<template>
    <div ref="containerRef">
        <v-card class="mt-2" height="calc(100vh - 70px)">
            <div ref="toolbarRef">
                <v-toolbar
                    ref="stickyToolbar"
                    class="d-flex align-items-center justify-content-center"
                    height="auto"
                >
                    <v-toolbar-title>
                        <div
                            class="d-flex align-items-center"
                            :class="{ 'justify-content-start': isDisplayMdAndDown }"
                        >
                            <span>{{ "Produse" }}</span>
                            <div>
                                <v-btn
                                    size="small"
                                    icon
                                >
                                    <v-icon
                                        size="x-small"
                                        class="fa fa-gear"
                                    ></v-icon>
                                    <v-menu
                                        activator="parent"
                                        :close-on-content-click="false"
                                    >
                                        <v-card
                                            class="p-2"
                                            variant="outlined"
                                        >
                                            <v-list density="compact">
                                                <v-list-item
                                                    density="compact"
                                                    v-for="header in headers"
                                                    :key="header.title"
                                                >
                                                    <v-checkbox
                                                        density="compact"
                                                        hide-details
                                                        :key="header.title"
                                                        v-model="header.show"
                                                        color="info"
                                                        :label="header.title"
                                                    ></v-checkbox>
                                                </v-list-item>
                                            </v-list>
                                        </v-card>
                                    </v-menu>
                                </v-btn>
                                <v-btn
                                    @click.prevent="addWorkmanship()"
                                    size="small"
                                    icon
                                >
                                    <v-icon>mdi-account-hard-hat</v-icon>
                                    <v-tooltip
                                        content-class="custom-tooltip"
                                        activator="parent"
                                        location="top"
                                    >
                                        Adaugă manoperă
                                    </v-tooltip>
                                </v-btn>
                                <v-btn
                                    @click.prevent="toggleMenu()"
                                    v-if="isDisplayLgAndDown"
                                    icon
                                >
                                    <v-icon>mdi-menu</v-icon>
                                </v-btn>
                            </div>
                        </div>
                        <div>
                            <v-btn @click="openAddProductDialog" size="small">Adaugă produs manual</v-btn>
                        </div>
                    </v-toolbar-title>
                    <v-expand-x-transition>
                        <v-toolbar-items v-if="!isDisplayLgAndDown || isMenuOpen"
                                         :style="{ width: isDisplayMdAndDown ? '60%' : '80%' }">
                            <v-row
                                :justify="isDisplayMdAndDown ? 'end' : 'space-between'"
                                style="max-width: 100%; margin: 0;"
                            >
                                <v-col cols="12" lg="5">
                                    <v-row>
                                        <v-col
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                            class="d-flex justify-content-center"
                                        >
                                            <v-btn>
                                                Grupare
                                                <v-menu activator="parent">
                                                    <v-list class="p-3">
                                                        <v-list-item
                                                            class="mb-3"
                                                            append-icon="mdi-format-list-bulleted-type"
                                                            @click="changeGroupingProperty('assigned_sub_category')"
                                                        >
                                                            <v-list-item-title>Categorie</v-list-item-title>
                                                        </v-list-item>
                                                        <v-list-item
                                                            append-icon="mdi-cancel"
                                                            @click="changeGroupingProperty('')"
                                                        >
                                                            <v-list-item-title>Negrupat</v-list-item-title>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>
                                            </v-btn>
                                        </v-col>
                                        <v-col
                                            cols="12"
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                        >
                                            <v-text-field
                                                v-model="tempSearchTerm"
                                                hide-details
                                                style="width: auto; min-width: 250px; max-width: 350px"
                                                variant="outlined"
                                                ref="search_term_input"
                                                clearable
                                                @focus="selectInputContent('search_term_input')"
                                                @input="onSearchTermInput"
                                                density="compact"
                                            >
                                                <template v-slot:label>
											<span>
												<v-icon icon="mdi-magnify"></v-icon>
												Căutare produse
											</span>
                                                </template>
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>

                                <v-col cols="12" lg="7">
                                    <v-row class="d-flex justify-content-end">
                                        <v-col
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                        >
                                            <v-checkbox
                                                density="compact"
                                                style="max-width: fit-content"
                                                hide-details
                                                v-model="showOnlyOfferQty"
                                                color="primary"
                                                label="Cu cantitate"
                                            >
                                            </v-checkbox>
                                        </v-col>
                                        <v-col
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                        >
                                            <v-select
                                                v-model="selectedPriceList"
                                                style="width: auto; min-width: 200px; max-width: 300px"
                                                :items="displayedPriceLists"
                                                label="Prețuri"
                                                :menu-props="{ closeOnContentClick: false }"
                                                hide-details
                                                variant="outlined"
                                                density="compact"
                                                item-title="date_applied"
                                                item-value="id"
                                                @update:modelValue="handlePriceListSelection(selectedPriceList)"
                                            >
                                                <template v-slot:append-item v-if="!showAllPriceLists">
                                                    <v-container>
                                                        <v-list-item @click="showAllPriceLists = true"
                                                                     title="Arata mai multe optiuni">
                                                        </v-list-item>
                                                    </v-container>
                                                </template>
                                            </v-select>
                                        </v-col>
                                        <v-col
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                        >
                                            <v-text-field
                                                label="Discount %"
                                                style="width: auto; min-width: 100px; max-width: 200px"
                                                v-model="offerInfo.editingDiscount"
                                                hide-details
                                                variant="outlined"
                                                density="compact"
                                                class="no-arrows"
                                                ref="offer_discount_input"
                                                @focus="
											toggleFieldEditing(true, 'offer_discount', offerInfo),
												selectInputContent('offer_discount_input')
										"
                                                @blur="
											handleOfferDiscountEdit($event.target.value),
												toggleFieldEditing(false, 'offer_discount', offerInfo)
										"
                                                @keyup.enter="
											handleOfferDiscountEdit($event.target.value),
												toggleFieldEditing(false, 'offer_discount', offerInfo)
										"
                                                :value="
											offerInfo.isOfferDiscountEditing
												? offerInfo.editingDiscount
												: formatInputDisplayValue(offerInfo.discount)
										"
                                                :rules="[(v) => (validateNumberTextField(v) ? true : 'Not a valid value')]"
                                            >
                                            </v-text-field>
                                        </v-col>
                                        <v-col
                                            sm="12"
                                            md="6"
                                            lg="auto"
                                        >
                                            <v-text-field
                                                label="Total cu TVA"
                                                style="width: auto; min-width: 100px"
                                                density="compact"
                                                hide-details
                                                variant="solo"
                                                bg-color="primary"
                                                readonly
                                                dirty
                                            >
                                                {{ formatNumber(this, totalFinalPrice) }}
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-toolbar-items>
                    </v-expand-x-transition>
                </v-toolbar>
            </div>
            <v-data-table
                :headers="getHeaders"
                :items="displayedProducts"
                class="elevation-1"
                item-key="localId"
                item-value="localId"
                items-per-page="50"
                :groupBy="groupBy"
                :loading="isLoading"
                :height="calculatedHeight"
                fixed-header
            >
                <template v-slot:loader>
                    <v-container class="d-flex justify-content-center">
                        <v-progress-circular
                            indeterminate
                            :size="67"
                        ></v-progress-circular>
                    </v-container>
                </template>
                <template v-slot:headers="{ columns }">
                    <tr
                        style="border-bottom: 1px solid rgba(0, 0, 0, 0.1)"
                        class="sticky-table-header"
                    >
                        <template
                            v-for="column in columns"
                            :key="column.key"
                        >
                            <th
                                v-if="!column.title.includes('Group')"
                                @click="sortBy(column.key)"
                            >
								<span
                                    class="mr-2 cursor-pointer"
                                    style="font-weight: 700"
                                >{{ column.title }}</span
                                >
                                <v-icon
                                    v-if="column.key !== 'data-table-group'"
                                    style="cursor: pointer"
                                    size="small"
                                >
                                    {{
                                        sortDirection === "ASC" || sortKey !== column.key
                                            ? "mdi-arrow-down"
                                            : "mdi-arrow-up"
                                    }}
                                </v-icon>
                            </th>
                        </template>
                    </tr>
                </template>
                <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
                    <tr>
                        <td :colspan="columns.length - 2">
                            <v-btn
                                :ref="'expand' + item.value"
                                size="small"
                                variant="text"
                                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                                @click="toggleGroup(item)"
                            ></v-btn>
                            {{
                                displayedCategoryOptions(item).find((c) => c.title === item.value)?.title
                            }}
                        </td>
                        <td
                            :colspan="columns.length - 2"
                            style="text-align: right"
                        >
							<span>{{
                                    `Total cu TVA ${displayedCategoryOptions(item).find((c) => c.title === item.value)?.title}: `
                                }}</span>
                            <span style="font-weight: 600; margin-right: 1rem">{{
                                    this.formatNumber(this, calculateCategoryFinalPrice(item.value))
                                }}</span>
                        </td>
                    </tr>
                </template>
                <template v-slot:item="{ item, index }">
                    <tr
                        :style="{
							backgroundColor: isOfferType('VMC') || isOfferType('PDC') ? getProductColorByCategory(item.columns.assigned_sub_category) : '',
						}"
                    >
                        <td v-if="headers[0].show && item.columns.number" class="d-flex flex-row">
                            <v-text-field
                                class="no-arrows mr-2"
                                variant="outlined"
                                density="compact"
                                v-model="item.columns.number"
                                type="number"
                                :readonly="true"
                                hide-details
                                style="min-width: 72px;"
                            >
                                <template v-slot:append>
                                    <div class="d-flex flex-column">
                                        <v-btn
                                            density="compact"
                                            variant="plain"
                                            size="small"
                                            v-if="item.columns.number > 1"
                                            @click="handleReordering('up', item, item.columns.number)"
                                            icon
                                        >
                                            <v-icon
                                            >
                                                mdi-menu-up
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                            density="compact"
                                            variant="plain"
                                            size="small"
                                            v-if="item.columns.number < lastOrderNumber"
                                            @click="handleReordering('down', item, item.columns.number)"
                                            icon
                                        >
                                            <v-icon
                                            >
                                                mdi-menu-down
                                            </v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                            </v-text-field>
                        </td>
                        <td v-if="headers[0].show && !item.columns.number">
                            {{ item.columns.number ? item.columns.number : '' }}
                        </td>
                        <td v-if="headers[1].show">{{ item.columns.product_code }}</td>
                        <td v-show="headers[2].show">
							<span
                                v-if="item.columns.assigned_sub_category !== 'Manoperă'"
                                style="
									white-space: nowrap;
									overflow: hidden;
									text-overflow: ellipsis;
									display: block;
									max-width: fit-content;
								"
                            >{{ item.columns.product_name }}</span
                            >
                            <v-text-field
                                v-else
                                v-model="item.raw.product_name"
                                hide-details
                                :variant="'underlined'"
                                density="compact"
                                class="short-input"
                            >
                            </v-text-field>
                            <v-tooltip
                                content-class="custom-tooltip"
                                activator="parent"
                                location="top"
                                :open-delay="750"
                            >
                                {{ item.columns.product_name }}
                            </v-tooltip>
                        </td>
                        <td v-show="headers[3].show">
                            <v-select
                                style="width: 14rem; white-space: nowrap"
                                variant="outlined"
                                density="compact"
                                :items="displayedCategoryOptions(item.columns.assigned_sub_category)"
                                item-title="title"
                                item-value="value"
                                hide-details
                                v-model="item.raw.assigned_sub_category"
                                @update:modelValue="updateProducts([...offeredProducts, ...newlyAddedProducts])"
                                :disabled="item.raw.assigned_sub_category === 'Manoperă'"
                            >
                                <template v-slot:item="{ props }">
                                    <v-list-item
                                        class="select-list-item"
                                        :disabled="props.value === 'Manoperă'"
                                        v-bind="props"
                                        density="comfortable"
                                    ></v-list-item>
                                </template>
                            </v-select>
                        </td>
                        <td v-if="headers[4].show">
                            <v-text-field
                                v-model="item.columns.quantity"
                                class="no-arrows"
                                hide-details
                                :variant="'outlined'"
                                :ref="'inputQuantity' + item.index"
                                density="compact"
                                @focus="
									toggleFieldEditing(true, 'quantity', item.raw),
										selectInputContent('inputQuantity' + item.index)
								"
                                @blur="
									handleItemQuantityEdit(item, $event.target.value),
										toggleFieldEditing(false, 'quantity', item.raw)
								"
                                @keyup.enter="
									handleItemQuantityEdit(item, $event.target.value),
										toggleFieldEditing(false, 'quantity', item.raw)
								"
                                :value="
									item.raw.isQuantityEditing
										? item.columns.quantity
										: formatInputDisplayValue(item.columns.quantity)
								"
                                :rules="[(v) => (validateNumberTextField(v) ? true : 'Not a valid value')]"
                                :tabindex="index + 1"
                            >
                            </v-text-field>
                        </td>
                        <td v-if="headers[5].show">
                            {{
                                measurementUnits.find((unit) => unit.value === item.raw.measurement_unit)?.text ??
                                item.raw.measurement_unit
                            }}
                        </td>
                        <td v-show="headers[6].show">
                            <span
                                v-if="item.selectable.assigned_sub_category !== 'Manoperă'"
                                class="table-span"
                            >{{ formatNumber(this, calculatePriceWithTax(item.columns), true) }}</span>
                            <v-text-field
                                v-else
                                v-model="item.columns.price"
                                class="narrow-input"
                                hide-details
                                reverse
                                style="min-width: 6rem"
                                :variant="'underlined'"
                                :ref="'inputPrice' + item.index"
                                density="compact"
                                @focus="toggleFieldEditing(true, 'price', item.raw),selectInputContent('inputPrice' + item.index)"
                                @blur="handleItemPriceEdit(item, $event.target.value),toggleFieldEditing(false, 'price', item.raw)"
                                :value="item.raw.isPriceEditing? item.columns.price : formatInputDisplayValue(calculatePriceWithTax(item.columns))"
                                :rules="[(v) => (validateNumberTextField(v) ? true : 'Not a valid value')]"
                            >
                                <template v-slot:append>
                                    <span>{{ "&nbsp;lei" }}</span>
                                </template>
                            </v-text-field>
                        </td>
                        <td v-if="headers[7].show">
                            <v-text-field
                                v-model="item.columns.discount"
                                :class="`no-arrows ${item.raw.manual_update ? 'bg-warning' : ''}`"
                                hide-details
                                :variant="'outlined'"
                                :ref="'inputDiscount' + item.index"
                                density="compact"
                                @focus="
									() => {
										toggleFieldEditing(true, 'discount', item.raw);
										selectInputContent('inputDiscount' + item.index);
									}
								"
                                @blur="
									($event) => {
										handleItemDiscountEdit(item, $event.target.value);
										toggleFieldEditing(false, 'discount', item.raw);
									}
								"
                                @keyup.enter="
									($event) => {
										handleItemDiscountEdit(item, $event.target.value);
										toggleFieldEditing(false, 'discount', item.raw);
									}
								"
                                :value="
									item.raw.isDiscountEditing
										? item.columns.discount
										: formatInputDisplayValue(item.columns.discount)
								"
                                :rules="[(v) => (validateNumberTextField(v) ? true : 'Not a valid value')]"
                            >
                            </v-text-field>
                        </td>
                        <td v-if="headers[8].show">
							<span class="table-span">{{
                                    this.formatNumber(this, calculateDiscountedPrice(item.raw))
                                }}</span>
                        </td>
                        <td v-if="headers[9].show">
                            <span class="table-span">{{ finalPriceFormatted(item.raw) }}</span>
                        </td>
                    </tr>
                </template>
            </v-data-table>
            <v-dialog v-model="addProductDialog" max-width="600px">
                <v-card>
                    <v-card-title>
                        <span class="headline">Adăugare produs manuală</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="addProductForm" v-model="formValid">
                            <v-text-field
                                v-model="newProduct.product_code"
                                required
                                label="Cod produs"
                                variant="outlined"
                                :rules="[v => !!v || 'Cod produs este obligatoriu']"
                            ></v-text-field>
                            <v-text-field
                                class="mt-2"
                                v-model="newProduct.product_name"
                                required
                                label="Nume produs"
                                variant="outlined"
                                :rules="[v => !!v || 'Nume produs este obligatoriu']"
                            ></v-text-field>
                            <v-text-field
                                class="mt-2"
                                v-model="newProduct.quantity"
                                required
                                label="Cantitate"
                                type="number"
                                variant="outlined"
                                :rules="[v => !!v || 'Cantitate este obligatoriu', v => v > 0 || 'Cantitate trebuie să fie mai mare de 0']"
                            ></v-text-field>
                            <v-select
                                class="mt-2"
                                v-model="newProduct.measurement_unit"
                                :items="measurementUnits"
                                item-title="text"
                                item-value="value"
                                variant="outlined"
                                required
                                label="Unitate de măsură"
                                :rules="[v => !!v || 'Unitate de măsură este obligatoriu']"
                            ></v-select>
                            <v-text-field
                                class="mt-2"
                                v-model="newProduct.price"
                                required
                                label="Preț"
                                type="number"
                                variant="outlined"
                                :rules="[v => !!v || 'Preț este obligatoriu', v => v > 0 || 'Preț trebuie să fie mai mare de 0']"
                            ></v-text-field>
                            <v-text-field
                                class="mt-2"
                                v-model="newProduct.discount"
                                required
                                label="Discount"
                                type="number"
                                variant="outlined"
                                :rules="[v => v !== null || 'Discount este obligatoriu', v => v >= 0 || 'Discount trebuie să fie cel puțin 0']"
                            ></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="danger" @click="closeAddProductDialog">Anulează</v-btn>
                        <v-btn color="success" @click="saveNewProduct">Adaugă</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
    </div>
