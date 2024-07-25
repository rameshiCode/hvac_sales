<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>{{ client.name }}</h1>
        <p>Email: {{ client.email }}</p>
        <p>Phone: {{ client.phone }}</p>
        <p>Address: {{ client.address }}</p>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="offers"
      item-key="id"
      class="elevation-1"
      :items-per-page="5"
    >
      <template v-slot:item.offer_id="{ item }">
        <span>{{ item.id }}</span>
      </template>
      <template v-slot:item.category="{ item }">
        <span>{{ item.category }}</span>
      </template>
      <template v-slot:item.total_price="{ item }">
        <span>{{ item.totalPrice }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn color="primary" @click="goToEditOffer(item)">Edit</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  props: ['clientId'],
  data() {
    return {
      client: {},
      offers: [],
      totalPrice: this.$route.query.totalPrice || 0,
      headers: [
        { title: 'Offer ID', value: 'offer_id' },
        { title: 'Category', value: 'category' },
        { title: 'Total Price', value: 'total_price' },
        { title: 'Final Price', value: 'final_price' },
        { title: 'Created At', value: 'created_at' },
        { title: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  created() {
    this.fetchClientDetails();
    this.fetchOffers();
  },
  methods: {
    fetchClientDetails() {
      axios.get(`${this.$apiUrl}/clients/${this.clientId}`)
        .then(response => {
          this.client = response.data;
        })
        .catch(error => {
          console.error('Error fetching client details:', error);
        });
    },
    fetchOffers() {
      axios.get(`${this.$apiUrl}/clients/${this.clientId}/offers`)
        .then(response => {
          // Ensure the response data is an array of offers
          if (Array.isArray(response.data)) {
            this.offers = response.data.map(offer => {
              // Ensure products_details is a JSON string that needs to be parsed
              try {
                offer.products_details = JSON.parse(offer.products_details);
                // Extract category from products_details if available
                offer.category = offer.products_details.length > 0 ? offer.products_details[0].category : 'N/A';
              } catch (e) {
                console.error('Error parsing products_details:', e);
                offer.products_details = [];
                offer.category = 'N/A';
              }
              return offer;
            });
          } else {
            console.error('Unexpected response format:', response.data);
          }
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
        });
    },
    goToEditOffer(offer) {
      this.$router.push({ 
        name: 'ProductSelection', 
        params: { 
          offerId: offer.id, 
          clientId: this.clientId, 
          clientEmail: this.client.email, 
          categoryName: offer.category,
          totalPrice: offer.totalPrice
        }
      });
    }
  }
};
</script>
