<template>
    <v-card>
        <v-hover open-delay="150" close-delay="150" v-slot="{ isHovering, props }">
            <v-toolbar class="cursor-pointer" @click="collapsed = !collapsed" v-bind="props">
                <v-toolbar-title>Documente</v-toolbar-title>
                <v-expand-x-transition>
                    <v-toolbar-items v-if="!collapsed">
                        <v-btn icon
                               @click.stop="openFileSelector"
                        >
                            <v-icon>mdi-plus</v-icon>
                            <v-tooltip activator="parent" location="top">
                                Adaugă fișier
                            </v-tooltip>
                        </v-btn>
                    </v-toolbar-items>
                </v-expand-x-transition>
                <v-expand-transition>
                    <div v-if="isHovering" class="d-flex justify-content-center align-items-center"
                         style="background: rgb(var(--v-theme-on-surface-variant)); position: absolute; top: 65%; left: 50%;">
                        <v-icon v-if="collapsed">mdi-chevron-double-down</v-icon>
                        <v-icon v-else>mdi-chevron-double-up</v-icon>
                    </div>
                </v-expand-transition>
            </v-toolbar>
        </v-hover>
        <v-expand-transition>
            <v-card-text v-if="!collapsed">
                <FileList :documents="offerFiles" @file-removed="handleFileRemoved" @update-file="updateFile"/>
            </v-card-text>
        </v-expand-transition>

        <!-- Hidden file input -->
        <input type="file" ref="fileInput" @change="handleFileSelected" style="display: none" multiple>
    </v-card>
</template>

<script>
import FileList from "@/components/clients/FileList.vue";
import apiClient from "@/utils/apiClient";
import {showAlertModal} from "@/utils/utils";

export default {
    name: "OfferDocuments",

    components: {FileList},
    props: {
        locationId: {
            type: Number,
            required: true,
        },
        documents: {
            type: Array,
            required: true,
        },
    },
    created() {
        this.offerFiles = this.documents;
    },
    data() {
        return {
            offerFiles: [],
            collapsed: true,
            tooltipAddFileVisible: false,
            fileToUpdate: null,
        }
    },
    methods: {
        /**
         * Triggers the file input to open the file selector dialog.
         */
        openFileSelector() {
            this.$refs.fileInput.click();
        },
        /**
         * Prepares a file for updating by setting it as the current file to update and opening the file selector.
         * @param {Object} file - The file object to be updated.
         */
        updateFile(file) {
            this.fileToUpdate = file;
            this.openFileSelector();
        },
        /**
         * Updates a file on the backend using the provided form data.
         * @param {FormData} formData - The form data containing file information for the update.
         */
        async updateFileBackend(formData) {
            await apiClient
                .put(`api/locations/${this.locationId}/documents/${this.fileToUpdate.id}/`, formData)
                .then((response) => {
                    this.offerFiles = response.data;
                    showAlertModal(this.$store, 'Fisierul a fost actualizat.', 'success', 2000)
                    this.fileToUpdate = null;
                })
                .catch(error => {
                    showAlertModal(this.$store, 'A intervenit o eroare, va rugam reimprospatati pagina.', 'danger', 2000)
                    console.error('Failed to update file:', error);
                });
        },
        /**
         * Handles the file selection for either adding a new file or updating an existing one.
         * @param {Event} event - The event triggered by file selection.
         */
        // this method is used for uploading a file/array of files to the back-end
        async handleFileSelected(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);

            if (this.fileToUpdate) {
                if (!Number.isInteger(this.fileToUpdate.id)) {
                    // File needs to be added
                    await this.saveFile(formData);
                } else {
                    // File exists and needs to be updated
                    await this.updateFileBackend(formData);
                }
            } else {
                // New file selected, needs to be added
                await this.saveFile(formData);
            }
        },
        /**
         * Handles the removal of a file both from the state and the backend.
         * @param {Object} file - The file object to be removed.
         */
        async handleFileRemoved(file) {
            if (file.id) { // Assuming files that exist on the server have an 'id'
                await apiClient
                    .delete(`api/locations/${this.locationId}/documents/${file.id}/`)
                    .then(response => {
                        console.log('File deleted from server:', response.data);
                        this.offerFiles = this.offerFiles.filter(f => f.id !== file.id);
                        showAlertModal(this.$store, 'Fisierul a sters.', 'success', 2000)
                    })
                    .catch(error => {
                        showAlertModal(this.$store, 'A intervenit o eroare, va rugam reimprospatati pagina.', 'danger', 2000)
                        console.error('Failed to delete file:', error);
                    });
            }
        },
        /**
         * Saves a new file to the backend using the provided form data.
         * @param {FormData} formData - The form data containing the new file information.
         */
        async saveFile(formData) {
            await apiClient
                .put(`api/locations/${this.locationId}/documents/`, formData)
                .then(response => {

                    showAlertModal(this.$store, 'Fisierul a fost adaugat.', 'success', 2000)
                    // Replace the existing file in the array
                    this.offerFiles = response.data;
                })
                .catch(error => {
                    showAlertModal(this.$store, 'A intervenit o eroare, va rugam reimprospatati pagina.', 'danger', 2000)
                    console.error('Failed to add file to location document:', error);
                });
        },
    },
}
</script>