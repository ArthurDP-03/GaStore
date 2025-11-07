<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");
$resposta = [];

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    if (isset($_SESSION['id_usuario'])) {
        $id_usuario = $_SESSION['id_usuario'];
        
        $stmt = $conn->prepare("DELETE FROM usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $id_usuario); 

        if ($stmt->execute()) {
            $resposta = [
                "status" => "sucesso",
                "mensagem" => "Conta deletada com sucesso."
            ];
        } else {
            $resposta = [
                "status" => "erro",
                "mensagem" => "Erro ao deletar conta."
            ];
        }
        // É uma boa prática fechar o statement
        $stmt->close();
    } else {
        $resposta = [
            "status" => "erro",
            "mensagem" => "Usuário não autenticado."
        ];
    }
}

echo json_encode($resposta);
