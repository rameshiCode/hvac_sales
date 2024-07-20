<template>
    <v-dialog v-model="showModal" width="auto">
        <ClientLocation :location="selectedLocation"></ClientLocation>
    </v-dialog>
    <a href="#" id="section1" ref="section1"></a>
    <v-card class="mb-4 mt-4">
        <v-toolbar @click="recentLocationCollapsed = !recentLocationCollapsed" class="cursor-pointer">
            <v-container>
                <h5>Locații recente</h5>
            </v-container>
        </v-toolbar>
        <v-container v-show="!recentLocationCollapsed">
            <v-row>
                <v-col cols="4" md="6" sm="12" v-for="location in recentLocations" :key="location.id">
                    <LocationCard :active-link="true" :location="location" :client="location.client"
                                  :renderedByClientsList="true" :titleInfo="'clientTitle'"/>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
    <a href="#" id="section2" ref="section2"></a>
    <v-card>
        <v-toolbar class="sticky-top" height="auto">
            <v-container>
                <v-row class="d-flex justify-content-between flex-row">
                    <v-col cols="12" md="12" lg="2" class="order-first d-flex align-items-center">
                        <h5 class="mb-0 cursor-pointer"
                            data-cy="clientsList-title">{{ getClientsListTitle }}</h5>
                    </v-col>
                    <v-col cols="12" md="12" lg="4" class="d-flex justify-content-end align-items-center">
                        <v-text-field
                            class="clientsList-input"
                            label="Nume client"
                            density="compact"
                            clearable
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="searchQuery"
                            @click:clear="handleNameSearchQuery"
                            @keydown.enter="handleNameSearchQuery"
                            prepend-inner-icon="mdi-magnify"
                        >
                            <template v-slot:append>
                                <v-btn @click="handleNameSearchQuery"
                                       color="primary"
                                       variant="text"
                                       class="mx-2"
                                >
                                    Caută
                                </v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="12" lg="2" class="d-flex justify-content-end align-items-center">
                        <v-select
                            :items="this.offerTypes"
                            item-title="name"
                            item-value="type"
                            label="Tip ofertă"
                            density="compact"
                            :variant="this.$store.state.vuetifyFieldType"
                            v-model="searchOfferType"
                            hide-details
                            dirty
                        >
                        </v-select>
                    </v-col>
                    <v-col cols="12" md="12" lg="3" class="d-flex justify-content-end align-items-center">
                        <v-text-field
                            class="clientsList-input"
                            density="compact"
                            :variant="this.$store.state.vuetifyFieldType"
                            label="Număr ofertă"
                            clearable
                            v-model="searchOfferIdValue"
                            prepend-inner-icon="mdi-magnify"
                            @keydown.enter="findOffers"
                        >
                            <template v-slot:append>
                                <v-btn @click="findOffers"
                                       color="primary"
                                       variant="text"
                                       class="mx-2"
                                       :disabled="searchOfferType === 0 && !searchOfferIdValue"
                                       :loading="loadingOffers"
                                >
                                    Caută
                                </v-btn>
                            </template>
                        </v-text-field>
                        <div class="dropdown-menu" v-if="searchOfferIdHistory.length">
                            <a href="#" class="dropdown-item"
                               v-for="(suggestion, index) in searchOfferIdHistory"
                               :key="suggestion"
                               @click.prevent="searchOfferIdValue = searchOfferIdHistory[index]">{{
                                    suggestion
                                }}</a>
                        </div>
                    </v-col>
                    <v-theme-provider theme="sistemaLightTheme">
                        <v-col cols="6" md="12" lg="1"
                               class="d-flex justify-content-center align-items-center order-2 order-lg-4">
                            <v-btn icon @click="refreshClients()">
                                <v-icon color="success">mdi-refresh</v-icon>
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >
                                    Reîmprospătare listă clienți
                                </v-tooltip>
                            </v-btn>
                            <v-btn
                                color="primary"
                                @click="addClient"
                                data-cy="add-client"
                                variant="text"
                                icon
                            >
                                <v-icon>mdi-plus</v-icon>
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >
                                    Adaugă client
                                </v-tooltip>
                            </v-btn>
                        </v-col>
                    </v-theme-provider>
                </v-row>
            </v-container>
        </v-toolbar>
        <v-container>
            <div v-if="$vuetify.display.smAndDown">
                <div v-for="(client, index) in displayedClients" :key="index" class="my-4">
                    <ClientCard :active-link="true" :client="client"/>
                    <OffersCard v-if="client.offers?.length" :searchBy="{criteria: 'client',value: client.id}"
                                :collapsed="false" :search-offer-type="searchOfferType"></OffersCard>
                </div>
            </div>
            <ClientsTableList
                v-if="!searchOffersDialog"
                :clients="displayedClients"
                :loading="loadingClients"
                :agents="agents"
                :intermediaries="intermediaries"
                :total-clients="totalClients"
                :current-page="currentPage"
                :items-per-page="itemsPerPage"
                :search-offer-type="searchOfferType"
                @updated-sorting="handleSortingChange"
                @updated-items-per-page="handleClientsItemPerPageUpdate"
                @updated-page="handleClientsUpdatePage"
            >
                <template v-slot:agentMenu>
                    <v-list-item class="table-dropdown-input-item">
                        <v-text-field variant="outlined" density="compact" hide-details label="Nume agent"
                                      v-model="agentFilter" @click.stop></v-text-field>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item v-for="agent in filteredAgents" :value="agent.id" :key="agent.id"
                                 :active="isActiveFilter('agent__id', agent.id)" active-class="active-item"
                                 @click="addFilter('agent__id', agent.id)" class="list-item">
                        <div class="d-flex justify-content-between align-items-center flex-row">
                            <v-list-item-title>
                                {{ agent.full_name !== '' ? agent.full_name : agent.email }}
                            </v-list-item-title>
                            <v-icon color="danger" v-if="isActiveFilter('agent__id', agent.id)">mdi-delete
                            </v-icon>
                        </div>
                    </v-list-item>
                </template>
                <template v-slot:clientMenu>
                    <v-list-item>
                        <v-text-field variant="outlined" density="compact" hide-details label="Nume client"
                                      v-model="searchQuery"
                                      @click.stop></v-text-field>
                    </v-list-item>
                </template>
                <template v-slot:clientTypeMenu>
                    <v-list-item v-for=" clientType in clientTypes" :value="clientType.value" :key="clientType"
                                 :active="isActiveFilter('type', clientType.value)" active-class="active-item"
                                 @click="addFilter('type', clientType.value)">
                        {{ clientType.text }}
                    </v-list-item>
                </template>
                <template v-slot:intermediaryMenu v-if="filteredIntermediaries && filteredIntermediaries.length > 0">
                    <v-list-item>
                        <v-text-field variant="outlined" density="compact" hide-details label="Nume"
                                      v-model="intermediaryFilter" @click.stop></v-text-field>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item v-for="intermediary in filteredIntermediaries" :value="intermediary.id"
                                 :key="intermediary.id"
                                 :active="isActiveFilter('intermediate__id', intermediary.id)"
                                 active-class="active-item"
                                 @click="addFilter('intermediate__id', intermediary.id)">
                        <div class="d-flex justify-content-between align-items-center flex-row">
                            <v-list-item-title>
                                {{ intermediary.name }}
                            </v-list-item-title>
                            <v-icon color="danger">
                                mdi-delete
                            </v-icon>
                        </div>
                    </v-list-item>
                </template>
                <template v-slot:dateMenu>
                    <v-list-item density="compact">
                        <input type="date" class="form-control m-0" v-model="filterDate" @click.stop
                               @change="addFilter('modified', filterDate)"/>
                    </v-list-item>
                    <v-list v-if="offersWithClients.length > 0" class="no-bullets">
                        <v-divider></v-divider>
                        <v-list-item density="compact">
                            <h6 class="my-0 py-0">Oferte:</h6>
                        </v-list-item>
                        <v-list-item v-for="date in dateOptions" :key="date" :value="date.value"
                                     :active="date.value === selectedDateOption" active-class="active-item"
                                     density="compact"
                                     @click="updateSelectedDate(date.value)">
                            {{ date.text }}
                        </v-list-item>
                        <v-list-item density="compact">
                            <input
                                type="date"
                                class="form-control"
                                v-model="selectedDate"
                            >
                        </v-list-item>
                    </v-list>
                </template>
            </ClientsTableList>
            <SearchOffersResults
                v-if="searchOffersDialog"
                :offers="offersWithClients"
                :total-offers="offersSearchTotalOffersCount"
                :page="offersSearchPage"
                :items-per-page="offerSearchItemsPerPage"
                @update-page="handleOffersSearchUpdatePage"
                @update-items-per-page="handleOffersSearchUpdateItemsPerPage"
                @update-sorting="handleOffersSearchSortingUpdate"
            ></SearchOffersResults>
        </v-container>
    </v-card>
