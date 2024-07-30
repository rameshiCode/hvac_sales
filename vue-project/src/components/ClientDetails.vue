<template>
  <v-container>
    <v-btn @click="toggleNotes">{{ showNotes ? 'Hide Notes' : 'Show Notes' }}</v-btn>
    <div v-if="showNotes">
      <p>{{ clientNotes }}</p>
    </div>
    <h2>Category Offers</h2>
    <v-data-table
      :headers="categoryHeaders"
      :items="categoryOffers"
      item-key="id"
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn color="primary" @click="viewOffers(item)">View Offers</v-btn>
        <v-btn color="primary" @click="downloadPdf(item)">Download PDF</v-btn>
        <v-btn color="primary" @click="sendPdf(item)">Send PDF</v-btn>
      </template>
    </v-data-table>
    <h2>Offers for {{ selectedCategoryName }}</h2>
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
  props: ['clientId', 'clientNote'],
  data() {
    return {
      categoryOffers: [],
      offers: [],
      selectedCategoryOfferId: null,
      selectedCategoryName: '',
      showNotes: false,  // Add this line
      categoryHeaders: [
        { text: 'Category Name', value: 'category_name' },
        { text: 'Final Price', value: 'final_price' },
        { text: 'Created At', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      offerHeaders: [
        { text: 'Offer Type', value: 'offer_type' },
        { text: 'Total Price', value: 'total_price' },
        { text: 'Final Price', value: 'final_price' },
        { text: 'Created At', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      clientNotes: this.clientNote  // Initialize with prop value
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
          this.clientNotes = client.notes;  // Set clientNotes
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
      this.selectedCategoryName = categoryOffer.category_name;
      axios.get(`${this.$apiUrl}/category-offers/${categoryOffer.id}/offers`)
        .then(response => {
          this.offers = response.data.map(offer => ({
            ...offer,
            category_name: this.selectedCategoryName
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
          clientEmail: offer.client_email,
          categoryName: offer.category_name,
          offerId: offer.id,
          offerType: offer.offer_type
        }
      });
    },
    async downloadPdf(categoryOffer) {
      try {
        console.log("Downloading PDF for category offer:", categoryOffer);
        const response = await axios.get(`${this.$apiUrl}/category-offers/${categoryOffer.id}/offers/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `offers_${categoryOffer.id}.pdf`;
        link.click();
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('There was an error downloading the PDF. Please try again.');
      }
    },
    async sendPdf(categoryOffer) {
      try {
        console.log("Sending PDF for category offer:", categoryOffer);
        const response = await axios.post(`${this.$apiUrl}/category-offers/${categoryOffer.id}/offers/send-pdf`);
        alert('PDF sent successfully!');
      } catch (error) {
        console.error('Error sending PDF:', error);
        alert('There was an error sending the PDF. Please try again.');
      }
    },
    toggleNotes() {
      this.showNotes = !this.showNotes;
    }
  }
};
</script>
