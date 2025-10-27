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
    // --- LÓGICA GET: Buscar categorias para o formulário ---

    // 1. Buscar todas as categorias
    $sql_categorias = "SELECT id_categoria, nome FROM Categoria ORDER BY nome ASC";
    $result_categorias = $conn->query($sql_categorias);
    $categorias = [];
    while ($row = $result_categorias->fetch_assoc()) {
        $categorias[] = $row;
    }

    // 2. Retornar os dados
    echo json_encode([
        "status" => "success",
        "categories" => $categorias
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // --- LÓGICA POST: Inserir o novo produto ---

    $data = json_decode(file_get_contents('php://input'));

    // Validação básica dos dados recebidos
    if (
        !isset($data->titulo) || empty(trim($data->titulo)) || 
        !isset($data->preco_atual) || !isset($data->id_categoria)
    ) {
        echo json_encode(["status" => "error", "message" => "Dados incompletos (Título, Preço e Categoria são obrigatórios)"]);
        exit;
    }
    
    // Define valores nulos se estiverem vazios
    $capa = !empty($data->capa) ? $data->capa : null;
    $descricao = !empty($data->descricao) ? $data->descricao : null;

    $sql_insert = "INSERT INTO Produto (titulo, capa, preco_atual, descricao, id_categoria) 
                   VALUES (?, ?, ?, ?, ?)";
                   
    $stmt_insert = $conn->prepare($sql_insert);
    // "sdsdi" - s(string), d(double/decimal), s(string), i(integer)
    $stmt_insert->bind_param(
        "ssdsi",
        $data->titulo,
        $capa,
        $data->preco_atual,
        $descricao,
        $data->id_categoria
    );

    if ($stmt_insert->execute()) {
        echo json_encode(["status" => "success", "message" => "Produto adicionado com sucesso"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Erro ao adicionar produto: " . $conn->error]);
    }
    $stmt_insert->close();

} else {
    // Método não permitido
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido"]);
}

$conn->close();
?>