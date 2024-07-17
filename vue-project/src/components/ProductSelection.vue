<template>
    <div>
        <v-spacer></v-spacer>
        <v-toolbar color="deep-purple accent-3" dark fixed app>
            <div style="display: flex; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <v-col sm="12" md="6" lg="auto">
                    <v-text-field
                    v-model="search"
                    style="width: auto; min-width: 460px; max-width: 200px"
                    hide-details
                    variant="outlined"
                    density="compact"
                    class="no-arrows"
                    persistent-placeholder
                    >
                    <template v-slot:label>
                        <span class="custom-label">
                            Search
                            <v-icon class="label-icon">mdi-magnify</v-icon>
                        </span>
                    </template>
                </v-text-field>
            </v-col>
        </div>
        <v-col sm="12" md="6" lg="auto">
            <v-text-field
            label="Discount %"
            style="width: auto; min-width: 160px; max-width: 200px"
            v-model="overallDiscount"
            hide-details
            variant="outlined"
            density="compact"
            class="no-arrows"
            persistent-placeholder
            @focus="toggleFieldEditing(true, 'overallDiscount')"
              @blur="updateTotalPrice"
              @keyup.enter="updateTotalPrice"
              ></v-text-field>
            </v-col>
        </div>
        <v-toolbar-title>
          <v-col sm="12" md="6" lg="auto">
            <v-text-field
              label="Total Price"
              style="width: auto; min-width: 100px; max-width: 200px"
              :value="finalDiscountedPrice + ' lei'"
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
          <v-btn color="primary" @click="generatePDF">Generate Offer</v-btn>
        </div>
      </v-toolbar>
      
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
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
          <v-col sm="12" md="6" lg="auto">
            <v-text-field
              label="Discount %"
              style="width: auto; min-width: 100px; max-width: 200px"
              v-model="item.discount"
              hide-details
              variant="outlined"
              density="compact"
              class="no-arrows"
              persistent-placeholder
              @focus="toggleFieldEditing(true, 'itemDiscount', item)"
              @blur="updateTotalPrice"
              @keyup.enter="updateTotalPrice"
              :rules="[(v) => (validateNumberTextField(v) ? true : 'Not a valid value')]"
            ></v-text-field>
          </v-col>
        </template>
        <template v-slot:no-data>
          <v-alert color="error" icon="mdi-alert">
            No products found.
          </v-alert>
        </template>
      </v-data-table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        products: [],
        search: '',
        overallDiscount: 0,
        clientId: this.$route.params.clientId,
        categoryName: this.$route.params.categoryName,
        headers: [
          { title: 'Product Name', value: 'name', align: 'start', sortable: true },
          { title: 'Quantity', value: 'quantity', align: 'center', sortable: false },
          { title: 'Price', value: 'price', align: 'end', sortable: true },
          { title: 'Discount', value: 'discount', align: 'center', sortable: false }
        ],
      };
    },
    created() {
      console.log('ProductSelection - Client ID:', this.clientId);
      console.log('ProductSelection - Category:', this.categoryName);
      if (!this.clientId) {
        alert("No client selected!");
      }
    },
    computed: {
      filteredProducts() {
        return this.products.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase()));
      },
      totalDiscountedPrice() {
        let total = 0;
        this.products.forEach(item => {
          const itemDiscount = item.discount ? item.discount : 0;
          const priceAfterItemDiscount = item.price - (item.price * itemDiscount) / 100;
          total += priceAfterItemDiscount * item.quantity;
        });
        return total.toFixed(2);
      },
      finalDiscountedPrice() {
        const totalDiscountedPrice = parseFloat(this.totalDiscountedPrice);
        const overallDiscountValue = (totalDiscountedPrice * this.overallDiscount) / 100;
        return (totalDiscountedPrice - overallDiscountValue).toFixed(2);
      },
    },
    mounted() {
      axios
        .get(`${this.$apiUrl}/products`)
        .then(response => {
          this.products = response.data.items.map(item => ({
            ...item,
            price: parseFloat(item.price), // Ensure price is a number
            quantity: 0, // Initialize quantity to 0
            discount: 0 // Initialize discount to 0
          }));
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        });
    },
    methods: {
      updateTotalPrice() {
        this.$forceUpdate(); // Force Vue to re-render and recalculate total price
      },
      toggleFieldEditing(editing, field, item = null) {
        // Implementation for toggleFieldEditing can be added as per requirements
      },
      validateNumberTextField(value) {
        return !isNaN(value) && value >= 0 && value <= 100;
      },
      generatePDF() {
        if (!this.clientId) {
          alert("No client selected!");
          return;
        }

        const selectedProducts = this.products.filter(p => p.quantity > 0);
        if (selectedProducts.length === 0) {
          alert("No products selected!");
          return;
        }

        const requestData = {
          clientId: this.clientId,
          overallDiscount: this.overallDiscount,
          products: selectedProducts
        };

        axios.post(`${this.$apiUrl}/generate-offer`, requestData, { responseType: 'blob' })
          .then(response => {
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', 'ClientOffer.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('PDF offer generated successfully.');  // Display success message
          })
          .catch(error => {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
          });
      }
    }
  };
  </script>
  
  
  <style>
  .v-text-field--outlined {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  </style>
  