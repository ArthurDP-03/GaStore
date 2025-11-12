document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-coupon-form');
  const saveBtn = document.getElementById('save-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerText = 'Adicionando...';

    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData.entries());
    
    // Converte os tipos de dados
    dataToSend.valor = parseFloat(dataToSend.valor);
    dataToSend.usos_restantes = parseInt(dataToSend.usos_restantes);

    fetch('../api/admin_add_cupom.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Cupom adicionado com sucesso!');
        window.location.href = '../templates/admin.html';
      } else {
        alert('Erro ao salvar: ' + data.message);
        saveBtn.disabled = false;
        saveBtn.innerText = 'Adicionar Cupom';
      }
    })
    .catch(error => {
      console.error('Erro de conexão:', error);
      alert('Erro ao salvar. Verifique sua conexão.');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Adicionar Cupom';
    });
  });
});