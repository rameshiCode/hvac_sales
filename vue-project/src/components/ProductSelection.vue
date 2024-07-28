<template>
  <div>
    <v-toolbar color="deep-purple accent-3" dark fixed app>
      <!-- Toolbar Content -->
      <v-spacer></v-spacer>
      <v-col sm="12" md="6" lg="auto">
        <v-select
          v-model="selectedOfferType"
          :items="offerTypes"
          label="Offer Type"
          hide-details
          dense
        ></v-select>
      </v-col>
      <v-col sm="12" md="6" lg="auto">
        <v-text-field
          v-model="search"
          style="width: auto; min-width: 460px; max-width: 200px"
          hide-details
          variant="outlined"
          density="compact"
          class="no-arrows"
          persistent-placeholder
          @input="searchProducts"
        >
          <template v-slot:label>
            <span class="custom-label">
              Search
              <v-icon class="label-icon">mdi-magnify</v-icon>
            </span>
          </template>
        </v-text-field>
      </v-col>
      <v-col sm="12" md="6" lg="auto">
        <v-text-field
          label="Discount %"
          style="width: auto; min-width: 160px; max-width: 200px"
          v-model="overallDiscount"
          hide-details
          variant="outlined"
          density="compact"
          class="no-arrows"
          placeholder="0"
          persistent-placeholder
          @blur="updateTotalPrice"
          @keyup.enter="updateTotalPrice"
        ></v-text-field>
      </v-col>
      <v-toolbar-title>
        <v-col sm="12" md="6" lg="auto">
          <v-text-field
            label="Total Price"
            style="width: auto; min-width: 100px; max-width: 200px"
            :value="totalPrice + ' lei'"
            readonly
            hide-details
            variant="outlined"
            density="compact"
            class="no-arrows"
            persistent-placeholder
          ></v-text-field>
        </v-col>
      </v-toolbar-title>
      <div style="display: flex; align-items: center;">
        <v-btn color="green" @click="continueOffer">Continue</v-btn>
      </div>
      <div style="display: flex; align-items: center;">
        <v-btn color="primary" @click="downloadPDF">Download PDF</v-btn>
      </div>
      <div style="display: flex; align-items: center;">
        <v-btn color="secondary" @click="sendOffer">Send Offer</v-btn>
      </div>
      <div style="display: flex; align-items: center;">
        <v-btn color="blue" @click="finishOffer">Finish</v-btn>
      </div>
    </v-toolbar>

    <!-- Main Products -->
    <div v-if="mainProducts.length > 0">
      <h2>Main Products</h2>
      <v-data-table
        :headers="headers"
        :items="mainProducts"
        item-key="id"
        class="elevation-1"
        :items-per-page="5"
      >
        <template v-slot:item.price="{ item }">
          ${{ item.price }}
        </template>
        <template v-slot:item.quantity="{ item }">
          <v-text-field
            v-model.number="item.quantity"
            type="number"
            min="0"
            @input="updateTotalPrice"
            dense
            persistent-placeholder
          ></v-text-field>
        </template>
        <template v-slot:item.discount="{ item }">
          <v-text-field
            v-model="item.discount"
            hide-details
            variant="outlined"
            density="compact"
            persistent-placeholder
            @blur="updateTotalPrice"
            @keyup.enter="updateTotalPrice"
            :rules="[(v) => (validateDiscount(v) ? true : 'Not a valid value')]"
          ></v-text-field>
        </template>
        <template v-slot:item.pretTotal="{ item }">
          <span>{{ item.pretTotal }}</span>
        </template>
        <template v-slot:item.pretRedus="{ item }">
          <span v-if="item.pretRedus">{{ item.pretRedus }}</span>
        </template>
        <template v-slot:no-data>
          <v-alert color="error" icon="mdi-alert">
            No products found.
          </v-alert>
        </template>
      </v-data-table>
    </div>

    <!-- Complementary Products -->
    <div v-if="complementaryProducts.length > 0">
      <h2>Complementary Products</h2>
      <v-data-table
        :headers="headers"
        :items="complementaryProducts"
        item-key="id"
        class="elevation-1"
        :items-per-page="5"
      >
        <template v-slot:item.price="{ item }">
          ${{ item.price }}
        </template>
        <template v-slot:item.quantity="{ item }">
          <v-text-field
            v-model.number="item.quantity"
            type="number"
            min="0"
            @input="updateTotalPrice"
            dense
            persistent-placeholder
          ></v-text-field>
        </template>
        <template v-slot:item.discount="{ item }">
          <v-text-field
            v-model="item.discount"
            hide-details
            variant="outlined"
            density="compact"
            persistent-placeholder
            @blur="updateTotalPrice"
            @keyup.enter="updateTotalPrice"
            :rules="[(v) => (validateDiscount(v) ? true : 'Not a valid value')]"
          ></v-text-field>
        </template>
        <template v-slot:item.pretTotal="{ item }">
          <span>{{ item.pretTotal }}</span>
        </template>
        <template v-slot:item.pretRedus="{ item }">
          <span v-if="item.pretRedus">{{ item.pretRedus }}</span>
        </template>
        <template v-slot:no-data>
          <v-alert color="error" icon="mdi-alert">
            No products found.
          </v-alert>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  props: ['clientId', 'categoryName', 'clientEmail', 'offerId', 'offerType', 'categoryOfferId'],
  data() {
    return {
      products: [],
      search: '',
      overallDiscount: '',
      totalPrice: 0,
      selectedOfferType: this.offerType || 'standard',
      offerTypes: ['standard', 'comfort', 'premium'],
      headers: [
        { title: 'Product Name', value: 'name', align: 'start', sortable: true },
        { title: 'Quantity', value: 'quantity', align: 'center', sortable: false },
        { title: 'Price', value: 'price', align: 'end', sortable: true },
        { title: 'Discount', value: 'discount', align: 'center', sortable: false },
        { title: 'Preț Total', value: 'pretTotal', align: 'end', sortable: false },
        { title: 'Preț Redus', value: 'pretRedus', align: 'end', sortable: false }
      ],
      mainProducts: [],
      complementaryProducts: [],
      isEditing: !!this.offerId,  // Flag to check if editing an existing offer
    };
  },
  created() {
    console.log('Received Client ID:', this.clientId);
    console.log('Received Client Email:', this.clientEmail);
    console.log('Received Category Name:', this.categoryName);
    console.log('Received Offer ID:', this.offerId);
    console.log('Received Offer Type:', this.offerType);
    console.log('Received Category Offer ID:', this.categoryOfferId); 
    if (this.offerId) {
      this.loadExistingOffer(this.offerId);
    } else {
      this.loadProducts();
    }
  },
  methods: {
    loadProducts() {
      console.log('Loading products for category:', this.categoryName);
      axios.get(`${this.$apiUrl}/products`, {
        params: {
          category: this.categoryName
        }
      }).then(response => {
        this.products = response.data.items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          quantity: 0,
          discount: "",
          pretTotal: 0,
          pretRedus: 0,
          category: item.category,
          subcategory: item.subcategory
        }));
        this.categorizeProducts();
      }).catch(error => {
        console.error('Error fetching products:', error);
      });
    },
    loadExistingOffer(offerId) {
      console.log('Loading existing offer with ID:', offerId);
      axios.get(`${this.$apiUrl}/offers/${offerId}`, {
        params: { category: this.categoryName }
      }).then(response => {
        const offerDetails = response.data;
        console.log('Offer Details:', offerDetails);  // Log the offer details

        // Ensure products_details is an array
        let productsDetails = [];
        try {
          productsDetails = Array.isArray(offerDetails.products_details) ? offerDetails.products_details : JSON.parse(offerDetails.products_details);

          if (!Array.isArray(productsDetails)) {
            throw new Error('products_details is not an array');
          }
        } catch (e) {
          console.error('Error parsing products_details:', e);
          productsDetails = [];
        }

        const storedProducts = productsDetails.map(item => ({
          ...item,
          price: parseFloat(item.price),
          quantity: item.quantity || 0,
          discount: item.discount || "",
          pretTotal: item.pretTotal || 0,
          pretRedus: item.pretRedus || 0,
          category: item.category,
          subcategory: item.subcategory
        }));

        const categoryProducts = offerDetails.category_products.map(item => ({
          ...item,
          price: parseFloat(item.price),
          quantity: 0,
          discount: "",
          pretTotal: 0,
          pretRedus: 0,
          category: item.category,
          subcategory: item.subcategory
        }));

        // Merge storedProducts and categoryProducts
        const productMap = new Map();
        storedProducts.forEach(product => productMap.set(product.id, product));
        categoryProducts.forEach(product => {
          if (!productMap.has(product.id)) {
            productMap.set(product.id, product);
          }
        });

        this.products = Array.from(productMap.values());
        this.overallDiscount = offerDetails.overallDiscount || 0;
        this.selectedOfferType = offerDetails.offer_type || 'standard';  // Update the selected offer type
        this.categorizeProducts();
        this.updateTotalPrice();
      }).catch(error => {
        console.error('Error loading existing offer:', error);
      });
    },
    categorizeProducts() {
      this.mainProducts = this.products.filter(product => product.subcategory.toLowerCase() === 'main');
      this.complementaryProducts = this.products.filter(product => product.subcategory.toLowerCase() !== 'main');
      console.log("Main Products:", this.mainProducts);
      console.log("Complementary Products:", this.complementaryProducts);
    },
    searchProducts() {
      const searchLower = this.search.toLowerCase();
      const filtered = this.products.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.category && product.category.toLowerCase().includes(searchLower)) || 
        (product.subcategory && product.subcategory.toLowerCase().includes(searchLower))
      );
      this.mainProducts = filtered.filter(product => product.subcategory.toLowerCase() === 'main');
      this.complementaryProducts = filtered.filter(product => product.subcategory.toLowerCase() !== 'main');
    },
    updateTotalPrice() {
      this.totalPrice = this.products.reduce((acc, item) => {
        item.pretTotal = (item.price * item.quantity).toFixed(2);
        if (item.discount) {
          item.pretRedus = (item.pretTotal - (item.pretTotal * item.discount / 100)).toFixed(2);
        } else {
          item.pretRedus = item.pretTotal;
        }
        return acc + parseFloat(item.pretRedus);
      }, 0).toFixed(2);
    },
    validateDiscount(value) {
      return !isNaN(value) && value >= 0 && value <= 100;
    },
    sendOffer() {
      const url = `${this.$apiUrl}/generate-offer?action=email`;
      const overallDiscountValue = parseFloat(this.overallDiscount) || 0;

      axios.post(url, {
        clientId: this.clientId,
        clientEmail: this.clientEmail,  // Use prop here
        overallDiscount: overallDiscountValue,
        products: this.products.filter(p => p.quantity > 0)
      }).then(() => {
        alert('Offer sent successfully!');
      }).catch(error => {
        console.error('Error sending offer:', error);
        alert('There was an error sending the offer. Please try again.');
      });
    },
    downloadPDF() {
      const url = `${this.$apiUrl}/generate-offer?action=download`;
      const overallDiscountValue = parseFloat(this.overallDiscount) || 0;

      axios.post(url, {
        clientId: this.clientId,
        overallDiscount: overallDiscountValue,
        products: this.products.filter(p => p.quantity > 0)
      }, {
        responseType: 'blob'
      }).then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'offer.pdf';
        link.click();
      }).catch(error => {
        console.error('Error downloading PDF:', error);
        alert('There was an error downloading the PDF. Please try again.');
      });
    },
    continueOffer() {
  const url = this.isEditing ? `${this.$apiUrl}/offers/${this.offerId}` : `${this.$apiUrl}/offers`;
  const method = this.isEditing ? 'put' : 'post';
  const offerData = {
    clientId: this.clientId,
    offerType: this.selectedOfferType,
    products: this.products.filter(p => p.quantity > 0),
    totalPrice: this.totalPrice,
    finalPrice: this.totalPrice,
    categoryOfferId: this.categoryOfferId,  // Include the category offer ID
    categoryName: this.categoryName,  // Include category name
    clientEmail: this.clientEmail  // Include client email
  };
  console.log('Continuing offer with data:', offerData); // Log the offer data for debugging
  axios({ method, url, data: offerData })
    .then(response => {
      alert(`${this.selectedOfferType} offer ${this.isEditing ? 'updated' : 'saved'} successfully!`);
      const nextOfferType = this.getNextOfferType(this.selectedOfferType);
      if (!this.isEditing && nextOfferType) {
        this.selectedOfferType = nextOfferType;
        this.loadProducts();
      } else {
        this.$router.push({ 
          name: 'ClientDetails', 
          params: { clientId: this.clientId },
          query: { totalPrice: this.totalPrice }
        });
      }
    })
    .catch(error => {
      console.error(`Error ${this.isEditing ? 'updating' : 'saving'} the ${this.selectedOfferType} offer:`, error);
      alert(`There was an error ${this.isEditing ? 'updating' : 'saving'} the ${this.selectedOfferType} offer. Please try again.`);
    });
},
    getNextOfferType(currentOfferType) {
      const currentIndex = this.offerTypes.indexOf(currentOfferType);
      if (currentIndex >= 0 && currentIndex < this.offerTypes.length - 1) {
        return this.offerTypes[currentIndex + 1];
      }
      return null;
    },
    finishOffer() {
      console.log('Finishing offer with data:', {
        clientId: this.clientId,
        offerType: this.selectedOfferType,
        categoryName: this.categoryName
      });
      const url = this.isEditing ? `${this.$apiUrl}/offers/${this.offerId}` : `${this.$apiUrl}/offers`;
      const method = this.isEditing ? 'put' : 'post';
      const offerData = {
        clientId: this.clientId,
        offerType: this.selectedOfferType,
        products: this.products.filter(p => p.quantity > 0),
        totalPrice: this.totalPrice,
        finalPrice: this.totalPrice,
        categoryOfferId: this.categoryOfferId,  // Include the category offer ID if editing
        categoryName: this.categoryName  // Include the category name
      };

      axios({ method, url, data: offerData })
        .then(response => {
          alert(`${this.selectedOfferType} offer ${this.isEditing ? 'updated' : 'saved'} successfully!`);
          // No redirection needed here, simply stay on the same page
        })
        .catch(error => {
          console.error(`Error ${this.isEditing ? 'updating' : 'saving'} the ${this.selectedOfferType} offer:`, error);
          alert(`There was an error ${this.isEditing ? 'updating' : 'saving'} the ${this.selectedOfferType} offer. Please try again.`);
        });
    },
  }
};
</script>

<style>
.custom-label {
  display: flex;
  align-items: center;
}
.label-icon {
  margin-left: 5px;
}
</style>

