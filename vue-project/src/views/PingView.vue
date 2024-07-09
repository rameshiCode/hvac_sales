<template>
    <div class="ping-view">
      <h1>Ping Pong Test</h1>
      <button @click="sendPing">Ping</button>
      <p>Response: {{ response }}</p>
    </div>
  </template>
  
  <script>
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
        axios.get('http://localhost:5001/ping')
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
  