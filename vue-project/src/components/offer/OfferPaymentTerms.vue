<template>
    <v-card class="mt-2">
        <v-toolbar title="Note">
            <v-toolbar-items>
                <v-btn icon
                       @click="addPaymentTerm()"
                >
                    <v-icon>mdi-plus</v-icon>
                    <v-tooltip>
                        Adaugă un termen nou
                    </v-tooltip>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-card-text >
            <template v-for="paymentTerm, index in paymentTerms" :key="index">
                <v-row class="px-5">
                    <v-col cols="1" class="p-0 d-flex justify-start" align-self="center">
                        <span>
                            {{ index +1}}
                        </span></v-col>
                    <v-col class="p-0 d-flex justify-start" align-self="center">
                        <v-text-field placeholder="Adaugă un termen nou" :value="paymentTerm" @update:modelValue="editPaymentTerm($event, index)" variant="underlined" hide-details ></v-text-field>
                    </v-col>
                    <v-col cols="1" class="p-0 d-flex justify-center" align-self="center">
                        <v-icon
                            color="danger"
                            variant="flat"
                            @click.prevent="removePaymentTerm(index)"
                        >mdi-delete
                        </v-icon>
                    </v-col>
                </v-row>
                <v-divider v-if="index !== paymentTerms.length-1"></v-divider>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>


export default {
    name: "OfferPaymentTerms",
    emits:['update_payment_terms'],
    props: {
        offer: {
            type: Object,
        }
    },
    created() {
        this.paymentTerms = this.offer?.paymentTerms ?? [];
    },
    data() {
        return {
            paymentTerms: [],
        }
    },
    methods: {
        addPaymentTerm() {
            this.paymentTerms.push("");
            this.updatePaymentTerms();
        },
        editPaymentTerm(value, termIndex){
            this.paymentTerms[termIndex] = value;
            this.updatePaymentTerms();
        },
        removePaymentTerm(termIndex){    
            this.paymentTerms.splice(termIndex, 1);
            this.updatePaymentTerms();
        },
        updatePaymentTerms(){
            let filteredPaymentTerms = this.paymentTerms.filter(term=> term !== '');
            this.$emit('update_payment_terms', filteredPaymentTerms);
        }
    },
    watch:{
        'offer.payment_terms': function () {
            this.paymentTerms = this.offer?.payment_terms;
        }
    }
}
</script>
<style scoped>
:deep(.v-field__input){
    padding-bottom:0px;
    padding-top:0px;
}
</style>