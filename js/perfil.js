// js/perfil.js (versão completa e corrigida)

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Elementos do formulário de informações
const formInfoUsuario = document.getElementById('formInfoUsuario');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const mensagemInfoP = document.getElementById('mensagemInfo');

// Elementos do formulário de senha
const formMudarSenha = document.getElementById('formMudarSenha');
const mensagemSenhaP = document.getElementById('mensagemSenha');

// Função para carregar nome e email do usuário NOS CAMPOS DO FORMULÁRIO
async function carregarInfoUsuario() {
  try {
    const res = await fetch('http://localhost:3000/api/user/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.erro || 'Falha ao carregar dados do usuário.');
    }

    const user = await res.json();
    inputNome.value = user.nome;
    inputEmail.value = user.email;

  } catch (error) {
    mensagemInfoP.textContent = error.message;
    mensagemInfoP.className = 'mensagem erro';
  }
}

// Event listener do formulário de INFORMAÇÕES
formInfoUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagemInfoP.textContent = '';
    mensagemInfoP.className = 'mensagem';

    const nome = inputNome.value;
    const email = inputEmail.value;

    try {
        const res = await fetch('http://localhost:3000/api/user/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.erro || 'Ocorreu um erro ao salvar as informações.');
        }

        mensagemInfoP.textContent = 'Informações salvas com sucesso!';
        mensagemInfoP.classList.add('sucesso');
        
        // **MUITO IMPORTANTE**: Atualiza o nome no localStorage para refletir no header!
        localStorage.setItem('userName', data.nome);

    } catch(error) {
        mensagemInfoP.textContent = error.message;
        mensagemInfoP.classList.add('erro');
    }
});


// Event listener do formulário de MUDANÇA DE SENHA
formMudarSenha.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagemSenhaP.textContent = '';
  mensagemSenhaP.className = 'mensagem';

  const senhaAntiga = document.getElementById('senhaAntiga').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

  if (novaSenha !== confirmarNovaSenha) {
    mensagemSenhaP.textContent = 'A nova senha e a confirmação não correspondem.';
    mensagemSenhaP.classList.add('erro');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/user/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senhaAntiga, novaSenha })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Ocorreu um erro.');
    }

    mensagemSenhaP.textContent = 'Senha alterada com sucesso!';
    mensagemSenhaP.classList.add('sucesso');
    formMudarSenha.reset();

  } catch (error) {
    mensagemSenhaP.textContent = error.message;
    mensagemSenhaP.classList.add('erro');
  }
});

// Carregar tudo ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarInfoUsuario();
    // Adiciona o logout ao botão do header
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
});