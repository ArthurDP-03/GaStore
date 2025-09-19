document.addEventListener('DOMContentLoaded', function() { // Espera o carregamento completo do DOM
    const header = document.createElement('header'); // Seleciona o elemento <header>
    const style = document.createElement('style'); // Cria um elemento <style> para os estilos  
    // Adiciona o conteúdo HTML do cabeçalho
    header.innerHTML = `
        <div class="container-menu">
            <div class="logo">GaStore</div>
            <div class="menu-item">Início</div>
            <div class="menu-item">Sobre</div>
            <div class="menu-item">Suporte</div>
            <div class="menu-item">Perfil</div>
        </div>
    `;

    style.innerHTML = `
        header {
            background-color: #222;
            padding: 10px 20px;
            color: white;
        }
        .container-menu {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 20px;
            font-weight: bold;
        }
        .menu-item {
            margin-left: 20px;
            cursor: pointer;
            transition: 0.3s;
        }
        .menu-item:hover {
            color: #ff9800;
        }
    `;

    document.head.appendChild(style); // Adiciona os estilos ao <head>
    document.body.insertBefore(header, document.body.firstChild); // Adiciona o cabeçalho ao <body>
})