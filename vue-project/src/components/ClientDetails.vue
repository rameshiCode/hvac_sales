<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>{{ client.name }}</h2>
        <p>Email: {{ client.email }}</p>
        <p>Phone: {{ client.phone }}</p>
        <p>Address: {{ client.address }}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>Offers:</h3>
        <v-data-table
          :headers="headers"
          :items="offers"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn color="primary" @click="goToEditOffer(item.id)" text>Edit</v-btn>
          </template>
          <template v-slot:item.created_at="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      client: {},
      offers: [],
      headers: [
        { title: 'Offer ID', value: 'id' },
        { title: 'Total Price', value: 'total_price', sortable: true },
        { title: 'Final Price', value: 'final_price', sortable: true },
        { title: 'Created At', value: 'created_at', sortable: true },
        { title: 'Actions', value: 'actions', sortable: false } // Adding an actions column for edit buttons
      ]
    };
  },
  created() {
    this.fetchClientDetails();
    this.fetchOffers();
  },
  methods: {
    async fetchClientDetails() {
      const clientId = this.$route.params.clientId;
      try {
        const response = await fetch(`${this.$apiUrl}/clients/${clientId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this.client = await response.json();
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    },
    async fetchOffers() {
      const clientId = this.$route.params.clientId;
      try {
        const response = await fetch(`${this.$apiUrl}/clients/${clientId}/offers`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        this.offers = await response.json();
        this.offers.forEach(offer => {
          offer.created_at = new Date(offer.created_at).toLocaleString(); // Formatting the date
        });
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    },
    goToEditOffer(offerId) {
      this.$router.push({ name: 'ProductSelection', params: { clientId: this.client.id, offerId: offerId, categoryName: 'yourCategoryHere' } }); // Ensure you pass all required props
    }
  }
};
</script>
