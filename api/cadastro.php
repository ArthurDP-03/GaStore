<?php
header('Content-Type: application/json');

$resposta = [];
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");

if ($conn->connect_error) {
    $resposta = ['status' => 'erro', 'mensagem' => 'Falha na conexão com o banco de dados.'];
    echo json_encode($resposta);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == "POST") {

    $senha = $_POST['senha1'];
    $confirmar_senha = $_POST['senha2'];

    if ($senha !== $confirmar_senha) {
        $resposta = ['status' => 'erro', 'mensagem' => 'As senhas não coincidem.'];
    } else {
        // Pega os dados do formulário
        $nome = $_POST['nome'];
        $dtnasc = $_POST['data_nascimento'];
        $cpf = $_POST['cpf'];
        $email = $_POST['email'];
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        $stmt_check = $conn->prepare("SELECT id FROM usuario WHERE email = ? OR cpf = ?");
        $stmt_check->bind_param("ss", $email, $cpf);
        $stmt_check->execute();
        $result = $stmt_check->get_result();

        if ($result->num_rows > 0) {
            $resposta = [
                'status' => 'erro',
                'mensagem' => 'Este e-mail ou CPF já está cadastrado em nosso sistema.'
            ];
            $stmt_check->close();
        } else {
            // Se não encontrou, o usuário é novo. Pode prosseguir com o cadastro.
            $stmt_check->close();
            $stmt_insert = $conn->prepare("INSERT INTO usuario (nome, cpf, email, senha, dtnasc) VALUES (?, ?, ?, ?, ?)");

            if ($stmt_insert === false) {
                $resposta = ['status' => 'erro', 'mensagem' => 'Erro na preparação da query de inserção.'];
            } else {
                $stmt_insert->bind_param("sssss", $nome, $cpf, $email, $senhaHash, $dtnasc);

                if ($stmt_insert->execute()) {
                    $resposta = ['status' => 'sucesso', 'mensagem' => 'Usuário cadastrado com sucesso!'];
                } else {
                    $resposta = ['status' => 'erro', 'mensagem' => 'Erro ao cadastrar usuário: ' . $stmt_insert->error];
                }
                $stmt_insert->close();
            }
        }
    }
} else {
    $resposta = ['status' => 'erro', 'mensagem' => 'Método de requisição inválido.'];
}

$conn->close();
echo json_encode($resposta);
?>