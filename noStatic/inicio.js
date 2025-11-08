document.addEventListener('DOMContentLoaded', () => {
  const gameList = document.getElementById('game-list');
  const searchInput = document.getElementById('search-input');
  const filterPriceInput = document.getElementById('filter-price');
  const filterCategoryInput = document.getElementById('filter-category');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  let allProducts = [];

  // 1. Função para buscar os dados da API (Atualizada)
  fetch('../api/inicio.php')
    .then(response => response.json())
    .then(data => {
      // 1. Check de Sucesso (status: 'success')
      if (data.status === 'success' && data.products) {
        allProducts = data.products;
        populateCategoryFilter(data.all_categories);
        renderProducts(allProducts);

      // 2. Check de Autorização (status: 'unauthorized' ou 'admin_logout')
      } else if (data.status === 'unauthorized' || data.status === 'admin_logout') {
        alert(data.mensagem); // Ex: "Você não está logado."
        window.location.href = '../templates/login.html'; // Redireciona para o login
      
      // 3. Outros Erros (status: 'error')
      } else {
        console.error('API retornou um erro:', data.message || 'Formato inesperado');
        gameList.innerHTML = `<p>Erro ao carregar jogos: ${data.message || 'Tente novamente.'}</p>`;
      }
    })
    .catch(error => {
      console.error('Erro de conexão ao buscar produtos:', error);
      gameList.innerHTML = '<p>Erro de conexão ao carregar jogos.</p>';
    });

  // 2. Função que desenha os cards dos jogos na tela
  function renderProducts(products) {
    gameList.innerHTML = '';

    if (products.length === 0) {
      gameList.innerHTML = '<p>Nenhum jogo encontrado com esses filtros.</p>';
      return;
    }

    products.forEach(product => {
      const gameCard = document.createElement('div');
      gameCard.className = 'jogo';

      const preco = parseFloat(product.preco_atual) === 0 ? 'Gratuito' : `R$ ${parseFloat(product.preco_atual).toFixed(2)}`;
      const capa = product.capa || '../static/imagens/capa_padrao.jpg';
      const categoria = product.categoria || 'Sem Categoria';
      const descricao = product.descricao || 'Sem descrição disponível.';
      const titulo = product.titulo || 'Jogo sem nome';

      // HTML com os botões "Comprar", "Detalhes" e "Wishlist"
      gameCard.innerHTML = `
        <img src="${capa}" alt="${titulo}">
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <span class="categoria">${categoria}</span>
        
        <div class="preco-container">
          <div class="preco">${preco}</div>
          <button class="wishlist-btn" data-id="${product.id_produto}" title="Adicionar à Lista de Desejos">
            +
          </button>
        </div>

        <div class="botoes-acao">
          <a href="compra.html?id=${product.id_produto}" class="btn-comprar">Comprar</a>
          <a href="detalhesProduto.html?id=${product.id_produto}" class="btn-detalhes">Detalhes</a>
        </div>
      `;
      gameList.appendChild(gameCard);
    });
  }

  // 3. Popula o dropdown de categorias
  function populateCategoryFilter(categories) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.innerText = category;
      filterCategoryInput.appendChild(option);
    });
  }

  // 4. Função para aplicar TODOS os filtros (sem alterações)
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const priceRange = filterPriceInput.value;
    const category = filterCategoryInput.value;

    let filteredProducts = allProducts;

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.titulo.toLowerCase().includes(searchTerm)
      );
    }
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.categoria === category
      );
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filteredProducts = filteredProducts.filter(product =>
        product.preco_atual >= min && product.preco_atual <= max
      );
    }
    renderProducts(filteredProducts);
  }

  // 5. Adiciona os "escutadores" de eventos
  searchInput.addEventListener('input', applyFilters);
  filterPriceInput.addEventListener('change', applyFilters);
  filterCategoryInput.addEventListener('change', applyFilters);

  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterPriceInput.value = '';
    filterCategoryInput.value = '';
    renderProducts(allProducts);
  });

  // 6. Listener para o botão Wishlist (Ação "add")
  gameList.addEventListener('click', (e) => {
    if (e.target.classList.contains('wishlist-btn')) {
      const btn = e.target;
      const idProduto = btn.dataset.id;
      
      const formData = new FormData();
      formData.append('id_produto', idProduto);
      formData.append('action', 'add'); // Ação de adicionar

      btn.disabled = true;
      btn.textContent = '...';

      // Chama a api/wishlist.php (que já tem a segurança de sessão)
      fetch('../api/wishlist.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success' || data.status === 'info') {
          btn.textContent = '✓';
          btn.style.backgroundColor = '#28a745';
          alert(data.message);
        } else {
          alert(data.message); 
          btn.textContent = '+';
          btn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Erro ao adicionar na wishlist:', error);
        alert('Erro de conexão. Tente novamente.');
        btn.textContent = '+';
        btn.disabled = false;
      });
    }
  });

});