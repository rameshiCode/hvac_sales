<template>
    <header class="header">
      <div class="header-content">
        <img alt="E-caldura Logo" class="logo1" src="@/assets/logo.png" />
        <nav class="nav">
          <RouterLink to="/ping">Ping</RouterLink>
          <RouterLink to="/sign-up">SignUp</RouterLink>
          <RouterLink to="/login">Login</RouterLink>
        </nav>
      </div>
    </header>
  </template>
  
  <script>
  import { RouterLink } from 'vue-router';
  
  export default {
    name: 'Header',
    components: {
      RouterLink
    }
  };
  </script>
  

