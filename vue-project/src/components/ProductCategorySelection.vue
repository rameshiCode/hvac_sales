<template>
  <v-container>
    <h1>Select a Category</h1>
    <v-row>
      <v-col cols="12" md="4">
        <v-btn
          large
          block
          color="primary"
          @click="selectCategory('Pompe de Caldura')"
        >
          <v-icon left>mdi-fire</v-icon>
          Pompe de Caldura
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          large
          block
          color="secondary"
          @click="selectCategory('Instalatii Sanitare')"
        >
          <v-icon left>mdi-pipe</v-icon>
          Instalatii Sanitare
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          large
          block
          color="success"
          @click="selectCategory('Ventilatie')"
        >
          <v-icon left>mdi-fan</v-icon>
          Ventilatie
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ['clientId', 'clientEmail'],
  created() {
    console.log('Received Client ID:', this.clientId);
    console.log('Received Client Email:', this.clientEmail);
  },
  methods: {
    selectCategory(categoryName) {
      console.log('Selected Category:', categoryName);
      this.$router.push({ 
        name: 'ProductSelection', 
        params: { 
          clientId: this.clientId, 
          categoryName: categoryName, 
          clientEmail: this.clientEmail 
        }
      });
    },
  }
}
</script>


<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}
.v-btn {
  font-size: 1.2rem;
  height: 56px;
  margin-bottom: 20px;
}
</style>
