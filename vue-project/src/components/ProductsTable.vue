<template>
    <v-skeleton-loader type="card" :loading="loading">
      <v-data-table-server
        :headers="headers"
        :items="items"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions"
        :page="currentPage"
        :loading="loading"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
        @update:options="updateOptions"
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
      </v-data-table-server>
    </v-skeleton-loader>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ProductsTable',
    props: {
      items: Array,
      totalItems: Number,
      itemsPerPage: Number,
      currentPage: Number,
      loading: Boolean
    },
    data() {
      return {
        editable: {},
        editItem: null,
        headers: [
          { title: 'Product Name', key: 'name', align: 'start', sortable: true },
          { title: 'Price', key: 'price', align: 'end', sortable: true },
          { title: 'Category', key: 'category', align: 'start', sortable: true },
          { title: 'Area', key: 'area', align: 'start', sortable: true },
          { title: 'Actions', key: 'actions', sortable: false }
        ],
        itemsPerPageOptions: [5, 10, 15]
      };
    },
    methods: {
      updatePage(page) {
        this.$emit('update-page', page);
      },
      updateItemsPerPage(itemsPerPage) {
        this.$emit('update-items-per-page', itemsPerPage);
      },
      updateOptions(options) {
        this.$emit('update-options', options);
      },
      enableEditing(item) {
        this.editable = { ...item };
        this.editItem = item.id;
      },
      saveEdit(item) {
        axios.put(`http://localhost:5001/products/${item.id}`, this.editable)
          .then(() => {
            this.editItem = null;
            this.$emit('update-options');
          })
          .catch(error => {
            console.error('Error updating product:', error);
            this.editItem = null;
          });
      },
      deleteProduct(productId) {
        axios.delete(`http://localhost:5001/products/${productId}`)
          .then(() => {
            this.$emit('update-options');
          })
          .catch(error => {
            console.error('Error deleting product:', error);
          });
      }
    }
  };
  </script>
  