<?php
session_start();
session_unset();
session_destroy();
if (isset($_COOKIE[session_name()])) {
    setcookie(
        session_name(),
        '',
        time() - 3600,
        '/'
    );
    echo "Você saiu com sucesso!<br>";
    echo "<a href='../templates/login.html'>Voltar para o login</a>";
}


header("Location: ../templates/login.html");
?>