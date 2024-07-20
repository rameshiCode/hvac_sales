<template>
    <v-card>
        <v-toolbar :title="formTitle">
        </v-toolbar>
        <v-card-text>
            <v-row>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        :bg-color="full_name === '' && showMissingInfo ? 'danger' : ''"
                        label="Nume client"
                        :variant="full_name === '' && showMissingInfo ? 'solo-filled' : this.$store.state.vuetifyFieldType"
                        v-model="full_name"
                        data-cy="client-name"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        clearable
                        label="Număr telefon"
                        :variant="this.$store.state.vuetifyFieldType"
                        :rules="[validatePhone]"
                        v-model="phone"
                        data-cy="client-phone"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        id="email"
                        clearable
                        label="Adresă email"
                        :variant="this.$store.state.vuetifyFieldType"
                        :rules="[validateEmail]"
                        v-model="email"
                        data-cy="client-email"
                        placeholder="popescu@mail.com"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-select
                        data-cy="client-type"
                        clearable
                        label="Tipul Clientului"
                        :items="clientTypes"
                        v-model="client_type"
                        :variant="this.$store.state.vuetifyFieldType"
                        item-text="label"
                        item-value="value"
                    >
                    </v-select>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <IntermediarySelect
                        :classes="'col-12 mb-4'"
                        :current-intermediary="this.client ? this.client.intermediate_id : null"
                        :selected-agent="selectedAgent"
                        :on-edit="true"
                        @new-intermediary="withIntermediary = true"
                        @intermediary-changed="changeIntermediary"
                    ></IntermediarySelect>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-autocomplete
                        v-if="this.userPermissions.canEditClientAgent"
                        :bg-color="selectedAgent === null && showMissingInfo ? 'danger' : ''"
                        :variant="selectedAgent === null && showMissingInfo ? 'solo-filled' : this.$store.state.vuetifyFieldType"
                        prepend-inner-icon="mdi-account-switch"
                        label='Nume agent'
                        :items="availableAgents"
                        item-title="full_name"
                        item-value="id"
                        v-model="selectedAgent"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <CreateIntermediary
                v-if="withIntermediary"
                :onClientCreation="true"
                @save-intermediary="saveIntermediary"
            />
            <v-card-actions v-if="client" class="justify-content-end">
                <v-btn color="#54c5b0" variant="elevated" @click="saveClient" data-cy="createClient">
                    Salvează modificările
                </v-btn>
            </v-card-actions>
        </v-card-text>
    </v-card>
</template>

<script>
import getCurrentDateTime from "@/utils/currentTimeFunction";
import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";
import CreateIntermediary from "@/components/clients/CreateIntermediary.vue";
import IntermediarySelect from "@/components/clients/IntermediarySelect.vue";
import {mapGetters} from "vuex";

export default {
    name: "ClientInfo",
    components: {
        IntermediarySelect,
        CreateIntermediary,
    },
    props: {
        client: Object,
    },
    data() {
        return {
            showMissingInfo: false,
            isCollapsed: false,
            email: this.client ? this.client.email : '',
            full_name: this.client ? this.client.full_name : '',
            phone: this.client ? this.client.phone : '',
            error: '',
            client_type: this.client ? this.client.type : 1,
            clientTypes: [
                {title: "Client final", value: 1},
                {title: "Instalator", value: 2},
                {title: "Constructor", value: 3},
                {title: "Dezvoltator", value: 4},
                {title: "Magazin", value: 5},
                {title: "Agent", value: 6},
            ],
            selectedAgent: null,
            intermediary: "",
            newIntermediary: null,
            changedIntermediary: null,
            withIntermediary: false,
        };
    },
    mounted() {
        this.selectedAgent = this.client ? this.client.agent_id : parseInt(JSON.parse(sessionStorage.getItem('userId')));
        emitter.on('add-client', this.saveClient)
    },
    unmounted() {
        emitter.off('add-client')
    },
    computed: {
        ...mapGetters(['userPermissions', 'userRole']),
        formTitle() {
            return this.client ? "Editare client" : "Creare client";
        },
        availableAgents() {
            let users = JSON.parse(sessionStorage.getItem('myUsers'));
            let currentUserId = JSON.parse(sessionStorage.getItem('userId'));
            if (this.userRole === 'superAgent') {
                users = users.filter(user => user.parent_agent === currentUserId || user.id === currentUserId);
            }
            return users;
        },
    },
    methods: {
        changeIntermediary(intermediary) {
            this.withIntermediary = false;
            this.changedIntermediary = intermediary;
        },
        saveIntermediary(intermediary) {
            this.newIntermediary = intermediary;
        },
        async saveClient() {
            if (this.full_name === '') {
                this.showMissingInfo = true;
                this.error = 'Introduceti un nume.';
            } else {
                this.error = '';
                const phoneValid = this.validatePhone();
                if (!phoneValid) {
                    return;
                }
                let client = {
                    agent_id: this.selectedAgent,
                    cif: "",
                    created: getCurrentDateTime(),
                    email: this.email,
                    full_name: this.full_name,
                    modified: getCurrentDateTime(),
                    notes: '',
                    phone: this.phone,
                    type: this.client_type,
                }
                if (this.newIntermediary) {
                    client.intermediate = this.newIntermediary;
                } else if (this.changedIntermediary) {
                    client.intermediate_id = this.changedIntermediary;
                } else {
                    client.intermediate_id = '';
                }
                // Retrieve the 'myClients' array from sessionStorage
                let myClients = JSON.parse(sessionStorage.getItem('myClients')) || [];

                if (this.client) {
                    // Update existing client
                    const response = await apiClient.put(`/api/update_client/${this.client.id}/`, client);
                    emitter.emit('client-updated', response.data)

                    // Update the client in the 'myClients' array
                    const clientIndex = myClients.findIndex(c => c.id === this.client.id);
                    if (clientIndex !== -1) {
                        myClients.splice(clientIndex, 1); // Remove the client from its current position
                        myClients.unshift(response.data); // Add the updated client to the beginning of the array
                    }
                } else {
                    // Add new client
                    let newClient;
                    await apiClient.post('/api/add_client/', client)
                        .then(response => {
                            // handle successful response
                            emitter.emit('client-saved')
                            // Add the new client to the 'myClients' array
                            myClients.unshift(response.data.client);
                            newClient = response.data.client;
                        })
                        .then(() => {
                            this.$emit('client-added', newClient);
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 400) {
                                alert('A aparut o eroare la salvarea clientului: ' + error.response.data.message);
                            } else {
                                console.log('A aparut o eroare: ', error.response.data.message);
                                // handle other errors
                            }
                        });
                }
                // Save the updated 'myClients' array back to sessionStorage
                sessionStorage.setItem('myClients', JSON.stringify(myClients));
            }
        },
        validatePhone() {
            if (!this.phone) {
                return true;
            }
            if (this.phone.length === 0) {
                return true;
            }
            if (
                (!/^\d{10}$/.test(this.phone)) &&
                (!/^\+\d{11}$/.test(this.phone))
            ) {
                return 'Introduceti un număr de telefon valid, format din 10 cifre sau incepand cu + si 11 cifre.';
            }
            return true;
        },
        validateEmail() {
            if (this.email.length === 0) {
                return true;
            }
            const pattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!pattern.test(this.email)) {
                return 'Introduceti o adresă de email validă.';
            }
            return true;
        },
    },
}
</script>


<style scoped>
</style>
