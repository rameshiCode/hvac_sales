import {createStore} from 'vuex'

// Create a new store instance.
const store = createStore({
    state() {
        return {
            alert: {
                show: false,
                message: '',
                type: '',
                duration: 2000
            },
            i18nLocale: 'ro',
            locale: 'ro-RO',
            userId: 0,
            superUser: false,
            clientId: 0,
            locationId: 0,
            userList: [],
            clientsList: {},
            userFullName: '',
            offerVMCInitialLoad: true,
            sidebarLinks: [],
            token: '',
            mainMenu: {},
            simpleOfferLocationId: 0,
            activeSection: '',
            breadcrumbsClientId: sessionStorage.getItem('clientId'),
            vuetifyFieldType: 'solo-inverted',
            vmcPossibleTubes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            currency: {
                'ro-RO': {
                    code: ' lei'
                },
            },
            vmcErrors: [],
            PRICE_LIST_PRODUCTS: [],
            fetchedClientOffers: [],
            userRole: '',
            userPermissions: {
                canEditClientAgent: false,
                canEditPlenumSize: false,
                canDeletePlenum: false,
                canAddPlenum: false,
                canExcludeRoom: false,
                canEditUnitFloors: false,
                canViewAllUnitModels: false,
                canEditTubingDiameters: false,
                canAddUnitsAboveNeeded: false,
                canViewAllClientsListHeaders: false,
                canViewPriceListsPage: false,
                canAddAnyOfferTypeInSummary: false,
            }
        }
    },
    mutations: {
        configureAlert(state, {message, type, duration, visible}) {
            state.alert.message = message;
            state.alert.type = type;
            state.alert.duration = duration;
            state.alert.show = visible;
        },
        // Set user role
        setUserRole(state, role) {
            state.userRole = role;
        },
        // Update user permissions based on role
        updatePermissions(state, permissions) {
            state.userPermissions = permissions;
        },
        increment(state) {
            state.count++
        },
        setActiveSection(state, payload) {
            state.activeSection = payload;
        },
        setClientId(state, clientId) {
            if (clientId) {
                state.breadcrumbsClientId = clientId;
                sessionStorage.setItem('clientId', clientId);
            }
        },
        setFetchedClientOffers(state, offer) {
            if (!state.fetchedClientOffers) {
                state.fetchedClientOffers = [];
            }
            state.fetchedClientOffers.push(offer);
        },
        emptyVmcErrorArray(state) {
            state.vmcErrors = [];
        },
        pushVmcError(state, error) {
            let errorObject = {
                color: error.type,
                title: 'Eroare',
                icon: '$error',
                text: error.text,
            };
            if (error.type === 'warning') {
                errorObject.title = 'Atentionare';
                errorObject.icon = '$warning';
            }

            // Check if the error text already exists in the array
            const errorExists = state.vmcErrors.some(e => e.text === errorObject.text);

            // Only add the new error if it doesn't already exist
            if (!errorExists) {
                state.vmcErrors.push(errorObject);
            }
        },
    },
    actions: {
        setUserPermissions({commit}, {role, permissions}) {
            commit('setUserRole', role);
            commit('updatePermissions', permissions);
        },
    },
    getters: {
        userPermissions: state => state.userPermissions,
        userRole: state => state.userRole,
    },
})
export default store