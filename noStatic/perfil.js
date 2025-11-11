const editarBtn = document.getElementById('editarBtn');
const salvarBtn = document.getElementById('salvarBtn');
const cancelarBtn = document.getElementById('cancelarBtn');
const deletarBtn = document.getElementById('deletarBtn');

// Carrega os dados do perfil ao carregar a página ---------------------------------
fetch('../api/perfil.php', {
    method: 'GET',
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Houve um problema com a resposta do servidor.');
        }
        return response.json();
    })
    .then(data => {
        // --- MODIFICAÇÃO AQUI ---
        if (data.status === 'sucesso') {
            document.getElementById('idDisplay').innerText = data.id_usuario;
            document.getElementById('nomeDisplay').innerText = data.nome;
            document.getElementById('emailDisplay').innerText = data.email;
        } else if (data.status === 'unauthorized') {
            alert(data.mensagem); 
            window.location.href = '../templates/login.html'; // Redireciona
        } else {
            console.error('Erro ao carregar perfil:', data.mensagem);
        }

    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
// Manipulação do clique no botão "Cancelar"------------------------------------------
cancelarBtn.addEventListener('click', e => {
    e.preventDefault();
    
    document.querySelectorAll('span.perfil-info').forEach(span => span.style.display = 'block');
    document.querySelectorAll('input').forEach(input => input.style.display = 'none');

    editarBtn.style.display = 'inline-block';
    deletarBtn.style.display = 'inline-block';
    salvarBtn.style.display = 'none';
    cancelarBtn.style.display = 'none';

});

// Manipulação do clique no botão "Editar"------------------------------------------
editarBtn.addEventListener('click', e => {
    e.preventDefault();

    // Esconde os spans, mostra os inputs
    document.querySelectorAll('span.perfil-info').forEach(span => span.style.display = 'none');
    document.querySelectorAll('input').forEach(input => input.style.display = 'block');

    editarBtn.style.display = 'none';
    deletarBtn.style.display = 'none';
    salvarBtn.style.display = 'inline-block';
    cancelarBtn.style.display = 'inline-block';
});

// Manipulação do envio do formulário ----------------------------------------------
document.getElementById('perfilForm').addEventListener('submit', e => { 
    e.preventDefault();

    const mensagemElemento = document.getElementById('mensagem');
    
    // Pega os valores dos inputs para validar
    const nome = document.getElementById('nomeInput').value;
    const email = document.getElementById('emailInput').value;
    const senha = document.getElementById('senhaInput').value;

    // --- Validações ---
    mensagemElemento.style.color = 'red'; // Cor padrão para erros

    // 1. Validação de campos vazios
    if (!nome || !email || !senha) {
        mensagemElemento.innerText = 'Todos os campos (Nome, Email, Senha) são obrigatórios.';
        return;
    }

    // 2. Validação de E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensagemElemento.innerText = 'Formato de e-mail inválido.';
        return;
    }

    // 3. Validação de Senha (Mesmas regras do cadastro)
    if (senha.length < 6) {
        mensagemElemento.innerText = 'A nova senha deve ter no mínimo 6 caracteres.';
        return;
    }
    const uppercaseRegex = /[A-Z]/;
    if (!uppercaseRegex.test(senha)) {
        mensagemElemento.innerText = 'A nova senha deve conter pelo menos uma letra maiúscula.';
        return;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(senha)) {
        mensagemElemento.innerText = 'A nova senha deve conter pelo menos um caractere especial (ex: !@#$).';
        return;
    }
    // --- Fim das Validações ---

    // Desabilita o botão *antes* do fetch
    salvarBtn.disabled = true;
    salvarBtn.style.opacity = '0.7';
    mensagemElemento.innerText = 'Salvando...';

    const dadosFormulario = new FormData(e.target);

    fetch('../api/perfil.php', {
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
            // 'data' agora é o objeto {status: '...', mensagem: '...'}
            mensagemElemento.innerText = data.mensagem;

            // Adiciona um feedback visual (muda a cor da mensagem)
            if (data.status === 'sucesso') {
                mensagemElemento.style.color = 'green';
                e.target.reset();
                mensagemElemento.innerText = data.mensagem + " Recarregando a página...";
                setTimeout(() => {
                    window.location.reload();
                }, 2500); 

            } else {
                mensagemElemento.innerText = data.mensagem || 'Ocorreu um erro ao atualizar o perfil.';
                mensagemElemento.style.color = 'red';
                // Reabilita o botão em caso de erro
                salvarBtn.disabled = false;
                salvarBtn.style.opacity = '1';

                // Se o erro for de autorização no POST, redireciona também
                if (data.status === 'unauthorized') {
                    setTimeout(() => {
                        window.location.href = '../templates/login.html';
                    }, 2000);
                }
            }
        })
        .catch(error => {
            // Este 'catch' pega erros de rede ou o erro que geramos acima
            console.error('Erro no fetch:', error);
            mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
            mensagemElemento.style.color = 'red';
            // Reabilita o botão em caso de erro
            salvarBtn.disabled = false;
            salvarBtn.style.opacity = '1';
        });
});


//Logout-----------------------------------------------------------------
document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();

    fetch('../api/logout.php', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('mensagem').innerHTML = data.mensagem;
            if (data.status === 'sucesso') {
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000); // Dá tempo de mostrar a mensagem antes de redirecionar
            } else {
                document.getElementById('mensagem').innerHTML = "Erro ao fazer logout.";
            }

        });
});

// Deletar conta-----------------------------------------------------------
deletarBtn.addEventListener('click', e => {
    e.preventDefault();
    if (confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")) {
        fetch('../api/deletar_perfil.php', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('mensagem').innerHTML = data.mensagem;
                if (data.status === 'sucesso') {
                    setTimeout(() => {
                        window.location.href = '../templates/login.html';
                    }, 2000); // Dá tempo de mostrar a mensagem antes de redirecionar
                } else if (data.status === 'unauthorized') { // Adicionado para segurança
                     alert(data.mensagem);
                     window.location.href = '../templates/login.html';
                }
            });
    }
});