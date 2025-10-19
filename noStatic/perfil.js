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
        if (data.status === 'sucesso') {
            document.getElementById('idDisplay').innerText = data.id_usuario;
            document.getElementById('nomeDisplay').innerText = data.nome;
            document.getElementById('emailDisplay').innerText = data.email;
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
    const dadosFormulario = new FormData(e.target);


    fetch('../api/perfil.php', {
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
                mensagemElemento.innerText = data.mensagem + " Recarregando a página...";
                setTimeout(() => {
                    window.location.reload();
                }, 2500); // Dá tempo de mostrar a mensagem antes de recarregar a página


            } else {
                mensagemElemento.innerText = data.mensagem || 'Ocorreu um erro ao atualizar o perfil.';
                mensagemElemento.style.color = 'red';
            }
        })
        .catch(error => {
            // Este 'catch' pega erros de rede ou o erro que geramos acima
            console.error('Erro no fetch:', error);
            mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
            mensagemElemento.style.color = 'red';
        });


    editarBtn.style.display = 'inline-block';
    salvarBtn.style.display = 'none';
});


//Logout-----------------------------------------------------------------
document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();

    fetch('../api/logout.php', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('mensagem-logout').innerHTML = data.mensagem;
            if (data.status === 'sucesso') {
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000); // Dá tempo de mostrar a mensagem antes de redirecionar
            } else {
                document.getElementById('mensagem-logout').innerHTML = "Erro ao fazer logout.";
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
                }
            });
    }
});