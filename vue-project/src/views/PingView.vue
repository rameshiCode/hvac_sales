<template>
    <div class="ping-view container">
      <p class="alert alert-info">{{ response }}</p>
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
    },
    mounted() {
      this.sendPing();
    }
  };
  </script>
  
  <style scoped>
  .ping-view {
    text-align: center;
  }
  </style>
  