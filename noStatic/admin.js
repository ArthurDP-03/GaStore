document.addEventListener('DOMContentLoaded', function () {
  // --- VARIÁVEIS GLOBAIS ---
  let allProducts = []; // Guarda a lista completa de produtos
  const tbody = document.getElementById('product-list-body');
  const searchNameInput = document.getElementById('search-name');
  const filterPriceInput = document.getElementById('filter-price');
  const filterCategoryInput = document.getElementById('filter-category');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  // --- FUNÇÕES AUXILIARES ---

  /**
   * Renderiza a lista de produtos na tabela
   * @param {Array} products - A lista de produtos a ser renderizada
   */
  function renderProducts(products) {
    tbody.innerHTML = ''; // Limpa a tabela

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum produto encontrado com esses filtros.</td></tr>';
      return;
    }

    products.forEach(product => {
      const row = document.createElement('tr');

      // Garantir que o preço seja formatado corretamente
      const precoFormatado = parseFloat(product.preco_atual).toFixed(2);

      const imgHtml = product.capa ? `<img src="${product.capa}" alt="${product.titulo}" style="max-height:60px;">` : '';
      const descricao = product.descricao || '';
      const categoria = product.categoria || '';

      row.innerHTML = `
        <td>${product.id_produto}</td>
        <td>${imgHtml}</td>
        <td>${product.titulo}</td>
        <td>R$ ${precoFormatado}</td> 
        <td>${categoria}</td>
        <td>${descricao}</td>
        <td>
          <button class="edit-btn" data-id="${product.id_produto}">Editar</button>
          <button class="delete-btn" data-id="${product.id_produto}">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Popula o dropdown de categorias com base na lista vinda do PHP
   * @param {Array<string>} categories - A lista de NOMES de categorias
   */
  function populateCategoryFilter(categories) {
    filterCategoryInput.innerHTML = '<option value="">Por Categoria</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.innerText = category;
      filterCategoryInput.appendChild(option);
    });
  }

  /**
   * Aplica os filtros e atualiza a tabela
   */
  function applyFilters() {
    const searchName = searchNameInput.value.toLowerCase();
    const priceRange = filterPriceInput.value;
    const category = filterCategoryInput.value;

    let filteredProducts = allProducts;

    // 1. Filtro por Nome
    if (searchName) {
      filteredProducts = filteredProducts.filter(p =>
        p.titulo.toLowerCase().includes(searchName)
      );
    }

    // 2. Filtro por Categoria
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.categoria === category);
    }

    // 3. Filtro por Preço
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filteredProducts = filteredProducts.filter(p => {
        // Garante que a comparação seja feita com números
        const preco = parseFloat(p.preco_atual);
        return preco >= min && preco <= max;
      });
    }

    renderProducts(filteredProducts);
  }

  // --- INICIALIZAÇÃO DA PÁGINA ---

  // 1. BUSCAR DADOS QUANDO A PÁGINA CARREGA
  fetch('../api/admin.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'unauthorized') {
        alert('Acesso negado. Você não é um administrador.');
        window.location.href = '../templates/login.html';
      } else if (data.status === 'success') {
        document.getElementById('admin-id').innerText = data.admin.id;
        document.getElementById('admin-nome').innerText = data.admin.nome;
        document.getElementById('admin-email').innerText = data.admin.email;
        
        // Garante que o preço seja um número para o filtro
        allProducts = data.products.map(p => {
            p.preco_atual = parseFloat(p.preco_atual);
            return p;
        });

        populateCategoryFilter(data.all_categories);
        renderProducts(allProducts);
      } else {
        alert('Resposta inesperada do servidor.');
        console.error('Resposta do servidor:', data);
      }
    })
    .catch(error => {
      console.error('Erro ao buscar dados:', error);
      alert('Erro ao carregar dados do servidor.');
    });

  // --- EVENT LISTENERS (Ações do Usuário) ---

  // 2. AÇÃO DO BOTÃO DE ADICIONAR
  document.getElementById('add-product-btn').addEventListener('click', () => {
    window.location.href = '../templates/admin_add_produto.html';
  });

  // 3. AÇÃO DO BOTÃO DE DESLOGAR
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja deslogar?')) {
      fetch('../api/logout.php')
        .then(() => {
          alert('Você foi deslogado.');
          window.location.href = '../templates/login.html';
        })
        .catch(() => {
          alert('Erro ao deslogar.');
        });
    }
  });

  // --- 4. (ATUALIZADO) AÇÕES DE EDITAR/EXCLUIR ---
  tbody.addEventListener('click', function (e) {
    const id = e.target.dataset.id;
    if (!id) return;

    // Checa se o botão clicado foi o de EDITAR
    if (e.target.classList.contains('edit-btn')) {
      // Redireciona para a nova página de edição com o ID na URL
      window.location.href = `../templates/editarProduto.html?id=${id}`;
    }

    // Checa se o botão clicado foi o de EXCLUIR
    if (e.target.classList.contains('delete-btn')) {
      if (confirm(`Tem certeza que deseja excluir o produto ID: ${id}?`)) {
        
        // Faz a chamada fetch para a API de exclusão
        fetch(`../api/excluirProduto.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: id }) 
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            alert('Produto excluído!');
            // Remove a linha da tabela sem recarregar a página
            e.target.closest('tr').remove();
          } else {
            // Mostra erros, incluindo "não autorizado" se a sessão expirou
            alert('Erro ao excluir: ' + data.message);
          }
        })
        .catch(err => alert('Erro de conexão ao excluir.'));
      }
    }
  });
  // --- FIM DA ATUALIZAÇÃO ---


  // 5. EVENT LISTENERS DOS FILTROS
  searchNameInput.addEventListener('input', applyFilters);
  filterPriceInput.addEventListener('change', applyFilters);
  filterCategoryInput.addEventListener('change', applyFilters);

  clearFiltersBtn.addEventListener('click', () => {
    searchNameInput.value = '';
    filterPriceInput.value = '';
    filterCategoryInput.value = '';
    renderProducts(allProducts);
  });
});