document.addEventListener('DOMContentLoaded', function() {
            
            // 1. BUSCAR DADOS QUANDO A PÁGINA CARREGA
            fetch('../api/admin_data.php')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'unauthorized') {
                        // Se não for admin, expulsa para o login
                        alert('Acesso negado. Você não é um administrador.');
                        window.location.href = '../templates/login.html';
                    } else if (data.status === 'success') {
                        // Se for admin, preenche os dados
                        
                        // Preenche dados do admin
                        document.getElementById('admin-id').innerText = data.admin.id;
                        document.getElementById('admin-nome').innerText = data.admin.nome;
                        document.getElementById('admin-email').innerText = data.admin.email;

                        // Preenche a tabela de produtos
                        const tbody = document.getElementById('product-list-body');
                        tbody.innerHTML = ''; // Limpa o "Carregando..."
                        
                        data.products.forEach(product => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${product.id_produto}</td>
                                <td><img src="${product.capa}" alt="${product.titulo}"></td>
                                <td>${product.titulo}</td>
                                <td>R$ ${product.preco_atual}</td>
                            `;
                            tbody.appendChild(row);
                        });
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar dados:', error);
                    alert('Erro ao carregar dados do servidor.');
                });

            // 2. AÇÃO DO BOTÃO DE ADICIONAR
            document.getElementById('add-product-btn').addEventListener('click', () => {
                // Você pode criar uma página separada para isso
                window.location.href = '../templates/admin_add_produto.html';
            });

            // 3. AÇÃO DO BOTÃO DE DESLOGAR
            document.getElementById('logout-btn').addEventListener('click', () => {
                if (confirm('Tem certeza que deseja deslogar?')) {
                    fetch('../api/logout.php')
                        .then(() => {
                            alert('Você foi deslogado.');
                            window.location.href = '../templates/login.html';
                        });
                }
            });
        });