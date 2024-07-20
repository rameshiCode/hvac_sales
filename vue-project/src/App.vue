<template>
    <div>
        <router-view :key="$route.meta.timestamp"/>
    </div>
    <v-overlay v-model="isOverlayDisplayed" class="d-flex justify-content-center align-items-center">
        <v-progress-circular color="primary" indeterminate :size="100" :width="6"></v-progress-circular>
    </v-overlay>
</template>
<script lang="js">

import {mapGetters} from "vuex";
import {getUserData} from "@/utils/utils";
import emitter from "@/utils/emitter";

export default {
    name: 'App',
    data() {
        return {
            isOverlayDisplayed: false,
        }
    },
    async mounted() {
        emitter.on('trigger-overlay', () => {
            this.isOverlayDisplayed = !this.isOverlayDisplayed;
        })
        let userId = sessionStorage.getItem('userId');
        if (userId) {
            await getUserData(this.$store, userId);
        }
    },
    unmounted() {
        emitter.off('trigger-overlay');
    },
    computed: {
        ...mapGetters(['userPermissions']),
    },
}
</script>
<style>
#app {
    --bs-bg-opacity: 1;
    background-color: rgba(var(--bs-light-rgb), var(--bs-bg-opacity)) !important;
}

.v-container {
    max-width: 100% !important;
}
</style>