document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edit-coupon-form');
  const loadingMessage = document.getElementById('loading-message');
  const saveBtn = document.getElementById('save-btn');

  const urlParams = new URLSearchParams(window.location.search);
  const id_cupom = urlParams.get('id');

  if (!id_cupom) {
    alert('ID do cupom não encontrado. Redirecionando...');
    window.location.href = '../templates/admin.html';
    return;
  }

  // 1. Função para carregar os dados do cupom
  function loadCouponData() {
    fetch(`../api/editarCupom.php?id=${id_cupom}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'unauthorized') {
          alert('Acesso negado.');
          window.location.href = '../templates/login.html';
          return;
        }

        if (data.status === 'error') {
          alert('Erro: ' + data.message);
          window.location.href = '../templates/admin.html';
          return;
        }

        const coupon = data.coupon;
        document.getElementById('id_cupom').value = coupon.id_cupom;
        document.getElementById('codigo').value = coupon.codigo;
        document.getElementById('tipo_desconto').value = coupon.tipo_desconto;
        document.getElementById('valor').value = parseFloat(coupon.valor).toFixed(2);
        document.getElementById('data_validade').value = coupon.data_validade;
        document.getElementById('usos_restantes').value = coupon.usos_restantes;

        loadingMessage.style.display = 'none';
      })
      .catch(error => {
        console.error('Erro de conexão:', error);
        alert('Erro ao carregar dados. Verifique sua conexão.');
      });
  }

  // 2. Listener para o envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    saveBtn.disabled = true;
    saveBtn.innerText = 'Salvando...';

    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData.entries());
    
    // Converte os tipos de dados
    dataToSend.id_cupom = parseInt(dataToSend.id_cupom);
    dataToSend.valor = parseFloat(dataToSend.valor);
    dataToSend.usos_restantes = parseInt(dataToSend.usos_restantes);

    fetch('../api/editarCupom.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Cupom atualizado com sucesso!');
        window.location.href = '../templates/admin.html';
      } else {
        alert('Erro ao salvar: ' + data.message);
        saveBtn.disabled = false;
        saveBtn.innerText = 'Salvar Alterações';
      }
    })
    .catch(error => {
      console.error('Erro de conexão:', error);
      alert('Erro ao salvar. Verifique sua conexão.');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Salvar Alterações';
    });
  });

  // 3. Carrega os dados assim que a página abre
  loadCouponData();
});