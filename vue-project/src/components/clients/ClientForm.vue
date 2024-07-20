<template>
    <v-dialog v-model="existingClientDialog" width="auto">
        <v-card>
            <v-card-text>
                {{ existingClientMessage }} <br>
                Ești sigur că vrei să creezi clientul?
            </v-card-text>
            <v-card-actions class="justify-content-end">
                <v-btn
                    color="primary"
                    variant="text"
                    @click="existingClientDialog = false"
                >
                    Nu
                </v-btn>
                <v-btn
                    color="danger"
                    variant="text"
                    @click="triggerForceCreateClient"
                >
                    Da
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-form ref="form" v-model="valid">
        <v-card>
            <v-card-title> Informații Client</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col md="6" sm="12">
                        <v-text-field
                            :variant="this.$store.state.vuetifyFieldType"
                            label="Nume client"
                            v-model="formData.client.full_name"
                            :rules="nameRules"
                            required
                            data-cy="client-name"
                        >
                        </v-text-field
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-text-field
                            clearable
                            label="Număr telefon"
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="formData.client.phone"
                            :rules="phoneRules"
                            data-cy="client-phone"
                        >
                        </v-text-field
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-text-field
                            id="email"
                            clearable
                            label="Adresă email"
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="formData.client.email"
                            :rules="emailRules"
                            data-cy="client-email"
                            placeholder="popescu@mail.com"
                        >
                        </v-text-field
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-select
                            data-cy="client-type"
                            clearable
                            label="Tipul Clientului"
                            :items="clientTypes"
                            v-model="formData.client.client_type"
                            :variant="this.$store.state.vuetifyFieldType"
                            item-text="label"
                            item-value="value"
                            :rules="clientTypeRules"
                            required
                        >
                        </v-select
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <IntermediarySelect
                            :classes="'col-12 mb-4'"
                            :current-intermediary="null"
                            :selected-agent="formData.client.selectedAgent"
                            :on-edit="true"
                            @new-intermediary="withIntermediary = true"
                            @intermediary-changed="changeIntermediary"
                        ></IntermediarySelect>
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-autocomplete
                            v-if="this.userPermissions.canEditClientAgent"
                            prepend-inner-icon="mdi-account-switch"
                            label="Nume agent"
                            :items="availableAgents"
                            item-title="full_name"
                            :rules="agentRules"
                            required
                            item-value="id"
                            v-model="formData.client.selectedAgent"
                            @update:modelValue="setDifferentAgentSelected"
                        >
                        </v-autocomplete
                        >
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <CreateIntermediary
            v-if="withIntermediary"
            :onClientCreation="true"
            @save-intermediary="saveIntermediary"
        />
        <v-card>
            <v-card-title> Informații locație</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col md="6" sm="12">
                        <v-text-field
                            clearable
                            label="Descriere"
                            required
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="formData.location.description"
                            :rules="nameRules"
                            data-cy="location-description"
                        >
                        </v-text-field
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-autocomplete
                            data-cy="location-region"
                            clearable
                            label="Județ"
                            :items="regions"
                            v-model="formData.location.region_id"
                            :variant="this.$store.state.vuetifyFieldType"
                            item-title="title"
                            item-value="value"
                            autocomplete
                        >
                        </v-autocomplete
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-text-field
                            clearable
                            label="Localitate"
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="formData.location.city"
                            data-cy="location-city"
                        >
                        </v-text-field
                        >
                    </v-col>
                    <v-col md="6" sm="12">
                        <v-text-field
                            clearable
                            label="Adresă"
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="formData.location.address"
                            data-cy="location-address"
                        >
                        </v-text-field
                        >
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-btn color="success" class="mr-4" @click="saveClientWithLocation(false)">
            Salvează client
        </v-btn
        >
    </v-form>
    <v-snackbar v-model="snackbar"
    >{{ snackbarMessage }}
        <v-btn color="pink" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
</template>

<script>
import apiClient from "@/utils/apiClient";
import getCurrentDateTime from "@/utils/currentTimeFunction";
import IntermediarySelect from "@/components/clients/IntermediarySelect.vue";
import CreateIntermediary from "@/components/clients/CreateIntermediary.vue";
import {mapGetters} from "vuex";
import {fetchData} from "@/utils/utils";

