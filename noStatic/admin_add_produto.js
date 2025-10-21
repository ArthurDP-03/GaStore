document.addEventListener('DOMContentLoaded', () => {
  // Pega os elementos do formulário
  const form = document.getElementById('add-form');
  const categorySelect = document.getElementById('id_categoria');
  const saveBtn = document.getElementById('save-btn');

  // 1. Função para carregar as categorias no <select>
  function loadCategories() {
    // Faz um GET para o próprio script PHP para buscar as categorias
    fetch(`../api/admin_add_produto.php`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unauthorized') {
          alert('Acesso negado. Você não é um administrador.');
          window.location.href = '../templates/login.html';
          return;
        }

        if (data.status === 'error') {
          alert('Erro: ' + data.message);
          return;
        }

        // Preenche o <select> de categorias
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        data.categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id_categoria;
          option.innerText = category.nome;
          categorySelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Erro de conexão:', error);
        alert('Erro ao carregar categorias. Verifique sua conexão.');
      });
  }

  // 2. Adiciona o listener para o envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio tradicional
    saveBtn.disabled = true;
    saveBtn.innerText = 'Adicionando...';

    // Coleta os dados do formulário
    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData.entries());
    
    // Converte os tipos de dados que precisam ser números
    dataToSend.id_categoria = parseInt(dataToSend.id_categoria);
    dataToSend.preco_atual = parseFloat(dataToSend.preco_atual);


    // Envia os dados (POST) para o script PHP
    fetch('../api/admin_add_produto.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Produto adicionado com sucesso!');
        // Redireciona de volta para a lista de admin
        window.location.href = '../templates/admin.html';
      } else {
        // Mostra erro (pode ser "não autorizado", "dados incompletos", etc.)
        alert('Erro ao salvar: ' + data.message);
        saveBtn.disabled = false;
        saveBtn.innerText = 'Adicionar Produto';
      }
    })
    .catch(error => {
      console.error('Erro de conexão:', error);
      alert('Erro ao salvar. Verifique sua conexão.');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Adicionar Produto';
    });
  });

  // 3. Carrega as categorias assim que a página abre
  loadCategories();
});