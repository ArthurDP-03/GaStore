<?php
session_start();
// Verifica se o usuário está logado
if (isset($_SESSION['usuario'])) { // Sessão válida
    echo "Você está logado como: " .
        htmlspecialchars($_SESSION['usuario']) . "<br>";
    echo "<a href='../api/logout.php'>Sair</a>";
} else {// Sessão inválida ou expirada
    echo "Você não está logado. Redirecionando para o login...";
    header("Refresh: 2; URL=../templates/login.html");
    exit;
}
?>
