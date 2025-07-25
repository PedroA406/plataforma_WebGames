const formTermo = document.getElementById('formTermo');
const mensagem = document.getElementById('mensagem');
const listaTermos = document.getElementById('lista-termos');

formTermo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const termo = document.getElementById('termo').value.trim();
  const definicao = document.getElementById('definicao').value.trim();

  if (!termo || !definicao) {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      mensagem.style.color = 'red';
      mensagem.textContent = 'Usuário não autenticado.';
      return;
    }

    const res = await fetch('http://localhost:3000/api/termos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ termo, definicao }),
    });

    const data = await res.json();

    if (!res.ok) {
      mensagem.style.color = 'red';
      mensagem.textContent = data.erro || 'Erro ao salvar termo.';
      return;
    }


    const card = document.createElement('div');
    card.classList.add('termo-card');
    card.innerHTML = `<div layout = "background-color: rgba(15, 32, 39, 0.6)"><h3>${termo}</h3><p>${definicao}</p></div>`;
    listaTermos.appendChild(card);

    mensagem.style.color = 'green';
    mensagem.textContent = 'Termo salvo com sucesso!';
    formTermo.reset();

  } catch (error) {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro na conexão com o servidor.';
  }
});
