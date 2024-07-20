<template>
    <v-card style="border: 1px solid rgba(0,0,0,0.15);" :elevation="3">
        <v-dialog v-model="dialog" width="auto">
            <v-card>
                <v-card-text>
                    Ești sigur că vrei să ștergi clientul?
                </v-card-text>
                <v-card-actions class="justify-content-end">
                    <v-btn
                        color="primary"
                        variant="text"
                        @click="dialog = false"
                    >
                        Nu
                    </v-btn>
                    <v-btn
                        color="danger"
                        variant="text"
                        @click="triggerDeleteClient"
                    >
                        Da
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-toolbar>
            <v-toolbar-title data-cy="clientDetails-clientName" @click="goToClientDetails(client.id)">
                {{ client.full_name }}
            </v-toolbar-title>
            <v-btn
                v-if="!editMode"
                class="mr-2"
                @click.prevent="dialog = true"
                data-cy="delete-client"
                icon
                rounded="3"
                density="comfortable"
                color="white"
                variant="text"
                style="color: var(--bs-danger) !important;">
                <v-icon color="danger">mdi-delete</v-icon>
                <v-tooltip
                    activator="parent"
                    location="top"
                >
                    Șterge clientul
                </v-tooltip>
            </v-btn>
            <v-btn
                v-if="!editMode"
                color="primary"
                @click.prevent="toggleEditMode(true)"
                variant="text"
                icon
                density="comfortable"
                rounded="3"
                style="color: white;">
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip
                    activator="parent"
                    location="top"
                >
                    Editează clientul
                </v-tooltip>
            </v-btn>
            <v-btn
                v-if="editMode"
                color="success"
                @click.prevent="toggleEditMode(false)"
                variant="text"
                icon
                density="comfortable"
                rounded="3"
                style="color: white;">
                <v-icon>mdi-check</v-icon>
                <v-tooltip
                    activator="parent"
                    location="top"
                >
                    Salvează modificările
                </v-tooltip>
            </v-btn>
        </v-toolbar>
        <v-container>
            <v-row>
                <v-col>
                    <v-text-field
                        v-if="editMode"
                        clearable
                        :hint="!editMode ? 'Pentru a edita numele clientului, apasă butonul de editare.' : ''"
                        type="text"
                        label="Nume client"
                        prepend-inner-icon="mdi-account"
                        variant="solo-inverted"
                        density="compact"
                        v-model="editableClient.full_name"
                    ></v-text-field>
                    <v-autocomplete
                        v-model="editableClient.type"
                        variant="solo-inverted"
                        :hint="!editMode ? 'Pentru a edita tipul clientului, apasă butonul de editare.' : ''"
                        density="compact"
                        label="Tip client"
                        prepend-inner-icon="mdi-account-multiple-outline"
                        :readonly="!editMode"
                        :items="clientTypes"
                        item-title="text"
                        item-value="value"
                    >
                    </v-autocomplete>
                    <v-text-field
                        :clearable="editMode"
                        :readonly="!editMode"
                        :hint="!editMode ? 'Pentru a edita email-ul, apasă butonul de editare.' : ''"
                        variant="solo-inverted"
                        label="Email"
                        type="email"
                        density="compact"
                        prepend-inner-icon="mdi-email"
                        v-model="editableClient.email"
                    ></v-text-field>
                    <v-text-field
                        :readonly="!editMode"
                        :clearable="editMode"
                        variant="solo-inverted"
                        :hint="!editMode ? 'Pentru a edita numărul de telefon, apasă butonul de editare.' : ''"
                        label="Telefon"
                        type="phone"
                        density="compact"
                        prepend-inner-icon="mdi-phone"
                        v-model="editableClient.phone"
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-autocomplete
                        v-if="this.userPermissions.canEditClientAgent"
                        v-model="editableClient.agent_id"
                        variant="solo-inverted"
                        :hint="!editMode ? 'Pentru a edita agentul, apasă butonul de editare.' : ''"
                        density="compact"
                        label="Agent"
                        prepend-inner-icon="mdi-account-switch"
                        :readonly="!editMode"
                        :items="availableAgents"
                        item-title="full_name"
                        item-value="id"
                        :clearable="editMode"
                    >
                    </v-autocomplete>
                    <IntermediarySelect
                        :isDisabled="!editMode"
                        :current-intermediary="editableClient.intermediate_id"
                        :on-edit="editMode"
                        :selected-agent="editableClient.agent_id"
                        @new-intermediary="withIntermediary = true"
                        @intermediary-changed="changeIntermediary"
                    />
                </v-col>
            </v-row>
            <CreateIntermediary
                v-if="withIntermediary"
                @save-intermediary="saveIntermediary"
            />
        </v-container>
    </v-card>
