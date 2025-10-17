<?php
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");
$resposta = [];

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    if (isset($_SESSION['id_usuario'])) {
        $id_usuario = $_SESSION['id_usuario'];

        $query = "DELETE FROM usuario WHERE id_usuario = $id_usuario";
        if (mysqli_query($conn, $query)) {
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
    } else {
        $resposta = [
            "status" => "erro",
            "mensagem" => "Usuário não autenticado."
        ];
    }
}

echo json_encode($resposta);