document.addEventListener('DOMContentLoaded', () => {

    const dataNascimentoInput = document.getElementById('data_nascimento');

    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 13);

    const dataMaxFormatada = dataLimite.toISOString().split('T')[0];

    dataNascimentoInput.setAttribute('max', dataMaxFormatada);


    document.getElementById('cadastro-form').addEventListener('submit', e => {
        e.preventDefault();

        const mensagemElemento = document.getElementById('mensagem');
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const dataNascimentoStr = dataNascimentoInput.value; // Usa a const já declarada
        const email = document.getElementById('email').value;
        const senha1 = document.getElementById('senha1').value;
        const senha2 = document.getElementById('senha2').value;
        const submitButton = e.target.querySelector('button[type="submit"]');


        // --- Validações ---
        mensagemElemento.style.color = 'red'; 

        // 1. Campos obrigatórios
        if (!nome || !cpf || !dataNascimentoStr || !email || !senha1 || !senha2) {
            mensagemElemento.innerText = 'Todos os campos são obrigatórios.';
            return;
        }

        // 2. Validação de Idade (13+)
        const dataNascimento = new Date(dataNascimentoStr);
        if (dataNascimento > dataLimite) {
            mensagemElemento.innerText = 'Você deve ter pelo menos 13 anos para se cadastrar.';
            return;
        }
        
        // 3. Validação de E-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mensagemElemento.innerText = 'Formato de e-mail inválido.';
            return;
        }
        
        // 4. Validação de Senha (Força)
        if (senha1.length < 6) {
            mensagemElemento.innerText = 'A senha deve ter no mínimo 6 caracteres.';
            return;
        }
        const uppercaseRegex = /[A-Z]/;
        if (!uppercaseRegex.test(senha1)) {
            mensagemElemento.innerText = 'A senha deve conter pelo menos uma letra maiúscula.';
            return;
        }
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(senha1)) {
            mensagemElemento.innerText = 'A senha deve conter pelo menos um caractere especial (ex: !@#$).';
            return;
        }

        // 5. Confirmação de senha
        if (senha1 !== senha2) {
            mensagemElemento.innerText = 'As senhas não coincidem.';
            return;
        }
        // --- Fim das Validações ---

        // Desabilita o botão e mostra mensagem
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        mensagemElemento.innerText = 'Cadastrando...';

        const dadosFormulario = new FormData(e.target);

        fetch('../api/cadastro.php', {
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
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000);
            } else {
                mensagemElemento.style.color = 'red';
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
            }
        })
        .catch(error => {
            console.error('Erro no fetch:', error);
            mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
            mensagemElemento.style.color = 'red';
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        });
    });
});