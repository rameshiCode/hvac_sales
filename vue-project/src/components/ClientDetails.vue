<template>
  <v-container>
    <h2>Category Offers</h2>
    <v-data-table
      :headers="categoryHeaders"
      :items="categoryOffers"
      item-key="id"
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn color="primary" @click="viewOffers(item)">View Offers</v-btn>
        <v-btn color="secondary" @click="downloadPdf(item)">Download PDF</v-btn>
      </template>
    </v-data-table>

    <h2>Offers for Selected Category</h2>
    <v-data-table
      :headers="offerHeaders"
      :items="offers"
      item-key="id"
      class="elevation-1"
    >
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
      categoryOffers: [],
      offers: [],
      selectedCategoryOfferId: null,
      selectedCategoryName: '', // Added to store the selected category name
      categoryHeaders: [
        { text: 'Category Name', value: 'category_name' },
        { text: 'Final Price', value: 'final_price' },
        { text: 'Created At', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      offerHeaders: [
        { text: 'Offer Type', value: 'offer_type' },  // Display offer type
        { text: 'Total Price', value: 'total_price' },
        { text: 'Final Price', value: 'final_price' },
        { text: 'Created At', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  created() {
    this.fetchClientDetails();
    this.fetchCategoryOffers();
  },
  methods: {
    fetchClientDetails() {
      axios.get(`${this.$apiUrl}/clients/${this.clientId}`)
        .then(response => {
          const client = response.data;
          console.log('Fetched client details:', client);
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
    viewOffers(categoryOffer) {
      console.log('Viewing offers for category offer:', categoryOffer);
      this.selectedCategoryOfferId = categoryOffer.id;
      this.selectedCategoryName = categoryOffer.category_name; // Set the category name here
      axios.get(`${this.$apiUrl}/category-offers/${categoryOffer.id}/offers`)
        .then(response => {
          this.offers = response.data.map(offer => ({
            ...offer,
            category_name: this.selectedCategoryName // Ensure the category name is included in each offer
          }));
          console.log('Fetched offers for category:', this.offers);
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
        });
    },
    goToEditOffer(offer) {
      if (!offer.category_name) {
        console.error('Category name is missing from the offer:', offer);
        return;
      }
      console.log('Navigating to edit offer with details:', offer);
      this.$router.push({
        name: 'ProductSelection',
        params: {
          clientId: offer.client_id,
          categoryName: offer.category_name,
          offerId: offer.id,
          offerType: offer.offer_type
        }
      });
    },
    downloadPdf(categoryOffer) {
      console.log('Downloading PDF for category offer:', categoryOffer);
      axios.get(`${this.$apiUrl}/category-offers/${categoryOffer.id}/offers/pdf`, { responseType: 'blob' })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `offers_${categoryOffer.id}.pdf`;
          link.click();
        })
        .catch(error => {
          console.error('Error downloading PDF:', error);
        });
    }
  }
};
</script>
