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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'));

    if (
        !isset($data->codigo) || empty(trim($data->codigo)) ||
        !isset($data->tipo_desconto) || !isset($data->valor) ||
        !isset($data->data_validade) || !isset($data->usos_restantes)
    ) {
        echo json_encode(["status" => "error", "message" => "Dados incompletos"]);
        exit;
    }

    $sql_insert = "INSERT INTO CupomDesconto (codigo, tipo_desconto, valor, data_validade, usos_restantes) 
                   VALUES (?, ?, ?, ?, ?)";
                   
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param(
        "ssdsi",
        $data->codigo,
        $data->tipo_desconto,
        $data->valor,
        $data->data_validade,
        $data->usos_restantes
    );

    if ($stmt_insert->execute()) {
        echo json_encode(["status" => "success", "message" => "Cupom adicionado com sucesso"]);
    } else {
        // Trata erro de código duplicado (UNIQUE)
        if ($conn->errno == 1062) {
             echo json_encode(["status" => "error", "message" => "Erro: O código '{$data->codigo}' já existe."]);
        } else {
             echo json_encode(["status" => "error", "message" => "Erro ao adicionar cupom: " . $conn->error]);
        }
    }
    $stmt_insert->close();

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido"]);
}

$conn->close();
?>