<template>
    <div>
      <h2>{{ client.name }}</h2>
      <p>Email: {{ client.email }}</p>
      <p>Phone: {{ client.phone }}</p>
      <p>Address: {{ client.address }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        client: {}
      };
    },
    created() {
      this.fetchClientDetails();
    },
    methods: {
      async fetchClientDetails() {
        const clientId = this.$route.params.clientId;
        try {
          const response = await fetch(`${this.$apiUrl}/clients/${clientId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          this.client = await response.json();
        } catch (error) {
          console.error('Error fetching client details:', error);
        }
      }
    }
  };
  </script>
  