<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="login">
      <h2>Iniciar Sesión</h2>
      <input v-model="username" type="text" placeholder="Usuario" />
      <input v-model="password" type="password" placeholder="Contraseña" />
      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');

const login = async () => {
  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, password: password.value })
  });

  const data = await res.json();
  alert(data.message);
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to right, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.login-form h2 {
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
}

.login-form input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-form button {
  width: 100%;
  padding: 0.8rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-form button:hover {
  background-color: #5a67d8;
}
</style>
