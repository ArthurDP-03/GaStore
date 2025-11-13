document.addEventListener('DOMContentLoaded', () => {
    const janelaChat = document.getElementById('janela-chat');
    const inputMsg = document.getElementById('campo-msg');
    const btnEnviar = document.getElementById('btn-enviar');

    // Função que cria os balões na tela
    function adicionarBalao(texto, tipo) {
        const div = document.createElement('div');
        div.classList.add('balao');
        
        if (tipo === 'user') {
            div.classList.add('balao-user');
        } else {
            div.classList.add('balao-ia');
        }
        
        div.innerText = texto;
        janelaChat.appendChild(div);
        
        // Rola o scroll para o final (para ver a mensagem nova)
        janelaChat.scrollTop = janelaChat.scrollHeight;
    }

    // Função principal de envio
    function enviarMensagem() {
        const texto = inputMsg.value.trim();
        if (!texto) return; // Se tiver vazio, não faz nada

        // 1. Adiciona a mensagem do usuário na tela
        adicionarBalao(texto, 'user');
        inputMsg.value = ''; // Limpa o campo
        
        // 2. Bloqueia tudo para não floodar
        inputMsg.disabled = true;
        btnEnviar.disabled = true;
        btnEnviar.textContent = '...';

        // Cria um balão temporário de "digitando"
        const divDigitando = document.createElement('div');
        divDigitando.classList.add('balao', 'balao-ia', 'digitando');
        divDigitando.innerText = 'Pensando';
        janelaChat.appendChild(divDigitando);
        janelaChat.scrollTop = janelaChat.scrollHeight;

        // 3. Chama o PHP
        fetch('../api/chat_ollama.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: texto })
        })
        .then(response => response.json())
        .then(data => {
            // Remove o balão de "Pensando"
            divDigitando.remove();

            if (data.response) {
                adicionarBalao(data.response, 'ia');
            } else {
                adicionarBalao('Erro: ' + (data.error || 'Sem resposta da IA'), 'ia');
            }
        })
        .catch(erro => {
            divDigitando.remove();
            console.error(erro);
            adicionarBalao('Deu ruim na conexão com o servidor.', 'ia');
        })
        .finally(() => {
            // Libera tudo de novo
            inputMsg.disabled = false;
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';
            inputMsg.focus(); // Já deixa pronto pra digitar a próxima
        });
    }

    // Evento de clique no botão
    btnEnviar.addEventListener('click', enviarMensagem);

    // Evento de apertar ENTER no teclado
    inputMsg.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });
});