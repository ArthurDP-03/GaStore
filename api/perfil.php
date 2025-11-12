<?php
ini_set('session.cookie_httponly', 1);
session_start();
header('Content-Type: application/json');
$conn = mysqli_connect("localhost:3306", "root", "postly", "gastore");
$resposta = [];

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_SESSION['id_usuario'])) {
        if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'cliente') {
            echo json_encode(["status" => "unauthorized", "message" => "Acesso negado. Apenas clientes podem ter perfil."]);
            exit;
        }

        $id_usuario = $_SESSION['id_usuario'];
        $stmt = $conn->prepare("SELECT nome, email FROM usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            // --- INÍCIO DA MODIFICAÇÃO: BUSCAR COMPRAS ---
            $compras = [];
            $sql_compras = "SELECT id_compra, data_compra, valor_total 
                            FROM Compra 
                            WHERE id_usuario = ? 
                            ORDER BY data_compra DESC";
            $stmt_compras = $conn->prepare($sql_compras);
            $stmt_compras->bind_param("i", $id_usuario);
            $stmt_compras->execute();
            $result_compras = $stmt_compras->get_result();
            
            while ($row_compra = $result_compras->fetch_assoc()) {
                $row_compra['valor_total'] = (float)$row_compra['valor_total'];
                $compras[] = $row_compra;
            }
            $stmt_compras->close();
            // --- FIM DA MODIFICAÇÃO ---

            $resposta = [
                'status' => 'sucesso',
                'id_usuario' => $id_usuario,
                'nome' => $user['nome'],
                'email' => $user['email'],
                'compras' => $compras // Adiciona o array de compras
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
            'status' => 'unauthorized',
            'mensagem' => 'Você precisa estar logado para ver seu perfil.',
        ];
    }
}

// ... (O MÉTODO POST continua igual)
if ($_SERVER['REQUEST_METHOD'] == "POST") {
// (Restante do código POST permanece inalterado)
// ...
    if (isset($_SESSION['id_usuario']) && isset($_SESSION['tipo']) && $_SESSION['tipo'] === 'cliente') {
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
            'status' => 'unauthorized', 
            'mensagem' => 'Sua sessão expirou ou você não tem permissão. Faça login novamente.',
        ];
    }
}
echo json_encode($resposta);
?>