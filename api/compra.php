<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

// Conexão
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco"]);
    exit;
}

// 1. AUTENTICAÇÃO: O usuário é um cliente logado?
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'cliente') {
    echo json_encode(["status" => "unauthorized", "message" => "Você precisa estar logado como cliente para comprar."]);
    $conn->close();
    exit;
}
$id_usuario = $_SESSION['id_usuario'];

// --- ROTEAMENTO POR MÉTODO ---

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Ação: BUSCAR DADOS DO PRODUTO PARA A PÁGINA DE COMPRA

    $id_produto = $_GET['id'] ?? null;
    if (!$id_produto) {
        echo json_encode(["status" => "error", "message" => "Produto não especificado."]);
        exit;
    }

    // 2. VERIFICAÇÃO DE POSSE (Regra de não recomprar)
    $sql_check_own = "SELECT 1 
                      FROM Compra c 
                      JOIN ItemCompra ic ON c.id_compra = ic.id_compra 
                      WHERE c.id_usuario = ? AND ic.id_produto = ?";
    $stmt_check = $conn->prepare($sql_check_own);
    $stmt_check->bind_param("ii", $id_usuario, $id_produto);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        echo json_encode(["status" => "info", "message" => "Você já possui este jogo em sua biblioteca."]);
        $stmt_check->close();
        $conn->close();
        exit;
    }
    $stmt_check->close();

    // 3. BUSCAR DETALHES DO PRODUTO (Se não possui)
    $sql_prod = "SELECT titulo, capa, preco_atual FROM Produto WHERE id_produto = ? AND ativo = 1";
    $stmt_prod = $conn->prepare($sql_prod);
    $stmt_prod->bind_param("i", $id_produto);
    $stmt_prod->execute();
    $result_prod = $stmt_prod->get_result();

    if ($result_prod->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Produto não encontrado ou indisponível."]);
        exit;
    }
    $produto = $result_prod->fetch_assoc();
    $produto['preco_atual'] = (float)$produto['preco_atual'];

    echo json_encode(["status" => "success", "product" => $produto]);
    $stmt_prod->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ação: PROCESSAR A COMPRA

    $data = json_decode(file_get_contents('php://input'));
    $id_produto = $data->id_produto ?? null;
    $codigo_cupom = $data->codigo_cupom ?? null;
    $id_cupom_usado = null;
    $valor_desconto = 0.0;

    if (!$id_produto) {
        echo json_encode(["status" => "error", "message" => "ID do produto não fornecido no POST."]);
        exit;
    }

    // 2. RE-VERIFICAR POSSE (Segurança)
    $sql_check_own = "SELECT 1 FROM Compra c JOIN ItemCompra ic ON c.id_compra = ic.id_compra WHERE c.id_usuario = ? AND ic.id_produto = ?";
    $stmt_check = $conn->prepare($sql_check_own);
    $stmt_check->bind_param("ii", $id_usuario, $id_produto);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Você já possui este jogo."]);
        $stmt_check->close(); $conn->close(); exit;
    }
    $stmt_check->close();

    // 3. PEGAR PREÇO DO PRODUTO
    $sql_prod = "SELECT preco_atual FROM Produto WHERE id_produto = ? AND ativo = 1";
    $stmt_prod = $conn->prepare($sql_prod);
    $stmt_prod->bind_param("i", $id_produto);
    $stmt_prod->execute();
    $result_prod = $stmt_prod->get_result();
    if ($result_prod->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Produto não está mais disponível."]);
        $stmt_prod->close(); $conn->close(); exit;
    }
    $produto = $result_prod->fetch_assoc();
    $preco_original = (float)$produto['preco_atual'];
    $valor_total_final = $preco_original;
    $stmt_prod->close();

    // 4. VALIDAR CUPOM (Se fornecido)
    if (!empty($codigo_cupom)) {
        $sql_cupom = "SELECT * FROM CupomDesconto WHERE codigo = ? AND data_validade >= CURDATE() AND usos_restantes > 0";
        $stmt_cupom = $conn->prepare($sql_cupom);
        $stmt_cupom->bind_param("s", $codigo_cupom);
        $stmt_cupom->execute();
        $result_cupom = $stmt_cupom->get_result();
        
        if ($result_cupom->num_rows > 0) {
            $cupom = $result_cupom->fetch_assoc();
            $id_cupom_usado = $cupom['id_cupom'];
            
            if ($cupom['tipo_desconto'] === 'percentual') {
                $valor_desconto = $preco_original * ((float)$cupom['valor'] / 100);
            } else { // 'fixo'
                $valor_desconto = (float)$cupom['valor'];
            }
            
            $valor_total_final = $preco_original - $valor_desconto;
            if ($valor_total_final < 0) $valor_total_final = 0; // Preço não pode ser negativo
        } else {
            echo json_encode(["status" => "error", "message" => "Cupom inválido, expirado ou esgotado."]);
            $stmt_cupom->close(); $conn->close(); exit;
        }
        $stmt_cupom->close();
    }

    // 5. TRANSAÇÃO DA COMPRA (Atomica)
    $conn->begin_transaction();
    try {
        // Inserir na tabela Compra
        $sql_ins_compra = "INSERT INTO Compra (id_usuario, valor_total, id_cupom) VALUES (?, ?, ?)";
        $stmt_ins_compra = $conn->prepare($sql_ins_compra);
        $stmt_ins_compra->bind_param("idi", $id_usuario, $valor_total_final, $id_cupom_usado);
        $stmt_ins_compra->execute();
        
        $id_nova_compra = $conn->insert_id; // Pega o ID da compra que acabou de ser inserida

        // Inserir na tabela ItemCompra
        $sql_ins_item = "INSERT INTO ItemCompra (id_compra, id_produto, quantidade, preco_unitario) VALUES (?, ?, 1, ?)";
        $stmt_ins_item = $conn->prepare($sql_ins_item);
        $stmt_ins_item->bind_param("iid", $id_nova_compra, $id_produto, $preco_original);
        $stmt_ins_item->execute();

        // Atualizar usos do cupom (se foi usado)
        if ($id_cupom_usado) {
            $sql_upd_cupom = "UPDATE CupomDesconto SET usos_restantes = usos_restantes - 1 WHERE id_cupom = ?";
            $stmt_upd_cupom = $conn->prepare($sql_upd_cupom);
            $stmt_upd_cupom->bind_param("i", $id_cupom_usado);
            $stmt_upd_cupom->execute();
            $stmt_upd_cupom->close();
        }

        $stmt_ins_compra->close();
        $stmt_ins_item->close();
        
        // Se tudo deu certo, confirma a transação
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Compra realizada com sucesso!"]);

    } catch (mysqli_sql_exception $exception) {
        $conn->rollback(); // Desfaz tudo se algo deu errado
        echo json_encode(["status" => "error", "message" => "Erro ao processar o pagamento: " . $exception->getMessage()]);
    }
}

$conn->close();
?>