document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('compra-container');
    const loadingMessage = document.getElementById('loading-message');

    const urlParams = new URLSearchParams(window.location.search);
    const id_produto = urlParams.get('id');

    let produtoAtual = null; // Para guardar os dados do produto

    if (!id_produto) {
        container.innerHTML = '<h2>Erro</h2><p>Nenhum produto selecionado.</p>';
        return;
    }

    // 1. BUSCAR DADOS DO PRODUTO (GET)
    fetch(`../api/compra.php?id=${id_produto}`)
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = 'none';

            if (data.status === 'success') {
                produtoAtual = data.product;
                produtoAtual.id_produto = id_produto; // Armazena o ID
                renderPaginaCompra(produtoAtual);
            } else if (data.status === 'info') {
                // Usuário já possui o jogo
                container.innerHTML = `
                    <h2>Aviso</h2>
                    <p>${data.message}</p>
                    <a href="inicio.html" style="color: #fff;">Voltar ao início</a>
                `;
            } else if (data.status === 'unauthorized') {
                alert(data.message);
                window.location.href = '../templates/login.html';
            } else {
                container.innerHTML = `<h2>Erro</h2><p>${data.message}</p>`;
            }
        })
        .catch(err => {
            console.error(err);
            loadingMessage.style.display = 'none';
            container.innerHTML = '<h2>Erro de Conexão</h2><p>Não foi possível carregar os dados.</p>';
        });

    // 2. FUNÇÃO PARA RENDERIZAR A PÁGINA
    function renderPaginaCompra(produto) {
        const precoFormatado = parseFloat(produto.preco_atual).toFixed(2);
        
        container.innerHTML = `
            <div class="compra-layout">
                <img src="${produto.capa || '../static/imagens/capa_padrao.jpg'}" alt="${produto.titulo}">
                <div class="compra-detalhes">
                    <h3>${produto.titulo}</h3>
                    
                    <div class="cupom-container">
                        <input type="text" id="cupom-input" placeholder="Código do Cupom">
                        </div>

                    <div class="total-container">
                        Total: 
                        <span id="preco-final">R$ ${precoFormatado}</span>
                        </div>

                    <button id="btn-confirmar-compra">Confirmar Compra</button>
                    <p id="mensagem-compra"></p>
                </div>
            </div>
        `;

        // 3. ADICIONAR EVENTO AO BOTÃO DE CONFIRMAR
        document.getElementById('btn-confirmar-compra').addEventListener('click', processarCompra);
    }

    // 4. FUNÇÃO PARA PROCESSAR A COMPRA (POST)
    function processarCompra() {
        const btn = document.getElementById('btn-confirmar-compra');
        const msg = document.getElementById('mensagem-compra');
        const cupom = document.getElementById('cupom-input').value.trim();

        btn.disabled = true;
        btn.textContent = 'Processando...';
        msg.textContent = '';
        msg.style.color = 'white';

        const dadosCompra = {
            id_produto: produtoAtual.id_produto,
            codigo_cupom: cupom || null
        };

        fetch('../api/compra.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCompra)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                msg.style.color = 'green';
                msg.textContent = 'Compra realizada com sucesso! Redirecionando...';
                setTimeout(() => {
                    window.location.href = '../templates/perfil.html'; // Redireciona para o perfil
                }, 2500);
            } else {
                msg.style.color = 'red';
                msg.textContent = `Erro: ${data.message}`;
                btn.disabled = false;
                btn.textContent = 'Confirmar Compra';
            }
        })
        .catch(err => {
            console.error(err);
            msg.style.color = 'red';
            msg.textContent = 'Erro de conexão ao finalizar a compra.';
            btn.disabled = false;
            btn.textContent = 'Confirmar Compra';
        });
    }
});