<template>
  <header class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid justify-content-center">
      <!-- <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button> -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <<nav class="nav" data-bs-theme="dark">
          <router-link class="nav-link btn-hdr" to="/ping">Ping</router-link>
          <router-link class="nav-link btn-hdr" to="/sign-up">SignUp</router-link>
          <router-link class="nav-link btn-hdr" to="/login">Login</router-link>
          <router-link class="nav-link btn-hdr" to="/home">Home</router-link>
          <router-link class="nav-link btn-hdr" to="/product-management">ProductManagement</router-link>
          <router-link class="nav-link btn-hdr" to="/product-manipulation">Product Manipulation</router-link>
          <router-link class="nav-link btn-hdr" to="/add-client">Add Client</router-link>
        
        </nav>
      </div>
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
.btn-hdr {
  color: rgb(255, 145, 0);
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 0.5rem;
  /* background-color: #007bff;
  border: 1px solid #007bff; */
  cursor: pointer;
  font-size: 18px;
}

.btn-hdr:hover {
  background-color: #ffdd48dc;
  border: none;
  color: black;
}
.navbar-collapse {
  display: flex !important;
    flex-direction: column;
}
</style>


