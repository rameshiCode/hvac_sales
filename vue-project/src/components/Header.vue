<template>
    <header class="header">
      <div class="header-content">
        <img alt="E-caldura Logo" class="logo" src="@/assets/logo.png" />
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
  
  <style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    background-color: #222;   /* Adjust to match your design */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 1); /* Adjust to match your design */
    /* z-index: 1000; Ensure the header is above other content */
}
  
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1200px;
  }
  
  .logo {
    max-width: 200px;
    height: auto;
    border-radius: 16px;
  }
  
  .nav {
    display: flex;
    gap: 20px;
    font-size: 18px;
  }
  
  .nav a {
    color: #00ff00; /* Adjust the color to match your design */
    text-decoration: none;
    font-weight: bold;
  }
  
  .nav a:hover {
    color: #ff0000; /* Adjust the hover color to match your design */
  }
  </style>
  