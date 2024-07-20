<template>
    <v-autocomplete
        :readonly="isDisabled"
        :hint="isDisabled ? 'Pentru a edita intermediarul, apasă butonul de editare.' : ''"
        v-model="intermediary"
        variant="solo-inverted"
        label="Intermediar"
        prepend-inner-icon="mdi-account-tie"
        :items="availableIntermediaries"
        item-title="name"
        item-value="id"
        :clearable="!isDisabled"
        data-cy="client-intermediary"
    >
    </v-autocomplete>
</template>

<script>
export default {
    name: "IntermediarySelect",
    props: {
        isDisabled: {
            type: Boolean,
            default: false,
        },
        currentIntermediary: {
            type: Number,
            default: null,
        },
        selectedAgent: {
            type: Number,
        },
        onEdit: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            intermediary: "",
            intermediaries: [],
        };
    },
    created() {
        this.updateIntermediaries();
        if (this.currentIntermediary) {
            this.intermediary = this.currentIntermediary
        }
    },
    computed: {
        availableIntermediaries() {
            return this.onEdit ? this.intermediaries.filter(intermediary => intermediary.agent === this.selectedAgent) : this.intermediaries;
        },
    },
    methods: {
        async updateIntermediaries() {
            this.intermediaries = JSON.parse(sessionStorage.getItem("intermediaries")) || [];
            this.intermediaries.unshift({id: "", name: "-----------"});
            this.intermediaries.unshift({id: "newIntermediary", name: "* Adaugă un intermediar nou"});
        },
    },
    watch: {
        intermediary: function (newVal) {
            if (newVal === 'newIntermediary') {
                this.$emit('new-intermediary');
            } else {
                this.$emit('intermediary-changed', newVal);
            }
        }
    }
};
</script>
