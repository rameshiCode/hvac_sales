<template>
    <div>
        <a href="#" id="section1"></a>
        <ClientCard class="my-3"
                    v-if="client"
                    :client="client"
        />
        <!-- Add more fields as needed -->
        <div v-else>
            <p>Loading client details...</p>
        </div>
        <v-dialog v-model="showEditLocationModal" width="50vw">
            <ClientLocation
                :location="currentLocation"
                :clientId="client.id"
            />
        </v-dialog>
        <v-dialog v-model="showAddLocationModal" width="50vw">
            <ClientLocation
                :clientId="client.id"
            />
        </v-dialog>
        <a href="#" id="section2"></a>
        <v-card style="border: 1px solid rgba(0,0,0,0.15);" :elevation="3" class="mt-3">
            <v-toolbar>
                <v-toolbar-title>
                    Locații
                </v-toolbar-title>
                <v-toolbar-items>
                    <v-expand-x-transition>
                        <v-text-field
                            dense
                            class="my-auto"
                            style="width: 200px;"
                            v-show="showSearchField"
                            density="compact"
                            hide-details
                            ref="searchInput"
                            placeholder="Caută"
                            v-model="searchTerm"/>
                    </v-expand-x-transition>
                    <v-btn v-show="!showSearchField"
                           class="mx-1"
                           @click="toggleSearchField"
                           color="primary"
                           variant="text"
                           prepend-icon="mdi-magnify">
                        Caută
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >
                            Caută după numele locației
                        </v-tooltip>
                    </v-btn>
                    <v-btn v-show="showSearchField"
                           class="mx-1"
                           color="danger"
                           variant="text"
                           prepend-icon="mdi-window-close"
                           @click="toggleSearchField">
                        Anulează
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >
                            Anulează căutarea
                        </v-tooltip>
                    </v-btn>
                    <v-btn color="primary" @click="addLocationToClient"
                           variant="text"
                           data-cy="add-location">Adaugă
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >
                            Adaugă locație
                        </v-tooltip>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-container>
                <v-row v-if="locations && locations.length">
                    <v-col v-for="item in filteredLocations"
                           :key="item.id"
                           cols="12">
                        <LocationCard
                            :location="item"
                            :renderedByClientsList="false"
                            :client="client"
                            :titleInfo="'locationTitle'"
                        />
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
</template>

<script>
import ClientCard from "../components/clients/ClientCard.vue";
import LocationCard from "@/components/clients/LocationCard.vue";
import ClientLocation from "@/components/clients/ClientLocation.vue";
import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";
import {fetchData, getClientInfo, getClientLocations, deleteLocation, fetchProducts} from "@/utils/utils";
import navMixin from "@/mixins/navMixin";

export default {
    name: "ClientDetails",
    mixins: [navMixin],
    computed: {
        filteredLocations() {
            if (this.searchTerm) {
                return this.locations.filter((location) =>
                    location.description.toLowerCase().includes(this.searchTerm.toLowerCase())
                );
            }
            return this.locations;
        },
    },
    components: {
        ClientCard,
        ClientLocation,
        LocationCard,
    },
    props: {
        id: String
    },
    data() {
        return {
            locations: null,
            client: null,
            showAddLocationModal: false,
            showEditLocationModal: false,
            currentLocation: null,
            showEditClientModal: false,
            currentClient: null,
            sidebarLinks: [
                {
                    name: 'Client',
                    link: '#section1',
                    id: 'section1',
                },
                {
                    name: 'Locații',
                    link: '#section2',
                    id: 'section2',
                },
            ],
            searchTerm: "",
            showSearchField: false,
        };
    },
    mounted() {
        this.$store.state.sidebarLinks = this.sidebarLinks
        emitter.on('location-added', this.addLocationToClient);
        emitter.on('location-saved', this.refreshLocations);
        emitter.on('delete-location', async (clientId) => {
            this.locations = await deleteLocation(clientId, this.currentClient, this.recentLocations, this.locations)
        });
        emitter.on('edit-location', this.editLocation);
        emitter.on('edit-client', this.editClient);
        emitter.on('client-updated', this.updateClient);
        sessionStorage.setItem('clientId', this.id);
        this.$store.state.clientId = this.id
    },
    unmounted() {
        emitter.off('location-added')
        emitter.off('location-saved')
        emitter.off('delete-location')
        emitter.off('edit-location')
        emitter.off('edit-client')
        emitter.off('client-updated')
    },
    async created() {
        this.client = await getClientInfo(this.id);
        await this.assignEmail();
        this.locations = await getClientLocations(this.id);
        await fetchProducts();
    },
    methods: {
        async assignEmail() {
            let user_list = sessionStorage.getItem('myUsers');
            if (user_list.length < 1) {
                await fetchData('users')
                user_list = sessionStorage.getItem('myUsers');
            }
            for (const user of user_list) {
                if (user.id === this.client.agent_id) {
                    this.client.agent_email = user.email;
                    break;
                }
            }
        },
        addLocationToClient() {
            this.showAddLocationModal = true;
        },
        updateClient(updatedClient) {
            this.showEditClientModal = false;
            this.client = updatedClient;
            this.client.agent_email = updatedClient.agent_email
        },
        async refreshLocations() {
            await apiClient.get(`/api/list_locations/${this.id}/`)
                .then((locationsResponse) => {
                    this.locations = locationsResponse.data.locations;
                    this.showAddLocationModal = false;
                    this.showEditLocationModal = false;
                    this.currentLocation = null;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        editClient(client) {
            this.showEditClientModal = true;
            this.currentClient = client
        },
        editLocation(location) {
            this.currentLocation = location;
            this.showEditLocationModal = true;
        },
        toggleSearchField() {
            this.showSearchField = !this.showSearchField;
            if (this.showSearchField) {
                this.$nextTick(() => {
                    this.$refs.searchInput.focus();
                    this.$refs.searchInput.style.width = '200px'
                });
            } else {
                this.$refs.searchInput.style.width = '0px'
                this.searchTerm = '';
            }
        },
    }
}
</script>

<style scoped>
.search-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 20%;
}

.search-input {
    position: absolute;
    right: 100%;
    width: 0;
    transition: width 0.3s ease;
    overflow: hidden;
    white-space: nowrap;
    box-sizing: border-box;
    margin-right: 5px;
}

.show-search-field .search-input {
    width: 200px;
}
</style>