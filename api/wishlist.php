<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro de conexão."]);
    exit;
}

// Lógica de autorização
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "unauthorized", "message" => "Você precisa estar logado para usar a lista de desejos."]);
    exit;
}

// Verifica se o usuário logado é um cliente
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'cliente') {
    echo json_encode(["status" => "unauthorized", "message" => "Acesso negado. Apenas clientes podem ter uma lista de desejos."]);
    exit;
}


$id_usuario = $_SESSION['id_usuario'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Ação: LISTAR (Read)
    $sql = "SELECT p.id_produto, p.titulo, p.capa, p.preco_atual, p.descricao, c.nome as categoria
            FROM Wishlist w
            JOIN Produto p ON w.id_produto = p.id_produto
            LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
            WHERE w.id_usuario = ?
            ORDER BY w.data_adicao DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    $produtos = [];
    while ($result && $row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }

    $stmt->close();
    echo json_encode(["status" => "success", "products" => $produtos]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $id_produto = $_POST['id_produto'] ?? null;
    $action = $_POST['action'] ?? 'add'; 

    if (empty($id_produto)) {
        echo json_encode(["status" => "error", "message" => "ID de produto não fornecido."]);
        exit;
    }

    if ($action === 'add') {
        // Ação: ADICIONAR (Create)
        $sql = "INSERT IGNORE INTO Wishlist (id_usuario, id_produto) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id_usuario, $id_produto); 
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["status" => "success", "message" => "Jogo salvo na lista de desejos!"]);
            } else {
                echo json_encode(["status" => "info", "message" => "Este jogo já estava na sua lista."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Erro ao salvar."]);
        }
        $stmt->close();

    } elseif ($action === 'remove') {
        // Ação: REMOVER (Delete)
        $sql = "DELETE FROM Wishlist WHERE id_usuario = ? AND id_produto = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id_usuario, $id_produto);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Jogo removido da lista."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Erro ao remover."]);
        }
        $stmt->close();
    }
}

$conn->close();
?>