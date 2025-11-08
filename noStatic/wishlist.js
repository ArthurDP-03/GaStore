document.addEventListener('DOMContentLoaded', () => {
  const wishlistList = document.getElementById('wishlist-list');

  // --- 1. FUNÇÃO DE RENDERIZAÇÃO ---
  function renderWishlist(products) {
    wishlistList.innerHTML = '';
    if (products.length === 0) {
      wishlistList.innerHTML = '<p>Sua lista de desejos está vazia.</p>';
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

      gameCard.innerHTML = `
        <img src="${capa}" alt="${titulo}">
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <span class="categoria">${categoria}</span>
        <div class="preco-container">
          <div class="preco">${preco}</div>
        </div>
        <div class="botoes-acao">
          <a href="compra.html?id=${product.id_produto}" class="btn-comprar">Comprar</a>
          <button class="btn-remover" data-id="${product.id_produto}">Remover</button>
        </div>
      `;
      wishlistList.appendChild(gameCard);
    });
  }

  // --- 2. FUNÇÃO PARA BUSCAR OS DADOS (Read) ---
  function loadWishlist() {
    fetch('../api/wishlist.php', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        renderWishlist(data.products);
      } else if (data.status === 'unauthorized') {
        alert(data.message);
        window.location.href = '../templates/login.html';
      } else {
        wishlistList.innerHTML = `<p>Erro ao carregar sua lista: ${data.message}</p>`;
      }
    })
    .catch(error => {
      console.error('Erro de conexão:', error);
      wishlistList.innerHTML = '<p>Erro de conexão. Tente novamente.</p>';
    });
  }

  // --- 3. EVENT LISTENER PARA REMOVER (Delete) ---
  wishlistList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remover')) {
      const btn = e.target;
      const idProduto = btn.dataset.id;
      
      if (!confirm('Tem certeza que deseja remover este jogo da lista?')) {
        return;
      }
      const formData = new FormData();
      formData.append('id_produto', idProduto);
      formData.append('action', 'remove');

      btn.disabled = true;
      btn.textContent = 'Removendo...';

      fetch('../api/wishlist.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          e.target.closest('.jogo').remove();
          if (wishlistList.children.length === 0) {
             wishlistList.innerHTML = '<p>Sua lista de desejos está vazia.</p>';
          }
        } else {
          alert(data.message);
          btn.disabled = false;
          btn.textContent = 'Remover';
        }
      })
      .catch(error => {
        console.error('Erro ao remover:', error);
        alert('Erro de conexão. Tente novamente.');
        btn.disabled = false;
        btn.textContent = 'Remover';
      });
    }
  });

  // --- 4. INICIALIZAÇÃO ---
  loadWishlist();
});