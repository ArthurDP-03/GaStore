document.addEventListener('DOMContentLoaded', function () { // Espera o carregamento completo do DOM
    const header = document.createElement('header'); // Cria um header
    const style = document.createElement('style'); // Cria um elemento <style> para os estilos  
    // Adiciona o conteúdo HTML do cabeçalho
    header.innerHTML = `
        <div class="menu-container">
        <div class="logo">GaStore</div>
        
        <div class="menu-buttons">
            <button onclick="window.location.href='../templates/inicio.html'">Início</button>
            <button onclick="window.location.href='../templates/sobre.html'">Sobre</button>
            <button onclick="window.location.href='../templates/suporte.html'">Suporte</button>
            <button onclick="window.location.href='../templates/perfil.html'">
                Perfil: <span id="perfil-nome"></span>
            </button> 
        </div>
        </div>

    `;

    style.innerHTML = `
    /* ====== CONTAINER PRINCIPAL ====== */
    .menu-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1c1c2b;
    padding: 15px 40px;
    box-shadow: 0 0 20px #1c1c2b;
    backdrop-filter: blur(8px);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    }

    /* ====== LOGO ====== */
    .logo {
    font-weight: bold;
    font-size: 22px;
    color: #a68bff;
    letter-spacing: 1px;
    cursor: pointer;
    transition: 0.3s;
    }


    .logo:hover {
    color: #d4c3ff;
    }

    /* ====== BOTÕES DO MENU ====== */
    .menu-buttons {
    display: flex;
    gap: 30px;
    }

    .menu-buttons button {
    background: none;
    border: none;
    color: #c7c7d2;
    font-size: 15px;
    cursor: pointer;
    transition: 0.3s;
    position: relative;
    font-weight: 500;
    }

    .menu-buttons button:hover {
    color: #b98bff;
    }

    .menu-buttons button::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0%;
    height: 2px;
    background: #b98bff;
    transition: width 0.3s ease;
    }

    .menu-buttons button:hover::after {
    width: 100%;
    }
`;

    document.body.appendChild(style); // Adiciona os estilos ao <body>
    document.body.insertBefore(header, document.body.firstChild); // Adiciona o cabeçalho ao <body>
    fetch('../api/menu.php', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'sucesso') {
                // Exibe o nome do usuário logado
                document.getElementById('perfil-nome').innerHTML = data.nome;
            } else {
                // Exibe mensagem de erro ou redireciona
                alert(data.mensagem);
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 2000);
            }
        
        });
    });


