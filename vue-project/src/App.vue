<template>
  <Header />
  <RouterView />
</template>

<script>
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import ClientForm from './components/ClientForm.vue';
export default {
  name: 'App',
  components: {
    RouterView,
    Header,
    ClientForm
  }
};
</script>