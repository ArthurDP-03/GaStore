<?php
// Define o tipo de conteúdo como JSON
header('Content-Type: application/json');

// Conexão com o banco (use suas credenciais)
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");

// Verifica a conexão
if (!$conn) {
    // Se falhar, retorna um erro em JSON
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco"]);
    exit;
}

// Query para buscar todos os produtos e o NOME da sua categoria
// Usamos LEFT JOIN para o caso de um produto estar sem categoria
$sql = "
    SELECT 
        p.titulo,
        p.capa,
        p.preco_atual,
        p.descricao,
        c.nome AS categoria
    FROM Produto p
    LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
    ORDER BY p.titulo ASC
";

$result = mysqli_query($conn, $sql);

$products = [];
if ($result) {
    // Loop para pegar todos os produtos
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
} else {
    // Se a query falhar
    echo json_encode(["status" => "error", "message" => "Erro ao executar a consulta"]);
    exit;
}

// Fecha a conexão
mysqli_close($conn);

// Retorna a lista de produtos em formato JSON
echo json_encode($products);

?>