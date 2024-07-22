<template>
    <div class="d-flex justify-content-between flex-column h-100">
        <v-list dense nav density="compact">
            <v-list-item v-if="!rail" class="text-center">
                <img src="../../assets/chiwiwi_logo.png" class="mx-auto w-100"/>
            </v-list-item>
            <v-list-item v-else class="text-center">
                <img src="../../assets/chiwiwi_logo.png" style="width: 23px; height: 23px;"/>
            </v-list-item>

            <v-list-item
                v-for="item in mainMenuItems"
                :key="item.title"
                :to="item.link"
                :prepend-icon="item.icon"
                :value="item.title"
                @click="refreshClients(item.link)"
                exact
            >
                {{ item.title }}
            </v-list-item>
        </v-list>
        <v-list dense nav density="compact">
            <v-list-item class="px-0">
                <v-list-item @click="toggleNavigator" prepend-icon="mdi-file-marker" variant="flat">
                    Navigator
                </v-list-item>
                <sidebar-nav :section-links="this.$store.state.sidebarLinks" :showNavigator="showNavigator"
                             :rail="rail"/>
            </v-list-item>
        </v-list>
        <v-list dense nav density="compact">
            <!--            <v-list-item @click="toggleTheme" color="primary" prepend-icon="mdi-theme-light-dark">Toggle theme-->
            <!--            </v-list-item>-->
            <v-list-item dense nav>
                <v-switch
                    class="ml-2"
                    v-if="!rail"
                    v-model="isNavOpen"
                    :input-value="isNavOpen"
                    @change="emitHideMenu(!isNavOpen)"
                    color="success"
                >
                    <template v-slot:label>
                        <span>{{ isNavOpen ? 'Ascunde: On' : 'Ascunde: Off' }}</span>
                    </template>
                </v-switch>
            </v-list-item>
            <v-list-item prepend-icon="mdi-account">
                {{ this.userName }}
            </v-list-item>
            <v-list-item
                prepend-icon="mdi-logout"
                color="primary"
                variant="text"
                @click="logout"
            >
                Log out
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
import {reactive, watchEffect} from 'vue';
import apiClient from "@/utils/apiClient";
import {useTheme} from 'vuetify'
import SidebarNav from "@/components/common/SidebarNav.vue";
import {mapGetters} from "vuex";
import emitter from "@/utils/emitter";

export default {
    name: 'SidePanel',
    components: {SidebarNav},
    emits: ['hide-nav-drawer'],
    setup() {
        const state = reactive({
            isPanelOpen: true,
            panelClass: '',
            iconClass: 'ni ni-bold-left',
            headerClass: '',
        });
        // Update panel class based on isPanelOpen
        const updatePanelClass = () => {
            state.panelClass = state.isPanelOpen ? '' : 'closed';
            state.iconClass = state.isPanelOpen ? 'ni ni-bold-left' : 'ni ni-bold-right';
        };
        watchEffect(() => {
            updatePanelClass();
        });
        const theme = useTheme()

        return {
            state,
            updatePanelClass,
            theme,
            toggleTheme: () => {
                if (theme.global.name.value !== 'sistemaLightTheme') {
                    theme.global.name.value = 'sistemaLightTheme';
                    return
                }
                theme.global.name.value = 'sistemaDarkTheme'
            }
        };
    },
    props: {
        rail: {
            type: Boolean,
        },
    },
    data() {
        return {
            userName: sessionStorage.getItem('userFullName'),
            locationId: this.$store.state.locationId,
            mainMenuItems: JSON.parse(sessionStorage.getItem('mainMenuItems')) || [],
            showNavigator: true,
            isNavOpen: false,
        };
    },
    mounted() {
        if (!JSON.parse(sessionStorage.getItem('mainMenuItems'))) {
            let mainMenu = {
                title: 'Meniu',
                items: [
                    {
                        title: 'Clienți',
                        icon: 'mdi-account-group',
                        sublinks: [],
                        link: '/home',
                    },
                    {
                        title: 'Intermediari',
                        icon: 'mdi-account-switch',
                        sublinks: [],
                        link: '/intermediates',
                    },
                    {
                        title: 'Listă prețuri',
                        icon: 'mdi-list-box',
                        sublinks: [],
                        link: '/priceList',
                    },
                ],
            };

            // If the user is a technical user or the user is not a superuser we need to remove the Lista preturi menu item
            if (!this.userPermissions.canViewPriceListsPage) {
                mainMenu.items.splice(2, 1);
            }

            sessionStorage.setItem('mainMenuItems', JSON.stringify(mainMenu.items));

        }
        this.mainMenuItems = JSON.parse(sessionStorage.getItem('mainMenuItems'));
    },
    computed: {
        ...mapGetters(["userPermissions"]),
    },
    methods: {
        emitHideMenu(value) {
            this.isNavOpen = !value;
            this.$emit('hide-nav-drawer', value);
        },
        toggleNavigator() {
            if (this.showNavigator === false) {
                this.showNavigator = true;
                return;
            }
            this.showNavigator = !this.showNavigator
        },
        async logout() {
            try {
                // Call the Django logout endpoint
                await apiClient.get('/api/logout/');

                // Remove csrf and session cookies
                document.cookie = 'csrftoken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';


                sessionStorage.clear();
                localStorage.clear();

                // Redirect to the login page or any other appropriate location
                this.$router.push('/logout')
            } catch (error) {
                console.error('Error logging out:', error);
            }
        },
        /**
         * Emits an event to refresh data associated with the '/home' route. This method is designed to be
         * invoked in response to navigation actions within the application. When navigating to the '/home'
         * route, it emits an event that should trigger data fetching or state update mechanisms elsewhere in
         * the application, without reloading the page.
         *
         * This approach allows for decoupling the navigation logic from the data management logic, enabling
         * components or services responsible for data handling to listen for the 'refresh-clients' event and
         * react accordingly. It's particularly useful for scenarios where up-to-date data needs to be
         * presented to the user upon navigating to the home route, enhancing the user experience by
         * ensuring that the displayed information is current.
         *
         * @param {string} link - The URL path that determines whether the refresh operation should be
         *                        triggered. Specifically, if this parameter matches '/home', the method
         *                        emits the 'refresh-clients' event to initiate the refresh process.
         * @returns {Promise<void>} A promise that resolves once the operation completes, facilitating
         *                          potential asynchronous operations within event listeners. The method
         *                          does not explicitly return a value, emphasizing its role in triggering
         *                          side effects rather than producing a result.
         */
        async refreshClients(link) {
            if (link === '/home') {
                emitter.emit('refresh-clients');
            }
        },
    },
};
</script>
<style>
.v-list-item__prepend > .v-icon {
    margin-inline-end: 16px !important;
}
</style>
