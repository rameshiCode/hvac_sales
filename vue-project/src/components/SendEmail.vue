<template>
    <div>
      <button @click="sendOffer">Send Offer</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      sendOffer() {
        const offerData = {
          email: 'recipient@example.com',
          details: 'Special discount just for you!'
        };
        fetch('http://localhost:5000/send_offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offerData)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
      }
    }
  }
  </script>
  