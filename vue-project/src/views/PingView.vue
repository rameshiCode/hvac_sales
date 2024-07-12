<template>
    <div class="ping-view">
      <h1>Ping Pong Test</h1>
      <v-btn @click="sendPing" class="md1">Ping</v-btn>
      <p>Response: {{ response }}</p>
      <v-icon> mdi-account </v-icon>
      <v-icon>mdi-home</v-icon>
      <button class="v-btn">button md1</button>
    </div>
  </template>
  

  <!-- <script setup>
  import { mdiAccount } from '@mdi/js'
</script> -->

  <script >
  import axios from 'axios';

  export default {
    name: 'PingView',
    data() {
      return {
        response: ''
      };
    },
    methods: {
      sendPing() {
        axios.get(`${this.$apiUrl}/ping`)
          .then(result => {
            this.response = result.data;
          })
          .catch(error => {
            console.error('There was an error!', error);
            this.response = 'Error: ' + error.message;
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .ping-view {
    text-align: center;
  }
  </style>
  