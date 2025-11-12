<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Verifica se há um usuário logado
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(["status" => "unauthorized", "message" => "Usuário não autenticado"]);
        exit;
    }

    // Busca o usuário logado
    $id_usuario = $_SESSION['id_usuario'];
    
    $stmt_admin = $conn->prepare("SELECT * FROM Usuario WHERE id_usuario = ?");
    $stmt_admin->bind_param("i", $id_usuario);
    $stmt_admin->execute();
    $result_admin = $stmt_admin->get_result();


    if (!$result_admin || mysqli_num_rows($result_admin) === 0) {
        echo json_encode(["status" => "unauthorized", "message" => "Usuário não encontrado"]);
        exit;
    }

    $admin = mysqli_fetch_assoc($result_admin);
    
    $stmt_admin->close();

    // Verifica se é admin
    if ($admin['tipo'] !== 'admin') {
        echo json_encode(["status" => "unauthorized"]);
        exit;
    }

    // Busca todos os produtos com a categoria
    $sql_produtos = "
        SELECT 
            p.id_produto,
            p.titulo,
            p.capa,
            p.preco_atual,
            p.descricao,
            c.nome AS categoria
        FROM Produto p
        LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
    ";

    $result_produtos = mysqli_query($conn, $sql_produtos);

    $products = [];
    while ($row = mysqli_fetch_assoc($result_produtos)) {
        $products[] = $row;
    }

    // BUSCAR TODAS AS CATEGORIAS DA TABELA ---
    $sql_categorias = "SELECT nome FROM Categoria ORDER BY nome ASC";
    $result_categorias = mysqli_query($conn, $sql_categorias);
    
    $all_categories = [];
    while ($row_cat = mysqli_fetch_assoc($result_categorias)) {
        // Adiciona apenas a string do nome no array
        $all_categories[] = $row_cat['nome']; 
    }

    // --- BUSCAR TODOS OS USUÁRIOS ---
    $sql_users = "SELECT id_usuario, nome, email, tipo FROM Usuario WHERE id_usuario != ? ORDER BY nome ASC";
    $stmt_users = $conn->prepare($sql_users);
    $stmt_users->bind_param("i", $id_usuario); 
    $stmt_users->execute();
    $result_users = $stmt_users->get_result();

    $users = [];
    while ($row_user = $result_users->fetch_assoc()) {
        $users[] = $row_user;
    }
    $stmt_users->close();

    // --- BUSCAR TODOS OS CUPONS ---
    $sql_coupons = "SELECT * FROM CupomDesconto ORDER BY data_validade DESC";
    $result_coupons = mysqli_query($conn, $sql_coupons);

    $coupons = [];
    while ($row_coupon = $result_coupons->fetch_assoc()) {
        $coupons[] = $row_coupon;
    }


    // Retorna os dados
    echo json_encode([
        "status" => "success",
        "admin" => [
            "id" => $admin['id_usuario'],
            "nome" => $admin['nome'],
            "email" => $admin['email']
        ],
        "products" => $products,
        "all_categories" => $all_categories, // <-- NOVO: Envia o array de categorias
        "users" => $users,
        "coupons" => $coupons
    ]);

} else {
    // Se NÃO for GET, não faz nada
    http_response_code(405);
    exit;
}
?>