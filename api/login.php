<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(0);
ini_set('session.cookie_httponly', 1);

// Inicia a sessão para gerenciar o estado do usuário
session_start();


$resposta = [];
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");

if ($conn->connect_error) {
    $resposta = ['status' => 'erro', 'mensagem' => 'Falha na conexão com o banco de dados.'];
    echo json_encode($resposta);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == "POST") {

    $email = $_POST['email'];
    $senha = $_POST['senha']; 

    $stmt = $conn->prepare("SELECT id_usuario, nome, email, senha, tipo FROM usuario WHERE email = ?");
    
    if ($stmt === false) {
        $resposta = ['status' => 'erro', 'mensagem' => 'Erro ao preparar a consulta.'];
    } else {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            if (password_verify($senha, $row['senha'])) {
                // Armazena o ID do usuário na sessão
                $_SESSION['id_usuario'] = $row['id_usuario'];
                // Adiciona o nome na sessão
                $_SESSION['nome'] = $row['nome'];
                //Adciona o tipo de sessão
                $_SESSION['tipo'] = $row['tipo'];
                // Senha correta!
                $resposta = [
                    'status' => 'sucesso', 
                    'tipo' => $row['tipo'],
                    'mensagem' => "Login bem-sucedido! Bem-vindo(a) {$row['nome']}, {$row['tipo']}!", 
                ];
                
            } else {
                // Senha incorreta
                $resposta = ['status' => 'erro', 'mensagem' => 'E-mail ou senha incorretos.'];
            }
        } else {
            // Usuário não encontrado
            $resposta = ['status' => 'erro', 'mensagem' => 'E-mail ou senha incorretos.'];
        }
        $stmt->close();
    }
} else {
    $resposta = ['status' => 'erro', 'mensagem' => 'Método de requisição inválido.'];
}

$conn->close();

// Garante que uma resposta JSON seja sempre enviada
echo json_encode($resposta);
?>