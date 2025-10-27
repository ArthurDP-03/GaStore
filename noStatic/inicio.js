document.addEventListener('DOMContentLoaded', () => {
  // Pega os elementos do DOM
  const gameList = document.getElementById('game-list');
  const searchInput = document.getElementById('search-input');
  const filterPriceInput = document.getElementById('filter-price');
  const filterCategoryInput = document.getElementById('filter-category');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  let allProducts = []; // Array para guardar a lista mestre de produtos

  // 1. Função para buscar os dados da API
  fetch('../api/inicio.php')
    .then(response => response.json())
    .then(data => {
      // ATUALIZADO: Agora espera um objeto {products: [], all_categories: []}
      if (data.products && data.all_categories) {
        allProducts = data.products;
        populateCategoryFilter(data.all_categories); // Popula o <select> de categorias
        renderProducts(allProducts); // Renderiza todos os produtos na tela
      } else {
        console.error('API retornou um erro ou formato inesperado:', data.message || data);
        gameList.innerHTML = '<p>Erro ao carregar jogos. Tente novamente mais tarde.</p>';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar produtos:', error);
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

      // Formata o preço (mostra "Gratuito" se for 0)
      const preco = parseFloat(product.preco_atual) === 0 ? 'Gratuito' : `R$ ${parseFloat(product.preco_atual).toFixed(2)}`;

      const capa = product.capa || '../static/imagens/capa_padrao.jpg';
      const categoria = product.categoria || 'Sem Categoria';
      const descricao = product.descricao || 'Sem descrição disponível.';
      const titulo = product.titulo || 'Jogo sem nome';

      gameCard.innerHTML = `
        <img src="${capa}" alt="${titulo}">
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <span class="categoria">${categoria}</span>
        <div class="preco">${preco}</div>
      `;

      gameList.appendChild(gameCard);
    });
  }

  // 3. NOVO: Popula o dropdown de categorias
  function populateCategoryFilter(categories) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.innerText = category;
      filterCategoryInput.appendChild(option);
    });
  }

  // 4. ATUALIZADO: Função para aplicar TODOS os filtros
  function applyFilters() {
    // Pega os valores de todos os filtros
    const searchTerm = searchInput.value.toLowerCase();
    const priceRange = filterPriceInput.value;
    const category = filterCategoryInput.value;

    // Começa com a lista completa
    let filteredProducts = allProducts;

    // 1. Filtra por Nome
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.titulo.toLowerCase().includes(searchTerm)
      );
    }

    // 2. Filtra por Categoria
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.categoria === category
      );
    }

    // 3. Filtra por Preço
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filteredProducts = filteredProducts.filter(product =>
        product.preco_atual >= min && product.preco_atual <= max
      );
    }

    // Renderiza apenas os produtos filtrados
    renderProducts(filteredProducts);
  }

  // 5. Adiciona os "escutadores" de eventos
  searchInput.addEventListener('input', applyFilters);
  filterPriceInput.addEventListener('change', applyFilters);
  filterCategoryInput.addEventListener('change', applyFilters);

  clearFiltersBtn.addEventListener('click', () => {
    // Limpa os campos
    searchInput.value = '';
    filterPriceInput.value = '';
    filterCategoryInput.value = '';

    // Re-renderiza a lista completa
    renderProducts(allProducts);
  });

});