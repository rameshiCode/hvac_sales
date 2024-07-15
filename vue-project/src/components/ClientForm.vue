<template>
  <v-card>
    <v-card-title>
      Add New Client
    </v-card-title>
    <v-container>
      <v-form ref="form" v-model="valid">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="client.name"
              :rules="nameRules"
              label="Client Name"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="client.phone"
              :rules="phoneRules"
              label="Phone"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="client.email"
              :rules="emailRules"
              label="Email"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="client.address"
              :rules="addressRules"
              label="Address"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              :disabled="!valid"
              color="success"
              @click="submit"
            >
              Add Client
            </v-btn>
            <v-btn
              color="error"
              @click="reset"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      valid: true,
      client: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      nameRules: [
        v => !!v || 'Name is required'
      ],
      phoneRules: [
        v => !!v || 'Phone number is required',
        v => (v && v.length >= 10) || 'Phone number must be at least 10 digits'
      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      addressRules: [
        v => !!v || 'Address is required'
      ],
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        axios.post(`${this.$apiUrl}/clients`, this.client)
          .then(() => {
            this.$emit('update');
            this.reset();
            this.$emit('notification', 'Client added successfully', 'success');
          })
          .catch(error => {
            console.error('Error adding client:', error);
            this.$emit('notification', 'Error adding client', 'error');
          });
      }
    },
    reset() {
      this.$refs.form.reset();
    }
  }
};
</script>
