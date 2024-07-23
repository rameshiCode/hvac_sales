<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col>
          <v-btn color="primary" @click="enableAdding">Add New Client</v-btn>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search Clients"
            single-line
            hide-details
            @input="loadItems"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="clients"
        :server-items-length="totalItems"
        :loading="loading"
        :search="search"
        @update:options="loadItems"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-icon small v-bind="props">mdi-dots-vertical</v-icon>
            </template>
            <v-list>
              <v-list-item @click="createNewProject(item)">
                <v-list-item-title>New Project</v-list-item-title>
            </v-list-item>
              <v-list-item @click="enableEditing(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteClient(item.id)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

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
      </v-data-table>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Name"
                    v-model="editable.name"
                    :rules="[v => !!v || 'Name is required']"
                  ></v-text-field>
                  <v-text-field
                    label="Phone"
                    v-model="editable.phone"
                    :rules="[v => !!v || 'Phone is required']"
                  ></v-text-field>
                  <v-text-field
                    label="Email"
                    v-model="editable.email"
                    :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                  ></v-text-field>
                  <v-text-field
                    label="Address"
                    v-model="editable.address"
                    :rules="[v => !!v || 'Address is required']"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      clients: [],
      loading: true,
      dialog: false,
      editable: {},
      editItem: null,
      search: '',
      itemsPerPage: 5,
      sortOrder: true,
      sortBy: ['name'],
      totalItems: 0,
      page: 1,
      headers: [
        { title: 'Client Name', value: 'name', sortable: true },
        { title: 'Phone', value: 'phone' },
        { title: 'Email', value: 'email' },
        { title: 'Address', value: 'address' },
        { title: 'Actions', value: 'actions', sortable: false }
      ],
    }
  },
  methods: {
    loadItems() {
      this.loading = true;
      const sortOrder = this.sortOrder ? 'asc' : 'desc';
      const params = {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy[0],
        sortOrder: sortOrder,
        search: this.search,
      };
      axios.get(`${this.$apiUrl}/clients`, { params })
        .then(response => {
          this.clients = response.data.items;
          this.totalItems = response.data.total;
        })
        .catch(error => {
          console.error('Error fetching clients:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveClient(clientData) {
      axios.post(`${this.$apiUrl}/clients`, clientData)
        .then(response => {
          console.log('Client created:', response.data); // Log the response
          if (response.status === 201) {
            const clientId = response.data.id;
            const clientEmail = response.data.email;
            this.$router.push({ name: 'ProductCategorySelection', params: { clientId, clientEmail }});
          } else {
            console.error('Unexpected response:', response);
          }
        })
        .catch(error => {
          console.error('Error adding client:', error);
        });
    },
    save() {
      if (this.editItem) {
        axios.put(`${this.$apiUrl}/clients/${this.editItem}`, this.editable)
          .then(() => {
            this.loadItems();
            this.close();
          })
          .catch(error => {
            console.error('Error saving client:', error);
          });
      } else {
        this.saveClient(this.editable);
      }
    },
    deleteClient(clientId) {
      axios.delete(`${this.$apiUrl}/clients/${clientId}`)
        .then(() => {
          this.loadItems();
        })
        .catch(error => {
          console.error('Error deleting client:', error);
        });
    },
    enableEditing(client) {
      this.editable = { ...client };
      this.editItem = client.id;
      this.dialog = true;
      this.formTitle = 'Edit Client';
    },
    enableAdding() {
      this.editable = { name: '', phone: '', email: '', address: '' };
      this.editItem = null;
      this.dialog = true;
      this.formTitle = 'Add New Client';
    },
    createNewProject(client) {
      const { id, email, name } = client;
      this.$router.push({ 
        name: 'ProductCategorySelection',
        params: { clientId: id, clientEmail: email}
      });
    },
    close() {
      this.dialog = false;
    },
  },
  mounted() {
    this.loadItems(); // Ensure correct initial load parameters
  }
};
</script>