</template>

<script>
import apiClient from "@/utils/apiClient";
import ClientCard from "@/components/clients/ClientCard.vue";
import OffersCard from "@/components/clients/OffersCard.vue";
import emitter from "@/utils/emitter";
import ClientsTableList from "@/components/clients/ClientsTableList.vue";
import LocationCard from "@/components/clients/LocationCard.vue";
import ClientLocation from "@/components/clients/ClientLocation.vue";
import {deleteLocation, fetchData, showAlertModal} from "@/utils/utils";
import navMixin from "@/mixins/navMixin";
import SearchOffersResults from "@/components/offer/SearchOffersResults.vue";

export default {
    name: "ClientsList",
    mixins: [navMixin],
    components: {
        SearchOffersResults,
        LocationCard,
        ClientCard,
        ClientsTableList,
        ClientLocation,
        OffersCard,
    },
    data() {
        return {
            agentFilter: '',
            intermediaryFilter: '',
            agents: JSON.parse(sessionStorage.getItem('myUsers')),
            dateOptions: [
                {value: 'all', text: 'Toate datele'},
                {value: 'today', text: 'Azi'},
                {value: 'currentWeek', text: 'Săptămâna curentă'},
                {value: 'currentMonth', text: 'Luna curentă'},
                {value: 'currentYear', text: 'Anul curent'},
            ],
            clientTypes: JSON.parse(sessionStorage.getItem('clientTypes')),
            clients: [],
            searchQuery: '',
            searchQueryTimeout: null,
            searchQueryHistory: [],
            selectedClientType: '',
            currentClient: null,
            recentLocations: [],
            currentPage: 1,
            itemsPerPage: 25,
            showModal: false,
            selectedLocation: null,
            location: {},
            renderedByClientsList: true,
            recentLocationCollapsed: true,
            clientsListCollapsed: false,
            selectedAgent: "",
            selectedIntermediary: "",
            showAddClientModal: false,
            searchBy: 'clientName',
            searchOfferIdValue: null,
            searchOfferIdHistory: [],
            offersWithClients: [],
            selectedDate: '',
            selectedDateOption: 'all',
            filterDate: '',
            sidebarLinks: [
                {
                    name: 'Locații recente',
                    link: '#section1',
                    id: 'section1'
                },
                {
                    name: 'Listă clienți',
                    link: '#section2',
                    id: 'section2'
                },
            ],
            offerTypes: [
                {
                    name: 'Toate',
                    type: 0,
                    routeName: '',
                    color: '#e32829',
                },
                {
                    name: 'IPA',
                    type: 1,
                    routeName: '',
                    color: '#e32829',
                },
                {
                    name: 'Sanitare',
                    type: 2,
                    routeName: 'OfferPlumbing',
                    color: '#8774B3',
                },
                {
                    name: 'VMC',
                    type: 3,
                    routeName: 'OfferVMC',
                    color: '#57c0da',
                },
                {
                    name: 'Simplă',
                    type: 4,
                    routeName: 'OfferSimple',
                    color: 'black',
                },
                {
                    name: 'C.T.',
                    type: 5,
                    routeName: 'OfferTechnicalRoom',
                    color: '#8D9B6C',
                },
                {
                    name: 'Tavan',
                    type: 6,
                    routeName: 'OfferCeiling',
                    color: '#3777BB',
                },
                {
                    name: 'Pereti',
                    type: 7,
                    routeName: 'OfferWalls',
                    color: '#F8AC8C',
                },
                {
                    name: 'Automatizare',
                    type: 8,
                    routeName: 'OfferAutomation',
                    color: '#1F4690',
                },
                {
                    name: 'Ventiloconvec.',
                    type: 9,
                    routeName: 'OfferFanCoilUnit',
                    color: '#AB9E9A',
                },
                {
                    name: 'Canal T.',
                    type: 10,
                    routeName: 'OfferThermalChannel',
                    color: '#b269ab',
                },
                {
                    name: 'Pompe de C.',
                    type: 11,
                    routeName: 'OfferPDC',
                    color: '#F37928',
                },
            ],
            searchOfferType: null,
            loadingOffers: false,
            loadingClients: true,
            totalClients: 0,
            sortDirection: null,
            sortKey: null,
            clientFilters: [],
            searchOffersDialog: false,
            offersSearchPage: 1,
            offerSearchItemsPerPage: 25,
            offersSearchTotalOffersCount: 0,
            offersSearchSort: [
                {
                    key: 'modified',
                    order: 'desc',
                }
            ],
        }
    },
    async mounted() {
        if (this.clients.length === 0) {
            await this.fetchClients();
            this.recentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations'));
        }
        emitter.on('refresh-clients', async () => {
            await this.refreshClients();
        });
        emitter.on('clientDeleted', async () => {
            this.clients = []
            this.recentLocations = []
            this.clients = JSON.parse(sessionStorage.getItem('myClients'))
            this.recentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations'))
        });
        emitter.on('client-saved', async () => {
            this.clients = JSON.parse(sessionStorage.getItem('myClients'))
        });
        emitter.on('edit-client', (client) => {
            this.editingClient(client)
        });
        emitter.on('client-updated', async () => {
            await this.sortClientsByModifiedDate()
            this.clients = JSON.parse(sessionStorage.getItem('myClients'))
        });
        emitter.on('location-saved', async () => {
            this.showModal = false;
            await fetchData('locations')
            this.clients = JSON.parse(sessionStorage.getItem('myClients'))
            this.recentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations'))
            this.selectedLocation = null
        });
        emitter.on('delete-location-clientsList', async (clientId) => {
            this.recentLocations = await deleteLocation(clientId, this.currentClient, this.recentLocations);
        })
        emitter.on('edit-location', this.openEditLocationModal);
        this.searchOfferType = this.offerTypes[0].type;
    },
    unmounted() {
        emitter.off('clientDeleted');
        emitter.off('client-saved');
        emitter.off('edit-client');
        emitter.off('client-updated');
        emitter.off('location-saved');
        emitter.off('delete-location-clientsList');
        emitter.off('edit-location');
        emitter.off('refresh-clients');
    },
    computed: {
        emitter() {
            return emitter
        },
        getClientsListTitle() {
            return this.searchOffersDialog ? 'Rezultate căutare clienți' : 'Listă clienți';
        },
        displayedClients() {
            if (this.clients && this.clients.length > 0) {
                return JSON.parse(JSON.stringify(this.clients));
            }
            return [];
        },
        filteredIntermediaries() {
            // Extract IDs of intermediaries that are active in filters
            const activeIntermediaryIds = new Set(
                this.clientFilters
                    .filter(filter => filter.key === 'intermediate__id')
                    .map(filter => filter.value)
            );

            // Split intermediaries into two groups based on active filters
            const activeIntermediaries = [];
            const otherIntermediaries = [];

            this.intermediaries.forEach(intermediary => {
                if (activeIntermediaryIds.has(intermediary.id)) {
                    activeIntermediaries.push(intermediary);
                } else {
                    otherIntermediaries.push(intermediary);
                }
            });

            // Apply textual filter to both groups if intermediaryFilter is set
            const filter = this.intermediaryFilter.toLowerCase();
            const filterActive = intermediary => intermediary.name.toLowerCase().includes(filter);

            return [
                ...activeIntermediaries.filter(filterActive),
                ...otherIntermediaries.filter(filterActive)
            ];
        },
        filteredAgents() {
            // Extract IDs of agents that are active in filters
            const activeAgentIds = new Set(
                this.clientFilters
                    .filter(filter => filter.key === 'agent__id')
                    .map(filter => filter.value)
            );

            // Split agents into two groups based on active filters
            const activeAgents = [];
            const otherAgents = [];

            this.sortedAgents.forEach(agent => {
                if (activeAgentIds.has(agent.id)) {
                    activeAgents.push(agent);
                } else {
                    otherAgents.push(agent);
                }
            });

            // Apply textual filter only to the active agents if agentFilter is set
            const filter = this.agentFilter.toLowerCase();
            const filterActive = agent => agent.full_name.toLowerCase().includes(filter) ||
                agent.email.toLowerCase().includes(filter);

            // Concatenate filtered active agents with all other agents regardless of the filter
            return [
                ...activeAgents.filter(filterActive),
                ...otherAgents  // Always include all other agents
            ];
        },
        sortedAgents() {
            // return this.agents sorted alphabetically ascending
            return this.agents.slice().sort((a, b) => {
                if (a.full_name < b.full_name) {
                    return -1;
                }
                if (a.full_name > b.full_name) {
                    return 1;
                }
                return 0;
            });
        },
        intermediaries() {
            return JSON.parse(sessionStorage.getItem('intermediaries')) || [];
        },
    },
    methods: {
        handleOffersSearchSortingUpdate(newSorting) {
            this.offersSearchSort = newSorting;
            this.findOffers();
        },
        handleNameSearchQuery() {
            // Clear the existing timeout if there is one
            clearTimeout(this.searchQueryTimeout);

            // Set a new timeout to add the filter after 300ms
            this.searchQueryTimeout = setTimeout(async () => {
                if (this.offersWithClients && this.offersWithClients.length > 0) {
                    await this.refreshClients();
                }
                this.addFilter('nameSearch', this.searchQuery);
            }, 300);
        },
        isActiveFilter(key, value) {
            return this.clientFilters.some(filter => filter.key === key && filter.value === value);
        },
        async handleSortingChange(event) {
            this.sortKey = event.key;
            this.sortDirection = event.direction;
            await this.fetchClients();
        },
        async fetchClients() {
            this.loadingClients = true;
            const filters = JSON.stringify(this.clientFilters);

            const params = {
                page: this.currentPage,
                page_size: this.itemsPerPage,
                sort: this.sortKey,
                dir: this.sortDirection,
                filters: filters  // Send filters as a JSON string
            };

            await apiClient.get('/api/clients/', {params})
                .then(response => {
                    this.clients = response.data.results;
                    // console.log(this.clients);
                    sessionStorage.setItem('myClients', JSON.stringify(response.data.results));
                    this.totalClients = response.data.count;
                    this.loadingClients = false;
                })
                .catch(error => {
                    console.error("Error fetching the clients:", error);
                    this.loadingClients = false;
                });
        },
        handleClientsItemPerPageUpdate(itemsPerPage) {
            this.itemsPerPage = itemsPerPage;
            this.currentPage = 1; // Reset to first page with new page size
            this.fetchClients();
        },
        handleClientsUpdatePage(page) {
            this.currentPage = page;
            this.fetchClients();
        },
        handleOffersSearchUpdatePage(page) {
            this.offersSearchPage = page;
            this.findOffers();
        },
        handleOffersSearchUpdateItemsPerPage(itemsPerPage) {
            this.offerSearchItemsPerPage = itemsPerPage;
            this.findOffers();
        },
        /**
         * Asynchronously refreshes the client data by fetching it and updating the component's state.
         * This method retrieves a list of clients from sessionStorage, previously stored under the key 'myClients'.
         * Additionally, it fetches user details from 'myUsers' in sessionStorage to enrich each client's information
         * with the corresponding agent's full name and email. This is achieved by matching each client's 'agent_id'
         * with user IDs. The updated list of clients is then used to update the component's state.
         *
         * @returns {Promise<void>} - A promise that resolves once the clients have been refreshed with additional agent information,
         *                            and the component's state has been updated. The method does not return a value.
         */
        async refreshClients() {
            this.offersWithClients = [];
            this.searchOffersDialog = false;
            await this.fetchClients();
            this.clients = JSON.parse(sessionStorage.getItem('myClients'))
            let users = await JSON.parse(sessionStorage.getItem('myUsers'))
            this.clients = this.clients.map(client => {
                const matchingUser = users.find(user => user.id === client.agent_id);
                const agent_name = matchingUser ? matchingUser.full_name : '';
                const agent_email = matchingUser ? matchingUser.email : '';
                return {...client, agent_email, agent_name};
            });
        },
        addFilter(key, value) {
            let filter = {
                key: key,
                value: value,
            };
            // Find the index of an existing filter with the same key and value
            const index = this.clientFilters.findIndex(f => f.key === key && f.value === value);

            if (key === 'nameSearch' || key === 'modified') {
                const index = this.clientFilters.findIndex(f => f.key === key);
                if (index > -1) {
                    this.clientFilters.splice(index, 1);
                }
                this.clientFilters.push(filter);
                this.fetchClients();

            } else if (index > -1) {
                // If the filter is found, remove it
                this.clientFilters.splice(index, 1);
                this.fetchClients();
            } else {
                // If the filter is not found, add it
                this.clientFilters.push(filter);
                this.fetchClients();
            }
        },
        maintainSearchHistory(query, history) {
            // verify if query is already in history
            const queryIndex = history.findIndex(item => item === query);
            // if query is not already in history, add it
            if (queryIndex === -1) {
                history.push(query);
            }
            // limit history array to last 5 items
            if (history.length > 5) {
                history.shift();
            }
        },
        addClient() {
            this.$router.push({name: 'Client'})
        },
        updateSelectedDate(date) {
            const today = new Date();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            let startDate;

            this.selectedDateOption = date;
            switch (this.selectedDateOption) {
                case 'today':
                    this.selectedDate = this.formatDate(today);
                    break;
                case 'currentWeek':
                    startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                    this.selectedDate = [this.formatDate(startDate), this.formatDate(endOfDay)];
                    break;
                case 'currentMonth':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    this.selectedDate = [this.formatDate(startDate), this.formatDate(endOfDay)];
                    break;
                case 'currentYear':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    this.selectedDate = [this.formatDate(startDate), this.formatDate(endOfDay)];
                    break;
                default:
                    this.selectedDate = 'all';
                    break;
            }
        },
        formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = ('0' + (d.getMonth() + 1)).slice(-2);
            const day = ('0' + d.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        },
        areDatesEqual(date1, date2) {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        },
        /**
         * Asynchronously initiates the process to update and retrieve offers based on the current search parameters.
         * This method handles several steps in sequence to ensure that the application's state reflects the latest
         * data and user interactions:
         * 1. It sets a loading state to indicate that data fetching is in progress.
         * 2. It calls `refreshClients` to update client data from the server or a local source.
         * 3. Upon successful refresh, it proceeds to `fetchOffersForFilteredClients` to retrieve offers
         *    that match current search criteria.
         * 4. Concurrently, it updates the search history based on the current search offer ID.
         * 5. Finally, it resets the loading state to indicate that the data fetching process is complete.
         *
         * @returns {Promise<void>} - Completes all operations without returning a specific value, primarily
         *                            managing state updates within the component.
         */
        async findOffers() {
            this.loadingOffers = true;
            await this.refreshClients().then(() => {
                this.fetchOffersForFilteredClients();
                this.maintainSearchHistory(this.searchOfferIdValue, this.searchOfferIdHistory);
            });
        },
        /**
         * Fetches offers based on current search parameters and updates the clients with matching offers.
         * This method constructs an API endpoint with query parameters (if they are valid and present),
         * requests the offers, and then filters them to find matches against the currently listed clients.
         * Offers are filtered by date if a specific date is selected. Errors in fetching are handled gracefully
         * with user notifications.
         *
         * @returns {Promise<void>} - A promise that resolves once the offers have been fetched and processed,
         *                            or fails with an error notification to the user.
         */
        async fetchOffersForFilteredClients() {
            try {
                let apiUrl = `/api/get_offer_data/?`;
                const params = [];
                if (Number.isInteger(this.searchOfferType) && this.searchOfferType !== 0) {
                    params.push(`offerType=${this.searchOfferType}`);
                }
                if (this.searchOfferIdValue) {
                    params.push(`searchId=${this.searchOfferIdValue}`);
                }
                // Include itemsPerPage in the API request
                if (this.offerSearchItemsPerPage) {
                    params.push(`itemsPerPage=${this.offerSearchItemsPerPage}`);
                }
                // Include current page in the API request
                if (this.offersSearchPage) {
                    params.push(`page=${this.offersSearchPage}`);
                }
                // Include sorting parameters
                if (this.offersSearchSort.length) {
                    params.push(`sortKey=${this.offersSearchSort[0].key}`);
                    params.push(`sortDir=${this.offersSearchSort[0].order}`);
                }

                apiUrl += params.join('&');

                const response = await apiClient.get(apiUrl);
                if (response.data.results && response.data.results.length === 0) {
                    showAlertModal(this.$store, 'Nu s-au găsit oferte pentru filtrele selectate.', 'danger', 5000);
                    this.loadingOffers = false;
                } else {
                    this.offersWithClients = response.data.results || response.data.offers;
                    this.offersSearchTotalOffersCount = response.data.count || response.data.offers.length;
                    this.loadingOffers = false;
                    this.searchOffersDialog = true;
                }
            } catch (error) {
                console.error('Failed to fetch offers:', error);
                showAlertModal(this.$store, 'A apărut o eroare la încercarea de a prelua ofertele. Vă rugăm reîncărcați pagina.', 'danger', 5000);
            }
        },
        sortClientsByModifiedDate() {
            this.clients.sort((a, b) => new Date(b.modified) - new Date(a.modified));
            sessionStorage.setItem('myClients', JSON.stringify(this.clients));
        },
        openEditLocationModal(location) {
            this.selectedLocation = location;
            this.showModal = true;
        },
    },
}
</script>
<style scoped>
ul.no-bullets {
    list-style-type: none; /* Remove bullets */
    padding: 0; /* Remove padding */
    margin: 0; /* Remove margins */
}

.active-item {
    background-color: #0d6efd;
    color: white;
}
</style>
<style>
.clientsList-input .v-input__details {
    display: none !important;
}

.table-dropdown-menu .v-list-item {
    padding: 5px 10px !important;
    min-height: auto !important;
}

.table-dropdown-menu .v-divider {
    margin: 0px 5px !important;
}
</style>