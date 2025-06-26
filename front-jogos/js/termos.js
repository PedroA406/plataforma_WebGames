const termoForm = document.getElementById('termoForm');
const listaTermos = document.getElementById('lista-termos');

async function carregarTermos() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      listaTermos.innerHTML = '<p>Você precisa estar logado para ver os termos.</p>';
      return;
    }
    const res = await fetch('http://localhost:3000/api/termos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao buscar termos');
    const termos = await res.json();
    listaTermos.innerHTML = '';
    termos.forEach(t => {
      listaTermos.innerHTML += `
        <div class="termo-card">
          <div class="termo-texto"><strong>${t.termo}</strong></div>
          <div class="definicao-texto">${t.definicao}</div>
        </div>
      `;
    });
  } catch (err) {
    listaTermos.innerHTML = `<p style="color:red;">Erro ao carregar termos: ${err.message}</p>`;
  }
}


const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

termoForm.addEventListener('submit', async e => {
  e.preventDefault();
  const termo = document.getElementById('termo').value.trim();
  const definicao = document.getElementById('definicao').value.trim();
  if (!termo || !definicao) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para salvar termos');
      return;
    }

    const res = await fetch('http://localhost:3000/api/termos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ termo, definicao }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.erro || 'Erro ao salvar termo');
    }

    termoForm.reset();
    carregarTermos();
  } catch (err) {
    alert(err.message);
  }
});

window.onload = carregarTermos;
