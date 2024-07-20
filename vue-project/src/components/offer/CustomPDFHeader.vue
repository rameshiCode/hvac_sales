<template>
    <div class="d-flex flex-row align-items-center">
        <div>
            <v-icon size="small" class="mr-2">mdi-information-outline</v-icon>
            <v-tooltip
                location="top center"
                origin="auto"
                no-click-animation
                activator="parent"
            >
                <v-container class="text-center">
                    <h6>Acest câmp este utilizat pentru a afișa valoarea sa în cadrul <br>ofertei simple, înlocuind
                        titlul standard de pe pagina a doua.</h6>
                </v-container>
                <v-img
                    :width="500"
                    aspect-ratio="16/9"
                    cover
                    :src="'/custom_heading_info.JPG'"
                    class="mb-5"
                >
                </v-img>
            </v-tooltip>
        </div>
        <v-text-field
            clear-icon="mdi-close-circle"
            clearable
            rows="2"
            variant="outlined"
            density="compact"
            label="Titlu ofertă PDF"
            v-model="customPDFHeading"
            :counter="25"
            :maxlength="25"
            hide-details
            :error="isCustomPDFHeaderEmpty"
            @update:modelValue="removeCustomHeaderError"
            @blur="saveCustomPDFHeader"
        ></v-text-field>
    </div>
</template>

<script>
import emitter from "@/utils/emitter";

export default {
    name: "CustomPDFHeader",
    data() {
        return {
            customPDFHeading: '',
        }
    },
    props: {
        offer: {
            type: Object,
        },
        isCustomPDFHeaderEmpty: {
            type: Boolean,
        }
    },
    emits: ['get-custom-header', 'remove-custom-header-error',],
    mounted() {
        emitter.on('save-offer-clicked', () => {
            this.saveCustomPDFHeader();
        });
        if (this.offer) {
            this.customPDFHeading = this.offer.custom_pdf_heading;
            this.saveCustomPDFHeader();
        }
    },
    unmounted() {
        emitter.off('save-offer-clicked');
    },
    methods: {
        saveCustomPDFHeader() {
            this.$emit('get-custom-header', this.customPDFHeading);
        },
        removeCustomHeaderError() {
          if (this.customPDFHeading)
              this.$emit('remove-custom-header-error');
        },
    },
}
</script>

<style scoped>

</style>