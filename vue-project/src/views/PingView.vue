<template>
  <div class="ping-view">
    <h1>Ping Pong Test</h1>
    <v-btn @click="sendPing" class="md1">Ping</v-btn>
    <p>Response: {{ response }}</p>
  </div>
</template>

<script >
  import apiClient from '@/api/apiClient';

  export default {
    name: 'PingView',
    data() {
      return {
        response: ''
      };
    },
    methods: {
      sendPing() {
        apiClient.get(`${this.$apiUrl}/ping`)
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
  