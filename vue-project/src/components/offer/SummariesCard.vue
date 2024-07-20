<template>
    <v-card>
        <v-toolbar @click="toggleCollapsedContent" class="cursor-pointer">
            <v-toolbar-title>
                Listă centralizatoare
            </v-toolbar-title>
        </v-toolbar>
        <v-expand-transition>
            <v-card-text v-if="!collapsed">
                <v-data-table
                    :headers="headers"
                    :items="locationSummaries"
                    class="elevation-1"
                    item-key="id"
                    :items-per-page="50"
                    :loading="loading"
                >
                    <template v-slot:[`item.id`]="{ item }">
                        <div @click="openSummary(item.selectable.id)">
                            {{ item.selectable.id }}
                        </div>
                    </template>
                    <template v-slot:[`item.modified_at`]="{ item }">
                        {{
                            new Date(item.selectable.modified_at).toLocaleString("ro-RO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                            })
                        }}
                    </template>
                    <template v-slot:[`item.locations`]="{ item }">
                        <div class="location-container d-flex flex-row flex-wrap">
                            <span v-for="(location, index) in item.selectable.locations" :key="location.id">
                                {{ location.description }}<span v-if="index < item.selectable.locations.length - 1">,&nbsp;</span><br/>
                            </span>
                        </div>
                    </template>
                    <template v-slot:[`item.total`]="{ item }">
                        {{ formatNumber(this, calculateSummaryTotal(item.selectable), true) }}
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn @click="openSummary(item.selectable.id)">
                            <v-icon color="info">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn @click="confirmDeleteSummary(item.selectable.id)" class="ml-1">
                            <v-icon color="danger">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-expand-transition>
        <v-dialog v-model="deleteDialog" max-width="400px">
            <v-card>
                <v-card-title class="headline">Confirmare ștergere</v-card-title>
                <v-card-text>
                    Acest centralizator poate conține mai multe locații. <br> Ești sigur că vrei să îl ștergi?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" @click="closeDeleteDialog">Anulare</v-btn>
                    <v-btn color="danger" @click="deleteSummary">Șterge</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import apiClient from "@/utils/apiClient";
import { formatNumber } from "@/utils/utils";

export default {
    name: "SummariesCard",
    props: {
        locationId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            headers: [
                { title: "Nr", key: "id", width: "10%" },
                { title: "Data modificării", key: "modified_at", width: "20%" },
                { title: "Locații", key: "locations", width: "40%" },
                { title: "Total", key: "total", width: "15%" },
                { title: "Acțiuni", key: "actions", width: "15%" },
            ],
            locationSummaries: [],
            loading: false,
            collapsed: true,
            deleteDialog: false,
            summaryIdToDelete: null,
        };
    },
    methods: {
        openSummary(summaryId) {
            sessionStorage.setItem('currentSummaryId', summaryId);
            this.$router.push({ name: 'OffersSummary' });
        },
        calculateSummaryTotal(summary) {
            let total = 0;
            summary.items.forEach(summaryItem => {
                total += parseFloat(summaryItem.total);
            });
            return total;
        },
        async fetchSummariesByLocation() {
            this.loading = true;
            try {
                const response = await apiClient.get(`/api/summaries/location/${this.locationId}/`);
                this.locationSummaries = response.data.sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
                this.loading = false;
            } catch (error) {
                this.loading = false;
                console.error('Error fetching summaries:', error);
            }
        },
        confirmDeleteSummary(summaryId) {
            this.summaryIdToDelete = summaryId;
            this.deleteDialog = true;
        },
        async deleteSummary() {
            try {
                await apiClient.delete(`/api/main-summaries/${this.summaryIdToDelete}/`);
                this.deleteDialog = false;
                await this.fetchSummariesByLocation();
            } catch (error) {
                console.error('Error deleting summary:', error);
                this.deleteDialog = false;
            }
        },
        closeDeleteDialog() {
            this.deleteDialog = false;
            this.summaryIdToDelete = null;
        },
        async toggleCollapsedContent() {
            this.collapsed = !this.collapsed;
            if (!this.collapsed) {
                await this.fetchSummariesByLocation();
            }
        },
        formatNumber,
    },
};
</script>

<style scoped>
.location-container {
    white-space: normal;
    word-wrap: break-word;
}
</style>
