<?php
// Arquivo: api/chat_ollama.php
// Configurações básicas para aceitar JSON
header('Content-Type: application/json');
ini_set('display_errors', 0); // Esconde erros feios do PHP na resposta JSON

// 1. Recebe o que o usuário digitou
$input = json_decode(file_get_contents('php://input'), true);
$mensagemUsuario = $input['message'] ?? '';

if (empty($mensagemUsuario)) {
    echo json_encode(['error' => 'Você precisa escrever alguma coisa!']);
    exit;
}

// 2. Configura a conversa com o Ollama
// IMPORTANTE: O Ollama tem que estar rodando no seu PC (ollama serve ou app aberto)
$urlOllama = 'http://127.0.0.1:11434/api/generate';

// Define a personalidade da IA no "system"
$promptSistema = "Você é o suporte virtual da loja de jogos GaStore. " .
                 "Seja gente boa, engraçado e ajude com dúvidas sobre jogos, compras e a loja. " .
                 "Responda sempre em português e de forma resumida.";

$dadosParaEnvio = [
    "model" => "tinyllama", // Ou "tinyllama", "mistral" (o que você tiver baixado)
    "prompt" => $mensagemUsuario,
    "system" => $promptSistema,
    "stream" => false // False para esperar a resposta completa antes de devolver
];

// 3. Faz o envio usando CURL (padrão do PHP para APIs)
$ch = curl_init($urlOllama);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dadosParaEnvio));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$respostaBruta = curl_exec($ch);

// 4. Trata erros e devolve pro site
if (curl_errno($ch)) {
    echo json_encode(['error' => 'O Ollama parece desligado. Erro: ' . curl_error($ch)]);
} else {
    $jsonOllama = json_decode($respostaBruta, true);
    $textoResposta = $jsonOllama['response'] ?? 'Ops, a IA ficou confusa e não respondeu.';
    
    echo json_encode(['response' => $textoResposta]);
}
curl_close($ch);
?>