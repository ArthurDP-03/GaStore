<?php
// Define o tipo de conteúdo como JSON
header('Content-Type: application/json');

// Conexão com o banco (use suas credenciais)
$conn = mysqli_connect("localhost:3306", "root", "postly", "GaStore");

// Verifica a conexão
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco"]);
    exit;
}

// --- 1. BUSCA OS PRODUTOS ---
$sql_produtos = "
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
$result_produtos = mysqli_query($conn, $sql_produtos);

$products = [];
if ($result_produtos) {
    while ($row = mysqli_fetch_assoc($result_produtos)) {
        // Converte o preço para número, o JS agradece
        $row['preco_atual'] = (float)$row['preco_atual'];
        $products[] = $row;
    }
} else {
    echo json_encode(["status" => "error", "message" => "Erro ao buscar produtos"]);
    exit;
}


// --- 2. BUSCA TODAS AS CATEGORIAS ---
$sql_categorias = "SELECT nome FROM Categoria ORDER BY nome ASC";
$result_categorias = mysqli_query($conn, $sql_categorias);

$all_categories = [];
if ($result_categorias) {
    while ($row_cat = mysqli_fetch_assoc($result_categorias)) {
        $all_categories[] = $row_cat['nome'];
    }
} else {
     echo json_encode(["status" => "error", "message" => "Erro ao buscar categorias"]);
    exit;
}

// Fecha a conexão
mysqli_close($conn);

// --- 3. RETORNA TUDO EM UM ÚNICO JSON ---
echo json_encode([
    "products" => $products,
    "all_categories" => $all_categories
]);

?>