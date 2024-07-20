<template>
    <v-card variant="elevated" class="mt-4">
        <v-toolbar :title="location ? 'Editare locație' : 'Adăugare locație'"></v-toolbar>
        <v-card-text>
            <v-row>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        :bg-color="form.description === '' && showMissingInfo ? 'danger' : ''"
                        clearable
                        label="Descriere"
                        :variant="form.description === '' && showMissingInfo ? 'solo-filled' : this.$store.state.vuetifyFieldType"
                        v-model="form.description"
                        data-cy="location-description"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-autocomplete
                        data-cy="location-region"
                        clearable
                        label="Județ"
                        :items="regions"
                        v-model="form.region_id"
                        :variant="this.$store.state.vuetifyFieldType"
                        item-title="title"
                        item-value="value"
                        autocomplete
                    >
                    </v-autocomplete>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        clearable
                        label="Localitate"
                        :variant="this.$store.state.vuetifyFieldType"
                        v-model="form.city"
                        data-cy="location-city"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="6" md="6" sm="12">
                    <v-text-field
                        clearable
                        label="Adresă"
                        :variant="this.$store.state.vuetifyFieldType"
                        v-model="form.address"
                        data-cy="location-address"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
            <v-card-actions class="justify-content-end">
                <v-btn color="#54c5b0" variant="elevated" @click="saveLocation"
                       data-cy="createClient">{{
                        location ? 'Salvează modificările' : 'Finalizare'
                    }}
                </v-btn>
            </v-card-actions>
        </v-card-text>
    </v-card>
</template>


<script>
import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";
import {fetchData} from "@/utils/utils";

export default {
    name: "ClientLocation",
    props: {
        location: Object,
        clientId: {
            type: Number,
            default: null
        },
        creationRender: Boolean,
    },
    mounted() {
        fetch("/cities.json")
            .then((response) => response.json())
            .then((data) => {
                this.regions = data
                    .filter((item) => item.model === "cities_light.region")
                    .sort((a, b) => a.fields.display_name.localeCompare(b.fields.display_name))
                    .map((item) => {
                        return {
                            title: item.fields.display_name,
                            value: item.pk
                        }
                    });
            });
    },
    unmounted() {
        emitter.off('client-added')
    },
    computed: {
        emitter() {
            return emitter
        },
    },
    data() {
        return {
            showMissingInfo: false,
            form: {
                description: this.location ? this.location.description : "",
                region_id: this.location ? this.location.region : "",
                city: this.location ? this.location.subregion : "",
                address: this.location ? this.location.address : "",
            },
            error: "",
            regions: [],
            streetName: '',
            streetNumber: '',
            blockNumber: '',
            stairNumber: '',
            floorNumber: '',
            apartmentNumber: '',
        };
    },
    methods: {
        async saveLocation(client = null) {         
            if (this.creationRender && !client.id) {
                emitter.emit('add-client')
                if (this.form.description === '') {
                    this.showMissingInfo = true;
                }
                return
            }
            if (!client.id) {
                client.id = this.$store.state.clientId
            }
            if (client.id) {
                if (this.form.description === '') {
                    this.showMissingInfo = true;
                    return
                } else {
                    this.error = '';
                    try {
                        if (this.location) {
                            let locationData = {
                                address: this.form.address,
                                client_id: this.clientId, // Use clientId prop instead of $store.state.clientId
                                description: this.form.description,
                                region_id: this.form.region_id,
                                subregion: this.form.city,
                            }
                            // Update existing location
                            await apiClient.put(`/api/update_location/${this.location.id}/`, locationData).then(async () => {
                                    await fetchData('locations')
                                    emitter.emit('location-saved')
                                }
                            );
                        } else {
                            if (!client.id) {
                                alert('Introduceti un client inainte de a putea adauga o locatie.')
                                return
                            }
                            let locationData = {
                                address: this.form.address,
                                client_id: client.id, // Use clientId prop instead of $store.state.clientId
                                description: this.form.description,
                                region_id: this.form.region_id,
                                subregion: this.form.city,
                            }
                            // Add new location
                            await apiClient.post('/api/add_location/', locationData)
                                .then(async () => {
                                    // handle successful response
                                    emitter.emit('location-saved');
                                    await fetchData('locations')
                                    if (this.creationRender) {
                                        await fetchData('all')
                                        setTimeout(() => {
                                            this.$router.push('/client-details/' + client.id + '/')
                                        }, 300)
                                    }
                                })
                                .catch(error => {
                                    if (error.response && error.response.status === 400) {
                                        alert('A avut loc o eroare: ' + error.response.data.message);
                                    } else {
                                        console.log('A avut loc o eroare:', error.message);
                                        // handle other errors
                                    }
                                });
                        }
                    } catch (error) {
                        console.error(error.response.data);
                    }
                }
            }
        },
    },
}
</script>

<style scoped>

</style>

