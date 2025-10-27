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
// --- Fim da Verificação de Admin ---


// Pega o ID do produto enviado no corpo da requisição POST
$data = json_decode(file_get_contents('php://input'));
$id_produto = $data->id ?? null;

if (!$id_produto) {
    echo json_encode(["status" => "error", "message" => "ID do produto não fornecido"]);
    exit;
}

// Prepara e executa a query de exclusão
$sql_delete = "DELETE FROM Produto WHERE id_produto = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $id_produto);

if ($stmt_delete->execute()) {
    if ($stmt_delete->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Produto excluído com sucesso"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Produto não encontrado"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Erro ao excluir produto: " . $conn->error]);
}

$stmt_admin->close();
$stmt_delete->close();
$conn->close();
?>