</template>

<script>
import {deleteClient} from "@/utils/utils";
import emitter from "@/utils/emitter";
import getCurrentDateTime from "@/utils/currentTimeFunction";
import apiClient from "@/utils/apiClient";
import IntermediarySelect from "@/components/clients/IntermediarySelect.vue";
import CreateIntermediary from "@/components/clients/CreateIntermediary.vue";
import {mapGetters} from "vuex";

export default {
    components: {CreateIntermediary, IntermediarySelect},
    data() {
        return {
            editMode: false,
            editableClient: {},
            newIntermediary: null,
            withIntermediary: false,
            clientTypes: [],
            selectedAgent: parseInt(JSON.parse(sessionStorage.getItem('userId'))),
            dialog: false,
        };
    },
    props: {
        activeLink: {
            type: Boolean,
            default: false
        },
        client: {
            type: Object,
            required: true
        }
    },
    created() {
        this.editableClient = JSON.parse(JSON.stringify(this.client));
        this.clientTypes = JSON.parse(sessionStorage.getItem('clientTypes')) || [];
    },
    computed: {
        ...mapGetters(['userPermissions', 'userRole']),
        availableAgents() {
            let users = JSON.parse(sessionStorage.getItem('myUsers'));
            let currentUserId = JSON.parse(sessionStorage.getItem('userId'));
            if (this.userRole === 'superAgent') {
                users = users.filter(user => user.parent_agent === currentUserId || user.id === currentUserId);
            }
            return users;
        },
    },
    watch: {
        client: {
            deep: true,
            handler(newVal) {
                this.editableClient = JSON.parse(JSON.stringify(newVal));
            }
        }
    },
    methods: {
        async triggerDeleteClient() {
            this.dialog = false;
            await deleteClient(this.client.id, '/home');
        },
        // this method is used for closing the intermediary creation window
        closeCreateIntermediary() {
            this.withIntermediary = false;
        },
        changeIntermediary(intermediary) {
            this.withIntermediary = false;
            this.editableClient.intermediate_id = intermediary;
        },
        saveIntermediary(intermediary) {
            this.newIntermediary = intermediary;
        },
        editClient() {
            emitter.emit('edit-client', this.client);
        },
        validatePhone() {
            if (this.editableClient.phone.length === 0) {
                return true;
            }
            if (
                (!/^\d{10}$/.test(this.editableClient.phone)) &&
                (!/^\+\d{11}$/.test(this.editableClient.phone))
            ) {
                return false;
            }
            return true;
        },
        goToClientDetails(clientId) {
            this.$router.push({name: "ClientDetails", params: {id: parseInt(clientId)}});
        },
        toggleEditMode(value) {
            this.editMode = value;
            //if value is false then we also need to close the intermediary creation window
            if (!value) {
                this.saveChanges();
                this.closeCreateIntermediary()
            }
        },
        async saveChanges() {
            if (this.editableClient.full_name === '') {
                this.error = 'Introduceți un nume.';
            } else {
                this.error = '';
                const phoneValid = this.validatePhone(this.editableClient.phone);
                if (!phoneValid) {
                    return;
                }
                let updatedClient = {
                    ...this.editableClient,
                    cif: "",
                    modified: getCurrentDateTime(),
                    notes: '',
                    type: parseInt(this.editableClient.type),
                };
                if (this.newIntermediary) {
                    updatedClient.intermediate = this.newIntermediary;
                    this.withIntermediary = false;
                }
                if (this.client) {
                    // Update existing client
                    let agentEmail = this.client.agent_email
                    const response = await apiClient.put(`/api/update_client/${this.client.id}/`, updatedClient);
                    response.data.agent_email = agentEmail
                    emitter.emit('client-updated', response.data);
                    this.editMode = false;

                    // Update the client in sessionStorage's myClients array
                    const myClients = JSON.parse(sessionStorage.getItem('myClients')) || [];
                    const clientIndex = myClients.findIndex(client => client.id === this.client.id);
                    if (clientIndex !== -1) {
                        myClients.splice(clientIndex, 1, response.data);
                        sessionStorage.setItem('myClients', JSON.stringify(myClients));
                    } else {
                        // Handle the case when no client is provided
                        console.error("No client provided to saveClient");
                    }
                    emitter.emit('refresh-clients');
                    this.editMode = false;
                }
            }
        },
    }
}
</script>
