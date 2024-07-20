<template>
    <v-list-item
        v-show="showNavigator"
        variant="flat"
        v-for="(section, index) in sectionLinks"
        :key="index" :href="section.link"
        @click.prevent="navigateToSection(index)"
        :class="{ 'custom-active': activeLink === index, 'custom-active': currentSection === section.id, ' ml-5 ': !rail}"
        :active="activeLink === index && currentSection === section.id"
        prepend-icon="mdi-chevron-right"
    >
        {{ section.name }}
    </v-list-item>
</template>

<script>
import {onBeforeUnmount, ref, watchEffect} from 'vue';
import emitter from "@/utils/emitter";
import {mapState} from "vuex";

export default {
    name: 'SidebarNav',
    props: {
        sectionLinks: {
            type: Array,
            required: true,
        },
        showNavigator: {
            type: Boolean,
        },
        rail: {
            type: Boolean,
        },
    },
    computed: {
        ...mapState({
            activeSection: state => state.activeSection,
        }),
    },
    watch: {
        activeSection: function (val) {
            this.currentSection = val;
        }
    },
    data() {
        return {
            currentSection: '',
        };
    },
    setup(props) {
        const activeLink = ref(1);

        const handleScroll = () => {
            const fromTop = window.scrollY;

            props.sectionLinks.forEach((section, index) => {
                // Ensure that the selector starts with '#'
                if (!section.link.startsWith('#')) return;

                const target = document.querySelector(section.link);

                // Check if the target exists before proceeding
                if (!target) {
                    console.warn(`Element not found for link: ${section.link}`);
                    return;
                }

                if (
                    target.offsetTop <= fromTop &&
                    target.offsetTop + target.offsetHeight > fromTop
                ) {
                    const activeSection = {
                        index: index,
                        name: section.name,
                        link: section.link
                    };
                    emitter.emit('active-section-changed', activeSection);
                }
            });
        };
        watchEffect(() => {
            emitter.on('content-container-scroll', handleScroll);
            onBeforeUnmount(() => {
                emitter.off('content-container-scroll', handleScroll);
            });
        });
        return {

            activeLink,
            handleScroll,
        };
    },
    mounted() {
        emitter.on('active-section-changed', (activeSection) => {
            this.setActiveLink(activeSection.index)
        })
    },
    methods: {
        toggleSidebar() {
            this.isOpen = !this.isOpen;
        },
        setActiveLink(index) {
            this.activeLink = index;
        },
        navigateToSection(index) {
            this.setActiveLink(index);
            const section = this.sectionLinks[index];
            if (section && section.link.startsWith('#')) {
                this.scrollToElement(section.link.substring(1)); // Remove '#' for ID
            }
        },
        scrollToElement(elementId) {
            const targetElement = document.getElementById(elementId);
            if (targetElement) {
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 40; // Adjust for sticky header
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });
            }
        },
    },
};
</script>

<style scoped>
.sidebar {
    width: 250px;
    background-color: #f8f9fa;
    padding: 1rem;
    transition: transform 0.3s ease-in-out;
    z-index: 1050;
}

.sidebar.closed {
    transform: translateX(-100%);
}

@media (min-width: 768px) {
    .sidebar.closed {
        transform: translateX(0);
    }
}

.custom-link {
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    background-color: transparent;
    transition: background-color 0.2s ease-in-out;
}

.custom-link:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.custom-active {
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.1);
}

</style>
