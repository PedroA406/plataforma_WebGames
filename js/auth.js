// ================== Cadastro ==================
const registerForm = document.getElementById('registerForm');
const mensagemRegister = document.getElementById('mensagem');

function validarEmail(email) {
  // Regex simples para validar email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    // Validações básicas
    if (!nome) {
      alert('Por favor, preencha o nome.');
      return;
    }
    if (!email) {
      alert('Por favor, preencha o e-mail.');
      return;
    }
    if (!validarEmail(email)) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

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
        alert(mensagemRegister.textContent);
        return;
      }

      mensagemRegister.style.color = 'green';
      mensagemRegister.textContent = 'Cadastro realizado com sucesso! Redirecionando para o login...';
      alert('Cadastro realizado com sucesso!');
      registerForm.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } catch (error) {
      mensagemRegister.style.color = 'red';
      mensagemRegister.textContent = 'Erro ao conectar com o servidor.';
      alert(mensagemRegister.textContent);
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

    // Validações básicas
    if (!email) {
      alert('Por favor, preencha o e-mail.');
      return;
    }
    if (!validarEmail(email)) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

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
        alert(mensagemLogin.textContent);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('nome', data.nome);

      window.location.href = 'index.html';

    } catch (error) {
      mensagemLogin.style.color = 'red';
      mensagemLogin.textContent = 'Erro ao conectar com o servidor.';
      alert(mensagemLogin.textContent);
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
