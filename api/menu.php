<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == "GET") {

    // 1. A sessão 'id_usuario' existe?
    if (isset($_SESSION['id_usuario'])) {

        if (isset($_SESSION['tipo']) && $_SESSION['tipo'] == 'cliente') {
            $nome = isset($_SESSION['nome']) ? $_SESSION['nome'] : "Não identificado";
            
            echo json_encode([
                'status' => 'sucesso',
                'nome' => $nome,
                'tipo' => $_SESSION['tipo']
            ]);
            exit;

        } else if (isset($_SESSION['tipo']) && $_SESSION['tipo'] == 'admin') {
            
            session_unset();
            session_destroy();
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            echo json_encode([
                'status' => 'admin_logout',
                'mensagem' => 'Admin não permitido nesta área. Sessão encerrada.'
            ]);
            exit;
        }

    } 

    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Você não está logado.'
    ]);
    exit;
}

?>