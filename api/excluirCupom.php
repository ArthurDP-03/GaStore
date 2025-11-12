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

// --- Verificação de Admin ---
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin') {
    echo json_encode(["status" => "unauthorized", "message" => "Acesso negado"]);
    exit;
}
// --- Fim da Verificação de Admin ---


$data = json_decode(file_get_contents('php://input'));
$id_cupom = $data->id ?? null;

if (!$id_cupom) {
    echo json_encode(["status" => "error", "message" => "ID do cupom não fornecido"]);
    exit;
}

// Prepara e executa a query de exclusão
$sql_delete = "DELETE FROM CupomDesconto WHERE id_cupom = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("i", $id_cupom);

if ($stmt_delete->execute()) {
    if ($stmt_delete->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Cupom excluído com sucesso"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Cupom não encontrado"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Erro ao excluir cupom: " . $conn->error]);
}

$stmt_delete->close();
$conn->close();
?>