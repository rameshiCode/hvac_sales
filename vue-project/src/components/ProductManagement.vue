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
  
        this.axios.post(`${this.$apiUrl}/import`, formData)
          .then(() => {
            this.$router.push('/');  // Redirect to Home after successful import
          })
          .catch(error => {
            console.error('Import failed:', error);
            alert('Failed to import products');
          });
      },
      exportProducts() {
        this.axios.get('/export', { responseType: 'blob' })
          .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
          })
          .catch(error => {
            console.error('Export failed:', error);
            alert('Failed to export products');
          });
      }
    }
  };
  </script>
  