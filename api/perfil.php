<?php
session_start();
session_unset();
session_destroy();

$resposta = [];
if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_COOKIE[session_name()])) {
        setcookie(
            session_name(),
            '',
            time() - 3600,
            '/'
        );
        $resposta = ['status' => 'sucesso', 'mensagem' => 'Logout concluído com sucesso.'];
    } else {
        $resposta = ['status' => 'erro', 'mensagem' => 'Erro ao fazer logout.'];
    }
}
echo json_encode($resposta);
?>