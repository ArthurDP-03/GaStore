<?php

session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");
$resposta = [];

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    // Aqui você pode adicionar GET do perfil
    if (isset($_SESSION['id_usuario'])) {
        $id_usuario = $_SESSION['id_usuario'];
        $stmt = $conn->prepare("SELECT nome, email FROM usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $resposta = [
                'status' => 'sucesso',
                'id_usuario' => $id_usuario,
                'nome' => $user['nome'],
                'email' => $user['email']
            ];
        } else {
            $resposta = [
                'status' => 'erro',
                'mensagem' => 'Usuário não encontrado.'
            ];
        }
        $stmt->close();
    } else {
        $resposta = [
            'status' => 'erro',
            'mensagem' => 'Usuário não está logado.',
        ];
    }
}
if ($_SERVER['REQUEST_METHOD'] == "POST") {
    // Aqui você pode adicionar POST UPDATE do perfil
    if (isset($_SESSION['id_usuario'])) {
        $id_usuario = $_SESSION['id_usuario'];
        $nome = $_POST['nome'];
        $email = $_POST['email'];
        $senha = $_POST['senha'];
        
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        

        $stmt = $conn->prepare("UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?");
        $stmt->bind_param("sssi", $nome, $email, $senhaHash, $id_usuario);

        if ($stmt->execute()) {
            $_SESSION['id_usuario'] = $id_usuario;
            $_SESSION['nome'] = $nome;
            $resposta = [
                'status' => 'sucesso',
                'mensagem' => 'Perfil atualizado com sucesso.',
                'nome' => $nome,
                'email' => $email,
                'id_usuario' => $id_usuario
            ];

        } else {
            $resposta = [
                'status' => 'erro',
                'mensagem' => 'Erro ao atualizar perfil.'
            ];
        }
        $stmt->close();
    } else {
        $resposta = [
            'status' => 'erro',
            'mensagem' => 'Usuário não está logado.',
        ];
    }
}
echo json_encode($resposta);
?>