<template>
    <div>
      <h1>Add Client</h1>
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="client.name" required>
        </div>
        <div>
          <label for="phone">Phone Number:</label>
          <input type="text" id="phone" v-model="client.phone" required>
        </div>
        <div>
          <label for="email">Email Address:</label>
          <input type="email" id="email" v-model="client.email" required>
        </div>
        <div>
          <label for="address">Address:</label>
          <input type="text" id="address" v-model="client.address" required>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        client: {
          name: '',
          phone: '',
          email: '',
          address: ''
        }
      };
    },
    methods: {
      submitForm() {
        // Here you can handle the form submission,
        // For now, we'll just log the client object to the console.
        console.log(this.client);
        // Redirect to Home page after form submission
        this.$router.push('/');
      }
    }
  };
  </script>
  