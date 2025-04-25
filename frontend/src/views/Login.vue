<template>
  <form @submit.prevent="login">
    <input v-model="username" placeholder="Usuario" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button type="submit">Entrar</button>
  </form>
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
