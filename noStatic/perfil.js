const editarBtn = document.getElementById('editarBtn');
const salvarBtn = document.getElementById('salvarBtn');

editarBtn.addEventListener('click', () => {
    // Esconde os spans, mostra os inputs
    document.querySelectorAll('span').forEach(span => span.style.display = 'none');
    document.querySelectorAll('input').forEach(input => input.style.display = 'block');
    document.getElementById('senhaDisplay').style.display = 'block';

    editarBtn.style.display = 'none';
    salvarBtn.style.display = 'inline-block';
});

salvarBtn.addEventListener('click', () => {
    // Atualiza os spans com os valores dos inputs
    document.getElementById('nomeDisplay').textContent = document.getElementById('nomeInput').value;
    document.getElementById('emailDisplay').textContent = document.getElementById('emailInput').value;
    document.getElementById('telefoneDisplay').textContent = document.getElementById('telefoneInput').value;

    // Volta para modo leitura
    document.querySelectorAll('span').forEach(span => span.style.display = 'block');
    document.querySelectorAll('input').forEach(input => input.style.display = 'none');
    document.getElementById('senhaDisplay').style.display = 'none';

    editarBtn.style.display = 'inline-block';
    salvarBtn.style.display = 'none';
});


//Logout
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