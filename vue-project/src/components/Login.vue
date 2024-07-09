<template>
    <div class="login-form">
      <h2>Login</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="username">Username:</label>
          <input v-model="username" type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" required>
        </div>
        <button type="submit" :disabled="isSubmitting">Login</button>
      </form>
      <p v-if="message" :class="{'error-message': error}">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'LoginForm',
    setup() {
      const router = useRouter();
      return { router };
    },
    data() {
      return {
        username: '',
        password: '',
        isSubmitting: false,
        message: '',
        error: false
      };
    },
    methods: {
      async submitForm() {
        this.isSubmitting = true;
        this.message = '';
        this.error = false;
        try {
          const response = await axios.post('http://localhost:5001/login', {
            username: this.username,
            password: this.password
          });
          if (response.status === 200) {
            this.message = response.data.message;
            this.router.push('/');
          }
          this.isSubmitting = false;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            this.message = 'Invalid username or password';
          } else {
            this.message = 'Login failed';
          }
          this.error = true;
          this.isSubmitting = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>

  </style>
  