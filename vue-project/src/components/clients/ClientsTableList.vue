<template>
    <v-dialog v-model="showClientDialog" width="50vw">
        <ClientInfo :client="currentClient"/>
    </v-dialog>
    <v-dialog v-model="showLocationDialog" width="50vw">
        <ClientLocation :location="selectedLocation"/>
    </v-dialog>
    <v-dialog v-model="showDeleteClientDialog" width="auto">
        <v-card>
            <v-card-text>
                Ești sigur că vrei să ștergi clientul?
            </v-card-text>
            <v-card-actions class="justify-content-end">
                <v-btn color="primary" variant="text" @click="showDeleteClientDialog = false">
                    Nu
                </v-btn>
                <v-btn color="danger" variant="text" @click="triggerDeleteClient">
                    Da
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-skeleton-loader type="card" :loading="loading">
        <v-data-table-server
            v-show="$vuetify.display.mdAndUp"
            :headers="vHeaders"
            :items="clients"
            :expanded="expandedRows"
            :hover="true"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :total-items="totalClients"
            :items-length="totalClients"
            :page="currentPage"
            :loading="loading"
            @update:page="updatePage"
            @update:items-per-page="updateItemsPerPage"
        >
            <template v-slot:headers="{ columns }">
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.10)">
                    <template v-for="column in columns" :key="column.key">
                        <td>
                            <span class="mr-2 cursor-pointer" style="font-weight: 700;">
                                {{ column.title }}
                            </span>
                            <v-icon style="cursor:pointer;" v-if="column.hasMenu" size="small"
                                    class="fas fa-chevron-down">
                                <v-menu activator="parent" :close-on-content-click="true" class="table-dropdown-menu">
                                    <v-card variant="outlined"
                                            style=" max-height: 11cm; min-width: 4.5cm; overflow: auto;">
                                        <v-list style="list-style:none" density="compact">
                                            <template v-if="column.sortKey">
                                                <v-list-item @click="sortBy(column.sortKey, 'ASC')"> Sortare asc.
                                                </v-list-item>
                                                <v-list-item @click="sortBy(column.sortKey, 'DESC')"> Sortare desc.
                                                </v-list-item>
                                                <v-divider></v-divider>
                                            </template>
                                            <slot :name="column.menuSlotName"></slot>
                                        </v-list>
                                    </v-card>
                                </v-menu>
                            </v-icon>
                        </td>
                    </template>
                </tr>
            </template>

            <template v-slot:[`item.agent_id`]="{ item }">
                <span>
                    {{ item.agent_id }}
                </span>
            </template>
            <template v-slot:[`item.full_name`]="{ item }">
                <a href="#" class="text-decoration-none" @click.prevent="goToClientDetails(item.raw.id)">{{
                        item.full_name
                    }} </a>
            </template>
            <template v-slot:[`item.type`]="{ item }">
                <span>{{ item.type }}</span>
            </template>
            <template v-slot:[`item.modified`]="{ item }">
                <span>{{ showDateTime(item.modified) }}</span>
            </template>
            <template v-slot:[`item.intermediate_id`]="{ item }">
                <span>{{ parseIntermediaryId(item.intermediate_id) }}</span>
            </template>
            <template v-slot:[`item.email`]="{ item }">
                <span>{{ item.email ? item.email : defaultValuePlaceholder }}</span>
            </template>
            <template v-slot:[`item.phone`]="{ item }">
                <span>{{ item.phone ? item.phone : defaultValuePlaceholder }}</span>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon>
                    <v-icon color="grey">
                        mdi-dots-vertical
                    </v-icon>
                    <v-menu activator="parent">
                        <v-list>
                            <v-list-item v-for="(action, index) in actionMenuItems" :key="index"
                                         @click="action.method(item.raw)">
                                <v-list-item-title :class="{ 'text-danger': action.isDanger }">{{
                                        action.label
                                    }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>
            </template>
            <template v-slot:expanded-row="{ item, columns }">
                <tr v-if="item.raw.offers">
                    <td class="py-2" :colspan="columns.length -1" style="border-top:0">
                        <OffersCard :searchBy="{criteria: 'client',value: item.raw.id}" :collapsed="false" :search-offer-type="searchOfferType" :client-offers-data="item.raw.offers"></OffersCard>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </v-skeleton-loader>
</template>

<script>
import emitter from "@/utils/emitter";
import {deleteClient} from "@/utils/utils";
import ClientInfo from "@/components/clients/ClientInfo.vue";
import OffersCard from "@/components/clients/OffersCard.vue";
import ClientLocation from "@/components/clients/ClientLocation.vue";
import {mapGetters} from "vuex";

export default {
    name: "ClientsTableList",
    components: {
        ClientInfo,
        OffersCard,
        ClientLocation,
    },
    data() {
        return {
            showClientDialog: false,
            showLocationDialog: false,
            selectedLocation: null,
            clientTypes: JSON.parse(sessionStorage.getItem('clientTypes')),
            actionMenuItems: [],
            sortKey: 'client',
            sortDirection: 'NONE',
            currentClient: null,
            dialog: false,
            menu: false,
            showDeleteClientDialog: false,
            defaultValuePlaceholder: 'Nu',
            vHeaders: [
                {
                    title: 'Agent',
                    align: 'start',
                    key: 'agent_id',
                    adminColumn: false,
                    hasMenu: true,
                    menuSlotName: 'agentMenu',
                    sortKey: 'agent'
                },
                {
                    title: 'Nume client',
                    align: 'start',
                    key: 'full_name',
                    hasMenu: true,
                    menuSlotName: 'clientMenu',
                    sortKey: 'full_name'
                },
                {title: 'Tip client', align: 'start', key: 'type', hasMenu: true, menuSlotName: 'clientTypeMenu'},
                {
                    title: 'Intermediari',
                    align: 'start',
                    key: 'intermediate_id',
                    hasMenu: true,
                    menuSlotName: 'intermediaryMenu',
                    sortKey: 'intermediate_id',
                },
                {
                    title: 'Data modificării',
                    align: 'start',
                    key: 'modified',
                    hasMenu: true,
                    menuSlotName: 'dateMenu',
                    sortKey: 'modified'
                },
                {title: 'Email', align: 'start', key: 'email'},
                {title: 'Telefon', align: 'start', key: 'phone'},
                {title: 'Acțiuni', align: 'start', key: 'actions', sortable: false},
            ],
            itemsPerPageOptions: [
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ],
        }
    },
    props: {
        clients: Array,
        agents: Array,
        intermediaries: Array,
        totalClients: Number,
        itemsPerPage: Number,
        currentPage: Number,
        loading: Boolean,
        searchOfferType: Number,
    },
    emits: ['updated-page', 'updated-items-per-page', 'updated-sorting',],
    mounted() {
        console.log("Component mounted, vHeaders:", this.vHeaders);
        this.recentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations'))
        emitter.on('client-updated', () => {
            this.showClientDialog = false;
        })
        emitter.on('location-saved', () => {
            this.showLocationDialog = false;
        })
        this.actionMenuItems = [
            {label: 'Modifică', method: this.editingClient, isDanger: false},
            {label: 'Adaugă locație', method: this.openAddLocationModal, isDanger: false},
            {label: 'Șterge', method: this.openDeleteClientDialog, isDanger: true},
        ];
    },
    unmounted() {
        emitter.off('client-updated');
        emitter.off('location-saved');
    },
    computed: {
        ...mapGetters(['userPermissions']),
        emitter() {
            return emitter;
        },
        filterSuperUserHeaders() {
            return this.userPermissions.canViewAllClientsListHeaders ? this.vHeaders : this.vHeaders.filter(header => !header.adminColumn)
        },
        expandedRows() {
            return this.clients.filter(client => client.offers?.length).map(client => client.id)
        }
    },
    methods: {
        parseClientType(type) {
            return this.clientTypes.find(clientType => clientType.value === type).text ?? ''
        },
        showDateTime(value) {
            let options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            return new Date(value).toLocaleDateString('ro-RO', options);
        },
        parseAgentId(agent_id) {
            let agent = this.agents.find(agent => agent.id === agent_id)
            return agent?.full_name ? agent?.full_name : agent?.email ?? this.defaultValuePlaceholder;
        },
        parseIntermediaryId(intermediary_id) {
            let intermediary = this.intermediaries.find(intermediary => intermediary.id === intermediary_id)
            return intermediary?.name ?? this.defaultValuePlaceholder
        },
        editingClient(client) {
            this.currentClient = client;
            this.showClientDialog = true;
        },
        openAddLocationModal(client) {
            this.currentClient = client;
            this.$store.state.clientId = client.id
            this.showLocationDialog = true;
        },
        openDeleteClientDialog(client) {
            this.currentClient = client
            this.showDeleteClientDialog = true;
        },
        async triggerDeleteClient() {
            await deleteClient(this.currentClient.id);
            this.showDeleteClientDialog = false;
        },
        goToClientDetails(clientId) {
            this.$router.push({name: "ClientDetails", params: {id: parseInt(clientId)}});
        },
        sortBy(key, direction) {
            this.sortKey = key;
            this.sortDirection = this.sortDirection !== direction ? direction : 'NONE';
            let newSorting = {
                key: this.sortKey,
                direction: this.sortDirection,
            }
            this.$emit('updated-sorting', newSorting);
        },
        updatePage(newPage) {
            this.$emit('updated-page', newPage);
        },
        updateItemsPerPage(newItemsPerPage) {
            this.$emit('updated-items-per-page', newItemsPerPage);
        }
    },
}
</script>

<style>
tr:hover {
    background-color: rgba(0, 0, 0, 0.1);
}
</style>