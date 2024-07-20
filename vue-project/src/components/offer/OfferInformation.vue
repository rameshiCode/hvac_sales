<template>
    <v-card class="mt-2">
        <v-card-text>
            <v-row>
                <!-- Client Name -->
                <v-col cols="4" sm="12" md="6" lg="3">
                    <v-text-field v-model="clientInfo.clientName.value"
                                  label="Client"
                                  readonly
                                  density="compact"
                                  variant="outlined"
                                  hide-details="auto">
                    </v-text-field>
                </v-col>

                <!-- Customer Type Selection -->
                <v-col cols="12" sm="12" md="12" lg="3" v-if="customerTypes && customerTypes.length > 0">
                    <v-select variant="outlined"
                              density="compact"
                              hide-details
                              v-model="selectedCustomerType"
                              :items="customerTypes"
                              item-title="text"
                              item-value="value"
                              label="Tip client"
                              @update:modelValue="setCustomerType(selectedCustomerType)"
                    >
                    </v-select>
                </v-col>

                <!-- Client Location -->
                <v-col cols="4" sm="12" md="12" lg="3">
                    <v-text-field v-model="clientInfo.clientLocation.value"
                                  label="Locație"
                                  readonly
                                  density="compact"
                                  variant="outlined"
                                  hide-details="auto">
                    </v-text-field>
                </v-col>

                <!-- Intermediary -->
                <v-col cols="4" sm="12" md="12" lg="3">
                    <v-text-field v-model="clientInfo.intermediary.value"
                                  label="Intermediar"
                                  readonly
                                  density="compact"
                                  variant="outlined"
                                  hide-details="auto">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="12" md="12" lg="4" v-if="hasAfterSlot">
                    <slot name="after"></slot>
                </v-col>
                <v-col
                    cols="12"
                    sm="12"
                    md="12"
                    :lg="hasAfterSlot ? '8' : '12'">
                    <v-textarea v-model="offerInfo.notes"
                                placeholder="..."
                                label="Observații"
                                @blur="updateInfo"
                                density="compact"
                                variant="outlined"
                                hide-details="auto"
                                :rows="1"
                                auto-grow>
                    </v-textarea>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

export default {
    name: "OfferInformation",
    data() {
        return {
            observer: null,
            isOfferButtonsInView: false,
            collapsed: false,
            clientInfo: {
                clientName: {
                    label: 'Client',
                    value: '',
                },
                clientLocation: {
                    label: 'Locație',
                    value: '',
                },
                intermediary: {
                    label: 'Intermediar',
                    value: 0,
                },
            },
            offerInfo: {
                notes: '',
            },
            locationInfo: '',
            statusOptions: [
                {label: '-----------', value: 0},
                {label: 'Trimisă', value: 1},
                {label: 'Anulată', value: 2},
                {label: 'Acceptată', value: 3},
                {label: 'Finalizată', value: 4},
            ],
            invoiceRecipient: [
                {label: '-----------', value: 0},
                {label: 'Client', value: 1},
                {label: 'Intermediar', value: 2},
            ],
            intermediaries: null,
            selectedCustomerType: 2,
        }
    },
    emits: ['update', 'offer-buttons-in-view'],
    props: {
        client: {
            type: Object,
            required: true,
        },
        location: {
            type: Object,
            required: true,
        },
        offerId: {
            type: String
        },
        offer: {
            type: Object,
            default: null,
        },
        customerTypes: {
            type: Array,
            default: null,
        }
    },
    computed: {
        hasAfterSlot() {
            return !!this.$slots.after; // This checks if the 'after' slot exists
        },
    },
    methods: {
        setOfferData(data) {
            this.offerInfo.selectedCustomerType = data.selected_customer_type;
            this.selectedCustomerType = data.selected_customer_type;
            this.offerInfo.notes = data.notes;
        },
        setCustomerType(customerType) {
            this.offerInfo.selectedCustomerType = customerType;
            this.updateInfo();
        },
        initializeCustomerType() {
            if (this.customerTypes && this.customerTypes.length > 0) {
                this.setCustomerType(this.selectedCustomerType);
            } else {
                this.setCustomerType(null);
            }
        },
        updateInfo() {
            this.$emit('update', this.offerInfo);
        },
        getIntermediaryName(id) {
            if (id === null) {
                return 'Fără intermediar';
            }
            return this.intermediaries.find(intermediary => intermediary.id === id).name;
        },
    },
    async mounted() {
        this.intermediaries = await JSON.parse(sessionStorage.getItem('intermediaries'));

        this.clientInfo.clientName.value = this.client.full_name;
        this.clientInfo.clientLocation.value = this.location.description;
        this.clientInfo.intermediary.value = this.getIntermediaryName(this.client.intermediate_id);

        if (this.offerId) {
            this.offerInfo.parent_offer = this.offerId;
            this.setOfferData(this.offer)
        } else {
            this.initializeCustomerType();
        }
    },
    watch: {
        offerId(newVal) {
            this.offerInfo.parent_offer = newVal;
            this.updateInfo();
        },
        offer(newVal) {
            this.setOfferData(newVal);
            this.updateInfo();
        },
    },
}
</script>

<style scoped>

</style>