</template>

<script>
import {VDataTable} from "vuetify/lib/labs/VDataTable";
import {
    fetchPriceListProducts,
    fetchPriceLists,
    fetchProducts,
    formatNumber,
    normalizeString,
    roundToTwo,
    showAlertModal,
    sortByProductCode,
} from "@/utils/utils";
import {PRODUCTS_COLOR_MAP} from "@/VMC/vmcLogic";
import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";

export default {
    name: "ProductTable",
    emits: ["update-products", "update-offer", "selected-price-list", "sort-pdf-by-number"],
    props: {
        offeredProducts: {
            type: Array,
        },
        offer: {
            type: Object,
        },
        offerType: {
            type: Object,
        },
        headers: {
            type: Array,
        },
        specialProducts: {
            type: Array,
        },
        customerType: {
            type: Number,
        },
        highPriorityProducts: {
            type: Array,
        }
    },
    components: {
        VDataTable,
    },
    async created() {
        emitter.on("save-offer-clicked", this.updateOfferTotals);
        emitter.on('set-products-with-quantity-true', () => this.showOnlyOfferQty = true);
        this.showOnlyOfferQty = this.offer?.id ? true : false;
        await this.initializeProductTable(this.offer);
    },
    mounted() {
        this.setResizeWatcher();
        this.calculateHeight();
    },
    unmounted() {
        emitter.off("save-offer-clicked");
        emitter.off('set-products-with-quantity-true');
    },
    data() {
        return {
            windowWidth: window.innerWidth,
            calculatedHeight: "calc(100vh - 64px)", // Initial value
            tempSearchTerm: "",
            searchTimeout: null,
            partialQuantity: [
                "104.02.51",
                "104.03.51",
                "104.04.51",
                "104.05.51",
                "101.01.02",
                "101.02.02",
                "101.02.51",
                "101.03.02",
                "101.03.51",
                "102.01.02",
                "1101.01.61",
                "1101.02.61",
                "1101.03.61",
                "1101.05.24",
            ],
            measurementUnits: [
                {value: 1, text: "m²"},
                {value: 2, text: "m"},
                {value: 3, text: "pungă"},
                {value: 4, text: "buc"},
                {value: 5, text: "l"},
                {value: 6, text: "set"},
                {value: 7, text: "box"},
                {value: 8, text: "rolă"},
            ],
            categoryOptions: [],
            recommendedProductsDefaultCategory: "ADITIONALE",
            searchTerm: "",
            showOnlyOfferQty: false,
            products: [],
            newlyAddedProducts: [],
            priceLists: [],
            discount: 0,
            selectedPriceList: null,
            vmcProductCodeFilter: 8,
            isLoading: true,
            sortDirection: "ASC",
            offerInfo: {
                discount: 0,
                price_list_id: "",
            },
            groupBy: [],
            isMenuOpen: true,
            defaultWorkmanshipProductCode: "100.00.00",
            sortKey: "",
            offerConfigurations: {
                VMC: {
                    sortKey: "assigned_sub_category",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: () => {
                        this.changeGroupingProperty("assigned_sub_category");
                    },
                    // Add more methods or properties specific to VMC as needed
                },
                SIMPLE: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'simple' as needed
                },
                PLUMBING: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'plumbing' as needed
                },
                TECHNICAL_ROOM: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'technical_room' as needed
                },
                CEILING: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'ceiling' as needed
                },
                WALLS: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'walls' as needed
                },
                AUTOMATION: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'automation' as needed
                },
                FANCOILUNIT: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'fan coil unit' as needed
                },
                THERMAL_CHANNEL: {
                    sortKey: "product_code",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: null,
                    // Add more methods or properties specific to 'thermal channel' as needed
                },
                PDC: {
                    sortKey: "category",
                    showProducts: (isSearchTermActive) => !isSearchTermActive,
                    initializeAdditionalSettings: () => {
                        this.changeGroupingProperty("assigned_sub_category");
                    },
                    // Add more methods or properties specific to 'thermal channel' as needed
                },
            },
            totalPriceWithoutDiscount: 0,
            showAllPriceLists: false,
            lastOrderNumber: 0,
            productsWithSpecialQuantityRules: [
                {
                    product_code: '207.01.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
                {
                    product_code: '207.02.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
                {
                    product_code: '207.03.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
                {
                    product_code: '207.04.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
                {
                    product_code: '207.05.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
                {
                    product_code: '207.06.32',
                    rule: (quantity) => Math.ceil(quantity / 10) * 10,
                    message: (item, oldVal, newVal) => `Cantitatea produsului ${item.raw.product_name} cu codul ${item.raw.product_code} <br/>  a fost rotunjită de la ${oldVal}m la ${newVal}m, deoarece poate fi ofertat doar la multiplu de 10m.`,
                },
            ],
            vmcSortPriorityMap: {
                "Produse Principale": 4,
                "Produse Suplimentare": 4,
                "Produse Camera Tehnică": 4,
                "Produse Automatizare": 4,
                "Produse Consumabile": 4,
                "Produse Etapa 1": 1,
                "Produse Etapa 2": 2,
                "Produse Etapa 3": 3,
                "Manoperă": 4,
            },
            allCategoryOptions: [],
            fixedTaxProducts: [
                {
                    product_code: 'TV1',
                    tax_rate: 0.19,
                },
                {
                    product_code: 'TV2',
                    tax_rate: 0.19,
                },
            ],
            addProductDialog: false,
            newProductId: -1,
            newProduct: {
                product_code: '',
                product_name: '',
                assigned_sub_category: '',
                quantity: 0,
                measurement_unit: 4,
                price: 0,
                discount: 0,
                localId: this.newProductId--,
            },
            formValid: false,
        };
    },
    computed: {
        getFetchedProducts() {
            return this.showProducts ? this.filterProductsByCategory(this.products) : this.products;
        },
        /**
         * Computes a combined list of offered and fetched products, ensuring that offered products are updated with
         * the latest 'number' property from fetched products where there is a matching 'product_code'.
         * Products already present in the offeredProducts array are not duplicated from fetchedProducts.
         *
         * Steps:
         * 1. Validates the offeredProducts list.
         * 2. Creates a mapping of 'product_code' to 'number' from fetchedProducts for quick lookup.
         * 3. Updates the 'number' property in offeredProducts based on this mapping if a matching 'product_code' is found.
         * 4. Filters out fetchedProducts that are already included in offeredProducts to avoid duplication.
         * 5. Returns the concatenated list of offeredProducts and the filtered fetchedProducts.
         *
         * @returns {Array<Object>} The combined and updated list of products.
         */
        getRegroupedProducts() {
            let offeredProducts = this.validateProducts(this.offeredProducts);

            // Create a map of product_code to number from fetchedProducts
            const fetchedProductNumbers = this.getFetchedProducts.reduce((acc, product) => {
                if (product.product_code && product.number) {
                    acc[product.product_code] = product.number;
                }
                return acc;
            }, {});

            // Update the number property in offeredProducts if the product is found in fetchedProductNumbers
            offeredProducts.forEach(product => {
                if (product.product_code in fetchedProductNumbers, fetchedProductNumbers[product.product_code]) {
                    // Check if the product has a number property and update it
                    const newNumber = fetchedProductNumbers[product.product_code];
                    if (newNumber !== undefined) {
                        product.number = newNumber;
                    }
                }
            });

            // Filter out fetchedProducts that are already in offeredProducts
            let fetchedProducts = this.getFetchedProducts.filter(product =>
                !this.isProductInArray(product, offeredProducts)
            );

            // Return the combined and updated list of products
            return offeredProducts.concat(fetchedProducts);
        },
        getHeaders() {
            return this.headers.filter((header) => header.show);
        },
        isSearchTermActive() {
            return this.searchTerm !== null && this.searchTerm !== undefined && this.searchTerm !== "";
        },
        showProducts() {
            let show = true;
            const config = this.offerConfigurations[this.offerType.type];
            if (config && config.showProducts) {
                show = show && config.showProducts(this.isSearchTermActive);
            }
            return show;
        },
        displayedProducts() {
            return this.sortedProducts;
        },
        filteredProducts() {
            let data = this.getRegroupedProducts;
            if (this.isSearchTermActive) {
                const normalizedSearchTerm = this.normalizeString(this.searchTerm.toLowerCase());
                data = data
                    .map((item) => {
                        const normalizedItemName = this.normalizeString(item.product_name.toLowerCase());
                        const nameIndex = normalizedItemName.indexOf(normalizedSearchTerm);
                        const partNoIndex = item.product_code.toLowerCase().indexOf(normalizedSearchTerm);
                        let score = 0;
                        if (nameIndex !== -1) {
                            score += 1000 - nameIndex;
                        }
                        if (partNoIndex !== -1) {
                            score += 500 - partNoIndex;
                        }
                        return {item, score};
                    })
                    .filter((itemWithScore) => itemWithScore.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .map((itemWithScore) => itemWithScore.item);
            }
            if (this.showOnlyOfferQty) {
                data = data.filter(
                    (item) =>
                        item.quantity > 0 ||
                        item.show ||
                        this.isRecommendedProduct(this.offeredProducts, item.product_code)
                );
            }

            return data;
        },
        sortedProducts() {
            const filteredProducts = this.filteredProducts.slice();
            let sortKey = this.sortKey;

            return filteredProducts.sort((a, b) => {
                let aPriority = 0;
                let bPriority = 0;

                // Check if highPriorityProducts is defined and not empty
                if (this.highPriorityProducts && this.highPriorityProducts.length > 0) {
                    aPriority = this.highPriorityProducts.includes(a.product_code) ? -1 : 0;
                    bPriority = this.highPriorityProducts.includes(b.product_code) ? -1 : 0;
                }

                // Prioritize high-priority products by comparing their priority statuses
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }

                // Proceed with normal sorting if neither or both are high priority
                const direction = this.sortDirection === "ASC" ? 1 : -1;

                // Use specialized sorting based on the sortKey
                switch (sortKey) {
                    case "number":
                        this.setPDFSorting("number");
                        return this.sortWithNumberPriority(a, b, sortKey, direction);
                    case "price":
                        this.setPDFSorting("price");
                        return direction * (a.price - b.price);
                    case "product_name":
                        this.setPDFSorting("product_name");
                        return direction * a.product_name.localeCompare(b.product_name);
                    case "product_code":
                        this.setPDFSorting("product_code");
                        return this.sortByProductCode(a, b, direction);
                    case "assigned_sub_category":
                        this.setPDFSorting("assigned_sub_category");
                        return this.sortByProductCategory(a, b, direction);
                    case "discount":
                        this.setPDFSorting("discount");
                        return direction * (a.discount - b.discount);
                    case "final_price":
                        this.setPDFSorting("final_price");
                        return direction * (this.calculateDiscountedPrice(a) - this.calculateDiscountedPrice(b));
                    case "final_total_price":
                        this.setPDFSorting("final_total_price");
                        return direction * (this.calculateFinalPrice(a) - this.calculateFinalPrice(b));
                    default:
                        return direction * (a[sortKey] - b[sortKey]);
                }
            });
        },
        /**
         * Calculates the total final price of all products, adjusting TVA based on customer type.
         * Products initially include a TVA of 19%. If customerType is 1, TVA is adjusted to 9%.
         * @returns {Number} Total price adjusted for TVA based on customer type and discounts.
         */
        totalFinalPrice() {
            return this.getRegroupedProducts
                .filter(product => product.quantity > 0)
                .reduce((total, product) => {
                    const discountedPrice = this.calculateDiscountedPrice({
                        price: product.price,
                        discount: product.discount,
                        product_code: product.product_code,
                    });
                    return total + discountedPrice * product.quantity;
                }, 0);
        },
        isDisplayLgAndDown() {
            return this.$vuetify.display.lgAndDown;
        },
        isDisplayMdAndDown() {
            return this.$vuetify.display.mdAndDown;
        },
        displayedPriceLists() {
            return this.showAllPriceLists ? this.priceLists : this.priceLists.slice(0, 5);
        },
    },
    methods: {
        /**
         * Opens the dialog to add a new product.
         * If a discount is specified in the component, it sets the discount for the new product.
         * If no discount is specified, it uses the discount from the offer information.
         */
        openAddProductDialog() {
            if (this.discount) {
                this.newProduct.discount = this.discount;
            } else if (this.offerInfo.discount) {
                this.newProduct.discount = this.offerInfo.discount;
            }
            this.addProductDialog = true;
        },
        /**
         * Closes the dialog for adding a new product.
         */
        closeAddProductDialog() {
            this.addProductDialog = false;
        },
        /**
         * Validates the form and, if valid, adds the new product to the list of products.
         * Resets the new product object and closes the dialog upon successful validation.
         */
        saveNewProduct() {
            // Validate the form
            this.$refs.addProductForm.validate().then((valid) => {
                if (valid.valid) {
                    // Add the new product to the displayedProducts array
                    this.newlyAddedProducts.push(this.newProduct);
                    this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);

                    // Reset the newProduct object
                    this.newProduct = {
                        product_code: '',
                        product_name: '',
                        quantity: null,
                        measurement_unit: 4,
                        price: null,
                        discount: null,
                        localId: this.newProductId--,
                    };

                    // Close the dialog
                    this.closeAddProductDialog();
                }
            });
        },
        /**
         * Calculates the price of a product with tax.
         *
         * @param {Object} product - The product object containing price and product_code.
         * @returns {number} - The final price including the adjusted tax rate.
         */
        calculatePriceWithTax(product) {
            // Calculate the base price excluding the original 19% TVA
            const basePrice = product.price / 1.19;

            // Find the product in the fixedTaxProducts array
            const fixedTaxProduct = this.fixedTaxProducts.find(p => p.product_code === product.product_code);

            // Determine the new TVA rate based on the product's tax rate or customer type
            const tvaRate = fixedTaxProduct ? fixedTaxProduct.tax_rate : (this.customerType === 1 ? 0.09 : 0.19);

            // Calculate the final price with adjusted TVA
            return basePrice * (1 + tvaRate);
        },
        /**
         * Returns the category options for display, ensuring "Alte produse" is included.
         *
         * @param {string} category - The category to determine which options to display.
         * @returns {Array} - The array of category options including "Alte produse".
         */
        displayedCategoryOptions(category) {
            // Initialize an array to store the category options that will be returned.
            let options;

            // Determine the condition based on which you choose between categoryOptions and allCategoryOptions.
            // This is a simple example. Adjust the condition based on your actual requirements.
            if (category === 'Alte produse') {
                options = [...this.allCategoryOptions];
            } else {
                options = [...this.categoryOptions];
            }

            // Check if "Alte produse" is already in the array to avoid duplicates.
            const alteProduseExists = options.some(option => option.value === "Alte produse");

            // If "Alte produse" is not in the array, add it.
            if (!alteProduseExists) {
                options.push({
                    title: "Alte produse",
                    value: "Alte produse",
                });
            }

            // Return the options array with "Alte produse" included.
            return options;
        },
        /**
         * Sets up a watcher on the window's resize event to detect horizontal resizes.
         */
        setResizeWatcher() {
            window.addEventListener('resize', this.onResize);
        },
        /**
         * Handles the window's resize event, updating the `windowWidth` data property
         * if the window's width has changed. This method can be used to perform actions
         * or calculations that depend on the window's width.
         */
        onResize() {
            const newWidth = window.innerWidth;
            if (this.windowWidth !== newWidth) {
                this.windowWidth = newWidth;
                // Perform actions here for horizontal resize
                this.calculateHeight();
            }
        },
        setPDFSorting(sorting) {
            this.$emit('sort-pdf-by-number', sorting);
        },
        handleReordering(e, item, orderNumber) {
            let direction = e === 'up' ? -1 : 1;
            this.changeProductOrder(item, parseFloat(orderNumber) + direction);
        },
        /**
         * Changes the order number of a specific product, ensuring uniqueness of order numbers across products.
         * If the specified order number is already assigned to another product, the method swaps the order numbers
         * between the two products. After adjusting order numbers, the method updates the UI and potentially re-sorts the product list
         * to reflect the new ordering. If an invalid order number is provided (e.g., non-numeric), the method clears the order number for the product.
         *
         * @param {Object} item - The product item whose order number is being modified. Must include 'raw', 'columns', and 'selectable' properties.
         * @param {number|string} orderNumber - The new order number to assign to the product. Non-numeric values result in clearing the product's order number.
         *
         * Steps:
         * 1. Validates and parses the provided `orderNumber` as an integer.
         * 2. Searches for an existing product with the same order number.
         * 3. If found, swaps the order numbers between the current item and the existing item.
         * 4. If no conflict, updates the current item with the new order number.
         * 5. Triggers a UI update to reflect changes and ensures products are displayed in their correct order.
         */
        changeProductOrder(item, orderNumber) {
            // Convert orderNumber to a valid integer or clear it if invalid
            orderNumber = parseInt(orderNumber);
            if (isNaN(orderNumber)) {
                item.raw.number = undefined;
                item.columns.number = undefined;
                item.selectable.number = undefined;
                return;
            }

            // Find if another product already has this order number
            const existingProductIndex = this.products.findIndex(product => parseInt(product.number) === parseInt(orderNumber));
            if (existingProductIndex !== -1) {
                // Temporarily store the current item's number
                let tempNumber = parseInt(item.columns.number);

                // Swap the numbers
                this.products[existingProductIndex].number = tempNumber;

                item.raw.number = orderNumber;
                item.columns.number = orderNumber;
                item.selectable.number = orderNumber;
                let changedProduct = this.products.find(product => product.product_code === item.columns.product_code);
                if (changedProduct) {
                    changedProduct.number = orderNumber;
                }
            } else {
                // Simply update the number if no conflict exists
                item.raw.number = orderNumber;
                item.columns.number = orderNumber;
                item.selectable.number = orderNumber;
            }

            // Trigger UI update and re-sort the products
            this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]); // Ensure this method refreshes your product display
        },
        /**
         * Custom sort function to prioritize sorting by 'number'. Products with a 'number' are sorted to the top regardless of the sorting direction.
         * @param {Object} a - The first product item to compare.
         * @param {Object} b - The second product item to compare.
         * @param {string} sortKey - The key used for sorting, in this case expected to be 'number'.
         * @param {number} direction - The direction of the sort. A positive number indicates ascending order, while a negative number indicates descending order.
         * @returns {number} - The comparison result: -1 if `a` should come before `b`, 1 if `b` should come before `a`, and 0 if their order should not change.
         */
        sortWithNumberPriority(a, b, sortKey, direction) {
            const aHasNumber = a[sortKey] != null;
            const bHasNumber = b[sortKey] != null;

            if (aHasNumber && !bHasNumber) {
                // If a has a number and b does not, a should always come first
                return -1;
            } else if (!aHasNumber && bHasNumber) {
                // If b has a number and a does not, b should always come first
                return 1;
            } else if (!aHasNumber && !bHasNumber) {
                // If neither has a number, maintain their oldVal positions
                return 0;
            } else {
                // Both have numbers, sort according to the direction
                return direction * (a[sortKey] - b[sortKey]);
            }
        },
        /**
         * Calculates and updates the component's `calculatedHeight` property based on the current height of the toolbar.
         * This method ensures dynamic adjustment of the component's height by subtracting the toolbar's height and a fixed value from the viewport height (100vh).
         * It only performs the calculation if the `toolbarRef` reference is available, indicating the toolbar has been rendered.
         *
         * @example
         * // If the toolbar's height is 50px, calculatedHeight will be set as follows:
         * this.calculatedHeight = 'calc(100vh - 118px - 50px)'
         *
         * Note: The fixed value subtracted alongside the toolbar's height is 118px, as shown in the calculation.
         * This method should be called whenever the toolbar's height might change, or the viewport size changes, to ensure the height is correctly recalculated.
         */
        calculateHeight() {
            // Ensure the toolbarRef is available and has been rendered
            if (this.$refs.toolbarRef) {
                const toolbarHeight = this.$refs.toolbarRef.clientHeight;
                // Calculate the height dynamically and update the data property
                this.calculatedHeight = `calc(100vh - 118px - ${toolbarHeight}px)`;
            }
        },
        /**
         * Sorts an array of price lists by the `date_applied` property in descending order, placing the most recent
         * price list first. This method mutates the oldVal array by sorting it in place.
         *
         * @param {Object[]} priceLists - An array of price list objects to be sorted. Each price list object must
         * have a `date_applied` property in the format "YYYY-MM-DD".
         * @returns {Object[]} The same array passed as input, sorted by the `date_applied` property in descending order.
         */
        sortPriceLists(priceLists) {
            return priceLists.sort((a, b) => {
                // Convert date_applied to Date objects for comparison
                const dateA = new Date(a.date_applied);
                const dateB = new Date(b.date_applied);
                // Sort by most recent first
                return dateB - dateA;
            });
        },
        onSearchTermInput() {
            // Clear the existing timeout, if any
            clearTimeout(this.searchTimeout);

            // Set a new timeout
            this.searchTimeout = setTimeout(() => {
                this.searchTerm = this.tempSearchTerm;
                this.showOnlyOfferQty = false;
            }, 500); // Delay in milliseconds
        },
        fetchProducts,
        fetchPriceListProducts,
        fetchPriceLists,
        formatNumber,
        normalizeString,
        roundToTwo,
        sortByProductCode,
        /**
         * Checks if the specified type is the same as offerType's types.
         *
         * @param {string} type - The type to check for in the offerType's types.
         * @returns {boolean} Returns true if the type is included in the offerType's types; otherwise, false.
         */
        isOfferType(type) {
            return this.offerType.type === type;
        },
        async getAllCategoryOptions() {
            const response = await apiClient.get(`/api/subcategories/`);
            this.allCategoryOptions = response.data.categoryOptions.map(category => ({
                title: category.title,
                value: category.value,
            }));
        },
        async getCategoryOptions() {
            if (this.offerType.productCategories[0]) {
                try {
                    const categoryName = encodeURIComponent(this.offerType.productCategories[0]);
                    const response = await apiClient.get(`/api/subcategories/${categoryName}/`);

                    // Check if the offer type is VMC
                    if (this.offerType.type === 'VMC') {
                        // Assign VMCsortPriority based on the mapping
                        this.categoryOptions = response.data.categoryOptions.map(category => ({
                            ...category,
                            VMCsortPriority: this.vmcSortPriorityMap[category.title] || 4, // Default to 4 if not specified
                        }));
                    } else {
                        // If not VMC, proceed without VMCsortPriority
                        this.categoryOptions = response.data.categoryOptions.map(category => ({
                            title: category.title,
                            value: category.value,
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch category options:', error);
                }
            }
        },
        /**
         * Asynchronously initializes the product table with data based on the provided offer. This method handles two main scenarios:
         * 1. If the offer includes a price list, it fetches available price lists, sets the selected price list, and initializes the product table with offer data.
         * 2. If the offer does not include a price list, it fetches products, then performs a series of initialization steps including setting fetched products with zero quantity, parsing recommended products, fetching price lists, setting offer data, and initializing offered products.
         *
         * In both scenarios, the method updates the component's state with fetched price lists, parsed products, and other offer details. It also emits the selected price list to the parent component for further handling.
         *
         * @async
         * @param {Object} offer - The offer object to initialize the product table with. This object should include details such as the offer's price list if available.
         *
         * @property {Function} fetchPriceLists - A method to fetch available price lists.
         * @property {Function} parseRecommendedProducts - A method to parse recommended products from the offer.
         * @property {Function} setOfferData - A method to set offer data into the component's state.
         * @property {Function} handlePriceListSelection - A method to handle selection of a price list.
         * @property {Function} initializeOfferedProducts - A method to initialize offered products based on the offer data.
         * @property {Function} fetchProducts - A method to fetch products if no price list is provided with the offer.
         * @property {Function} setZeroQtyForBackendProducts - A method to set the quantity of fetched products to zero.
         * @property {Function} initializeTableProducts - A method to initialize the product table with the processed products.
         *
         * @emits selected-price-list - Emits the selected price list ID after initialization for external handling.
         *
         * @throws {Error} If an error occurs during fetching products, an error message is logged to the console.
         */
        async initializeProductTable(offer) {
            let fetchedProducts = null;
            await this.getCategoryOptions();
            await this.getAllCategoryOptions();

            // Distinguish between scenarios based on the presence of a price list in the offer
            if (offer && offer.price_list) {
                try {
                    this.selectedPriceList = offer.price_list; // Handle specific to having a price list
                    await this.handlePriceListSelection(offer.price_list, true);
                    this.isLoading = false;
                } catch (error) {
                    console.error("Error fetching products:", error);
                    this.isLoading = false;
                    return; // Exit the method early if fetching products fails
                }
            } else {
                // Handle the scenario where there is no price list in the offer
                try {
                    const response = await this.fetchProducts();
                    fetchedProducts = response.items;
                    this.selectedPriceList = response.price_list_id;
                } catch (error) {
                    console.error("Error fetching products:", error);
                    this.isLoading = false;
                    return; // Exit the method early if fetching products fails
                }
            }

            // Only trigger the rest of the method when products are fetched
            if ((this.products && this.products.length > 0) || fetchedProducts) {
                // Operations common to both scenarios:
                this.priceLists = this.sortPriceLists(await this.fetchPriceLists());

                this.products = this.reassignSubCategories(fetchedProducts) ? this.reassignSubCategories(this.setZeroQtyForBackendProducts(fetchedProducts)) : this.reassignSubCategories(this.products);
                this.parseRecommendedProducts(this.products);
                this.setOfferData(offer);
                this.initializeOfferedProducts();
                this.$emit("selected-price-list", this.selectedPriceList);
                this.initializeTableProducts();
                this.isLoading = false; // Assuming you want to set loading to false in both scenarios
            }
        },
        /**
         * Updates the `lastOrderNumber` property of the component based on the highest `number` value found in `offeredProducts`.
         * If `offeredProducts` is empty or no products have defined `number` values, `lastOrderNumber` is set to 0.
         */
        updateLastOrderNumber() {
            const numbers = this.offeredProducts.map(product => product.number);
            this.lastOrderNumber = numbers.length ? Math.max(...numbers) : 0;
        },
        // method used for initializing the products inside the table depending on the configuration
        // that has been passed to the component
        initializeTableProducts() {
            // Reset sortKey to a default value
            this.sortKey = "";

            // Iterate over each product category
            const config = this.offerConfigurations[this.offerType.type];

            // Set sortKey based on the first valid configuration found
            if (config && config.sortKey && this.sortKey === "") {
                this.sortKey = config.sortKey;
            }

            // Call additional initialization method if it exists
            if (config && config.initializeAdditionalSettings) {
                config.initializeAdditionalSettings();
            }
        },
        /**
         * Updates the total price without discount and checks if the discount is mixed across all products.
         * This method first calculates the total price without considering any discounts by summing up the price of all products with a quantity greater than 0.
         * It then checks each product to determine if any product's discount differs from the offer's overall discount, setting the `isDiscountMixed` flag accordingly.
         * Finally, it updates the offer's information with the new total prices and mixed discount status and triggers an update to the offer in the data store or backend.
         */
        updateOfferTotals() {
            // Calculate the total price without discount for all products with a positive quantity.
            this.totalPriceWithoutDiscount = this.getRegroupedProducts
                .filter((product) => product.quantity > 0)
                .reduce((total, product) => (total += this.calculatePriceWithoutDiscount(product)), 0);
            // Update the offer information with the calculated total price without discount.
            this.offerInfo.totalPriceWithoutDiscount = this.totalPriceWithoutDiscount;

            // Assume no mixed discount initially.
            let isDiscountMixed = false;

            // Iterate over each product to check if the product's discount is different from the offer's discount.
            this.getRegroupedProducts.forEach((product) => {
                if (product.discount !== undefined && product.discount !== this.offerInfo.discount) {
                    isDiscountMixed = true;
                }
            });

            // Update the offer information with the mixed discount status.
            this.offerInfo.isDiscountMixed = isDiscountMixed;
            // Update the offer information with the total final price, assuming it's calculated elsewhere.
            this.offerInfo.totalFinalPrice = this.totalFinalPrice;

            // Trigger an update to the offer in the data store or backend.
            this.updateOffer();
        },
        reassignSubCategories(products) {
            return products?.map((product) => {
                // Filter out the category_assignments that don't match the productCategories
                const filteredAssignments = product.category_assignments.filter((assignment) =>
                    this.offerType.productCategories.includes(assignment.main_category.name)
                );

                product.assigned_sub_category = filteredAssignments[0] ? filteredAssignments[0].sub_category.name : 'Alte produse';

                // Return the product with adjusted category_assignments
                return {
                    ...product,
                };
            });
        },
        /**
         * Filters products by categories specified in offerType.productCategories. If offerType.productCategories
         * is empty, all products are returned without filtering.
         *
         * @param {Array} products - The array of products to be filtered. Each product should have a
         *                           category_assignments property, which is an array of assignments.
         *                           Each assignment has a main_category property with a name that
         *                           is checked against offerType.productCategories.
         * @returns {Array} An array of filtered products. If offerType.productCategories is empty,
         *                  returns all products.
         */
        filterProductsByCategory(products) {
            // Check if this.offerType.productCategories is empty
            if (!this.offerType.productCategories.length) {
                // If empty, return all products
                return products;
            }
            return products
                .filter((product) =>
                    product.category_assignments.some((assignment) =>
                        this.offerType.productCategories.includes(assignment.main_category.name)
                    )
                )
                .map((product) => {
                    // Filter out the category_assignments that don't match the productCategories
                    const filteredAssignments = product.category_assignments.filter((assignment) =>
                        this.offerType.productCategories.includes(assignment.main_category.name)
                    );
                    product.assigned_sub_category = filteredAssignments[0].sub_category.name;

                    // Return the product with adjusted category_assignments
                    return {
                        ...product,
                    };
                });
        },
        /**
         * Initializes the `offeredProducts` by validating each product's quantity, discount, and number.
         * Additionally, updates the `number` property of items in `this.products` based on a mapping from `offeredProducts`.
         * This ensures that `this.products` reflects the latest ordering information.
         *
         * Steps:
         * 1. Creates a mapping of `product_code` to `number` for quick lookups.
         * 2. Validates each product in `offeredProducts` for integer quantities, decimal discounts, and product numbers.
         * 3. Updates the `number` property of each product in `this.products` if a matching `product_code` is found in the mapping.
         * 4. Triggers a reactivity update for `this.products` to ensure UI consistency.
         */
        initializeOfferedProducts() {
            if (!this.offeredProducts?.length) return;

            // Step 1: Create a mapping of product_code to number
            const productNumberMap = this.offeredProducts.reduce((acc, product) => {
                if (product.product_code && product.number !== undefined) {
                    acc[product.product_code] = product.number;
                }
                return acc;
            }, {});

            // Process each offeredProduct
            this.offeredProducts.forEach((product) => {
                this.validateIntegerQuantity(product);
                this.validateDecimalDiscount(product);
                this.validateProductNumber(product);
            });

            // Step 2: Update the numbers in this.products based on the mapping
            this.products.forEach(product => {
                const matchedNumber = productNumberMap[product.product_code];
                if (matchedNumber !== undefined) {
                    product.number = matchedNumber;
                }
            });

            // If needed, trigger reactivity update
            this.products = [...this.products];
        },
        isProductInArray(product, productArray) {
            return productArray.some((item) => item.product_code === product.product_code);
        },
        /**
         * Sets the offer data into the component's state.
         * This includes setting the offer's discount and price list ID both in a dedicated offerInfo object and as separate reactive properties.
         *
         * @param {Object} offer - The offer object containing the discount and price list information.
         * @param {number} [offer.discount=0] - The discount value to be set. If not provided, defaults to 0.
         * @param {string} offer.price_list - The ID of the price list associated with the offer.
         */
        setOfferData(offer) {
            this.updateLastOrderNumber();
            this.offerInfo.discount = this.roundToTwo(offer?.discount ?? 0);
            this.discount = this.roundToTwo(offer?.discount ?? 0);
            if (this.discount) {
                this.handleOfferDiscountEdit(this.discount);
            }
            if (offer && offer.price_list) {
                this.offerInfo.price_list_id = offer?.price_list;
                this.selectedPriceList = offer?.price_list;
            }
        },
        /**
         * Handles the selection of a price list and the initial loading of price lists based on the context of the call.
         * When a price list is selected, it performs several operations:
         * - Updates the offer's price list ID with the selected one.
         * - Initiates a loading state before fetching products associated with the selected price list.
         * - Fetches products linked to the selected price list and resets their quantities to zero.
         * - If the method is not called during the component's initial load (`isOnLoad` is false), it updates prices of the offered products
         *   based on the fetched price list, emits an event with the selected price list for external handling, and updates the offer.
         * - Clears the loading state after these operations are completed.
         * This method supports both user-initiated price list selection and automatic selection on component load, controlled by the `isOnLoad` flag.
         *
         * @async
         * @param {string} priceListId - The ID of the selected price list.
         * @param {boolean} isOnLoad - Indicates whether the method is called as part of the initial load.
         */
        async handlePriceListSelection(priceListId, isOnLoad) {
            this.offerInfo.price_list_id = priceListId;
            this.isLoading = true;
            await this.fetchPriceListProducts(priceListId).then((products) => {
                this.products = this.setZeroQtyForBackendProducts(products.items);
            });
            if (!isOnLoad) {
                this.updateOfferedProductsPrices();
                this.$emit("selected-price-list", this.selectedPriceList);
                this.updateOffer();
            }
            this.isLoading = false;
        },
        /**
         * Updates the prices of offered products based on matching product codes in the products array.
         * If a product from the offered products matches a product in the products array by product code,
         * its price is updated to the price found in the products array.
         */
        updateOfferedProductsPrices() {
            // Ensure there are products to update from and offered products to update
            if (!this.offeredProducts || !this.products) {
                console.error("Missing offeredProducts or products for price update.");
                return;
            }

            // Loop through each offered product
            this.offeredProducts.forEach((offeredProduct) => {
                // Find the matching product in this.products by product_code
                const matchingProduct = this.products.find(
                    (product) => product.product_code === offeredProduct.product_code
                );

                // If a matching product is found, update the offered product's price
                if (matchingProduct) {
                    offeredProduct.price = matchingProduct.price;
                }
            });
        },
        setZeroQtyForBackendProducts(products) {
            products.forEach((product) => (product.quantity = 0));
            return products;
        },
        validateIntegerQuantity(item) {
            item.quantity = this.partialQuantity.includes(item.product_code)
                ? this.roundToTwo(parseFloat(item.quantity))
                : parseInt(item.quantity);
        },
        validateNumberTextField(value) {
            // This regex supports optional leading minus, digits, optional dot, and digits after dot
            return /^-?\d+(\.\d+)?$/.test(value);
        },
        // handleItemFieldEdit(item, field, value) {
        //     let product = this.getRegroupedProducts.find(
        //         (product) => product.product_code === item.raw.product_code
        //     );
        //     // Validate value and update the specific field with the new value
        //     let isValueInputValid = this.validateNumberTextField(value);
        //     let valideValue = isValueInputValid ? parseFloat(value) : product[field];
        //
        //     if (field === "quantity") {
        //         let isProductNewlyAdded = !product.quantity > 0;
        //         //If the product is newly added to the offered items, update the manual_added flag
        //         if (isProductNewlyAdded && isValueInputValid) {
        //             product.manual_added = true;
        //             product.quantity = parseInt(value);
        //
        //             //If the product is newly added, include it in the selected products array
        //             !this.isProductInArray(product, [...this.offeredProducts, ...this.newlyAddedProducts,]) ? this.newlyAddedProducts.push(product) : null;
        //         } else if (!isProductNewlyAdded && isValueInputValid) {
        //             this.updateItemFieldValue(product, field, valideValue);
        //         }
        //
        //         //If the quantity entered is 0, update the is_deleted flag
        //         product.is_deleted = value <= 0;
        //     } else if (field === "discount")
        //         //If the product discount was updated, modify manual_update flag
        //         product.manual_update = isValueInputValid;
        //
        //     this.updateProducts([
        //         ...this.offeredProducts,
        //         ...this.newlyAddedProducts,
        //     ]);
        // },
        handleItemPriceEdit(item, price) {
            if (!price) {
                item.raw.price = 0;
                item.columns.price = 0;
            } else {
                let isPriceInputValid = this.validateNumberTextField(price);
                if (price === item.raw.price) return;
                let parsedPrice = this.roundToTwo(price);
                if (!isPriceInputValid) parsedPrice = item.raw.price;
                item.columns.price = parsedPrice;
                item.raw.price = parsedPrice;
                this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);
            }
        },
        // handleItemQuantityEdit, handleItemDiscountEdit and handleItemPriceEdit functions are deprecated and have been replaced by
        // handleItemFieldEdit

        /**
         * Validates and standardizes the input quantity format to ensure it is in a parseable decimal format.
         * This function handles different formats where dots and commas are used as decimal and thousand separators.
         * It adapts the input to a standard format by determining the role of dots and commas based on their count and presence:
         * - If there's only a dot and no comma, the dot is treated as a decimal separator.
         * - If both a dot and a comma are present, the dot is treated as a thousands separator, and the comma as a decimal separator.
         * - If only a comma is present, it's treated as a decimal separator.
         * In cases where the format does not match any of the above, the original input is returned, which might require additional handling.
         *
         * @param {string} quantity - The quantity input string to be validated and standardized.
         * @returns {string} The standardized quantity string in a format suitable for parsing into a number.
         */
        validateQuantityInput(quantity) {
            let standardizedQuantity;

            const dotCount = (quantity.match(/\./g) || []).length;
            const commaCount = (quantity.match(/,/g) || []).length;

            if (dotCount > 0 && commaCount === 0) {
                // If there's only a dot present, it's treated as a decimal separator
                standardizedQuantity = quantity.replace('.', '.');
            } else if (dotCount > 0 && commaCount === 1) {
                // If both a dot and a comma are present, the dot is thousands separator, and comma is decimal separator
                standardizedQuantity = quantity.replace(/\./g, '').replace(',', '.');
            } else if (dotCount === 0 && commaCount === 1) {
                // If only a comma is present, it's treated as a decimal separator
                standardizedQuantity = quantity.replace(',', '.');
            } else {
                // Default or error handling could go here
                standardizedQuantity = quantity; // You might want to handle this case differently
            }
            return standardizedQuantity;
        },
        handleItemQuantityEdit(item, quantity) {
            // Standardize the quantity format and check its validity
            let standardizedQuantity = this.validateQuantityInput(quantity);
            let isQuantityInputValid = this.validateNumberTextField(standardizedQuantity);

            let isProductNewlyAdded = !item.raw.quantity > 0;
            let specialRule = this.productsWithSpecialQuantityRules.find(
                rule => rule.product_code === item.raw.product_code
            );

            let parsedQuantity = parseFloat(standardizedQuantity);
            if (isNaN(parsedQuantity)) {
                parsedQuantity = item.raw.quantity; // Use original if parsed result is NaN
            }
            if (specialRule && standardizedQuantity && isQuantityInputValid) {
                parsedQuantity = specialRule.rule(standardizedQuantity);
                if (parseFloat(standardizedQuantity) !== parseFloat(parsedQuantity)) {
                    const alertMessage = specialRule.message(item, standardizedQuantity, parsedQuantity);
                    showAlertModal(this.$store, `${alertMessage}`, 'warning', 10000);
                }
            } else if (isQuantityInputValid) {
                parsedQuantity = this.partialQuantity.includes(item.columns.product_code)
                    ? this.roundToTwo(standardizedQuantity)
                    : Math.round(parseFloat(standardizedQuantity));
            } else {
                parsedQuantity = item.raw.quantity; // Fallback to the existing quantity if invalid
            }

            let isQuantityEdited = item.raw.quantity !== parsedQuantity;

            if (!isQuantityInputValid) {
                parsedQuantity = item.raw.quantity;
            }

            item.raw.quantity = parsedQuantity;
            item.columns.quantity = parsedQuantity;

            if (isProductNewlyAdded && isQuantityInputValid) {
                item.raw.manual_added = true;
                // Check if the product is already in the array, if not, add it
                if (!this.isProductInArray(item.raw, [...this.offeredProducts, ...this.newlyAddedProducts])) {
                    this.newlyAddedProducts.push(item.raw);
                }
            }

            if ((standardizedQuantity <= 0 && !item.selectable.show) || (standardizedQuantity === "" && !item.selectable.show)) {
                // Handle product deletion logic
                let itemToDeleteIndex = this.products.findIndex(
                    (product) => product.product_code === item.selectable.product_code
                );
                if (itemToDeleteIndex !== -1) {
                    this.products[itemToDeleteIndex].quantity = 0;
                }
                item.is_deleted = true;
            }

            if (isQuantityEdited) {
                // If quantity is edited, update the order number to reflect its new position
                item.raw.number = this.getNextOrderNumber().toString();
                this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);
            }
        },
        getNextOrderNumber() {
            // Increment and return the next order number
            this.lastOrderNumber++
            return this.lastOrderNumber;
        },
        /**
         * Handles editing of the discount for an item. This method sets the item's discount based on the entered value,
         * ensuring it falls within a valid range (-100 to 100) and is rounded to two decimal places. If the entered discount
         * is invalid or the input is an empty string, the discount is set to zero. Additionally, if the discount value
         * has changed, the method sets the `manual_update` flag to true on the item's raw data. It also ensures that
         * if the new discount value is either falsy and matches the current discount (also falsy) or is exactly equal
         * to the current discount, the method will perform no action, avoiding unnecessary updates. In cases where the
         * discount and item.raw.discount are both falsy or equal, it explicitly sets item.raw.discount to an empty string
         * for clarity.
         *
         * @param {Object} item - The item object whose discount is being edited. Expected to have `raw` and `columns` properties.
         * @param {string} discount - The new discount value entered, as a string. It may be empty or represent a numeric value.
         */
        handleItemDiscountEdit(item, discount) {
            // Standardize and parse discount input
            let parsedDiscount = this.parseNumberInput(discount);

            const bothAreFalsy = !discount && !item.raw.discount;
            const valuesAreEqual = discount === item.raw.discount;

            if (bothAreFalsy || valuesAreEqual) {
                item.raw.discount = '';
                return;
            }

            let isItemDiscountEdited = item.raw.discount !== parsedDiscount;

            if (isNaN(parsedDiscount) || discount === "") {
                parsedDiscount = 0;
            } else {
                parsedDiscount = Math.min(100, Math.max(-100, this.roundToTwo(parsedDiscount)));
            }

            if (parsedDiscount !== item.raw.discount) {
                item.raw.manual_update = true;
            }

            item.columns.discount = parsedDiscount;
            item.raw.discount = parsedDiscount;

            if (isItemDiscountEdited) {
                this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);
            }
        },
        handleOfferDiscountEdit(discount) {
            // Standardize and parse discount input
            let parsedDiscount = this.parseNumberInput(discount);
            // Validate input without standardization for logical flow
            let isOfferDiscountInputValid = this.validateNumberTextField(parsedDiscount);

            // Ensure the discount is within the -100 to 100 range.
            parsedDiscount = Math.max(-100, Math.min(100, this.roundToTwo(parsedDiscount)));

            let isOfferDiscountEdited = this.offerInfo.discount !== parsedDiscount;

            if (!discount) {
                parsedDiscount = 0;
                isOfferDiscountInputValid = true;
            }

            if (!isOfferDiscountInputValid && discount !== "") {
                parsedDiscount = this.offerInfo.discount;
            }

            this.offerInfo.discount = parsedDiscount;
            this.offerInfo.editingDiscount = parsedDiscount;

            this.getRegroupedProducts
                .filter((product) => (isOfferDiscountInputValid || discount === "") && product.quantity > 0)
                .forEach((product) => {
                    if (!product.manual_update) product.discount = parsedDiscount;
                });

            if (isOfferDiscountEdited) {
                this.updateOffer();
                this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);
            }
        },
        /**
         * Parses a string input, standardizing commas to dots and converting to a float.
         * Ensures the input is treated consistently as a decimal number.
         *
         * @param {String} input - The input string representing a number, potentially using commas as decimal points.
         * @return {Number} The parsed number, or NaN if the input is not a valid number.
         */
        parseNumberInput(input) {
            let standardizedInput;
            if (typeof input === "string") {
                standardizedInput = input.replace(',', '.');
            } else {
                standardizedInput = input;
            }
            return parseFloat(standardizedInput);
        },
        toggleFieldEditing(isFieldEditing, field, object) {
            switch (field) {
                case "quantity":
                    object.isQuantityEditing = isFieldEditing;
                    break;
                case "discount":
                    object.isDiscountEditing = isFieldEditing;
                    break;
                case "price":
                    object.isPriceEditing = isFieldEditing;
                    break;
                case "offer_discount":
                    object.isOfferDiscountEditing = isFieldEditing;
                    break;
            }
        },
        validateDecimalDiscount(item) {
            item.discount = this.roundToTwo(
                item.discount || item.discount === 0 ? item.discount : this.offerInfo.discount
            );
        },
        validateProductNumber(item) {
            let matchingItem = this.products.find(
                (product) => product.product_code === item.product_code
            );
            if (matchingItem) item.number ??= matchingItem.number;
        },
        validateProducts(products) {
            products?.forEach((product) => {
                this.validateIntegerQuantity(product);
                this.validateDecimalDiscount(product);
                this.validateProductNumber(product);
            });
            return products;
        },
        sortByProductCategory(a, b, direction) {
            const defaultPriority = 1000;  // A high default value for items without a defined priority

            // Find category options for each product
            let aCategoryOption = this.categoryOptions.find(c => c.value === a.assigned_sub_category);
            let bCategoryOption = this.categoryOptions.find(c => c.value === b.assigned_sub_category);

            // Obtain VMCsortPriority or use a large default value if undefined
            let aPriority = aCategoryOption?.VMCsortPriority ?? defaultPriority;
            let bPriority = bCategoryOption?.VMCsortPriority ?? defaultPriority;

            // Compare priorities if both are defined, otherwise sort alphabetically
            if (aPriority !== bPriority) {
                return direction * (aPriority < bPriority ? -1 : 1);
            } else {
                // If priorities are equal or default, sort alphabetically by `assigned_sub_category`
                if (a.assigned_sub_category === b.assigned_sub_category) {
                    // Secondary sorting, e.g., by product code
                    return this.sortByProductCode(a, b, direction);
                } else {
                    // Alphabetical sorting of categories if priorities are equal
                    return direction * (a.assigned_sub_category.localeCompare(b.assigned_sub_category));
                }
            }
        },
        calculateDiscountedPrice(product) {
            let discountedPrice = this.calculatePriceWithTax(product);
            if (product.discount) {
                discountedPrice -= this.calculatePriceWithTax(product) * (product.discount / 100);
            }

            // Round to 2 decimal places
            discountedPrice = Math.round((discountedPrice + Number.EPSILON) * 100) / 100;

            return discountedPrice;
        },
        finalPriceFormatted(product) {
            return this.calculateFinalPrice(product) === 0
                ? "--"
                : this.formatNumber(this, this.calculateFinalPrice(product));
        },
        calculateFinalPrice(product) {
            let finalPrice = product.quantity * this.calculateDiscountedPrice(product);

            // Round to 2 decimal places
            finalPrice = Math.round((finalPrice + Number.EPSILON) * 100) / 100;

            return finalPrice;
        },
        calculatePriceWithoutDiscount(product) {
            let priceWithoutDiscount = product.quantity * product.price;
            // Round to 2 decimal places
            priceWithoutDiscount = Math.round((priceWithoutDiscount + Number.EPSILON) * 100) / 100;

            return priceWithoutDiscount;
        },
        calculateCategoryFinalPrice(category) {
            return this.getRegroupedProducts
                .filter((product) => product.quantity > 0 && product.assigned_sub_category === category)
                .reduce((total, product) => (total += this.calculateFinalPrice(product)), 0);
        },
        updateProducts(products) {
            this.$emit(
                "update-products",
                products.filter((product) => product.quantity > 0)
            );
            this.newlyAddedProducts = [];
        },
        updateOffer() {
            this.offerInfo.totalPriceWithoutDiscount = this.totalPriceWithoutDiscount;
            this.offerInfo.totalFinalPrice = this.totalFinalPrice;
            this.$emit("update-offer", this.offerInfo);
        },
        sortBy(key) {
            this.sortDirection = this.sortDirection === "ASC" && this.sortKey === key ? "DESC" : "ASC";
            this.sortKey = key;
        },
        formatInputDisplayValue(value) {
            return value ? this.formatNumber(this, value, false) : "";
        },
        changeGroupingProperty(groupKey) {
            this.groupBy = groupKey === "" ? [] : [{key: groupKey}];
            this.sortKey = groupKey;
            this.toggleAll();
        },
        toggleAll() {
            this.$nextTick(() => {
                // for each key in this.refs run a separate log
                for (let key in this.$refs) {
                    if (key.includes("expand") && this.$refs[key]) {
                        this.$refs[key].$el.click();
                    }
                }
            });
        },
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            // calculate the height of the product table depending on the toolbar height
            setTimeout(() => {
                this.calculateHeight();
            }, 500);
        },
        addWorkmanship() {
            let workmanshipItem = {
                product_name: "Manoperă",
                product_code: this.defaultWorkmanshipProductCode,
                quantity: 1,
                price: 0,
                discount: 0,
                measurement_unit: 4,
                category: "MANOPERA",
                assigned_sub_category: "Manoperă",
                manual_added: true,
                manual_update: false,
                is_deleted: false,
            };
            this.newlyAddedProducts.unshift(workmanshipItem);
            this.updateProducts([...this.offeredProducts, ...this.newlyAddedProducts]);
        },
        selectInputContent(inputRef) {
            this.$nextTick(() => {
                let inputElement = this.$refs[inputRef];
                inputElement.setSelectionRange(0, inputElement.value.length);
            });
        },
        isRecommendedProduct(offeredProducts, product_code) {
            if (this.specialProducts) {
                return this.specialProducts.some((recommendedProduct) => {
                    return recommendedProduct.product_code === product_code;
                });
            } else {
                return false;
            }
        },
        parseRecommendedProducts(products) {
            products.forEach((product) => {
                if (this.isRecommendedProduct(this.offeredProducts, product.product_code) && !product.manual_added)
                    product.assigned_sub_category = this.recommendedProductsDefaultCategory;
            });
        },
        getProductColorByCategory(category) {
            return PRODUCTS_COLOR_MAP.has(category) ? PRODUCTS_COLOR_MAP.get(category) : "white";
        },
    }
    ,
    watch: {
        // add a watcher for tempSearchTerm where you compare current value with previous value
        tempSearchTerm(newValue, oldValue) {
            if (newValue !== oldValue && !newValue) {
                this.onSearchTermInput();
            }
        }
        ,
        offer: function () {
            this.setOfferData(this.offer);
        }
        ,
        // TODO MOVE TO NEW TABLE for products with 0 quantity
        offeredProducts: {
            handler: function () {
                this.offeredProducts.forEach((offeredProduct) => {
                    this.products.forEach((product) => {
                        if (offeredProduct.show && offeredProduct.product_code === product.product_code) {
                            product.show = offeredProduct.show;
                        }
                    });
                });
            }
            ,
            deep: true,
        }
        ,
    }
    ,
}
;
</script>
<style scoped>
.v-list-item {
    min-height: auto !important;
    padding: 0 !important;
}

.v-checkbox :deep(label) {
    opacity: 100;
}

.v-select :deep(label) {
    opacity: 100;
}

.input-group-text {
    font-size: 0.875rem;
    font-weight: 400;
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0.1);
    border: none;
    display: flex;
    text-align: center;
    align-items: center;
}

.v-table > .v-table__wrapper > table > thead > tr > td {
    padding-right: 0;
    padding-left: 0;
}

.v-data-table :deep(td) {
    padding: 0 5px !important;
}

:deep(.v-col-lg-auto) {
    padding: 6px !important;
}

:deep(.v-text-field__suffix) {
    padding-inline-end: 5px !important;
}

.narrow-input:deep(.v-field__input) {
    padding-inline-start: 0px !important;
    padding-inline-end: 0px !important;
    min-width: fit-content !important;
}

.short-input:deep(.v-field__input) {
    padding-top: 0px !important;
}

.select-list-item {
    padding: 10px !important;
}

.table-span {
    white-space: nowrap;
    display: block;
    text-align: end;
    width: 100%;
}

tr > td {
    background-color: transparent !important;
}

.no-arrows input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.no-arrows input::-webkit-outer-spin-button,
.no-arrows input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}


</style>
