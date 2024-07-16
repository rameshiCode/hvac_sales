<template>
    <div>
      <h1>Select a Category</h1>
      <button @click="selectCategory('pompe de caldura')">Pompe de Caldura</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      selectCategory(categoryName) {
        // Here you can pass the category name and client ID to the next component
        this.$router.push({ name: 'ProductSelection', params: { categoryName, clientId: this.$route.params.clientId }});
      }
    }
  }
  </script>
  