export default {
    name: "ClientForm",
    components: {
        IntermediarySelect,
        CreateIntermediary,
    },
    data: () => ({
        formData: {
            client: {
                full_name: "",
                phone: "",
                email: "",
                cif: "",
                notes: "",
                client_type: 1,
                selectedAgent: parseInt(JSON.parse(sessionStorage.getItem("userId"))),
            },
            location: {
                description: "",
                region_id: null,
                city: "",
                address: "",
            },
        },
        clientTypes: [
            {title: "Client final", value: 1},
            {title: "Instalator", value: 2},
            {title: "Constructor", value: 3},
            {title: "Dezvoltator", value: 4},
            {title: "Magazin", value: 5},
            {title: "Agent", value: 6},
        ],
        intermediary: "",
        newIntermediary: null,
        changedIntermediary: null,
        withIntermediary: false,
        regions: [],
        show: false,
        customerSubmitted: false,
        valid: false,
        checkbox: false,
        snackbar: false,
        snackbarMessage: "",
        clientTypeRules: [
            (value) => {
                if (value) return true;
                return "Tipul clientului este obligatoriu.";
            },
        ],
        agentRules: [
            (value) => {
                if (value) return true;
                return "Numele agentului este obligatoriu.";
            },
        ],
        nameRules: [
            (value) => {
                if (value) return true;
                return "Denumirea este obligatorie.";
            },
        ],
        emailRules: [
            (value) => {
                if (!value) return true;
                else if (/.+@.+\..+/.test(value)) return true;
                return "E-mailul trebuie să fie valid";
            },
        ],
        phoneRules: [
            (value) => {
                if (!value) return true;
                if (value.startsWith("+")) {
                    return (
                        value.length >= 11 ||
                        "Numărul de telefon trebuie să aibă cel puțin 12 caractere."
                    ); // Checks length for numbers starting with +
                } else {
                    return (
                        value.length >= 10 ||
                        "Numărul de telefon trebuie să aibă cel puțin 10 caractere."
                    ); // Checks length for other numbers
                }
            },
        ],
        existingClientDialog: false,
        existingClientAgent: null,
        existingClientMessage: '',
        isDifferentAgentSelected: false,
    }),
    mounted() {
        fetch("/cities.json")
            .then((response) => response.json())
            .then((data) => {
                this.regions = data
                    .filter((item) => item.model === "cities_light.region")
                    .sort((a, b) =>
                        a.fields.display_name.localeCompare(b.fields.display_name)
                    )
                    .map((item) => {
                        return {
                            title: item.fields.display_name,
                            value: item.pk,
                        };
                    });
            });
    },
    computed: {
        ...mapGetters(["userPermissions", "userRole"]),
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
        setDifferentAgentSelected() {
            this.isDifferentAgentSelected = true;
        },
        saveIntermediary(intermediary) {
            this.newIntermediary = intermediary;
        },
        changeIntermediary(intermediary) {
            this.withIntermediary = false;
            this.changedIntermediary = intermediary;
        },
        /**
         * Asynchronously sets a special technical user as the selected agent for a client under specific conditions.
         * This method checks the current user's email stored in sessionStorage. If the email matches one of two predefined
         * email addresses, it then filters the list of users also stored in sessionStorage to find a technical user
         * with an email that includes 'tehnic@sistema.com.ro'. If such a user is found, their ID is set as the selected
         * agent for the client in the form data. This is a special case operation intended for creating clients with
         * a specific technical user agent when the current user is one of two special agents.
         *
         * Assumes 'myUsers' in sessionStorage is a JSON string representing an array of user objects, and that
         * 'userEmail' in sessionStorage is a string representing the current user's email.
         *
         * @async
         * @function setSpecialUserForTechnicalUsers
         * @throws {SyntaxError} Throws a syntax error if 'myUsers' is not valid JSON.
         * @sideEffect Modifies `this.formData.client.selectedAgent` by setting it to the ID of the found technical user.
         *             May log to the console if no technical user is found.
         */
        async setSpecialUserForTechnicalUsers() {
            let usersArray = await JSON.parse(sessionStorage.getItem('myUsers'));
            if (!this.isDifferentAgentSelected && (sessionStorage.getItem('userEmail') === 'ofertare@sistema.com.ro' || sessionStorage.getItem('userEmail') === 'ofertare2@sistema.com.ro')) {
                let technicalUser = usersArray.filter(user => user.email.includes('tehnic@sistema.com.ro'));
                if (technicalUser.length > 0) { // Ensure at least one user was found
                    this.formData.client.selectedAgent = technicalUser[0].id;
                } else {
                    console.log('No technical user found');
                }
            }
        },
        /**
         * Triggers the creation of a client with the forceCreateClient flag set to true.
         * This method is intended to be called when a user decides to force the creation
         * of a client despite the system detecting a potential duplicate.
         */
        async triggerForceCreateClient() {
            let forceCreateClient = true;
            await this.saveClientWithLocation(forceCreateClient);
        },
        /**
         * Constructs a detailed message based on the fields that matched an existing client.
         *
         * @param {Object} matchedInfo - An object containing information about which fields matched an existing client.
         * @param {String} existingClientAgent - The name of the agent associated with the existing client.
         * @returns {String} A message detailing which fields were matched and the agent associated with the existing client.
         */
        constructMatchedMessage(matchedInfo, existingClientAgent) {
            let matchedFieldsMessage = '';
            if (matchedInfo) {
                // Split the matched fields and values to construct a detailed message
                const fields = matchedInfo.matched_field.split(', ');
                const values = matchedInfo.matched_value.split(', ');
                fields.forEach((field, index) => {
                    let fieldName = '';
                    switch (field) {
                        case 'full_name':
                            fieldName = 'numele';
                            break;
                        case 'phone':
                            fieldName = 'numărul de telefon';
                            break;
                        case 'email':
                            fieldName = 'email-ul';
                            break;
                    }
                    matchedFieldsMessage += `${fieldName} ${values[index]}`;
                    if (index < fields.length - 1) {
                        matchedFieldsMessage += ' și ';
                    }
                });
            }

            // Construct the final message to display in the dialog
            return `Pentru ${matchedFieldsMessage} s-a găsit un client existent pe agentul ${existingClientAgent}.`;
        },
        /**
         * Attempts to save a new client along with its location to the system. It performs validation
         * and then sends a request to the backend. If a client already exists, it handles the response
         * accordingly by displaying a message.
         *
         * @param {Boolean} [forceCreateClient=false] - Flag indicating whether to force the creation of a client, bypassing duplicate checks.
         */
        async saveClientWithLocation(forceCreateClient = false) {
            await this.setSpecialUserForTechnicalUsers();
            let validation = await this.$refs.form.validate();
            if (validation.valid) {
                if (this.newIntermediary) {
                    this.formData.client.intermediate = this.newIntermediary;
                } else if (this.changedIntermediary) {
                    this.formData.client.intermediate_id = this.changedIntermediary;
                } else {
                    this.formData.client.intermediate_id = "";
                }
                this.formData.client.created = getCurrentDateTime();
                this.formData.client.modified = getCurrentDateTime();
                this.formData.client.created_by = JSON.parse(sessionStorage.getItem('userId'));
                const requestData = {
                    client: this.formData.client,
                    location: this.formData.location,
                    forceCreateClient: forceCreateClient,
                };

                await apiClient
                    .post("/api/add_client_with_location/", requestData)
                    .then(async (response) => {
                        response.data.client.agent_id = response.data.client.agent;
                        this.snackbarMessage = "Clientul a fost adăugat cu succes!";
                        this.snackbar = true;
                        await fetchData("all");
                        this.existingClientDialog = false;
                        setTimeout(() => {
                            this.$router.push(
                                "/client-details/" + response.data.client.id + "/"
                            );
                        }, 300);
                    })
                    .catch((error) => {
                        if (error.response.status === 400 && error.response.data.message === "Client already exists") {
                            const matchedInfo = error.response.data.matched_info;
                            const existingClientAgent = error.response.data.existing_client.agent_full_name;
                            // Use the new method to construct the message
                            this.existingClientMessage = this.constructMatchedMessage(matchedInfo, existingClientAgent);
                            this.existingClientDialog = true;
                        } else {
                            console.log(
                                "Other status",
                                error.response.status,
                                error.response.data.details[0] ||
                                "A apărut o eroare la adăugarea clientului."
                            );
                            // Handle other statuses
                            this.snackbarMessage =
                                error.response.data.details[0] ||
                                "A apărut o eroare la adăugarea clientului.";
                            this.snackbar = true;
                        }
                    });
            } else {
                this.snackbarMessage = "Formularul nu este completat corect.";
                this.snackbar = true;
            }
        },
    },
};
</script>

<style scoped>
.v-form {
    margin: 20px 0 0 0;
}

.v-card {
    margin: 20px 0;
}
</style>
