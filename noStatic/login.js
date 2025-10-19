document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();

    const mensagemElemento = document.getElementById('mensagem');
    const dadosFormulario = new FormData(e.target);

    fetch('../api/login.php', {
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
                if (data.tipo === 'admin') {
                    // Limpa o formulário após o sucesso
                    e.target.reset();
                    // Redireciona para a página de admin após 2 segundos
                    setTimeout(() => {
                        window.location.href = '../templates/admin.html';
                    }, 2000);
                } else {
                    mensagemElemento.style.color = 'green';
                    // Limpa o formulário após o sucesso
                    e.target.reset();
                    // Redireciona para a página inicial após 2 segundos
                    setTimeout(() => {
                        window.location.href = '../templates/inicio.html';
                    }, 2000);
                }
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