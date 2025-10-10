document.querySelector('.logout-button').addEventListener('click', e => {
    e.preventDefault();

    fetch('../api/perfil.php', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('mensagem-logout').innerHTML = data.mensagem;
            if (data.status === 'sucesso') {
                setTimeout(() => {
                    window.location.href = '../templates/login.html';
                }, 1500); // Dá tempo de mostrar a mensagem antes de redirecionar
            }
        });
});