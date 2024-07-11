<template>
    <div>
      <h2>Product Management</h2>
      <form @submit.prevent="addProduct">
        <div class="form-group">
          <input type="text" id="productName" v-model="newProduct.name" required>
          <label for="productName">Product Name</label>
        </div>
        <div class="form-group">
          <input type="number" id="productPrice" v-model="newProduct.price" required>
          <label for="productPrice">Price (RON)</label>
        </div>
        <button type="submit">Add Product</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price (RON)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.price }} RON</td>
            <td>
              <button @click="deleteProduct(product.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  
  
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        products: [],
        newProduct: { name: '', price: 0},
        editingProductId: null,  // ID of the product being edited
        editFormData: {          // Temporary form data for edits
          name: '',
          price: 0
    }
      };
    },
    methods: {
      fetchProducts() {
        axios.get(`${this.$apiUrl}/products`)
          .then(response => {
            this.products = response.data;
          })
          .catch(error => {
            console.error('There was an error!', error);
          });
      },
      addProduct() {
        axios.post(`${this.$apiUrl}/products`, this.newProduct)
          .then(response => {
            this.products.unshift(response.data); // Adds the new product to the beginning of the array
            this.newProduct = { name: '', price: 0 }; // Reset the form after submission
        })
          .catch(error => {
            console.error('There was an error!', error);
          });
      },
      deleteProduct(id) {
        axios.delete(`${this.$apiUrl}/products/${id}`)
          .then(() => {
            this.products = this.products.filter(p => p.id !== id);
          })
          .catch(error => {
            console.error('There was an error!', error);
          });
      }
    },
    mounted() {
      this.fetchProducts();
    }
  }
  </script>
  

  <style scoped>
.form-group {
  position: relative;
  margin-bottom: 20px;
}

.form-group input {
  width: 40%;
  padding: 10px;
  font-size: 16px;
}

.form-group label {
  position: relative; 
  left: 10px;
  top: 10px;
  color: #666;
  transition: all 0.3s ease;
  pointer-events: none;
}

.form-group input:focus + label,
.form-group input:not(:placeholder-shown) + label {
  top: -10px;
  left: 10px;
  font-size: 12px;
  color: #333;
}
</style>

  