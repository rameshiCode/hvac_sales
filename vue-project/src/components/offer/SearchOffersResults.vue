<template>
    <v-data-table-server
        :headers="headers"
        :items="offers"
        :items-length="totalOffers"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions"
        :page="page"
        v-model:sort-by="sortBy"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
        @update:sort-by="updateSortBy"
    >
        <template v-slot:[`item.client`]="{ item }">
            <a @click.prevent="goToClientDetails(item.selectable.client.id)"
               class="text-decoration-none cursor-pointer">
                {{ item.selectable.client.full_name }}
            </a>
        </template>
        <template v-slot:[`item.type`]="{ item }">
            <span v-if="item.selectable.type === 1">IPA</span>
            <span v-if="item.selectable.type === 2">SANITARE</span>
            <span v-if="item.selectable.type === 3">VMC</span>
            <span v-if="item.selectable.type === 4">SIMPLĂ</span>
            <span v-if="item.selectable.type === 5">C. T. și COLOANE</span>
            <span v-if="item.selectable.type === 6">TAVAN</span>
            <span v-if="item.selectable.type === 7">PEREȚI</span>
            <span v-if="item.selectable.type === 8">AUTOMATIZARE</span>
            <span v-if="item.selectable.type === 9">VENTILOCONVECTOARE</span>
            <span v-if="item.selectable.type === 10">CANAL TERMIC</span>
            <span v-if="item.selectable.type === 11">PDC</span>
        </template>
        <template v-slot:[`item.list_price_value`]="{ item }">
                    <span v-if="item.selectable.list_price_value !== '0.00'">{{
                            formatNumber(this, Math.round(item.selectable.list_price_value), true, 0)
                        }}</span>
            <span v-else>--</span>
        </template>
        <template v-slot:[`item.discount`]="{ item }">
                    <span v-if="item.selectable.is_discount_mixed">
                          <span v-if="item.selectable.discount !== '0.00' && item.selectable.discount !== null">
                            {{ parseInt(item.selectable.discount) }}%
                          </span>
                          <span style="color: red;"> Mixt</span>
                    </span>
            <span v-else-if="item.selectable.discount !== '0.00' && item.selectable.discount !== null">
                        {{ parseInt(item.selectable.discount) }}%
                    </span>
            <span v-else>--</span>
        </template>
        <template v-slot:[`item.value_with_discount`]="{ item }">
                    <span v-if="item.selectable.value_with_discount !== '0.00'">{{
                            formatNumber(this, Math.round(item.selectable.value_with_discount), true, 0)
                        }}</span>
            <span v-else>--</span>
        </template>
        <template v-slot:[`item.modified`]="{ item }">
            {{
                new Date(item.selectable.modified).toLocaleString("ro-RO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                })
            }}
        </template>
    </v-data-table-server>
</template>

<script>
import {formatNumber} from "@/utils/utils";

export default {
    name: "SearchOffersResults",
    data() {
        return {
            headers: [
                {title: 'Nr.', key: 'id'},
                {title: 'Client', key: 'client'},
                {title: 'Tip', key: 'type'},
                {title: 'Data', key: 'modified'},
                {title: 'Total preț listă', key: 'list_price_value', align: 'center',},
                {title: 'Discount', key: 'discount', align: 'center'},
                {
                    title: 'Total cu discount',
                    key: 'value_with_discount',
                    align: 'center',
                },
            ],
            itemsPerPageOptions: [
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ],
            sortBy: [
                {
                    key: 'modified',
                    order: 'desc',
                }
            ],
        };
    },
    emits: ['close-offer-dialog', 'update-page', 'update-items-per-page', 'update-sorting',],
    props: {
        offers: Array,
        totalOffers: Number,
        loading: Boolean,
        itemsPerPage: Number,
        page: Number,
    },
    methods: {
        formatNumber,
        goToClientDetails(clientId) {
            this.$router.push({name: "ClientDetails", params: {id: parseInt(clientId)}});
        },
        updatePage(newPage) {
            this.$emit('update-page', newPage);
        },
        updateItemsPerPage(newItemsPerPage) {
            this.$emit('update-items-per-page', newItemsPerPage);
        },
        updateSortBy(newSort) {
            this.$emit('update-sorting', newSort);
        },
    },
};
</script>