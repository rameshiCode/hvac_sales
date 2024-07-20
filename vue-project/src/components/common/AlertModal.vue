<template>
    <v-expand-transition>
        <div class="alert" :class="alertClasses" v-if="showAlert">
            <v-btn icon variant="plain" class="alert-close-button" size="small" density="compact" @click="closeAlert">
                <v-icon color="black">mdi-close</v-icon>
            </v-btn>
            <div v-html="message"></div>
        </div>
    </v-expand-transition>
</template>

<script>

export default {
    computed: {
        showAlert() {
            return this.$store.state.alert.show;
        },
        message() {
            return this.$store.state.alert.message;
        },
        alertClasses() {
            return {
                'alert-success': this.$store.state.alert.type === 'success',
                'alert-danger': this.$store.state.alert.type === 'danger',
                'alert-warning': this.$store.state.alert.type === 'warning',
                'alert-info': this.$store.state.alert.type === 'info'
            };
        },
        duration() {
            return this.$store.state.alert.duration;
        }
    },
    methods: {
        closeAlert() {
            this.$store.state.alert.show = false;
        },
    },
    watch: {
        showAlert(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.$store.commit('configureAlert', {visible: false})
                }, this.duration);
            }
        }
    }
};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}

.alert-close-button {
    position: absolute !important;
    right: 0;
    top: 0;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.alert {
    position: fixed !important;
    top: 5%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1999;
}
</style>

