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
      <template v-slot:item.offer_type="{ item }">
        <span>{{ item.offer_type }}</span>
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
        { title: 'Offer Type', value: 'offer_type' },
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
          if (Array.isArray(response.data)) {
            console.log('Offers:', response.data);
            this.offers = response.data.map(offer => {
              console.log('Offer Type:', offer.offer_type);
              try {
                offer.products_details = JSON.parse(offer.products_details);
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
      console.log('Sending Offer Type:', offer.offer_type);  // Log the offer type
      this.$router.push({ 
        name: 'ProductSelection', 
        params: { 
          offerId: offer.id, 
          clientId: this.clientId, 
          clientEmail: this.client.email, 
          categoryName: offer.category,  // Ensure categoryName is passed
          totalPrice: offer.totalPrice,
          offerType: offer.offer_type  // Ensure offerType is passed
        }
      });
    }
  }
};
</script>
