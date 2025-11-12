document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('compra-container');
    const loadingMessage = document.getElementById('loading-message');

    const urlParams = new URLSearchParams(window.location.search);
    const id_produto = urlParams.get('id');

    let produtoAtual = null; // Para guardar os dados do produto
    let cupomValidado = null; // Para guardar o código do cupom aplicado

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
                        <button id="btn-aplicar-cupom">Aplicar</button>
                    </div>
                    <p id="mensagem-cupom"></p>

                    <div class="total-container">
                        <span id="preco-original"></span>
                        <span id="valor-desconto"></span>
                        <span id="preco-final">Total: R$ ${precoFormatado}</span>
                    </div>

                    <button id="btn-confirmar-compra">Confirmar Compra</button>
                    <p id="mensagem-compra"></p>
                </div>
            </div>
        `;

        // 3. ADICIONAR EVENTOS AOS BOTÕES
        document.getElementById('btn-aplicar-cupom').addEventListener('click', aplicarCupom);
        document.getElementById('btn-confirmar-compra').addEventListener('click', processarCompra);
    }

    // 4. FUNÇÃO PARA APLICAR O CUPOM (NOVA)
    function aplicarCupom() {
        const cupomInput = document.getElementById('cupom-input');
        const cupom = cupomInput.value.trim();
        const btnAplicar = document.getElementById('btn-aplicar-cupom');
        const msgCupom = document.getElementById('mensagem-cupom');

        const precoOriginalEl = document.getElementById('preco-original');
        const valorDescontoEl = document.getElementById('valor-desconto');
        const precoFinalEl = document.getElementById('preco-final');

        if (!cupom) {
            msgCupom.textContent = "Digite um código.";
            msgCupom.style.color = 'red';
            return;
        }

        btnAplicar.disabled = true;
        btnAplicar.textContent = '...';
        msgCupom.textContent = '';

        fetch('../api/verificar_cupom.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_produto: produtoAtual.id_produto,
                codigo_cupom: cupom
            })
        })
        .then(response => response.json())
        .then(data => {
            btnAplicar.disabled = false;
            btnAplicar.textContent = 'Aplicar';

            if (data.status === 'success') {
                msgCupom.style.color = 'green';
                msgCupom.textContent = data.message;

                // Atualiza os preços na tela
                precoOriginalEl.textContent = `Preço Original: R$ ${parseFloat(data.preco_original).toFixed(2)}`;
                valorDescontoEl.textContent = `Desconto: - R$ ${parseFloat(data.valor_desconto).toFixed(2)}`;
                precoFinalEl.textContent = `Total: R$ ${parseFloat(data.preco_final).toFixed(2)}`;

                cupomValidado = cupom; // Armazena o cupom que deu certo
                cupomInput.disabled = true; // Trava o campo
                btnAplicar.disabled = true; // Trava o botão
            } else {
                msgCupom.style.color = 'red';
                msgCupom.textContent = data.message;
                
                // Reseta os preços
                precoOriginalEl.textContent = '';
                valorDescontoEl.textContent = '';
                precoFinalEl.textContent = `Total: R$ ${parseFloat(produtoAtual.preco_atual).toFixed(2)}`;
                
                cupomValidado = null; // Limpa o cupom inválido
            }
        })
        .catch(err => {
            console.error(err);
            btnAplicar.disabled = false;
            btnAplicar.textContent = 'Aplicar';
            msgCupom.style.color = 'red';
            msgCupom.textContent = 'Erro de conexão ao aplicar cupom.';
        });
    }

    // 5. FUNÇÃO PARA PROCESSAR A COMPRA (MODIFICADA)
    function processarCompra() {
        const btn = document.getElementById('btn-confirmar-compra');
        const msg = document.getElementById('mensagem-compra');

        btn.disabled = true;
        btn.textContent = 'Processando...';
        msg.textContent = '';
        msg.style.color = 'white';

        const dadosCompra = {
            id_produto: produtoAtual.id_produto,
            // Envia o cupom SÓ se ele foi validado com sucesso
            codigo_cupom: cupomValidado 
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