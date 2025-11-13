<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);

$input = json_decode(file_get_contents('php://input'), true);
$mensagemUsuario = trim($input['message'] ?? '');

if (empty($mensagemUsuario)) {
    echo json_encode(['error' => 'Você precisa escrever alguma coisa!']);
    exit;
}

$urlOllama = 'http://127.0.0.1:11434/api/generate';


$contexto = <<<EOT
Você é o atendente virtual da loja de jogos GaStore 🎮

Seu estilo:
- Fale como um gamer simpático e engraçado.
- Responda curto, natural e sempre em português.
- Só fale sobre games, consoles, lançamentos, suporte e promoções da GaStore.
- Se o usuário perguntar algo fora disso, diga:
  "Hehe, eu só entendo de games e da GaStore 😎. Bora falar de joguinho?"

Agora responda como se fosse uma conversa:
EOT;

$promptCompleto = <<<EOT
$contexto

Usuário: {$mensagemUsuario}
Atendente:
EOT;

$dadosParaEnvio = [
    "model" => "tinyllama",
    "prompt" => $promptCompleto,
    "stream" => false
];

$ch = curl_init($urlOllama);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($dadosParaEnvio),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json']
]);

$respostaBruta = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['error' => 'O Ollama parece estar desligado: ' . curl_error($ch)]);
} else {
    $jsonOllama = json_decode($respostaBruta, true);
    $textoResposta = trim($jsonOllama['response'] ?? '');

    if ($textoResposta === '' || strlen($textoResposta) < 3) {
        $textoResposta = "Hmm... não entendi 😅 fala comigo sobre games ou promoções da GaStore!";
    }

    echo json_encode(['response' => $textoResposta]);
}

curl_close($ch);
?>
