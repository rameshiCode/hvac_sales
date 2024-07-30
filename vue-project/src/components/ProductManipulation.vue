<template>
  <v-card>
    <v-container class="pa-3">
      <v-row>
        <v-col cols="12">
          <v-btn color="primary" @click="openDialog()">Add Product</v-btn>
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

    <!-- Add/Edit Product Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ dialogTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editableProduct.name"
                  label="Product Name"
                  required
                  :rules="[v => !!v || 'Name is required']"
                  outlined
                  dense
                  @input="transformEditableNameToUpperCase"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editableProduct.price"
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
                  v-model="editableProduct.category"
                  :items="categories"
                  label="Category"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editableProduct.subcategory"
                  :items="subcategories"
                  label="Subcategory"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editableProduct.area"
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
          <v-btn color="blue darken-1" text @click="saveProduct">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Products Table -->
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
        <span @dblclick="editProduct(item)">{{ item.name }}</span>
      </template>
      <template v-slot:item.price="{ item }">
        <span @dblclick="editProduct(item)">${{ item.price }}</span>
      </template>
      <template v-slot:item.category="{ item }">
        <span>{{ item.category }}</span>
      </template>
      <template v-slot:item.subcategory="{ item }">
        <span>{{ item.subcategory }}</span>
      </template>
      <template v-slot:item.area="{ item }">
        <span>{{ item.area }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="deleteProduct(item.id)">
          mdi-delete
        </v-icon>
        <v-icon small @click="editProduct(item)">
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
      subcategory: '',
      area: ''
    },
    editableProduct: {},
    categories: ['Pompe de Caldura', 'Instalatii Sanitare', 'Ventilatie'],
    subcategories: ['Main', 'Complementary'],
    dialog: false,
    dialogTitle: '',
    itemsPerPage: 5,
    headers: [
      { title: 'Product Name', key: 'name', align: 'start', sortable: true },
      { title: 'Price', key: 'price', align: 'end', sortable: true },
      { title: 'Category', key: 'category', align: 'start', sortable: true },
      { title: 'Subcategory', key: 'subcategory', align: 'start', sortable: true },
      { title: 'Area', key: 'area', align: 'start', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ],
    search: '',
    serverItems: [],
    loading: true,
    totalItems: 0,
    page: 1,
    sortOrder: true,
    sortBy: ['name']
  }),
  methods: {
    loadItems() {
      this.loading = true;
      const sortOrder = this.sortOrder ? 'asc' : 'desc';
      const params = {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy[0],
        sortOrder: sortOrder,
        search: this.search
      };
      console.log(params)
      axios.get(`${this.$apiUrl}/products`, { params })
        .then(response => {
          this.serverItems = response.data.items;
          this.totalItems = response.data.total;
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          this.loading = false;
        });
    },
    openDialog() {
      this.dialogTitle = 'Add Product';
      this.editableProduct = {
        name: '',
        price: '',
        category: '',
        subcategory: '',
        area: ''
      };
      this.dialog = true;
    },
    addProduct() {
      if (!this.newProduct.name || !this.newProduct.price) {
        alert("Please fill in all fields.");
        return;
      }
      this.newProduct.name = this.newProduct.name.charAt(0).toUpperCase() + this.newProduct.name.slice(1); // Transform name to capitalize before saving
      axios.post(`${this.$apiUrl}/products`, this.newProduct)
        .then(() => {
          this.newProduct = { name: '', price: '', category: '', subcategory: '', area: '' }; // Reset form
          this.dialog = false;
          this.loadItems();
        })
        .catch(error => console.error('Error adding product:', error));
    },
    deleteProduct(productId) {
      axios.delete(`${this.$apiUrl}/products/${productId}`)
        .then(() => {
          this.loadItems();
        })
        .catch(error => {
          console.error('Error deleting product:', error);
        });
    },
    editProduct(item) {
      this.dialogTitle = 'Edit Product';
      this.editableProduct = { ...item };
      this.dialog = true;
    },
    saveProduct() {
      if (this.dialogTitle === 'Add Product') {
        this.addProduct();
      } else {
        this.updateProduct();
      }
    },
    updateProduct() {
      this.editableProduct.name = this.editableProduct.name.charAt(0).toUpperCase() + this.editableProduct.name.slice(1); // Transform name to capitalize before saving
      axios.put(`${this.$apiUrl}/products/${this.editableProduct.id}`, this.editableProduct)
        .then(() => {
          this.editItem = null;
          this.dialog = false;
          this.loadItems();
        })
        .catch(error => {
          console.error('Error updating product:', error);
          this.editItem = null;
          this.dialog = false;
        });
    },
    transformEditableNameToUpperCase() {
      if (this.editableProduct.name) {
        this.editableProduct.name = this.editableProduct.name.charAt(0).toUpperCase() + this.editableProduct.name.slice(1);
      }
    }
  },
  created() {
    this.loadItems();
  },
}
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
