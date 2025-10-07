<?php
$resposta = [];
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");

if ($conn->connect_error) {
    $resposta = ['status' => 'erro', 'mensagem' => 'Falha na conexão com o banco de dados.'];
    echo json_encode($resposta);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == "GET"){
    
}
?>