<template>
    <div class="home">
      <h1>Welcome to E-caldura</h1>
      <p>This is the home page of our application.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Home'
  };
  </script>
  
  <style scoped>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f5f5f5; /* Adjust to match your design */
    color: #333; /* Adjust to match your design */
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 1.2rem;
  }
  </style>
  