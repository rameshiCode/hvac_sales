<template>
    <v-row class="d-flex justify-content-between mb-2">
        <v-col cols="4" sm="12" md="12" lg="4" class="d-flex flex-column justify-content-start">
            <v-card height="100%">
                <v-list height="100%" class="d-flex flex-column justify-content-evenly">
                    <v-list-item
                        density="compact"
                        v-if="titleInfo === 'clientTitle'"
                        class="d-flex justify-content-start"
                    >
                        <v-list-item-title class="text-wrap">
                            <span>Locație: {{ location.description }}</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        density="compact"
                        v-if="location.subregion !== ''"
                        class="d-flex justify-content-between align-items-center"
                    >
                        <v-list-item-title class="card-text text-wrap">
                            <span>Oraș: {{ location.subregion }}</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        density="compact"
                        v-if="location.address !== ''"
                        class="d-flex justify-content-between align-items-center"
                    >
                        <v-list-item-title class="card-text text-wrap">
                            <span>Adresă: {{ location.address }}</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        density="compact"
                        v-if="showDimensioning && location.version > 0"
                        class="d-flex justify-content-between align-items-center"
                    >
                        <v-list-item-title class="text-wrap">
              <span>Dimensionare: {{ location.version }}
                <span
                    v-if="
                    location.change_description &&
                    location.change_description !== ''
                  "
                    class="fst-italic overflow-hidden"
                >
                  <v-tooltip
                      content-class="custom-tooltip"
                      activator="parent"
                      location="top"
                  >
                    {{ location.change_description }}
                  </v-tooltip>
                  ({{ location.change_description }})
                </span>
              </span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-calendar-clock" color="black"></v-icon>
                        </template>
                        <v-list-item-title class="d-flex gap-2 align-items-center text-wrap">
                            {{ formattedModifiedDate }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-arrow-all" color="black"></v-icon>
                        </template>
                        <v-list-item-title class="d-flex gap-2 align-items-center text-wrap">
                            Suprafață totală: {{ locationArea }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item density="compact">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-format-list-numbered" color="black"></v-icon>
                        </template>
                        <v-list-item-title class="d-flex gap-2 align-items-center text-wrap">
                            Nr. camere:
                            {{ location.rooms ? location.rooms.length : "Nu sunt" }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-col>
        <v-col cols="8" sm="12" md="12" lg="8" class="d-flex align-items-center">
            <v-row>
                <v-col
                    lg="4"
                    md="6"
                    sm="12"
                    class="d-flex flex-column align-items-center"
                    style="gap: 8px;"
                    v-for="(group, index) in groupedOfferTypes"
                    :key="`group-${index}`"
                >
                    <template v-for="(type, index) in group">
                        <v-btn
                            v-if="type.show"
                            :key="`type-${index}`"
                            rounded="md"
                            size="large"
                            :class="'w-100 d-flex align-items-center btn-with-ellipsis ' + type.class"
                            variant="elevated"
                            :color="type.color"
                            style="color: white;"
                            @click="type.action"
                        >
                            <v-icon :icon="type.icon" class="mr-2"></v-icon>
                            {{ type.name }}
                             <v-tooltip
                                    activator="parent"
                                    location="top"
                                    open-delay="500"
                                >
                                   {{ type.name }}
                                </v-tooltip>
                        </v-btn>
                    </template>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>
<script>
import {formatNumber} from "@/utils/utils";

export default {
    name: "LocationInfo",
    props: {
        clientId: {
            type: Number,
            required: true,
        },
        location: {
            type: Object,
            required: true,
        },
        titleInfo: {
            type: String,
            required: true,
        },
        showDimensioning: {
            type: Boolean,
            default: true
        },
        locationOffers: {
            type: Array,
        }
    },
    data() {
        return {
            totalArea: 0,
            offerTypes: [
                {
                    name: "IPA",
                    routeName: "",
                    color: "danger",
                    icon: "mdi-pipe",
                    type: 1,
                    show: true,
                    class: '',
                    action: () => this.openOffer('IPA'),
                },
                {
                    name: "VMC",
                    routeName: "OfferVMC",
                    color: "#51C7E0",
                    icon: "mdi-wind-power-outline",
                    type: 3,
                    show: true,
                    class: '',
                    action: () => this.openOffer('VMC', 'OfferVMC'),
                },
                {
                    name: "Simplă",
                    type: 4,
                    routeName: "OfferSimple",
                    icon: "mdi-format-list-bulleted",
                    color: "black",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferSimple'),
                },
                {
                    name: "Sanitare",
                    type: 2,
                    routeName: "OfferPlumbing",
                    icon: "mdi-faucet-variant",
                    color: "#8774B3",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferPlumbing'),
                },
                {
                    name: "C. T. și COLOANE",
                    type: 5,
                    routeName: "OfferTechnicalRoom",
                    icon: "mdi-safe-square-outline",
                    color: "#8D9B6C",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferTechnicalRoom'),
                },
                {
                    name: "Tavan",
                    type: 6,
                    routeName: "OfferCeiling",
                    icon: "mdi-ceiling-fan",
                    color: "#3777BB",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferCeiling'),
                },
                {
                    name: "Pereți",
                    type: 7,
                    routeName: "OfferWalls",
                    icon: "mdi-wall",
                    color: "#F8AC8C",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferWalls'),
                },
                {
                    name: "Automatizare",
                    type: 8,
                    routeName: "OfferAutomation",
                    icon: "mdi-home-automation",
                    color: "#1F4690",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferAutomation'),
                },
                {
                    name: "Ventiloconvectoare",
                    type: 9,
                    routeName: "OfferFanCoilUnit",
                    icon: "mdi-radiator",
                    color: "#AB9E9A",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferFanCoilUnit'),
                },
                {
                    name: "Canal Termic",
                    type: 10,
                    routeName: "OfferThermalChannel",
                    icon: "mdi-pipe-valve",
                    color: "#b269ab",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferThermalChannel'),
                },
                {
                    name: "Pompe de Căldură",
                    type: 11,
                    routeName: "OfferPDC",
                    icon: "mdi-heat-pump-outline",
                    color: "#F37928",
                    show: true,
                    class: '',
                    action: () => this.openOffer('Simple', 'OfferPDC'),
                },

            ],
        };
    },
    computed: {
        groupedOfferTypes() {
            const result = [];
            for (let i = 0; i < this.offerTypes.length; i += 4) {
                result.push(this.offerTypes.slice(i, i + 4));
            }
            return result;
        },
        locationArea() {
            this.location.rooms.forEach((room) => {
                this.totalArea += room.area.sq_m;
            });
            return this.totalArea
                ? this.formatNumber(this, this.totalArea, false) + " m\u00B2"
                : "Nu";
        },
        formattedModifiedDate() {
            return new Date(this.location.modified).toLocaleString(
                this.$store.state.locale
            );
        },
    },
    methods: {
        formatNumber,
        /**
         * Opens an offer based on the type and provided details.
         * - For IPA offers, opens a URL in a new tab.
         * - For VMC and Simple offers, sets the client offers and clientId in session, then navigates.
         * @param {string} type - The type of offer ('IPA', 'VMC', 'Simple', 'Sanitare').
         * @param {string} routeName - The name of the route to navigate to (if applicable).
         */
        openOffer(type, routeName) {
            if (type === 'IPA') {
                const url = `${process.env.VUE_APP_API_BASE_URL}/app/client/${this.clientId}/${this.location.id}`;
                window.open(url, "_blank");
            } else {
                this.$store.state.fetchedClientOffers = this.locationOffers;
                sessionStorage.setItem('clientId', this.clientId);
                if (routeName) {
                    this.$router.push({
                        name: routeName,
                        params: {
                            clientId: this.clientId,
                            locationId: this.location.id,
                        }
                    });
                }
            }
        },
    }
}
</script>

<style>
h6 {
    margin-bottom: 0;
}

.btn-with-ellipsis span:last-of-type {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 95%; /* Adjust based on your needs and icon size */
    vertical-align: middle;
}
</style>
