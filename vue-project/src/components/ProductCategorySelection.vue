<template>
    <div>
      <h1>Select a Category</h1>
      <button @click="selectCategory('pompe de caldura')">Pompe de Caldura</button>
    </div>
  </template>
  
  <script>
  export default {
    props: ['clientId', 'clientEmail'],
    data() {
      return {};
    },
    created() {
      console.log('Received Client ID:', this.clientId);
      console.log('Received Client Email:', this.clientEmail);
    },
    methods: {
      selectCategory(categoryName) {
        this.$router.push({ name: 'ProductSelection', params: { categoryName, clientId: this.clientId, clientEmail: this.clientEmail }});
      },
    }
  }
  </script>
  
  
  
  