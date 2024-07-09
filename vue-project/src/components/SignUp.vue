<template>
    <div class="signup-form">
      <h2>Sign Up</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="username">Username:</label>
          <input v-model="username" type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="email" type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" required>
        </div>
        <button type="submit" :disabled="isSubmitting">Sign Up</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
</template>
  
<script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'SignUpForm',
    setup() {
      const router = useRouter();
      return { router };
    },
    data() {
      return {
        username: '',
        email: '',
        password: '',
        isSubmitting: false,
        message: ''
      };
    },
    methods: {
      async submitForm() {
        this.isSubmitting = true;
        try {
          const response = await axios.post('http://localhost:5001/signup', {
            username: this.username,
            email: this.email,
            password: this.password
          });
          this.message = response.data.message;
          // Consider implementing a success flag or using a different mechanism for routing
          if (response.status === 201) {
            this.resetForm();
            this.router.push('/welcome');
          }
          this.isSubmitting = false;
        } catch (error) {
          this.message = error.response ? error.response.data.message : 'Failed to register';
          this.isSubmitting = false;
        }
      },
      resetForm() {
        this.username = '';
        this.email = '';
        this.password = '';
      }
    }
  };
</script>

  

<style scoped>
  .signup-form {
    max-width: 500px;
    margin: auto;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    color: white;
  }
  
  .signup-form .form-group {
    margin-bottom: 15px;
  }
  
  .signup-form label {
    display: block;
    margin-bottom: 5px;
  
  }
  
  .signup-form input[type="text"],
  .signup-form input[type="email"],
  .signup-form input[type="password"] {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  .signup-form button {
    width: 100%;
    padding: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .signup-form button:disabled {
    background-color: #ccc;
  }
</style>
  