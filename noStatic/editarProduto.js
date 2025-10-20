document.addEventListener('DOMContentLoaded', () => {
  // Pega os elementos do formulário
  const form = document.getElementById('edit-form');
  const loadingMessage = document.getElementById('loading-message');
  const categorySelect = document.getElementById('id_categoria');
  const saveBtn = document.getElementById('save-btn');

  // Pega o ID do produto da URL (ex: ...?id=12)
  const urlParams = new URLSearchParams(window.location.search);
  const id_produto = urlParams.get('id');

  if (!id_produto) {
    alert('ID do produto não encontrado. Redirecionando...');
    window.location.href = '../templates/admin.html';
    return;
  }

  // 1. Função para carregar os dados do produto
  function loadProductData() {
    fetch(`../api/editarProduto.php?id=${id_produto}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unauthorized') {
          alert('Acesso negado. Você não é um administrador.');
          window.location.href = '../templates/login.html';
          return;
        }

        if (data.status === 'error') {
          alert('Erro: ' + data.message);
          window.location.href = '../templates/admin.html';
          return;
        }

        // Se deu tudo certo, preenche o formulário
        const product = data.product;
        document.getElementById('id_produto').value = product.id_produto;
        document.getElementById('titulo').value = product.titulo;
        document.getElementById('capa').value = product.capa || '';
        document.getElementById('descricao').value = product.descricao || '';
        document.getElementById('preco_atual').value = parseFloat(product.preco_atual).toFixed(2);

        // Preenche o <select> de categorias
        categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        data.categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id_categoria;
          option.innerText = category.nome;
          
          // Marca a categoria atual do produto como selecionada
          if (category.id_categoria == product.id_categoria) {
            option.selected = true;
          }
          categorySelect.appendChild(option);
        });

        // Esconde a mensagem de "Carregando"
        loadingMessage.style.display = 'none';
      })
      .catch(error => {
        console.error('Erro de conexão:', error);
        alert('Erro ao carregar dados. Verifique sua conexão.');
      });
  }

  // 2. Adiciona o listener para o envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio tradicional
    saveBtn.disabled = true;
    saveBtn.innerText = 'Salvando...';

    // Coleta os dados do formulário
    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData.entries());
    
    // Converte os tipos de dados que precisam ser números
    dataToSend.id_produto = parseInt(dataToSend.id_produto);
    dataToSend.id_categoria = parseInt(dataToSend.id_categoria);
    dataToSend.preco_atual = parseFloat(dataToSend.preco_atual);


    // Envia os dados (POST) para o mesmo endpoint
    fetch('../api/editarProduto.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Produto atualizado com sucesso!');
        // Redireciona de volta para a lista
        window.location.href = '../templates/admin.html';
      } else {
        // Mostra erro (pode ser "não autorizado", "dados incompletos", etc.)
        alert('Erro ao salvar: ' + data.message);
        saveBtn.disabled = false;
        saveBtn.innerText = 'Salvar Alterações';
      }
    })
    .catch(error => {
      console.error('Erro de conexão:', error);
      alert('Erro ao salvar. Verifique sua conexão.');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Salvar Alterações';
    });
  });

  // 3. Carrega os dados assim que a página abre
  loadProductData();
});