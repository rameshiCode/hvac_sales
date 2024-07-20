<template>
    <v-card v-if="locations.length > 0" class="mb-4">
        <v-hover open-delay="150" close-delay="150" v-slot="{ isHovering, props }">
            <v-toolbar v-bind="props" @click="collapsed = !collapsed" class="cursor-pointer">
                <v-toolbar-title>
                    Istoric dimensionare
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
                <v-card class="mb-3" v-for="location in locations" :key="location.version">
                    <v-toolbar>
                        <v-toolbar-title>Dimensionarea {{
                                location.version
                            }} <span v-if="location.change_description && location.change_description !== ''">:</span>
                            {{ location.change_description }}
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <LocationInfo
                            title-info=""
                            :clientId="clientId"
                            :location="location"
                            :show-dimensioning="false"
                            :location-offers="locationOffers"
                        ></LocationInfo>
                    </v-card-text>
                </v-card>
            </v-card-text>
        </v-expand-transition>
    </v-card>
</template>

<script>
import apiClient from "@/utils/apiClient";
import LocationInfo from "@/components/clients/LocationInfo.vue";

export default {
    name: "LocationHistory",
    components: {LocationInfo},
    props: {
        location: Object,
        clientId: Number,
        locationOffers: Array,
    },
    data() {
        return {
            locations: [],
            collapsed: true,
        }
    },
    async created() {
        //TODO change childrens to children (same for the api backend)
        await this.fetchChildren();
    },
    methods: {
        async fetchChildren() {
            await apiClient.get(`/api/locations/${this.location.id}/childrens/`)
                .then((response) => {
                    this.locations = response.data
                    this.locations.forEach((location) => {
                        let totalArea = 0;
                        let totalLocationCircuits = 0;
                        let totalLocationPipe = 0;
                        location.rooms.forEach((room) => {
                            totalArea += room.area.sq_m;
                            const pipeMeters = parseFloat(room.total_pipe)
                            totalLocationPipe += pipeMeters
                            const circuitNo = Math.ceil(parseFloat(room.total_pipe / 95))
                            totalLocationCircuits += circuitNo
                        });
                        location.totalArea = totalArea;
                        location.totalCricuits = totalLocationCircuits;
                        location.totalPipe = totalLocationPipe;
                    });
                })
                .catch(error => {
                    console.log(error)
                });
        },
    }
}
</script>
