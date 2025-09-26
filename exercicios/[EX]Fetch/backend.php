<?php
header("Content-Type: application/json; charset=UTF-8");

$db = "usuarios.json";

// garante que o arquivo exista
if (!file_exists($db)) {
    file_put_contents($db, json_encode([]));
}

$usuarios = json_decode(file_get_contents($db), true) ?? [];

if($_SERVER["REQUEST_METHOD"] == "GET") {
    $acao = $_GET["acao"] ?? "";
    if($acao === 'get_usuarios') {
        echo json_encode($usuarios);
        exit;
    }else{
        echo json_encode(["resposta" => "acao-invalida"]);
    }
}
if($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST["user"] ?? "";
    $acao = $_POST["acao"] ?? "";
    if ($acao === "login") {
        if (in_array($user, $usuarios)) {
            echo json_encode(["resposta" => "bem-vindo-$user"]);
        } else {
            echo json_encode(["resposta" => "usuario-$user-nao-cadastrado"]);
        }
    } else if ($acao === "cadastrar") {
        if (in_array($user, $usuarios)) {
            echo json_encode(["resposta" => "usuario-$user-ja-cadastrado"]);
        } else {
            $usuarios[] = $user;
            file_put_contents($db, json_encode($usuarios));
            echo json_encode(["resposta" => "ola-$user-seu-cadastro-foi-realizado"]);
        }
    } else {
        echo json_encode(["resposta" => "acao-invalida"]);
    }
}


