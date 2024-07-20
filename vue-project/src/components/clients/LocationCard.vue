<template>
    <v-dialog v-model="dialog" width="auto">
        <v-card>
            <v-card-text>
                Ești sigur că vrei să ștergi locația?
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
                    @click="onDelete"
                >
                    Da
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-card style="border: 1px solid rgba(0,0,0,0.15);" :elevation="3" class="w-100">
        <v-toolbar
            :class="{'cursor-pointer': activeLink }"
            @click="this.$router.push({name: 'ClientDetails', params: {id: parseInt(client.id)}})"
        >
            <v-toolbar-title class="nav-link" v-if="titleInfo ==='locationTitle'"
                             data-cy="clientDetails-locationName">
                {{ location.description }}
            </v-toolbar-title>
            <v-toolbar-title v-else>{{ client.full_name }}</v-toolbar-title>
            <v-btn
                @click.stop="goToOffersSummary"
                color="blue"
                variant="plain"
            >
                <v-icon>mdi-file-multiple-outline</v-icon>
                Centralizator
            </v-btn>
            <v-btn class="mr-2"
                   @click.stop="dialog = true;"
                   data-cy="delete-location"
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
                    Șterge locația
                </v-tooltip>
            </v-btn>
            <v-btn
                color="primary"
                @click.stop="editLocation"
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
                    Editează locația
                </v-tooltip>
            </v-btn>
        </v-toolbar>
        <v-container>
            <div class="row row-cols-1 row-cols-md-1 g-3"
            >
                <div class="col">
                    <location-info
                        v-if="location"
                        :titleInfo="titleInfo"
                        :location="location"
                        :clientId="client.id"
                        :locationOffers="locationOffers"
                    />
                    <OffersCard
                        v-show="!renderedByClientsList && location.id"
                        :client-agent="client.agent_id"
                        :searchBy="{ criteria: 'location', value: location.id}"
                        @location-offers-fetched="setLocationOffers"
                    />
                    <OfferDocuments
                        v-if="location && files"
                        :documents="files"
                        :locationId="location.id"
                        @save-files="updateFiles($event)"
                        class="mt-3"
                    />
                    <SummariesCard
                        class="mt-3"
                        :locationId="location.id"
                    />
                </div>
                <div class="col">
                    <LocationHistory
                        :location="location"
                        :clientId="client.id"
                        :locationOffers="locationOffers"
                    />
                </div>
            </div>
        </v-container>
    </v-card>
    <router-view></router-view>
</template>


<script>
import emitter from "@/utils/emitter";
import LocationHistory from "@/components/clients/LocationHistory.vue";
import OffersCard from "@/components/clients/OffersCard.vue";
import LocationInfo from "@/components/clients/LocationInfo.vue";
import {formatNumber} from "@/utils/utils";
import OfferDocuments from "@/components/offer/OfferDocuments.vue";
import documentsMixin from "@/mixins/documentsMixin";
import SummariesCard from "@/components/offer/SummariesCard.vue";


export default {
    name: 'LocationCard',
    mixins: [documentsMixin],
    components: {
        SummariesCard,
        OfferDocuments,
        LocationInfo,
        LocationHistory,
        OffersCard
    },
    props: {
        activeLink: {
            type: Boolean,
            default: false
        },
        location: {
            type: Object,
            required: true
        },
        renderedByClientsList: {
            type: Boolean,
            required: true,
        },
        client: Object,
        titleInfo: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            hover: false,
            dialog: false,
            locationOffers: null,
        }
    },
    computed: {
        locationArea() {
            this.location.rooms.forEach((room) => {
                this.totalArea += room.area.sq_m;
            })
            return this.totalArea ? this.formatNumber(this, this.totalArea, false) + ' m\u00B2' : 'Nu';
        },
        formattedModifiedDate() {
            return new Date(this.location.modified).toLocaleString(this.$store.state.locale);
        },
    },
    methods: {
        goToOffersSummary() {
            this.$router.push({name: 'OffersSummary', params: {id: parseInt(this.client.id), locationId: this.location.id}});
        },
        formatNumber,
        setLocationOffers(offers) {
            this.locationOffers = offers;
        },
        onDelete() {
            if (this.renderedByClientsList) {
                emitter.emit("delete-location-clientsList", this.location.id);
                this.dialog = false;
            } else {
                emitter.emit("delete-location", this.location.id);
                this.dialog = false;
            }
        },
        editLocation() {
            emitter.emit('edit-location', this.location)
        },
    }
}
</script>
