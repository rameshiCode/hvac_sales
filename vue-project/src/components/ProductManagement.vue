<template>
    <div class="product-manager">
      <h1>Product Manager</h1>
      
      <!-- Hidden file input for triggering upload -->
      <input type="file" ref="fileInput" style="display: none;" @change="uploadFile" />
  
      <div class="button-group">
        <button @click="triggerFileInput">Import Products</button>
        <button @click="exportProducts">Export Products</button>
      </div>
    </div>
  </template>
  
  <script>
  import apiClient from '@/api/apiClient';
  export default {
    methods: {
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      uploadFile(event) {
        const file = event.target.files[0];
        if (!file) {
          return; 
        }
 
        const formData = new FormData();
        formData.append('file', file);
        
        apiClient.post(`${this.$apiUrl}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(() => {
          alert('File imported successfully');
        })
        .catch(error => {
          alert(error.response.data.error || 'Failed to import file');
        });
      },
      exportProducts() {
        apiClient({
          url: '/export',
          method: 'GET',
          responseType: 'blob', // Important for handling the download
        })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'products.csv'); // File name for download
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          alert('Products exported successfully');
        })
        .catch(() => {
          alert('Failed to export products');
        });
      },
    }
  };
  </script>
  
  <style scoped>
  .product-manager {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
  }
  
  .button-group {
    display: flex;
    gap: 20px;
  }
  
  button {
    cursor: pointer;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  