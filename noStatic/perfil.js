// --- Seleção dos Elementos Principais ---
const editarBtn = document.getElementById('editarBtn');
const salvarBtn = document.getElementById('salvarBtn');
const cancelarBtn = document.getElementById('cancelarBtn');
const deletarBtn = document.getElementById('deletarBtn');
const perfilForm = document.getElementById('perfilForm');
const mensagemElemento = document.getElementById('mensagem');
const logoutBtn = document.getElementById('logoutBtn');

// --- Função para Renderizar a Tabela de Compras ---
/**
 * Popula a tabela de histórico de compras.
 * @param {Array} compras - Um array de objetos de compra vindos da API.
 */
function renderizarCompras(compras) {
    const tabelaComprasBody = document.getElementById('corpo-tabela-compras');
    if (!tabelaComprasBody) return; // Sai se a tabela não existir

    tabelaComprasBody.innerHTML = ''; // Limpa o corpo da tabela

    // A folha de estilo (perfil.css) já deve ter uma regra :empty::after
    // para mostrar a mensagem "Você ainda não fez nenhuma compra."
    if (compras && compras.length > 0) {
        compras.forEach(compra => {
            const row = document.createElement('tr');
            
            // Formata a data para o padrão pt-BR (DD/MM/AAAA)
            const dataFormatada = new Date(compra.data_compra).toLocaleDateString('pt-BR', { 
                timeZone: 'UTC' // Garante que a data não mude por fuso horário
            });
            
            // Formata o valor para o padrão BRL (R$ XX,XX)
            const valorFormatado = parseFloat(compra.valor_total).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            
            row.innerHTML = `
                <td>${compra.id_compra}</td>
                <td>${dataFormatada}</td>
                <td>${valorFormatado}</td>
            `;
            tabelaComprasBody.appendChild(row);
        });
    }
}

// --- Carregamento Inicial dos Dados do Perfil e Compras ---
document.addEventListener('DOMContentLoaded', () => {
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
            // Preenche os spans de visualização
            document.getElementById('idDisplay').innerText = data.id_usuario;
            document.getElementById('nomeDisplay').innerText = data.nome;
            document.getElementById('emailDisplay').innerText = data.email;

            // Pré-preenche os inputs do formulário de edição
            document.getElementById('nomeInput').value = data.nome;
            document.getElementById('emailInput').value = data.email;

            // Renderiza o histórico de compras
            renderizarCompras(data.compras || []);

        } else if (data.status === 'unauthorized') {
            alert(data.mensagem); 
            window.location.href = '../templates/login.html'; // Redireciona
        } else {
            console.error('Erro ao carregar perfil:', data.mensagem);
            mensagemElemento.innerText = data.mensagem;
            mensagemElemento.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        mensagemElemento.innerText = 'Erro de conexão ao carregar dados.';
        mensagemElemento.style.color = 'red';
    });
});

// --- Event Listeners para os Botões ---

// Manipulação do clique no botão "Cancelar"
cancelarBtn.addEventListener('click', e => {
    e.preventDefault();
    
    // Mostra os spans
    document.querySelectorAll('span.perfil-info').forEach(span => span.style.display = 'block');
    // Esconde os inputs
    document.querySelectorAll('input.perfil-input').forEach(input => input.style.display = 'none');
    // Esconde o campo senha (que é um input-group)
    document.getElementById('senhaInputGroup').style.display = 'none';


    // Alterna a visibilidade dos botões
    editarBtn.style.display = 'inline-flex'; // 'inline-flex' para alinhar com ícone
    deletarBtn.style.display = 'inline-flex';
    salvarBtn.style.display = 'none';
    cancelarBtn.style.display = 'none';
    
    // Limpa a senha e mensagens de erro
    document.getElementById('senhaInput').value = '';
    mensagemElemento.innerText = '';
});

