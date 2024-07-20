<template>
    <nav aria-label="breadcrumb"
         class="sticky-top px-2 py-2 shadow d-flex align-items-center mt-1 bg-white justify-content-between">
        <transition-group
            tag="ol"
            name="breadcrumb-transition"
            class="breadcrumb d-flex align-items-center py-2 px-2"
        >
            <li
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                class="breadcrumb-item"
                :class="{ active: index === breadcrumbs.length - 1 }"
            >
                <transition name="fade">
                    <router-link
                        v-show="index !== breadcrumbs.length - 1 && crumb.path !== 'javascript:void(0)'"
                        :to="crumb.path"
                    >
                        {{ crumb.label }}
                    </router-link>
                </transition>
                <transition name="link-transition">
                        <span v-show="index === breadcrumbs.length - 1 || crumb.path === 'javascript:void(0)'">{{
                                crumb.label
                            }}</span>
                </transition>
                <i
                    v-if="index !== breadcrumbs.length - 1"
                    class="fas fa-angles-right breadcrumb-item-divider mx-2"
                    style="color: #54c5b0"
                />
            </li>
        </transition-group>
        <div>
            <slot name="header"></slot>
        </div>
    </nav>
</template>

<script>

export default {
    name: 'BreadCrumbs',
    data() {
        return {
            clientId: sessionStorage.getItem('clientId')
        };
    },
    computed: {
        breadcrumbs() {
            // First, ensure that breadcrumbs is always treated as an array
            const metaBreadcrumbs = this.$route.meta.breadcrumbs;
            const breadcrumbsArray = Array.isArray(metaBreadcrumbs)
                ? metaBreadcrumbs
                : typeof metaBreadcrumbs === 'function'
                    ? metaBreadcrumbs(this.$route)
                    : [];

            // If breadcrumbs require asynchronous data, handle that here
            const clientId = JSON.parse(sessionStorage.getItem('clientId') || null);
            const offerId = this.$route.params.offerId;


            // Map over the breadcrumbs array to construct the full breadcrumbs
            return breadcrumbsArray.map((crumb) => {
                // Example of handling a dynamic path based on 'clientId'
                if (crumb.path === '/client-details' && clientId) {
                    return {
                        ...crumb,
                        path: `/client-details/${clientId}`
                    };
                }
                // Handle dynamic label for 'Ofertă VMC'
                if (crumb.label.startsWith('Ofertă VMC') && offerId) {
                    return {...crumb, label: `Oferta VMC ${offerId}`};
                } else if (crumb.label.startsWith('Ofertă VMC') && !offerId) {
                    return {...crumb, label: 'Ofertă VMC'};
                }

                // Return the original breadcrumb if no special handling is needed
                return crumb;
            });
        },
    },
    watch: {
        '$store.state.clientId': {
            handler(newValue) {
                this.clientId = newValue;
            },
            immediate: true,
        },
    },
};
</script>

<style scoped>
nav.fixed-top {
    background-color: white;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1030;
}

nav {
    border: 1px solid var(--bs-gray-500);
    border-radius: 5px !important;
}

.breadcrumb-item + .breadcrumb-item::before {
    content: none;
}

.router-link-active {
    text-decoration: none !important;
}

.breadcrumb-item a {
    text-decoration: none !important;
}

.breadcrumb {
    --bs-breadcrumb-margin-bottom: none !important;
}

.breadcrumb-item + .breadcrumb-item {
    padding-left: 0 !important;
}

.breadcrumb-transition-enter-active,
.breadcrumb-transition-leave-active {
    transition: all 0.3s ease-in-out;
}

.breadcrumb-transition-enter,
.breadcrumb-transition-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
