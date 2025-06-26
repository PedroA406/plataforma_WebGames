// ================== Cadastro ==================
const registerForm = document.getElementById('registerForm');
const mensagemRegister = document.getElementById('mensagem');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        mensagemRegister.style.color = 'red';
        mensagemRegister.textContent = data.erro || 'Erro no cadastro';
        return;
      }

      mensagemRegister.style.color = 'green';
      mensagemRegister.textContent = 'Cadastro realizado com sucesso! Redirecionando para o login...';
      registerForm.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } catch (error) {
      mensagemRegister.style.color = 'red';
      mensagemRegister.textContent = 'Erro ao conectar com o servidor.';
    }
  });
}

// ================== Login ==================
const loginForm = document.getElementById('loginForm');
const mensagemLogin = document.getElementById('mensagemLogin');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        mensagemLogin.style.color = 'red';
        mensagemLogin.textContent = data.erro || 'Erro no login';
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('nome', data.nome);

      window.location.href = 'index.html';

    } catch (error) {
      mensagemLogin.style.color = 'red';
      mensagemLogin.textContent = 'Erro ao conectar com o servidor.';
    }
  });
}

// ================== Verificação e Saudação (Dashboard) ==================
const token = localStorage.getItem('token');
const nomeUsuario = localStorage.getItem('nome');

const boasVindas = document.getElementById('boasVindas');
if (boasVindas && nomeUsuario) {
  boasVindas.textContent = `Bem-vindo(a), ${nomeUsuario}!`;
}

if (boasVindas && !token) {
  window.location.href = 'login.html';
}

// ================== Logout ==================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}