// Manipulação do clique no botão "Editar"
editarBtn.addEventListener('click', e => {
    e.preventDefault();

    // Esconde os spans, mostra os inputs
    document.querySelectorAll('span.perfil-info').forEach(span => span.style.display = 'none');
    document.querySelectorAll('input.perfil-input').forEach(input => input.style.display = 'block');
    document.getElementById('senhaInputGroup').style.display = 'flex'; // 'flex' para alinhar label e input

    // Alterna a visibilidade dos botões
    editarBtn.style.display = 'none';
    deletarBtn.style.display = 'none';
    salvarBtn.style.display = 'inline-flex';
    cancelarBtn.style.display = 'inline-flex';
});

// Manipulação do envio do formulário (Salvar Edição)
perfilForm.addEventListener('submit', e => { 
    e.preventDefault();
    
    // Pega os valores dos inputs para validar
    const nome = document.getElementById('nomeInput').value;
    const email = document.getElementById('emailInput').value;
    const senha = document.getElementById('senhaInput').value;

    // --- Validações ---
    mensagemElemento.style.color = 'red'; // Cor padrão para erros

    // 1. Validação de campos vazios
    if (!nome || !email || !senha) {
        mensagemElemento.innerText = 'Todos os campos (Nome, Email, Senha) são obrigatórios para salvar.';
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

    const dadosFormulario = new FormData(perfilForm);

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
        if (data.status === 'sucesso') {
            mensagemElemento.style.color = 'green';
            mensagemElemento.innerText = data.mensagem + " Recarregando a página...";
            // Recarrega a página para mostrar os dados atualizados e reverter o layout
            setTimeout(() => {
                window.location.reload();
            }, 2500); 

        } else {
            mensagemElemento.innerText = data.mensagem || 'Ocorreu um erro ao atualizar o perfil.';
            mensagemElemento.style.color = 'red';
            // Reabilita o botão em caso de erro
            salvarBtn.disabled = false;
            salvarBtn.style.opacity = '1';

            // Se o erro for de autorização no POST, redireciona
            if (data.status === 'unauthorized') {
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000);
            }
        }
    })
    .catch(error => {
        console.error('Erro no fetch:', error);
        mensagemElemento.innerText = 'Não foi possível se conectar ao servidor. Tente novamente mais tarde.';
        mensagemElemento.style.color = 'red';
        // Reabilita o botão em caso de erro
        salvarBtn.disabled = false;
        salvarBtn.style.opacity = '1';
    });
});

// Logout
logoutBtn.addEventListener('click', e => {
    e.preventDefault();

    fetch('../api/logout.php', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        mensagemElemento.innerText = data.mensagem;
        mensagemElemento.style.color = 'white';
        if (data.status === 'sucesso') {
            setTimeout(() => {
                window.location.href = '../templates/login.html';
            }, 2000); // Dá tempo de mostrar a mensagem
        } else {
            mensagemElemento.innerText = "Erro ao fazer logout.";
            mensagemElemento.style.color = 'red';
        }
    })
    .catch(err => {
        console.error('Erro no logout:', err);
        mensagemElemento.innerText = 'Erro de conexão ao tentar deslogar.';
        mensagemElemento.style.color = 'red';
    });
});

// Deletar conta
deletarBtn.addEventListener('click', e => {
    e.preventDefault();
    if (confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")) {
        fetch('../api/deletar_perfil.php', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            mensagemElemento.innerText = data.mensagem;
            if (data.status === 'sucesso') {
                mensagemElemento.style.color = 'green';
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2500); 
            } else {
                 mensagemElemento.style.color = 'red';
                 if (data.status === 'unauthorized') {
                     alert(data.mensagem);
                     window.location.href = '../templates/login.html';
                }
            }
        })
        .catch(err => {
            console.error('Erro ao deletar:', err);
            mensagemElemento.innerText = 'Erro de conexão ao tentar deletar a conta.';
            mensagemElemento.style.color = 'red';
        });
    }
});