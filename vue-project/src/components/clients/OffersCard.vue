<template>
    <div class="d-flex flex-column align-items-center justify-content-center w-100">
        <v-card class="w-100">
            <v-hover open-delay="150" close-delay="150" v-slot="{ isHovering, props }">
                <v-toolbar v-bind="props" @click="toggleComponentCollapse" class="cursor-pointer">
                    <v-toolbar-title>
                        Oferte
                    </v-toolbar-title>
                    <v-expand-transition>
                        <div v-if="isHovering" class="d-flex justify-content-center align-items-center"
                             style="background: rgb(var(--v-theme-on-surface-variant)); position: absolute; top: 65%; left: 50%;">
                            <v-icon v-if="collapsed">mdi-chevron-double-down</v-icon>
                            <v-icon v-else>mdi-chevron-double-up</v-icon>
                        </div>
                    </v-expand-transition>
                </v-toolbar>
            </v-hover>
            <v-expand-transition>
                <v-card-text v-if="!collapsed">
                    <v-data-table
                        :items="sortedItems"
                        :headers="headers"
                        class="elevation-1"
                        :variant="this.$store.state.vuetifyFieldType"
                        item-title="title"
                        item-key="key"
                        :loading="loading"
                        dense
                    >
                        <template v-slot:[`item.offer_id`]="{ item }">
                            <a
                                href="#"
                                class="text-decoration-none"
                                @click.prevent="showOfferDetails(item)"
                            ><span
                                v-if="differentCreator(item.selectable.agent ? item.selectable.agent : clientAgent,clientAgent)"
                            >#{{
                                    item.selectable.id
                                }}<span class="text-danger">*</span>
              <v-tooltip
                  content-class="custom-tooltip"
                  activator="parent"
                  location="top"
              >
                {{
                      differentCreator(item.selectable.agent, clientAgent)
                  }}
              </v-tooltip></span
                            >
                                <span v-else>#{{ item.selectable.id }}</span>
                            </a>
                        </template>
                        <template v-slot:[`item.modified`]="{ item }">
                            {{
                                new Date(item.selectable.modified).toLocaleString("ro-RO", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    second: "numeric",
                                })
                            }}
                        </template>
                        <template v-slot:[`item.dimension`]="{ item }">
                            <v-btn
                                v-if="item.selectable.type === 1 || item.selectable.type === 3"
                                color="primary"
                                variant="text"
                                href="#"
                                class="text-decoration-none"
                                @click.prevent="openDimensioning(item.selectable)"
                            >{{ item.selectable.offer_location_version }}
                            </v-btn>
                            <span v-else>Nu</span>
                        </template>
                        <template v-slot:[`item.type`]="{ item }">
                            <span v-if="item.selectable.type === 1">IPA</span>
                            <span v-if="item.selectable.type === 2">SANITARE</span>
                            <span v-if="item.selectable.type === 3">VMC</span>
                            <span v-if="item.selectable.type === 4">{{
                                    item.selectable.custom_pdf_heading ? item.selectable.custom_pdf_heading + ' / ' : ''
                                }}SIMPLĂ</span>
                            <span v-if="item.selectable.type === 5">C. T. și COLOANE</span>
                            <span v-if="item.selectable.type === 6">TAVAN</span>
                            <span v-if="item.selectable.type === 7">PEREȚI</span>
                            <span v-if="item.selectable.type === 8">AUTOMATIZARE</span>
                            <span v-if="item.selectable.type === 9">VENTILOCONVECTOARE</span>
                            <span v-if="item.selectable.type === 10">CANAL TERMIC</span>
                            <span v-if="item.selectable.type === 11">PDC</span>
                        </template>
                        <template v-slot:[`item.total_area`]="{ item }">
                <span v-if="item.selectable.type === 1 || item.selectable.type === 3">
                    {{ item.selectable.total_area ? parseFloat(item.selectable.total_area).toFixed(2) + "m²" : "Nu" }}
                </span>
                            <span v-else>Nu</span>
                        </template>
                        <template v-slot:[`item.list_price_value`]="{ item }">
                    <span v-if="item.selectable.list_price_value !== '0.00'">{{
                            formatNumber(this, Math.round(item.selectable.list_price_value), true, 0)
                        }}</span>
                            <span v-else>--</span>
                        </template>
                        <template v-slot:[`item.discount`]="{ item }">
                    <span v-if="item.selectable.is_discount_mixed">
                          <span v-if="item.selectable.discount !== '0.00' && item.selectable.discount !== null">
                            {{ parseInt(item.selectable.discount) }}%
                          </span>
                          <span style="color: red;"> Mixt</span>
                    </span>
                            <span v-else-if="item.selectable.discount !== '0.00' && item.selectable.discount !== null">
                        {{ parseInt(item.selectable.discount) }}%
                    </span>
                            <span v-else>--</span>
                        </template>
                        <template v-slot:[`item.value_with_discount`]="{ item }">
                    <span v-if="item.selectable.value_with_discount !== '0.00'">{{
                            formatNumber(this, Math.round(item.selectable.value_with_discount), true, 0)
                        }}</span>
                            <span v-else>--</span>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon size="small" color="danger" @click="triggerDeleteDialog(item.selectable)">
                                mdi-delete
                            </v-icon>
                            <v-dialog v-model="deleteDialog" width="auto">
                                <v-card>
                                    <v-card-title
                                        class="text-danger d-flex align-items-center justify-content-between"
                                    >
                                        Atenție!
                                        <v-icon color="danger">mdi-alert-octagon-outline</v-icon>
                                    </v-card-title>
                                    <v-card-text>
                                        Această operație nu este reversibilă. Datele vor fi șterse
                                        permanent. <br/>
                                        Ești sigur că dorești să ștergi aceste date?
                                    </v-card-text>
                                    <v-card-actions class="justify-content-end">
                                        <v-btn
                                            color="primary"
                                            variant="text"
                                            @click="deleteDialog = false"
                                        >
                                            Nu
                                        </v-btn>
                                        <v-btn
                                            color="danger"
                                            variant="text"
                                            @click="deleteOffer(offerToDelete)"
                                        >
                                            Da
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-expand-transition>
        </v-card>
    </div>
