<template>
    <v-sheet theme="light">
        <v-container class="w-100" style="max-width: 100%;">
            <v-layout>
                <v-hover
                    v-slot:default="{ props }"
                    v-model="isHovering"
                >
                    <v-navigation-drawer
                        v-bind="props"
                        v-model="drawer"
                        class="navbar-nav d-flex align-items-center"
                        permanent
                        :rail="railWatcher"
                    >
                        <side-panel :rail="railWatcher" @hide-nav-drawer="toggleHideMenu"/>
                    </v-navigation-drawer>
                </v-hover>
                <v-main @click="rail = true">
                    <BreadCrumbs
                        v-if="this.$route.name !== 'ClientList' &&
                         this.$route.name !== 'IntermediateList' &&
                         this.$route.name !== 'OfferVMC' &&
                         this.$route.name !== 'OfferSimple' &&
                         this.$route.name !== 'OfferPlumbing' &&
                         this.$route.name !== 'OfferTechnicalRoom' &&
                         this.$route.name !== 'OfferCeiling' &&
                         this.$route.name !== 'OfferWalls' &&
                         this.$route.name !== 'OfferAutomation' &&
                         this.$route.name !== 'OfferFanCoilUnit' &&
                         this.$route.name !== 'OfferThermalChannel' &&
                         this.$route.name !== 'OfferPDC' &&
                         this.$route.name !== 'OffersSummary'"/>
                    <router-view/>
                    <AlertModal></AlertModal>
                </v-main>
            </v-layout>
        </v-container>
    </v-sheet>
</template>

<script>
import SidePanel from "@/components/common/SidePanel.vue";
import BreadCrumbs from "@/components/common/BreadCrumbs.vue";
import AlertModal from "@/components/common/AlertModal.vue";

export default {
    name: "MainLayout",
    components: {AlertModal, SidePanel, BreadCrumbs},
    data() {
        return {
            drawer: true,
            rail: false,
            isNavOpen: true,
            isHovering: false,
        };
    },
    computed: {
        railWatcher() {
            return !(this.isHovering || this.isNavOpen);
        },
    },
    methods: {
        toggleHideMenu(value) {
            this.isNavOpen = value;
        },
    },
};
</script>
<style>
.content-container {
    padding: 0 2rem;
}

.slide-enter-active {
    -moz-transition-duration: 0.3s;
    -webkit-transition-duration: 0.3s;
    -o-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -moz-transition-timing-function: ease-in;
    -webkit-transition-timing-function: ease-in;
    -o-transition-timing-function: ease-in;
    transition-timing-function: ease-in;
}

.slide-leave-active {
    -moz-transition-duration: 0.3s;
    -webkit-transition-duration: 0.3s;
    -o-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
    -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
    -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-in-out;
}

.slide-enter,
.slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
