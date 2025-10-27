document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();

    const mensagemElemento = document.getElementById('mensagem');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const submitButton = e.target.querySelector('button[type="submit"]');

    // --- Validações ---
    mensagemElemento.style.color = 'red'; // Cor padrão para erros

    // 1. Validação de E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        mensagemElemento.innerText = 'Por favor, insira um e-mail válido.';
        return;
    }

    // 2. Validação de Senha
    if (senhaInput.value.trim() === '') {
        mensagemElemento.innerText = 'O campo senha não pode estar vazio.';
        return;
    }
    // --- Fim das Validações ---
    
    // Desabilita o botão para evitar múltiplos envios
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';
    mensagemElemento.innerText = 'Entrando...';

    const dadosFormulario = new FormData(e.target);

    fetch('../api/login.php', {
        method: 'POST',
        body: dadosFormulario
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Houve um problema com a resposta do servidor.');
            }
            return response.json();
        })
        .then(data => {
            mensagemElemento.innerText = data.mensagem;

            if (data.status === 'sucesso') {
                mensagemElemento.style.color = 'green';
                e.target.reset();
                
                const redirectUrl = data.tipo === 'admin' 
                    ? '../templates/admin.html' 
                    : '../templates/inicio.html';

                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);

            } else {
                mensagemElemento.style.color = 'red';
                // Reabilita o botão em caso de erro
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
            }
        })
        .catch(error => {
            console.error('Erro no fetch:', error);
            mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
            mensagemElemento.style.color = 'red';
            // Reabilita o botão em caso de erro de conexão
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        });
});