<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");
$resposta = [];

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_COOKIE[session_name()]) && (isset($_SESSION['id_usuario']))) {
        session_destroy();
        $resposta = ['status' => 'sucesso', 'mensagem' => "Logout concluído com sucesso {$_SESSION['nome']}."];
        session_unset();
        setcookie(session_name(), '', time() - 3600, '/', '', true, true);

    } else {
        $resposta = ['status' => 'sucesso', 'mensagem' => 'Você não está logado. Redirecionando para a página de login...'];
    }
}
echo json_encode($resposta);
?>