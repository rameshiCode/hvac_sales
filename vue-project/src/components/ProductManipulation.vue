<template>
  <v-card>
    <v-container class="pa-3">
      <v-row>
        <v-col cols="12">
          <v-btn color="primary" @click="dialog = true">Add Product</v-btn>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search Products"
            single-line
            hide-details
            @input="loadItems"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Product</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newProduct.name"
                  label="Product Name"
                  required
                  :rules="[v => !!v || 'Name is required']"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
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
              <v-col cols="12">
                <v-select
                  v-model="newProduct.category"
                  :items="categories"
                  label="Category"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newProduct.area"
                  label="Area"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="addProduct">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      <template v-slot:item.name="{ item }">
        <v-text-field
          v-if="editItem === item.id"
          v-model="editable.name"
          dense
          flat
          hide-details
        ></v-text-field>
        <span v-else @dblclick="enableEditing(item)">{{ item.name }}</span>
      </template>
      <template v-slot:item.price="{ item }">
        <v-text-field
          v-if="editItem === item.id"
          v-model="editable.price"
          type="number"
          prefix="$"
          dense
          flat
          hide-details
        ></v-text-field>
        <span v-else @dblclick="enableEditing(item)">{{ item.price }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="deleteProduct(item.id)">
          mdi-delete
        </v-icon>
        <v-icon small
          v-if="editItem === item.id"
          @click="saveEdit(item)"
        >
          mdi-content-save
        </v-icon>
        <v-icon small
          v-else
          @click="enableEditing(item)"
        >
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    newProduct: {
      name: '',
      price: '',
      category: '',
      area: ''
    },
    categories: ['Pompe de Caldura', 'Instalatii Sanitare', 'Ventilatie'],
    editable: {},
    editItem: null,
    dialog: false,
    itemsPerPage: 5,
    headers: [
      { title: 'Product Name', key: 'name', align: 'start', sortable: true },
      { title: 'Price', key: 'price', align: 'end', sortable: true },
      { title: 'Category', key: 'category', align: 'start', sortable: true },
      { title: 'Area', key: 'area', align: 'start', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ],
    search: '',
    serverItems: [],
    loading: true,
    totalItems: 0,
  }),
  methods: {
    loadItems ({ page, itemsPerPage, sortBy }) {
      this.loading = true;
      axios.get('http://localhost:5001/products', {
        params: { page, itemsPerPage, sortBy, search: this.search }
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
          this.newProduct = { name: '', price: '', category: '', area: '' }; // Reset form
          this.dialog = false;
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
    },
    enableEditing(item) {
      this.editable = {...item};
      this.editItem = item.id;
    },
    saveEdit(item) {
      axios.put(`http://localhost:5001/products/${item.id}`, this.editable)
        .then(() => {
          this.editItem = null;
          this.loadItems({ page: 1, itemsPerPage: this.itemsPerPage, sortBy: [], sortDesc: [] });
        })
        .catch(error => {
          console.error('Error updating product:', error);
          this.editItem = null;
        });
    }
  }
}
</script>
