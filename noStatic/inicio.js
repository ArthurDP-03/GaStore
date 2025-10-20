document.addEventListener('DOMContentLoaded', () => {
  const gameList = document.getElementById('game-list');
  const searchInput = document.getElementById('search-input');
  let allProducts = []; // Array para guardar a lista mestre de produtos

  // 1. Função para buscar os dados da API
  fetch('../api/inicio.php')
    .then(response => response.json())
    .then(data => {
      // Verifica se 'data' é um array (sucesso)
      if (Array.isArray(data)) {
        allProducts = data;
        renderProducts(allProducts); // Renderiza todos os produtos na tela
      } else {
        // Se a API retornar um erro (como status: error)
        console.error('API retornou um erro:', data.message);
        gameList.innerHTML = '<p>Erro ao carregar jogos. Tente novamente mais tarde.</p>';
      }
    })
    .catch(error => {
      // Erro de conexão ou JSON inválido
      console.error('Erro ao buscar produtos:', error);
      gameList.innerHTML = '<p>Erro de conexão ao carregar jogos.</p>';
    });

  // 2. Função que desenha os cards dos jogos na tela
  function renderProducts(products) {
    gameList.innerHTML = ''; // Limpa a lista (remove o "Carregando...")

    // Se a lista de produtos (filtrada ou não) estiver vazia
    if (products.length === 0) {
      gameList.innerHTML = '<p>Nenhum jogo encontrado com esse nome.</p>';
      return;
    }

    // Cria um card para cada produto
    products.forEach(product => {
      const gameCard = document.createElement('div');
      gameCard.className = 'jogo'; // Usa a classe .jogo do seu CSS

      // Formata o preço (mostra "Gratuito" se for 0)
      const preco = parseFloat(product.preco_atual) === 0 ? 'Gratuito' : `R$ ${parseFloat(product.preco_atual).toFixed(2)}`;

      // Define valores padrão caso algo venha nulo do banco
      const capa = product.capa || '../static/imagens/capa_padrao.jpg'; // (Crie uma imagem padrão se quiser)
      const categoria = product.categoria || 'Sem Categoria';
      const descricao = product.descricao || 'Sem descrição disponível.';
      const titulo = product.titulo || 'Jogo sem nome';

      // Monta o HTML interno do card
      gameCard.innerHTML = `
        <img src="${capa}" alt="${titulo}">
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <span class="categoria">${categoria}</span>
        <div class="preco">${preco}</div>
      `;
      
      // Adiciona o novo card na lista
      gameList.appendChild(gameCard);
    });
  }

  // 3. Função para aplicar o filtro de busca
  function applySearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Filtra a lista MESTRE (allProducts)
    const filteredProducts = allProducts.filter(product => 
      product.titulo.toLowerCase().includes(searchTerm)
    );
    
    // Renderiza apenas os produtos filtrados
    renderProducts(filteredProducts);
  }

  // 4. Adiciona o "escutador" de eventos na barra de busca
  // O evento 'input' dispara a cada letra digitada
  searchInput.addEventListener('input', applySearch);

});