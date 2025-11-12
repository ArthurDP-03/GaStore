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


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_cupom = $_GET['id'] ?? null;
    if (!$id_cupom) {
        echo json_encode(["status" => "error", "message" => "ID do cupom não fornecido"]);
        exit;
    }

    $sql_cupom = "SELECT * FROM CupomDesconto WHERE id_cupom = ?";
    $stmt_cupom = $conn->prepare($sql_cupom);
    $stmt_cupom->bind_param("i", $id_cupom);
    $stmt_cupom->execute();
    $result_cupom = $stmt_cupom->get_result();
    
    if ($result_cupom->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Cupom não encontrado"]);
        exit;
    }
    $cupom = $result_cupom->fetch_assoc();
    $stmt_cupom->close();

    echo json_encode([
        "status" => "success",
        "coupon" => $cupom
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'));

    if (
        !isset($data->id_cupom) || !isset($data->codigo) ||
        !isset($data->tipo_desconto) || !isset($data->valor) ||
        !isset($data->data_validade) || !isset($data->usos_restantes)
    ) {
        echo json_encode(["status" => "error", "message" => "Dados incompletos"]);
        exit;
    }

    $sql_update = "UPDATE CupomDesconto SET 
                    codigo = ?, 
                    tipo_desconto = ?, 
                    valor = ?, 
                    data_validade = ?, 
                    usos_restantes = ? 
                   WHERE id_cupom = ?";
                   
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param(
        "ssdsii",
        $data->codigo,
        $data->tipo_desconto,
        $data->valor,
        $data->data_validade,
        $data->usos_restantes,
        $data->id_cupom
    );

    if ($stmt_update->execute()) {
        echo json_encode(["status" => "success", "message" => "Cupom atualizado com sucesso"]);
    } else {
         if ($conn->errno == 1062) {
             echo json_encode(["status" => "error", "message" => "Erro: O código '{$data->codigo}' já existe."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Erro ao atualizar cupom: " . $conn->error]);
        }
    }
    $stmt_update->close();

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido"]);
}

$conn->close();
?>