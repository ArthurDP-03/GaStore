<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_SESSION['usuario'])) {
        // Exemplo: $_SESSION['usuario'] pode ser o ID, então busque o nome no banco
        // Supondo que você já tem o nome armazenado na sessão:
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