</template>

<script>
// import { VDataTable } from 'vuetify/lib/components/VDataTable';
import {formatNumber, roundToTwo, showAlertModal} from "@/utils/utils";
import apiClient from "@/utils/apiClient";

export default {
    name: "OffersCard",
    // components: {
    //     VDataTable,
    // },
    emits: ['offers-fetched', 'location-offers-fetched'],
    props: {
        searchBy: Object,
        clientId: {
            type: String,
            default: null,
        },
        searchId: Number,
        clientOffersData: {
            type: Array,
            default: () => [],
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        clientAgent: {
            type: Number,
            default: null,
        },
        searchOfferType: {
            type: Number,
        }
    },
    data() {
        return {
            fetchedClientOffers: [],
            searchString: '',
            isCollapsed: this.collapsed,
            showOffersButton: false,
            collapsed: true,
            sortKey: null,
            sortDirection: 1,
            headers: [
                {title: 'Nr.', key: 'offer_id', align: 'center', sortable: true},
                {title: 'Data', key: 'modified', align: 'center', sortable: true},
                {title: 'Dim.', key: 'dimension', align: 'center', sortable: true},
                {title: 'Tip', key: 'type', align: 'center', sortable: true},
                {title: 'Suprafață', key: 'total_area', align: 'center', sortable: true},
                {title: 'Total preț listă', key: 'list_price_value', align: 'center', sortable: true, width: '120px'},
                {title: 'Discount', key: 'discount', align: 'center', sortable: true},
                {
                    title: 'Total cu discount',
                    key: 'value_with_discount',
                    align: 'center',
                    sortable: true,
                    width: '120px'
                },
                {title: 'Acțiuni', key: 'actions', align: 'center', sortable: false},
            ],
            deleteDialog: false,
            loading: false,
            offerToDelete: null,
        };
    },
    computed: {
        sortedItems() {
            const items = this.fetchedClientOffers.slice(); // Create a copy of the original array
            if (this.sortKey) {
                items.sort((a, b) => {
                    const valueA = this.getPropertyValue(a, this.sortKey);
                    const valueB = this.getPropertyValue(b, this.sortKey);

                    if (valueA === null) return 1; // Handle null values by pushing them to the end
                    if (valueB === null) return -1;

                    if (valueA > valueB) return this.sortDirection;
                    if (valueA < valueB) return -this.sortDirection;

                    return 0;
                });
            }
            return items;
        },
    },
    methods: {
        async toggleComponentCollapse() {
            this.collapsed = !this.collapsed;
            if (!this.collapsed) {
                this.searchString = '';
                if (this.searchBy.criteria === 'location') {
                    this.searchString = '_by_location_id';
                } else if (this.searchBy.criteria === 'client') {
                    this.searchString = '_by_client_id';
                }
                if (this.clientOffersData && this.clientOffersData.length > 0) {
                    this.fetchedClientOffers = this.clientOffersData;
                    if (this.searchOfferType) {
                        this.fetchedClientOffers = this.fetchedClientOffers.filter(offer => offer.type === this.searchOfferType);
                    }
                    this.fetchedClientOffers.sort((a, b) => b.id - a.id);
                } else if (this.searchBy.value && !(this.clientOffersData && this.clientOffersData.length > 0)) {
                    await this.fetchClientOffers();
                }
            }
        },
        roundToTwo, formatNumber,
        differentCreator(offerAgent, clientAgent) {
            if (clientAgent !== offerAgent) {
                let usersNames = JSON.parse(sessionStorage.getItem('myUsers'));
                let agent_name = usersNames.find(user => user.id === offerAgent);
                let string = 'Oferta a fost creată de '
                string += agent_name.full_name ? agent_name.full_name : agent_name.email;
                return string;
            }
            return null;
        },
        /**
         * Toggles the visibility of the delete confirmation dialog and sets the current offer to be deleted.
         * This method is intended to be called when a user initiates the delete action by clicking the delete
         * icon associated with an offer. It updates the component's state to reflect the offer selected for deletion
         * and toggles the visibility of a confirmation dialog.
         *
         * @param {Object} offer - The offer object that is intended to be deleted. This object should
         * contain at least an identifier (id) that uniquely identifies the offer within the dataset.
         */
        triggerDeleteDialog(offer) {
            this.offerToDelete = offer;
            this.deleteDialog = !this.deleteDialog;
        },
        sortBy(key) {
            if (this.sortKey === key) {
                this.sortDirection *= -1; // Reverse the sort direction if the same key is clicked again
            } else {
                this.sortKey = key;
                this.sortDirection = 1; // Default to ascending order
            }
        },
        getPropertyValue(item, key) {
            const keys = key.split('.');
            let value = item;

            for (const k of keys) {
                value = value[k];
                if (value === undefined || value === null) {
                    // Return a placeholder value for null values
                    return 0;
                }
            }

            return value;
        },

        lastModified(offer) {
            return 'Ultima modificare: ' + new Date(offer.modified).toLocaleDateString('ro-RO')
        },
        async fetchClientOffers() {
            this.loading = true;
            await apiClient
                .get(`/api/get_offer_data${this.searchString}/${this.searchBy.value}/`)
                .then((response) => {
                    if (response.data.offers.length > 0) {
                        this.fetchedClientOffers = JSON.parse(JSON.stringify(response.data.offers)) || [];
                        if (this.searchOfferType) {
                            this.fetchedClientOffers = this.fetchedClientOffers.filter(offer => offer.type === this.searchOfferType);
                        }
                        this.fetchedClientOffers.sort((a, b) => b.id - a.id);
                        this.$emit('location-offers-fetched', this.fetchedClientOffers);
                        this.loading = false;
                    } else {
                        this.$emit('offers-fetched', false);
                        this.loading = false;
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        },
        /**
         * Asynchronously deletes an offer from the server and updates the local state to reflect this change.
         * This method sends a DELETE request to the server targeting a specific offer by its ID. Upon successful
         * deletion, it filters out the deleted offer from the local list of fetched client offers. It also manages
         * loading state indicators and handles any errors that might occur during the process by logging the error
         * and displaying an alert modal. A success message is displayed in an alert modal after the offer is
         * successfully deleted.
         *
         * @param {Object} offer - The offer object to be deleted. This object must include an `id` property
         * that uniquely identifies the offer.
         * @returns {Promise<void>} A promise that resolves when the deletion process has completed. This includes
         * updating the local state and handling any errors. It does not return a value.
         * @throws {Error} Throws an error if the deletion request to the server fails. The error is logged to the console
         * and a warning message is displayed to the user via an alert modal.
         */
        async deleteOffer(offer) {
            this.loading = true;
            try {
                await apiClient.delete(`/api/delete_offer/${offer.id}/`);
                this.fetchedClientOffers = this.fetchedClientOffers.filter(o => o.id !== offer.id);
                this.$emit('location-offers-fetched', this.fetchedClientOffers);
                this.loading = false;
            } catch (error) {
                console.error("Error deleting offer:", error);
                showAlertModal(this.$store, 'A apărut o eroare la ștergerea ofertei.', 'warning', 2000);
            } finally {
                this.deleteDialog = false;
                showAlertModal(this.$store, 'Oferta a fost ștearsă cu succes.', 'success', 2000);
            }
        },
        showOfferDetails(item) {
            let offer = item.raw;
            this.$store.state.fetchedClientOffers = this.fetchedClientOffers;
            switch (offer.type) {
                case 2:
                    this.$router.push({
                        name: "OfferPlumbing",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 3:
                    this.$router.push({
                        name: "OfferVMC",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 4:
                    this.$router.push({
                        name: "OfferSimple",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 5:
                    this.$router.push({
                        name: "OfferTechnicalRoom",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 6:
                    this.$router.push({
                        name: "OfferCeiling",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 7:
                    this.$router.push({
                        name: "OfferWalls",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 8:
                    this.$router.push({
                        name: "OfferAutomation",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 9:
                    this.$router.push({
                        name: "OfferFanCoilUnit",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 10:
                    this.$router.push({
                        name: "OfferThermalChannel",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                case 11:
                    this.$router.push({
                        name: "OfferPDC",
                        params: {
                            clientId: offer.client.id ? offer.client.id : offer.client,
                            locationId: offer.location.id,
                            offerId: offer.id,
                        },
                    });
                    break;
                default:
                    window.open(process.env.VUE_APP_API_BASE_URL + `/app/oferta/detaliu/${offer.id}`, '_blank');
                    break;
            }
        },
        openDimensioning(offer) {
            switch (offer.type) {
                case 3:
                    this.$router.push({
                        name: "OfferVMC",
                        params: {
                            clientId: offer.client,
                            locationId: offer.location,
                        },
                        hash: "#section2",
                    });
                    break;
                default:
                    window.open(process.env.VUE_APP_API_BASE_URL + `/app/client/${offer.client}/${offer.location}`, '_blank');
                    break;
            }
        },
    },
};
</script>

<style scoped>
h5 {
    cursor: pointer;
}
</style>
