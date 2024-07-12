<template>
  <v-card>
    <v-container class="pa-3">
      <v-row>
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="newProduct.name"
            label="Product Name"
            required
            :rules="[v => !!v || 'Name is required']"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="newProduct.price"
            label="Price"
            required
            :rules="[v => !!v || 'Price is required']"
            type="number"
            prefix="$"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="2">
          <v-btn color="primary" @click="addProduct" block>Add Product</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="serverItems"
      :server-items-length="totalItems"
      :loading="loading"
      :search="search"
      @update:options="loadItems"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          class="mb-3"
        ></v-text-field>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="deleteProduct(item.id)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    itemsPerPage: 5,
    newProduct: {
      name: '',
      price: ''
    },
    headers: [
      { title: 'Product Name', value: 'name', align: 'start', sortable: true },
      { title: 'Price', value: 'price', align: 'end', sortable: true },
      { title: 'Actions', value: 'actions', sortable: false }
    ],
    search: '',
    serverItems: [],
    loading: true,
    totalItems: 0,
  }),
  methods: {
    loadItems({ page, itemsPerPage, sortBy, sortDesc }) {
      this.loading = true;
      const sortOrder = sortDesc && sortDesc.length > 0 ? 'desc' : 'asc';
      const sortByParam = sortBy && sortBy.length > 0 ? sortBy[0] : 'name';
      axios.get('http://localhost:5001/products', {
        params: { page, itemsPerPage, sortBy: sortByParam, sortOrder, search: this.search }
      }).then(response => {
        this.serverItems = response.data.items;
        this.totalItems = response.data.total;
        this.loading = false;
      }).catch(error => {
        console.error('Error fetching products:', error);
        this.loading = false;
      });
    },
    addProduct() {
      if (!this.newProduct.name || !this.newProduct.price) {
        alert("Please fill in all fields.");
        return;
      }
      axios.post('http://localhost:5001/products', this.newProduct)
        .then(() => {
          this.newProduct = { name: '', price: '' }; // Reset form
          this.loadItems({ page: 1, itemsPerPage: this.itemsPerPage, sortBy: [], sortDesc: [] });
        })
        .catch(error => console.error('Error adding product:', error));
    },
    deleteProduct(productId) {
      axios.delete(`http://localhost:5001/products/${productId}`)
        .then(() => {
          this.loadItems({ page: 1, itemsPerPage: this.itemsPerPage, sortBy: [], sortDesc: [] });
        })
        .catch(error => {
          console.error('Error deleting product:', error);
        });
    }
  }
}
</script>
