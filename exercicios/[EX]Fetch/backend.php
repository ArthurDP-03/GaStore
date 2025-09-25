<?php
header("Content-Type: application/json; charset=UTF-8");

$db = "usuarios.json";

// garante que o arquivo exista
if (!file_exists($db)) {
    file_put_contents($db, json_encode([]));
}

$usuarios = json_decode(file_get_contents($db), true) ?? [];
?>
