<template>
  <div>
    <h2>Client Details</h2>
    <div v-if="clientDetails">
      <p>Name: {{ clientDetails.name }}</p>
      <p>Email: {{ clientDetails.email }}</p>
      <p>Phone: {{ clientDetails.phone }}</p>
      <p>Address: {{ clientDetails.address }}</p>
    </div>

    <h3>Category Offers</h3>
    <v-data-table :headers="categoryHeaders" :items="categoryOffers" item-key="id">
      <template v-slot:item.actions="{ item }">
        <v-btn @click="toggleCategoryOffers(item)">View Offers</v-btn>
      </template>
    </v-data-table>

    <div v-if="showOffers">
      <h4>Offers for Selected Category</h4>
      <v-data-table :headers="offerHeaders" :items="selectedCategoryOffers" item-key="id">
        <template v-slot:item.actions="{ item }">
          <v-btn @click="goToEditOffer(item, selectedCategory)">Edit</v-btn>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['clientId'],
  data() {
    return {
      clientDetails: {},
      categoryOffers: [],
      selectedCategoryOffers: [],
      showOffers: false,
      selectedCategory: null,  // Add selectedCategory to track the selected category
      categoryHeaders: [  // Ensure this is defined
        { title: 'Category Name', value: 'category_name' },
        { title: 'Final Price', value: 'final_price' },
        { title: 'Created At', value: 'created_at' },
        { title: 'Actions', value: 'actions', sortable: false }
      ],
      offerHeaders: [  // Headers for displaying offers
        { title: 'Offer Type', value: 'offer_type' },
        { title: 'Total Price', value: 'total_price' },
        { title: 'Final Price', value: 'final_price' },
        { title: 'Created At', value: 'created_at' },
        { title: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  created() {
    console.log('Received Client ID:', this.clientId);
    this.fetchClientDetails();
    this.fetchCategoryOffers();
  },
  methods: {
    fetchClientDetails() {
      axios.get(`${this.$apiUrl}/clients/${this.clientId}`)
        .then(response => {
          this.clientDetails = response.data;
          console.log('Fetched Client Details:', this.clientDetails);
        })
        .catch(error => {
          console.error('Error fetching client details:', error);
        });
    },
    fetchCategoryOffers() {
      axios.get(`${this.$apiUrl}/clients/${this.clientId}/category-offers`)
        .then(response => {
          this.categoryOffers = response.data;
          console.log('Fetched Category Offers:', this.categoryOffers);
        })
        .catch(error => {
          console.error('Error fetching category offers:', error);
        });
    },
    toggleCategoryOffers(categoryOffer) {
      this.showOffers = !this.showOffers;
      this.selectedCategory = categoryOffer.category_name;  // Store the selected category name
      if (this.showOffers) {
        this.fetchOffers(categoryOffer.id);
      }
    },
    fetchOffers(categoryOfferId) {
      axios.get(`${this.$apiUrl}/category-offers/${categoryOfferId}/offers`)
        .then(response => {
          this.selectedCategoryOffers = response.data;
          console.log('Fetched Offers for Category:', this.selectedCategoryOffers);
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
        });
    },
    goToEditOffer(offer, categoryName) {
      console.log('Navigating to edit offer with details:', offer);
      this.$router.push({ 
        name: 'ProductSelection', 
        params: { 
          clientId: this.clientId, 
          categoryName: categoryName,  // Pass the category name here
          offerId: offer.id, 
          offerType: offer.offer_type 
        }
      });
    }
  }
};
</script>

<style>
/* Your existing style code */
</style>
