<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

// Conexão
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão."]);
    exit;
}

// 1. AUTENTICAÇÃO
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'cliente') {
    echo json_encode(["status" => "unauthorized", "message" => "Você precisa estar logado."]);
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $id_produto = $data->id_produto ?? null;
    $codigo_cupom = $data->codigo_cupom ?? null;

    if (!$id_produto || !$codigo_cupom) {
        echo json_encode(["status" => "error", "message" => "Dados incompletos."]);
        exit;
    }

    // 2. PEGAR PREÇO DO PRODUTO
    $sql_prod = "SELECT preco_atual FROM Produto WHERE id_produto = ?";
    $stmt_prod = $conn->prepare($sql_prod);
    $stmt_prod->bind_param("i", $id_produto);
    $stmt_prod->execute();
    $result_prod = $stmt_prod->get_result();
    if ($result_prod->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Produto não encontrado."]);
        $stmt_prod->close(); $conn->close(); exit;
    }
    $produto = $result_prod->fetch_assoc();
    $preco_original = (float)$produto['preco_atual'];
    $stmt_prod->close();

    // 3. VALIDAR CUPOM
    $sql_cupom = "SELECT * FROM CupomDesconto WHERE codigo = ? AND data_validade >= CURDATE() AND usos_restantes > 0";
    $stmt_cupom = $conn->prepare($sql_cupom);
    $stmt_cupom->bind_param("s", $codigo_cupom);
    $stmt_cupom->execute();
    $result_cupom = $stmt_cupom->get_result();
    
    if ($result_cupom->num_rows > 0) {
        $cupom = $result_cupom->fetch_assoc();
        $valor_desconto = 0.0;
        
        if ($cupom['tipo_desconto'] === 'percentual') {
            $valor_desconto = $preco_original * ((float)$cupom['valor'] / 100);
        } else { // 'fixo'
            $valor_desconto = (float)$cupom['valor'];
        }
        
        $preco_final = $preco_original - $valor_desconto;
        if ($preco_final < 0) $preco_final = 0;

        echo json_encode([
            "status" => "success",
            "message" => "Cupom aplicado com sucesso!",
            "preco_original" => $preco_original,
            "preco_final" => $preco_final,
            "valor_desconto" => $valor_desconto
        ]);

    } else {
        echo json_encode(["status" => "error", "message" => "Cupom inválido, expirado ou esgotado."]);
    }
    $stmt_cupom->close();
}

$conn->close();
?>