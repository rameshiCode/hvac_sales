<template>
  <div>
    <h1>Product Management</h1>
    <input type="file" @change="handleFileUpload" ref="fileUploader">
    <button @click="importProducts">Import CSV</button>
    <button @click="exportProducts">Export CSV</button>
  </div>
</template>



<script>
import axios from 'axios';

export default {
  name: 'ProductManagement',
  data() {
    return {
      file: null,
      $apiUrl: 'http://localhost:5000'  // Ensure this is correctly set
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    importProducts() {
      if (!this.file) {
        alert('Please select a file first!');
        return;
      }
      let formData = new FormData();
      formData.append('file', this.file);

      axios.post(`${this.$apiUrl}/import`, formData)
        .then(() => {
          this.$router.push('/');  // Redirect to Home after successful import
        })
        .catch(error => {
          console.error('Import failed:', error);
          alert('Failed to import products');
        });
    },
    exportProducts() {
      axios.get(`${this.$apiUrl}/export-products`, { responseType: 'blob' })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'products.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(error => {
          console.error('Export failed:', error);
          alert('Failed to export products');
        });
    }
  }
};


</script>
