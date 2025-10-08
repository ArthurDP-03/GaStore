document.getElementById('cadastro-form').addEventListener('submit', e => {
    e.preventDefault();

    const mensagemElemento = document.getElementById('mensagem');
    const dadosFormulario = new FormData(e.target);

    fetch('../api/cadastro.php', {
        method: 'POST',
        body: dadosFormulario
    })
        .then(response => {
            // Se a resposta do servidor não for OK (ex: erro 500 no PHP), gera um erro
            if (!response.ok) {
                throw new Error('Houve um problema com a resposta do servidor.');
            }
            return response.json();
        })
        .then(data => {
            // 'data' agora é o objeto {status: '...', mensagem: '...'}
            mensagemElemento.innerText = data.mensagem;

            // Adiciona um feedback visual (muda a cor da mensagem)
            if (data.status === 'sucesso') {
                mensagemElemento.style.color = 'green';
                // Limpa o formulário após o sucesso
                e.target.reset();
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000);
            } else {
                mensagemElemento.style.color = 'red';
            }
        })
        .catch(error => {
            // Este 'catch' pega erros de rede ou o erro que geramos acima
            console.error('Erro no fetch:', error);
            mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
            mensagemElemento.style.color = 'red';
        });
});