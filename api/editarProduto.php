<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');

// Conexão com o banco
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco"]);
    exit;
}

// --- Verificação de Admin ---
// (Esta verificação é necessária tanto para GET quanto para POST)
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "unauthorized", "message" => "Usuário não autenticado"]);
    exit;
}
$id_usuario = $_SESSION['id_usuario'];
$sql_admin = "SELECT tipo FROM Usuario WHERE id_usuario = ?";
$stmt_admin = $conn->prepare($sql_admin);
$stmt_admin->bind_param("i", $id_usuario);
$stmt_admin->execute();
$result_admin = $stmt_admin->get_result();

if ($result_admin->num_rows === 0) {
     echo json_encode(["status" => "unauthorized", "message" => "Usuário não encontrado"]);
     exit;
}
$admin = $result_admin->fetch_assoc();
if ($admin['tipo'] !== 'admin') {
    echo json_encode(["status" => "unauthorized", "message" => "Acesso negado"]);
    exit;
}
$stmt_admin->close();
// --- Fim da Verificação de Admin ---


// Roteamento baseado no método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // --- LÓGICA GET: Buscar dados para o formulário ---

    $id_produto = $_GET['id'] ?? null;
    if (!$id_produto) {
        echo json_encode(["status" => "error", "message" => "ID do produto não fornecido"]);
        exit;
    }

    // 1. Buscar o produto específico
    $sql_produto = "SELECT * FROM Produto WHERE id_produto = ?";
    $stmt_produto = $conn->prepare($sql_produto);
    $stmt_produto->bind_param("i", $id_produto);
    $stmt_produto->execute();
    $result_produto = $stmt_produto->get_result();
    
    if ($result_produto->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Produto não encontrado"]);
        exit;
    }
    $produto = $result_produto->fetch_assoc();
    $stmt_produto->close();

    // 2. Buscar todas as categorias
    $sql_categorias = "SELECT id_categoria, nome FROM Categoria ORDER BY nome ASC";
    $result_categorias = $conn->query($sql_categorias);
    $categorias = [];
    while ($row = $result_categorias->fetch_assoc()) {
        $categorias[] = $row;
    }

    // 3. Retornar os dados
    echo json_encode([
        "status" => "success",
        "product" => $produto,
        "categories" => $categorias
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // --- LÓGICA POST: Atualizar o produto ---

    $data = json_decode(file_get_contents('php://input'));

    // Validação básica dos dados recebidos
    if (
        !isset($data->id_produto) || !isset($data->titulo) || 
        !isset($data->preco_atual) || !isset($data->id_categoria)
    ) {
        echo json_encode(["status" => "error", "message" => "Dados incompletos"]);
        exit;
    }
    
    // Define valores nulos se estiverem vazios
    $capa = !empty($data->capa) ? $data->capa : null;
    $descricao = !empty($data->descricao) ? $data->descricao : null;

    $sql_update = "UPDATE Produto SET 
                    titulo = ?, 
                    capa = ?, 
                    preco_atual = ?, 
                    descricao = ?, 
                    id_categoria = ? 
                   WHERE id_produto = ?";
                   
    $stmt_update = $conn->prepare($sql_update);
    // "sdsdii" - s(string), d(double/decimal), i(integer)
    $stmt_update->bind_param(
        "ssdsii",
        $data->titulo,
        $capa,
        $data->preco_atual,
        $descricao,
        $data->id_categoria,
        $data->id_produto
    );

    if ($stmt_update->execute()) {
        echo json_encode(["status" => "success", "message" => "Produto atualizado com sucesso"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Erro ao atualizar produto: " . $conn->error]);
    }
    $stmt_update->close();

} else {
    // Método não permitido
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido"]);
}

$conn->close();
?>