<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_SESSION['id_usuario'])) {
        $nome = isset($_SESSION['nome']) ? $_SESSION['nome'] : "Não identificado";

        echo json_encode([
            'status' => 'sucesso',
            'nome' => $nome
        ]);
    } else {
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Você não está logado.'
        ]);
        exit;
    }
}
?>
