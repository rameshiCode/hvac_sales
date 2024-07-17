<template>
    <div>
      <h1>Select a Category</h1>
      <button @click="selectCategory('pompe de caldura')">Pompe de Caldura</button>
    </div>
  </template>
  
<script>
  export default {
    data() {
    return {
      clientId: this.$route.params.clientId
    };
    },
    watch: {
      '$route.params.clientId'(newClientId) {
        this.clientId = newClientId;
      }
    },
    created() {
      console.log('Received Client ID:', this.clientId);  // Debugging line to check the received clientId
    },
    methods: {
      selectCategory(categoryName) {
        // Here you can pass the category name and client ID to the next component
        this.$router.push({ name: 'ProductSelection', params: { categoryName, clientId: this.$route.params.clientId }});
      },
    }
}
</script>
  