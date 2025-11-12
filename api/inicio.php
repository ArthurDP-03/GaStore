<?php
// 1. Regras de segurança obrigatórias
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

// Conexão com o banco
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco."]);
    exit;
}

// 2. Lógica de autorização (usando seu exemplo de menu.php)
if ($_SERVER['REQUEST_METHOD'] == "GET") {

    // 2.1. Verifica PRIMEIRO se é um Admin logado
    if (isset($_SESSION['id_usuario']) && isset($_SESSION['tipo']) && $_SESSION['tipo'] == 'admin') {
        
        // Desloga o admin
        session_unset();
        session_destroy();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        echo json_encode([
            'status' => 'admin_logout',
            'mensagem' => 'Admin não permitido nesta área. Você foi deslogado.',
            'tipo' => 'admin'
        ]);
        mysqli_close($conn);
        exit;
    }

    // 2.2. Se NÃO for Admin (seja cliente logado ou visitante), permite carregar os produtos
    
    $sql_produtos = "
        SELECT 
            p.id_produto, p.titulo, p.capa,
            p.preco_atual, p.descricao, c.nome AS categoria
        FROM Produto p
        LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
        ORDER BY p.titulo ASC
    ";
    $result_produtos = mysqli_query($conn, $sql_produtos);
    $products = [];
    if ($result_produtos) {
        while ($row = mysqli_fetch_assoc($result_produtos)) {
            $row['preco_atual'] = (float)$row['preco_atual'];
            $products[] = $row;
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Erro ao buscar produtos."]);
        mysqli_close($conn);
        exit;
    }

    // 4.2. BUSCA AS CATEGORIAS
    $sql_categorias = "SELECT nome FROM Categoria ORDER BY nome ASC";
    $result_categorias = mysqli_query($conn, $sql_categorias);
    $all_categories = [];
    if ($result_categorias) {
        while ($row_cat = mysqli_fetch_assoc($result_categorias)) {
            $all_categories[] = $row_cat['nome'];
        }
    } else {
         echo json_encode(["status" => "error", "message" => "Erro ao buscar categorias."]);
         mysqli_close($conn);
         exit;
    }

    // 4.3. RETORNA OS DADOS
    echo json_encode([
        "status" => "success", // Indica que a auth e a busca foram OK
        "products" => $products,
        "all_categories" => $all_categories
    ]);
    mysqli_close($conn);
    exit;
    // --- FIM DA MODIFICAÇÃO ---
}

echo json_encode(['status' => 'error', 'message' => 'Método não permitido.']);
mysqli_close($conn);
exit;
?>