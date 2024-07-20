<template>
    <v-btn icon
           variant="plain"
           :class="'d-flex flex-row w-100 justify-content-end ' + color"
           @click="openDialog"
    >
        <v-tooltip activator="parent"
                   location="top"
        ><span v-html="plenumsTooltip"></span>
        </v-tooltip>
        <span :class="color" v-for="(plenum, index ) in groupedPlenums" :key="index">
                        {{ plenum.shortName }}{{ plenum.size }}({{ plenum.count }})<span
            v-if="index < groupedPlenums.length - 1">,</span>
                                </span>
        <!-- Plenum Modal -->
        <v-dialog
            v-model="dialog"
            width="auto"
        >
            <v-card class="overflow-y-auto">
                <div>
                    <v-toolbar>
                        <v-toolbar-title>Plenumuri & Circuite
                            <v-toolbar-title color="red"
                            >
                                <h6 v-if="actualCircuits !== circuitCount" style="color: red;"> necesar de circuite:
                                    {{ circuitCount }} <span>- total circuite: {{ actualCircuits }} </span></h6>
                                <h6 v-else> necesar de circuite: {{ circuitCount }}</h6>
                            </v-toolbar-title>
                        </v-toolbar-title>
                        <v-toolbar-items>
                            <v-btn
                                v-if="hasRightsToAddPlenum"
                                @click="addPlenum()"
                            >
                                Adaugă plenum
                            </v-btn>
                            <v-btn
                                color="primary"
                                icon
                                @click="closeDialog"
                            >
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-data-table
                        v-if="localPlenums"
                        :headers="getHeaders"
                        :group-by="isMixedRoom ? [{key:'air'}] :[]"
                        :items="localPlenums"
                        item-key="key"
                        item-value="title"
                    >
                        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen  }">
                            <tr>
                                <td :colspan="columns.length" class="px-10">
                                    <v-card @click="()=>{!isGroupOpen(item) ? toggleGroup(item): null}"
                                            :ref="'expand' + item.id">
                                    </v-card>
                                    {{ getAirTypeByValue(item.value)?.name }}
                                </td>
                            </tr>
                        </template>
                        <template v-slot:[`item.index`]="{ item }">
                            <span>{{
                                    this.localPlenums.filter(p => p.air === item.raw.air).indexOf(item.raw) + 1
                                }}</span>
                        </template>
                        <template v-slot:[`item.air`]="{ item }">
                            <v-select
                                :items="airTypes"
                                v-model="item.columns.air"
                                item-title="name"
                                item-value="type"
                                density="compact"
                                :variant="item.columns.air === 3 ? 'outlined' : 'underlined'"
                                :color="item.columns.air === 3 ? 'danger' : 'black'"
                                @update:model-value="updateField(item, 'air', false)"
                                hide-details
                            >
                            </v-select>
                        </template>
                        <template v-slot:[`item.type`]="{ item }">
                            <v-select
                                style="width: 200px;"
                                variant="underlined"
                                v-model="item.columns.type"
                                :items="options"
                                item-title="name"
                                density="compact"
                                item-value="type"
                                @update:model-value="updateField(item, 'type', false)"
                                hide-details
                            ></v-select>
                        </template>
                        <template v-slot:[`item.circuit_length`]="{ item }">
                            <v-text-field
                                type="number"
                                variant="underlined"
                                density="compact"
                                v-model="item.columns.circuit_length"
                                :class="room.raw.is_plenums_edited ? 'no-arrows text-right text-warning suffix-color' : 'no-arrows text-right'"
                                hide-details
                                suffix="ml"
                                @blur="updateField(item, 'circuit_length', true)"
                                @keyup.enter="updateField(item, 'circuit_length', true)"
                            >
                            </v-text-field>
                        </template>
                        <template v-slot:[`item.size`]="{ item }">
                            <v-select variant="underlined"
                                      v-model="item.columns.size"
                                      density="compact"
                                      :items="availableSizes(item.selectable.type)"
                                      :disabled="!this.userPermissions.canEditPlenumSize"
                                      @update:modelValue="updateField(item, 'size', true)"
                                      hide-details
                            >
                            </v-select>
                        </template>
                        <template v-slot:[`item.grate`]="{ item }">
                            <v-select
                                v-model="item.columns.grate"
                                variant="underlined"
                                density="compact"
                                hide-details
                                :items="grateTypes"
                                @update:model-value="updateField(item,'grate', false)"
                                @focus="filterGrateTypes(item)"
                            ></v-select>
                        </template>
                        <template v-slot:[`item.flow`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.flow, false) }} m<sup>3</sup>/h</span>
                        </template>
                        <template v-slot:[`item.airSpeed`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.airSpeed, false) }} m/s</span>
                        </template>
                        <template v-slot:[`item.pressureLossPerLength`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.pressureLossPerLength, false) }} Pa</span>
                        </template>
                        <template v-slot:[`item.pressureLossPerGrill`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.pressureLossPerGrill, false) }} Pa</span>
                        </template>
                        <template v-slot:[`item.pressureLossPerPlenum`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.pressureLossPerPlenum, false) }} Pa</span>
                        </template>
                        <template v-slot:[`item.pressureLossPerSection`]="{ item }">
                            <span>{{ formatNumber(this, item.columns.pressureLossPerSection, false) }} Pa</span>
                        </template>
                        <template v-if="this.userPermissions.canDeletePlenum" v-slot:[`item.actions`]="{ item }">
                            <v-icon
                                color="danger"
                                variant="flat"
                                @click="removePlenum(item.raw.localId)"
                            >mdi-delete
                            </v-icon>
                        </template>
                        <template v-slot:bottom>
                            <template v-for="(air, index) in getRoomPlenumsAirTypes" :key="index">
                                <v-toolbar :title="`Totaluri ${ isMixedRoom ? air.name: ''}`">
                                    <v-chip color="black"
                                            text-color="white"
                                            class="ma-2"
                                            size="large"
                                            variant="outlined"
                                    >
                                        Pierdere de presiune pe camera:
                                        {{ formatNumber(this, getPlenumsPressureLossByAirType(air.type), false) }} Pa
                                    </v-chip>
                                </v-toolbar>
                                <v-divider style="opacity:0.4" class="my-0"
                                           v-if="index < getRoomPlenumsAirTypes.length-1"></v-divider>
                            </template>
                        </template>
                    </v-data-table>
                    <v-expand-transition>
                        <v-card v-if="showChangeDialog && !hidePlenumTypeChangeDialog" class="px-10">
                            <v-card-text class="pb-0">
                                <v-row>
                                    <v-col cols="auto">
                                        <v-icon class="pt-10" color="warning" size="x-large">
                                            mdi-alert-circle-outline
                                        </v-icon>
                                    </v-col>
                                    <v-col cols="auto">
                                        <v-radio-group v-model="changeOptions" v-if="singlePlenumChange"
                                                       class="mx-10 pt-6">
                                            <v-radio class="pb-2" @click="showChangeDialog = false" value="one">
                                                <template v-slot:label>
                                                    Schimb tipul plenumului selectat în
                                                    {{ getPlenumName(futureValues.columns.type) }}
                                                </template>
                                            </v-radio>
                                            <v-radio class="pb-2" value="two">
                                                <template v-slot:label>
                                                    Schimb toate plenumurile de tip
                                                    {{ getPlenumName(previousValues.type) }}
                                                    {{ previousValues.grate }} în tipul
                                                    {{ getPlenumName(futureValues.columns.type) }} cu grilaj
                                                    <v-select :items="getCompatibleGrates(futureValues.columns.type)"
                                                              v-model="futureValues.columns.grate"
                                                              item-value="grate"
                                                              item-text="grate"
                                                              dense="compact"
                                                              hide-details
                                                              variant="outlined"
                                                              class="mx-2"
                                                              style="font-weight: 700; color: var(--bs-dark); max-width:150px;">
                                                    </v-select>
                                                </template>
                                            </v-radio>
                                            <v-radio class="pb-2" value="three">
                                                <template v-slot:label>
                                                    Schimb tipul tuturor plenumurilor în
                                                    {{ getPlenumName(futureValues.columns.type) }} cu grilaj
                                                    <v-select :items="getCompatibleGrates(futureValues.columns.type)"
                                                              v-model="futureValues.columns.grate"
                                                              item-value="grate"
                                                              item-text="grate"
                                                              dense="compact"
                                                              hide-details
                                                              variant="outlined"
                                                              class="mx-2"
                                                              style="font-weight: 700; max-width:150px;">
                                                    </v-select>
                                                </template>
                                            </v-radio>
                                            <v-radio class="pb-2" value="room">
                                                <template v-slot:label>
                                                    Schimb tipul tuturor plenumurilor din această cameră în
                                                    {{ getPlenumName(futureValues.columns.type) }} cu grilaj
                                                    <v-select :items="getCompatibleGrates(futureValues.columns.type)"
                                                              v-model="futureValues.columns.grate"
                                                              item-value="grate"
                                                              item-text="grate"
                                                              dense="compact"
                                                              hide-details
                                                              variant="outlined"
                                                              class="mx-2"
                                                              style="font-weight: 700; max-width:150px;">
                                                    </v-select>
                                                </template>
                                            </v-radio>
                                            <v-radio class="pb-2" value="floor">
                                                <template v-slot:label>
                                                    Schimb tipul tuturor plenumurilor de pe acest etaj în
                                                    {{ getPlenumName(futureValues.columns.type) }} cu grilaj
                                                    <v-select :items="getCompatibleGrates(futureValues.columns.type)"
                                                              v-model="futureValues.columns.grate"
                                                              item-value="grate"
                                                              item-text="grate"
                                                              dense="compact"
                                                              hide-details
                                                              variant="outlined"
                                                              class="mx-2"
                                                              style="font-weight: 700; max-width:150px;">
                                                    </v-select>
                                                </template>
                                            </v-radio>
                                        </v-radio-group>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions class="pb-6">
                                <v-checkbox
                                    v-model="requestHidePlenumTypeChangeDialog"
                                    :label="'Nu afișa acest mesaj timp de ' + this.hideDelayMinutes + ' minute'"
                                    hide-details
                                />
                                <v-btn color="danger" variant="text" @click="showChangeDialog = false" class="mx-4">
                                    Anulează
                                </v-btn>
                                <v-btn variant="text" color="success"
                                       @click="changePlenumType(previousValues.type, futureValues.columns.type, futureValues.columns.grate, changeOptions)">
                                    Aplică selecția
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-expand-transition>
                    <v-expand-transition>
                        <v-card
                            v-if="showChangeGrateDialog && !hideGrateChangeDialog"
                            class="px-10"
                        >
                            <v-card-text class="pb-0">
                                <v-row>
                                    <v-col cols="auto">
                                        <v-icon
                                            class="pt-10"
                                            color="warning"
                                            size="x-large"
                                        >
                                            mdi-alert-circle-outline
                                        </v-icon>
                                    </v-col>
                                    <v-col cols="auto">
                                        <v-radio-group v-model="changeOptions" class="mx-10 pt-6">
                                            <v-radio value="one" class="pb-2">
                                                <template v-slot:label>
                                                    Schimbă grilajul plenumului selectat din
                                                    <strong>&nbsp;{{ previousValues.grate }}&nbsp;</strong> în
                                                    <strong>&nbsp;{{ futureValues.columns.grate }}&nbsp;</strong>
                                                </template>
                                            </v-radio>
                                            <v-radio value="two" class="pb-2">
                                                <template v-slot:label>
                                                    Schimbă grilajele pentru toate plenumurile cu grila
                                                    <strong>&nbsp;{{ previousValues.grate }}&nbsp;</strong> în
                                                    <strong>&nbsp;{{ futureValues.columns.grate }}&nbsp;</strong>
                                                </template>
                                            </v-radio>
                                            <v-radio value="three" class="pb-2">
                                                <template v-slot:label>
                                                    Schimbă grilajele pentru toate plenumurile în
                                                    <strong>&nbsp;{{ futureValues.columns.grate }}&nbsp;</strong>
                                                </template>
                                            </v-radio>
                                        </v-radio-group>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions class="pb-6">
                                <v-checkbox
                                    v-model="requestHideGrateChangeDialog"
                                    :label="'Nu afișa acest mesaj timp de ' + this.hideDelayMinutes +' minute'"
                                    hide-details
                                />
                                <v-btn
                                    color="danger"
                                    variant="text"
                                    @click="showChangeGrateDialog = false"
                                >
                                    Anulează
                                </v-btn>
                                <v-btn
                                    variant="text"
                                    color="success"
                                    @click="changePlenumGrate(changeOptions, futureValues.columns.grate)"
                                >
                                    Aplică selecția
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-expand-transition>
                </div>
            </v-card>
        </v-dialog>
        <v-icon>
            mdi-pencil
        </v-icon>
    </v-btn>
</template>

<script>
import {v4 as uuidv4} from "uuid";
import {VDataTable} from "vuetify/lib/labs/VDataTable";
import {formatNumber, roundToTwo, showAlertModal} from "@/utils/utils";
import {maxFlow77Tube, pressureLoss77Tube} from "@/VMC/vmcData";
import store from "@/store";
import {mapGetters} from "vuex";

export default {
    components: {
        VDataTable
    },
    props: {
        room: {
            type: Object,
        },
        color: {
            type: String,
        },
        reset: {
            type: Boolean,
        },
        hideDelayMinutes: {
            type: Number,
        },
        hidePlenumTypeChangeDialog: {
            type: Boolean,
        },
        previousPlenumType: {
            type: Number,
        },
        previousPlenumGrate: {
            type: String,
        }
    },
    emits: ['update-plenums', 'change-plenum-type-or-grate', 'update-circuit-count', 'update-pressure-loss', 'reset-done', 'request-hide-plenum-type-change-dialog'],
    mounted() {
        this.initializePlenums();
    },
    updated() {
        this.expandAllPlenumRows();
    },
    data() {
        return {
            isDebug: false,
            circuitCount: 0,
            grateTypes: [],
            airTypes: [
                {type: 1, name: "Proaspăt"},
                {type: 2, name: "Viciat"},
            ],
            options: [
                {type: 1, name: "Modular", sizes: [1, 2, 3], autoSize: [1, 2], shortName: "MO"},
                {type: 2, name: "Metalic spate", sizes: [1, 2], autoSize: [1, 2], shortName: "MS"},
                {type: 3, name: "Metalic lateral", sizes: [1, 2], autoSize: [1, 2], shortName: "ML"},
                {type: 4, name: "Design spate", sizes: [1, 2], autoSize: [1, 2], shortName: "DS"},
                {type: 5, name: "Design lateral", sizes: [1, 2], autoSize: [1, 2], shortName: "DL"},
                {type: 6, name: "Dublu tavan modular", sizes: [1, 2], autoSize: [1, 2], shortName: "TMO"},
                {type: 7, name: "Dublu tavan metalic", sizes: [1, 2], autoSize: [1, 2], shortName: "TME"},
            ],
            plenumGrateMapping: {
                1: {grateTypes: ['Design', 'Rotund', 'Difuzor rotund', 'Difuzor patrăt'], defaultGrate: 'Rotund'},
                2: {grateTypes: ['Găurit'], defaultGrate: 'Găurit'},
                3: {grateTypes: ['Găurit'], defaultGrate: 'Găurit'},
                4: {grateTypes: ['Design'], defaultGrate: 'Design'},
                5: {grateTypes: ['Design'], defaultGrate: 'Design'},
                6: {grateTypes: ['Rotund', 'Design', 'Difuzor rotund', 'Difuzor patrăt'], defaultGrate: 'Rotund'},
                7: {grateTypes: ['Rotund', 'Design', 'Difuzor rotund', 'Difuzor patrăt'], defaultGrate: 'Rotund'},
                // ... potentially more mappings as needed
            },
            calculatedValues: false,
            preferredType: 5,
            diameters: [75, 90],
            dialog: false,
            localCircuits: [],
            localPlenums: [],
            oldPlenums: [],
            roomInfo: null,
            isPlenumsEdited: false,
            initialCircuitLength: 15,
            airSpeedConstant: 12.69,
            editOrder: [],
            changeOptions: 'two',
            singlePlenumChange: true,
            previousValues: {},
            futureValues: {},
            showChangeDialog: false,
            requestHidePlenumTypeChangeDialog: false,
            requestHideGrateChangeDialog: false,
            showChangeGrateDialog: false,
            hideGrateChangeDialog: false,
        };
    },
    computed: {
        ...mapGetters(['userPermissions']),
        /**
         * Checks if the user has the rights to add a plenum.
         * A user has these rights if they are either a super user or a technical user.
         *
         * @returns {boolean} Returns true if the user is a super user or a technical user, false otherwise.
         */
        hasRightsToAddPlenum() {
            return this.userPermissions.canAddPlenum;
        },
        getHeaders() {
            let headers = [
                [
                    {title: 'Actiuni', align: 'center', key: 'actions', rowspan: 2, sortable: false},
                    {title: 'Nr.', key: 'index', rowspan: 2},
                    {title: 'Tip', key: 'type', rowspan: 2},
                    {title: 'Lungime', key: 'circuit_length', rowspan: 2},
                    {title: 'Mărime', key: 'size', rowspan: 2},
                    {title: 'Grilă', key: 'grate', rowspan: 2},
                    {title: 'Debit', key: 'flow', rowspan: 2},
                    {title: 'Viteza aerului', key: 'airSpeed', rowspan: 2},
                    {title: 'Pierdere de presiune pe', colspan: 4, align: 'center'},
                ],
                [
                    {title: 'lungime', key: 'pressureLossPerLength'},
                    {title: 'grilă', key: 'pressureLossPerGrill'},
                    {title: 'plenum', key: 'pressureLossPerPlenum'},
                    {title: 'secțiune', key: 'pressureLossPerSection'},
                ]
            ];
            if (this.roomInfo.air === 3) {
                headers[0].splice(2, 0, {title: 'Aer', key: 'air', rowspan: 2});
            }
            return headers;
        },
        roomId() {
            return this.roomInfo.localId !== undefined ? this.roomInfo.localId : this.room.raw.localId;
        },
        roomFlow() {
            return this.roomInfo.air_volume / this.actualCircuits;
        },
        airSpeed() {
            return this.roomFlow / this.airSpeedConstant;
        },
        roomPressureLoss() {
            let roomPressureLoss = 0;
            this.localPlenums.forEach(plenum => {
                roomPressureLoss += plenum.pressureLossPerSection;
            });
            return roomPressureLoss;
        },
        plenumsTooltip() {
            return this.groupedPlenums.map(plenum => `Plenum ${plenum.name} de ${plenum.size}, cantitate: ${plenum.count} `).join('<br/>');
        },
        actualCircuits() {
            return this.localPlenums.reduce((acc, plenum) => {
                return acc + plenum.size;
            }, 0);
        },
        groupedPlenums() {
            const group = this.room.columns.plenums.reduce((acc, plenum) => {
                const key = `${plenum.shortName}${plenum.size}`;
                if (!acc[key]) {
                    acc[key] = {
                        name: plenum.name,
                        shortName: plenum.shortName ? plenum.shortName : plenum.short_name,
                        size: plenum.size,
                        count: 0
                    };
                }
                acc[key].count += plenum.count;
                return acc;
            }, {});

            return Object.values(group);
        },
        getRoomPlenumsAirTypes() {
            return this.airTypes.filter(airType => this.localPlenums.some(plenum => plenum.air === airType.type))
        },
        isMixedRoom() {
            return this.roomInfo.air === 3;
        }
    },
    methods: {
        initializePlenums() {
            this.roomInfo = JSON.parse(JSON.stringify(this.room.columns));
            this.isPlenumsEdited = this.room.columns.is_plenums_edited;
            if (this.room.columns.circuit_no_VMC === 0 && this.room.columns.air_volume > 0) {
                this.recalculateCircuitsAndPlenums();
            } else {
                this.localPlenums = this.roomInfo.plenums;
                this.circuitCount = this.roomInfo.circuit_no_VMC;
            }
            this.localPlenums.forEach(plenum => {
                // add plenum id to orderEdit array
                this.recordEdit(plenum.localId, false);
                plenum.isEdited = false;
            });
            this.calculateVentilationCoefficients();
            this.setPlenumDetails();
            this.updatePlenums(false);
            this.initializeGrateTypes(this.localPlenums)
        },
        changePlenum(info) {
            this.setPreferredType(info.type);
            this.setPlenumDetails();
            this.updatePlenums(true);
        },
        getPlenumName(type) {
            return this.options.find(option => option.type === type).name
        },
        getCompatibleGrates(type) {
            let mapping = this.plenumGrateMapping[type];
            return mapping ? mapping.grateTypes : [];
        },
        /**
         * Changes the type of plenums based on a specified location condition.
         * This method emits an event with necessary change details, which can affect either a specific type of plenums
         * or all plenums, depending on the user's selection. It also manages the visibility of dialogs related to changes.
         *
         * @param {number} previousType - The initial type of the plenums before the change.
         * @param {number} futureType - The new type to be assigned to the plenums.
         * @param {string} grate - The grate associated with the plenum type, potentially affected by the type change.
         * @param {string} location - The location condition determining the scope of the change:
         *                            'two' changes plenums of the same type, 'three' changes all plenums.
         */
        changePlenumType(previousType, futureType, grate, location) {
            if (this.requestHidePlenumTypeChangeDialog) {
                this.$emit('request-hide-plenum-type-change-dialog');
            }
            let action;
            const roomId = this.roomInfo.id ? this.roomInfo.id : this.roomInfo.localId;  // Ensure you have the current room ID
            const floor = this.roomInfo.floor ? this.roomInfo.floor : this.room.raw.floor;  // Ensure you have the current floor ID
            switch (location) {
                case 'two':
                    action = 'change-same-plenum-type';
                    break;
                case 'three':
                    action = 'change-all-plenum-type';
                    break;
                case 'room':
                    action = 'change-room-plenum-type';
                    break;
                case 'floor':
                    action = 'change-floor-plenum-type';
                    break;
            }
            if (action) {
                this.$emit('change-plenum-type-or-grate', {action, previousType, futureType, grate, roomId, floor});
            }
            this.showChangeDialog = false;
            this.requestHidePlenumTypeChangeDialog = false;
        },
        /**
         * Changes the grate of plenums based on a specified location condition.
         * This method handles changing the grate for either a single plenum, all plenums of a similar type,
         * or all plenums irrespective of type. It emits events to indicate these changes and manages dialog visibility.
         *
         * @param {string} location - Determines the scope of the change: 'one' for a single plenum, 'two' for all of same type,
         *                            'three' for all plenums.
         * @param {string} grate - The new grate to be assigned to the plenum(s).
         */
        changePlenumGrate(location, grate) {
            if (this.requestHideGrateChangeDialog) {
                this.$emit('request-hide-plenum-type-change-dialog');
            }
            let previousGrate = this.previousValues.grate;
            let futureGrate = this.futureValues.columns.grate;
            let action;
            switch (location) {
                case 'one':
                    // Change grate only for the selected plenum
                    action = 'change-single-plenum-grate';
                    this.$emit('change-plenum-type-or-grate', {action, previousGrate, futureGrate, grate});
                    break;
                case 'two':
                    // Change grate for all plenums of the same previous type
                    action = 'change-same-plenum-grate';
                    this.$emit('change-plenum-type-or-grate', {action, previousGrate, futureGrate, grate});
                    break;
                case 'three':
                    // Change grate for all plenums
                    action = 'change-all-plenum-grate';
                    this.$emit('change-plenum-type-or-grate', {
                        action,
                        previousGrate,
                        futureGrate,
                        grate,
                        plenumGrateMapping: this.plenumGrateMapping
                    });
                    break;
            }
            this.showChangeGrateDialog = false;
            this.requestHideGrateChangeDialog = false;
        },
        deletePlenums(actualCircuits, circuitCount, plenums) {
            // logic to delete plenums if the actual number of circuits is higher than the calculated circuit count
            let circuitsToDelete = actualCircuits - circuitCount;
            let plenumsToDelete = []
            // Sort the plenums in ascending order based on their circuit length and diminish their size by circuitsToDelete.
            plenums.sort((a, b) => a.circuit_length - b.circuit_length).forEach((plenum) => {
                if (circuitsToDelete > 0) {
                    if (plenum.size > circuitsToDelete) {
                        plenum.size -= circuitsToDelete;
                        circuitsToDelete = 0;
                    } else {
                        circuitsToDelete -= plenum.size;
                        plenumsToDelete.push(plenum.localId)
                    }
                }
            });
            return plenums.filter(plenum => !plenumsToDelete.includes(plenum.localId))
        },
        resetPlenums() {
            this.isPlenumsEdited = false;
            this.recalculateCircuitsAndPlenums();
            this.localPlenums.forEach(plenum => {
                // add plenum id to orderEdit array
                this.recordEdit(plenum.localId, false);
                plenum.isEdited = false;
            });
            this.calculateVentilationCoefficients();
            this.setPlenumDetails();
            this.updatePlenums(false);
            this.initializeGrateTypes(this.localPlenums);
            this.$nextTick(() => {
                this.$emit('reset-done');
            });
        },
        recalculateCircuitsAndPlenums(matchOldLengths = false) {
            let totalPlenums = [];
            let totalCircuits = 0;
            if (this.roomInfo.air !== 3) {
                totalCircuits = this.calculateCircuits(this.localPlenums);
                this.circuitCount = totalCircuits;
                totalPlenums = this.calculatePlenums(this.localPlenums);
            } else {
                this.airTypes.forEach(airType => {
                    let plenums = this.localPlenums.filter(plenum => plenum.air === airType.type)
                    let newCircuits = this.calculateCircuits(plenums)
                    this.circuitCount = newCircuits;
                    let newPlenums = this.calculatePlenums(plenums).map(plenum => {
                        plenum.air = airType.type;
                        return plenum
                    });
                    totalPlenums.push(...newPlenums)
                    totalCircuits += newCircuits
                });
            }
            this.circuitCount = totalCircuits;

            if (matchOldLengths) {
                this.matchAndAssignCircuitLengths(totalPlenums);
            }

            this.localPlenums = totalPlenums;
        },
        /**
         * Matches and assigns circuit lengths from old plenums to new plenums based on specified conditions.
         * Only assigns lengths that are not the default value, unless there are fewer old plenums than new ones,
         * in which case the highest valid length is used.
         *
         * @param {Array} totalPlenums - The array of new plenums where circuit lengths need to be assigned.
         */
        matchAndAssignCircuitLengths(totalPlenums) {
            let sortedOldPlenums = [...this.localPlenums];
            let highestValidCircuitLength = sortedOldPlenums.find(plenum => plenum.circuit_length !== 15)?.circuit_length || this.initialCircuitLength;

            totalPlenums.forEach((plenum, index) => {
                if (index < sortedOldPlenums.length && sortedOldPlenums[index].circuit_length !== 15) {
                    plenum.circuit_length = sortedOldPlenums[index].circuit_length;
                } else if (index >= sortedOldPlenums.length) {
                    plenum.circuit_length = highestValidCircuitLength;
                }
            });
        },
        /**
         * Records the edit of a plenum by updating its position in the editOrder array.
         * If the plenumId already exists in editOrder, it is removed and then re-added to either
         * the beginning or the end of the array based on the addToEnd parameter.
         * In debug mode, it logs the presence of plenumIds in the localPlenums array.
         *
         * @param {string} plenumId - The identifier of the plenum that has been edited.
         * @param {boolean} addToEnd - Determines whether the plenumId is added to the end (true) or the beginning (false) of the editOrder array.
         */
        recordEdit(plenumId, addToEnd) {

            // Get the index of the plenumId in localPlenums
            let index = this.localPlenums.findIndex(element =>
                element.localId === plenumId
            );

            // If the plenumId exists in editOrder, remove it.
            if (index !== -1) {
                this.editOrder.splice(index, 1);
            }

            // Add the plenumId based on addToEnd.
            if (addToEnd) {
                this.editOrder.push(plenumId);
            } else {
                this.editOrder.unshift(plenumId);
            }
            // console log id-s from editOrder which do not appear in localPlenums
            if (this.isDebug) {
                this.editOrder.forEach((id) => {
                    let foundPlenum = this.localPlenums.find(element =>
                        element.localId === id
                    );
                    if (!foundPlenum) {
                        console.log('id not found in localPlenums: ' + id);
                    } else {
                        console.log('id found in localPlenums: ' + id);
                    }
                });
            }
        },
        // method to calculate the number of circuits for each room
        // it calculates the number of circuits based on the air volume of the room
        // if the air is transfer or undefined (4, 5), it sets the number of circuits to 0
        calculateCircuits(plenums) {
            let room = this.roomInfo;
            //Room volume is divided in 2 for mixed air rooms
            let roomVolume = room.air !== 3 ? room.air_volume : room.air_volume / 2;
            let length = this.initialCircuitLength;
            let circuitCount = 0;
            if (room.air !== 4 && room.air !== 5) {
                if (this.isPlenumsEdited === true && plenums.length)

                    //Get the plenum with the highest circuit length
                    length = Math.max(...plenums.map(p => p.circuit_length))

                circuitCount = this.calculateCircuitCount(length, roomVolume)
            }
            return circuitCount;
        },
        calculateCircuitCount(length, roomVolume) {
            let possibleTubes = this.$store.state.vmcPossibleTubes;
            let circuitCount = 0;
            let valueFound = false;
            let result = 0;
            let tryAgain = true;
            for (let i = 0; i < possibleTubes.length; i++) {
                let coefficient = (roomVolume / possibleTubes[i] / 39.8) ** 2 * 5;
                result = length * coefficient;
                if (result < 40 && tryAgain) {
                    circuitCount = possibleTubes[i];
                    valueFound = true;
                    tryAgain = false;
                }
            }
            if (!valueFound && roomVolume) {
                showAlertModal(store, `Pierderea de presiune este prea mare pentru volumul de ${roomVolume} m3 și ${length} ml de tub. Pierderea este: ${result} Pa/m`, 'warning', 5000)
            }
            return circuitCount
        },
        getPlenumsActualCircuitCount(plenums) {
            return plenums.reduce((total, plenum) => total += plenum.size, 0);
        },
        getPlenumsPressureLossByAirType(air) {
            return this.localPlenums.filter(p => p.air === air).reduce((total, p) => total += p.pressureLossPerSection, 0);
        },
        pushOptimizedPlenum(circuits, sizes, plenums) {
            let sortedOptions = JSON.parse(JSON.stringify(sizes.sort((a, b) => b - a))); // descending
            // Special case for room.air === 3 (Mixed)
            sortedOptions.forEach(option => {
                let count = Math.floor(circuits / option);
                if (count > 0) {
                    if ((circuits - (count * option)) >= 0) {
                        for (let i = 0; i < count; i++) {
                            this.pushDefaultPlenum(plenums, option);
                        }
                    }
                    circuits -= count * option;
                }
            });
            return plenums;
        },
        // this method calculates the needed plenums for a room
        calculatePlenums(plenums) {
            let sizes = this.options[this.preferredType].autoSize;
            let newPlenums = [];
            let actualCircuits = this.getPlenumsActualCircuitCount(plenums);
            let circuits = this.circuitCount;

            if ((actualCircuits > this.circuitCount) && !this.reset) {
                plenums = this.deletePlenums(actualCircuits, this.circuitCount, plenums);
                this.allocateCircuitsToPlenums(plenums);
                return plenums;
            } else {
                if (this.isPlenumsEdited === true) {
                    this.allocateCircuitsToPlenums(plenums);
                    circuits = this.circuitCount - this.getPlenumsActualCircuitCount(plenums);
                }
            }

            // increase plenum size for current localPlenums if size = 1
            newPlenums = this.pushOptimizedPlenum(circuits, sizes, newPlenums);

            if (this.isPlenumsEdited === true) {
                newPlenums.unshift(...plenums);
            }

            return newPlenums;
        },
        allocateCircuitsToPlenums(plenums) {
            //sum up all the sizes of each plenum available in the room.plenums array
            let unallocatedCircuits = this.circuitCount - this.getPlenumsActualCircuitCount(plenums);
            // start with the plenum which is has the longest circuit_length
            plenums.sort((a, b) => {
                return a.circuit_length - b.circuit_length
            })
            plenums.forEach(plenum => {
                if (plenum.size === 1 && unallocatedCircuits >= 0) {
                    //Check if there is a plenum with lower circuit_length that has more circuits
                    let smallerPlenum = plenums
                        .find(p => parseFloat(p.circuit_length) < parseFloat(plenum.circuit_length) && p.size >= 2)
                    //If there are still unallocated circuits use them
                    if (unallocatedCircuits > 0) {
                        plenum.size++;
                        unallocatedCircuits--;
                        //Else, take a circuit from the plenum with the least circuit_length and allocate it
                    } else if (smallerPlenum && unallocatedCircuits === 0) {
                        plenum.size++;
                        smallerPlenum.size--;
                    }
                }
            });
        },
        // this method adds a default plenum to the top of the plenums array
        pushDefaultPlenum(plenums, size) {
            plenums.unshift({
                localId: uuidv4(),
                type: this.previousPlenumType ? this.previousPlenumType : this.options[this.preferredType].type,
                name: this.options[this.preferredType].name,
                shortName: this.options[this.preferredType].shortName,
                circuit_length: this.initialCircuitLength,
                air: this.roomInfo.air !== 3 ? this.roomInfo.air : 1,
                grate: this.previousPlenumGrate ? this.previousPlenumGrate : this.plenumGrateMapping[this.options[this.preferredType].type].defaultGrate,
                count: 1,
                size: size,
            });
        },
        initializeGrateTypes(plenums) {
            plenums.forEach((plenum) => {
                if (!plenum.grate) {
                    // Get the mapping object for this plenum type
                    let mapping = this.plenumGrateMapping[plenum.type];

                    // Check if the mapping exists for this plenum type
                    if (mapping) {
                        // Set the .grate property of the plenum to the defaultGrate property
                        // in the matching plenumGrateMapping object
                        plenum.grate = mapping.defaultGrate;
                    } else {
                        // Handle the case where there is no mapping for this plenum type
                        // For example, you can set plenum.grate to a default value or log an error message
                        console.warn(`No grate mapping found for plenum type: ${plenum.type}`);
                    }
                }
                return plenum;
            });
            return plenums;
        },
        /**
         * Prepares for showing a change dialog by setting up previous and future values based on the specified property.
         * For a 'type' change, it assigns the old and new values to component state properties, updates the future values' grate field
         * based on the default grate for its plenum type, and sets a flag to show the type change dialog.
         * For a 'grate' change, it assigns old and new grate values and sets a flag to show the grate change dialog.
         *
         * @param {Object} oldVal - The old values, typically representing the current state before a change.
         * @param {Object} newVal - The new values, representing the state after a change.
         * @param {string} property - The property that is changing, either 'type' or 'grate', determining which dialog to show.
         */
        revealChangeDialog(oldVal, newVal, property) {
            switch (property) {
                case 'type':
                    this.showChangeGrateDialog = false;
                    this.previousValues = oldVal;
                    this.futureValues = newVal;
                    // Automatically assign a default grate when the plenum type changes
                    this.futureValues.columns.grate = this.plenumGrateMapping[this.futureValues.columns.type].defaultGrate;
                    this.showChangeDialog = true;
                    break;
                case 'grate':
                    this.showChangeDialog = false;
                    this.previousValues = oldVal;
                    this.futureValues = newVal;
                    // Grate changes do not require auto-assignment of default values
                    this.showChangeGrateDialog = true;
                    break;
            }
        },
        /**
         * Filters grate types based on the given plenum type and updates the local plenums accordingly.
         * It finds the plenum in the localPlenums array by matching the localId, and then updates its type.
         * Additionally, if the plenum type has changed, it sets the grate to a default value based on the new type.
         * This function also updates other relevant details about the plenum.
         *
         * @param {string} plenumType - The type of the plenum to filter for.
         * @param {Object} plenum - The plenum object, typically containing properties like localId.
         * @param {boolean} [changedType=false] - Indicates whether the plenum type has changed, defaults to false.
         */
        filterGrateTypes(item, changedType = false) {
            let plenum = item.raw;
            let plenumType = item.columns.type;
            let foundPlenumIndex = this.localPlenums.findIndex(element =>
                element.localId === plenum.localId
            );
            if (foundPlenumIndex !== -1) {
                this.localPlenums[foundPlenumIndex].type = plenumType;

                let mapping = this.plenumGrateMapping[plenumType];
                if (mapping) {
                    this.grateTypes = mapping.grateTypes;
                    if (changedType) {
                        this.localPlenums[foundPlenumIndex].grate = mapping.defaultGrate;
                    }
                }
                this.setPreferredType(plenumType);
                this.setPlenumDetails();
            }
        },
        formatNumber,
        calculateRoomFlow(plenum) {
            if (this.roomInfo.air !== 3)
                return this.roomFlow
            let plenumAirTypeCircuits = this.localPlenums.filter(p => p.air === plenum.air).reduce((acc, p) => acc += p.size, 0);
            return this.roomInfo.air_volume / 2 / plenumAirTypeCircuits;
        },
        calculateRoomAirSpeed(plenum) {
            return this.calculateRoomFlow(plenum) / this.airSpeedConstant
        },
        /**
         * Calculates ventilation coefficients for each plenum in `localPlenums`.
         * This method updates each plenum with its flow, air speed, and various pressure losses.
         * The calculation depends on several factors including room flow, plenum size,
         * maximum flow rate through a 77 tube, and pressure loss in a 77 tube.
         * The method assumes `calculateRoomFlow`, `calculateRoomAirSpeed`, and `roomInfo` are
         * defined in the context.
         *
         * @param {Object[]} localPlenums - An array of plenum objects to be processed.
         * Each plenum object should have `size`, `circuit_length`, and other properties.
         */
        calculateVentilationCoefficients() {
            this.localPlenums.forEach(plenum => {
                plenum.flow = (this.calculateRoomFlow(plenum) * plenum.size).toFixed(2);
                plenum.airSpeed = this.calculateRoomAirSpeed(plenum);
                plenum.pressureLossPerLength = (plenum.flow / plenum.size / maxFlow77Tube) ** 2 * pressureLoss77Tube * parseFloat(plenum.circuit_length);
                plenum.pressureLossPerGrill = this.roomInfo.air_volume > 30 ? Math.max(0, plenum.flow * 0.3643 - 8.7143) : 0;
                plenum.pressureLossPerPlenum = (142.37 - Math.sqrt(20269.2169 - Math.pow(plenum.flow, 2))) * 0.42;
                plenum.pressureLossPerSection = plenum.pressureLossPerLength + plenum.pressureLossPerGrill + plenum.pressureLossPerPlenum
            });
        },
        roundToTwoDecimals(number) {
            if (Number.isInteger(number)) {
                // If the number is an integer, return it as is
                return number;
            } else {
                // Else, convert the number to a string with 2 decimal places,
                // and then convert it back to a number
                return parseFloat(number.toFixed(2));
            }
        },
        /**
         * Sets the preferred type based on the provided type parameter.
         *
         * @param {number} type - The type to be set as preferred, will be decremented before setting.
         */
        setPreferredType(type) {
            type = type - 1;
            // make sure that type is within the bounds of the options array length (0 to options.length - 1) and that type is a number
            if (type >= 0 && type < this.options.length && !isNaN(type)) {
                this.preferredType = type;
            } else {
                console.warn('Invalid type provided to setPreferredType: ' + type);
            }
            this.preferredType = type;
        },
        /**
         * Adds a new plenum to the `localPlenums` array, which is a reactive data property of the component.
         * This method creates a new plenum with default properties and
         * pushes it to the `localPlenums` array. The new plenum includes a unique `localId`, default `size`,
         * `count`, `name`, `shortName` (derived from `options`), `type`, `air` (based on `roomInfo`),
         * `grate`, and `circuit_length`. After adding the new plenum, the method calls `recordEdit`,
         * `calculateVentilationCoefficients`, `setPlenumDetails`, and `updatePlenums` to update the component's
         * state and recalculate relevant data. This method is typically used to handle user actions for adding
         * new plenums in the UI.
         *
         * @returns {void} Does not return a value but updates the component's state and potentially triggers re-render.
         */
        addPlenum() {
            // Add a new plenum with size of 1
            this.localPlenums.push({
                localId: uuidv4(),
                item: {},
                size: 1,
                count: 1,
                name: this.options[this.preferredType].name,
                shortName: this.options[this.preferredType].shortName,
                type: this.options[this.preferredType].type,
                air: this.roomInfo.air !== 3 ? this.roomInfo.air : 1,
                grate: this.plenumGrateMapping[this.options[this.preferredType].type].defaultGrate,
                circuit_length: 15,
            });
            this.recordEdit(this.localPlenums[this.localPlenums.length - 1].localId, false);
            this.calculateVentilationCoefficients();
            this.setPlenumDetails();
            this.updatePlenums(true);
        },
        /**
         * Updates a specified field for a plenum in the localPlenums array.
         * If the field value has changed, it marks the plenum as edited and triggers additional updates and recalculations.
         * For numeric fields, it checks and converts the value to a number if necessary.
         * The method also handles specific updates if the changed field is 'type' or 'size' or 'air'.
         *
         * @param {Object} item - The item containing the new field value and the corresponding plenum's localId.
         * @param {string} field - The field in the plenum to be updated.
         * @param {boolean} isNumber - Indicates whether the field value should be treated as a number.
         */
        updateField(item, field, isNumber) {
            let valueHasChanged = false;
            let previousValue;
            this.localPlenums.forEach((plenum) => {

                if (plenum.localId === item.raw.localId) {
                    previousValue = JSON.parse(JSON.stringify(plenum));
                    if (plenum.isEdited !== undefined) {
                        plenum.isEdited = true;
                    }
                    if (isNumber) {
                        valueHasChanged = plenum[field].toString() !== item.columns[field].toString();
                        let value = item.columns[field];
                        // check if value is a number
                        if (isNaN(value)) {
                            value = parseFloat(value);
                        }
                        plenum[field] = roundToTwo(value);
                    } else {
                        valueHasChanged = plenum[field]?.toString() !== item.columns[field]?.toString();
                        plenum[field] = item.columns[field];
                    }
                    if (valueHasChanged) {
                        this.recordEdit(plenum.localId, true);
                    }
                }
            });
            if (valueHasChanged && field === 'type') {
                this.filterGrateTypes(item, true);
                this.revealChangeDialog(previousValue, item, 'type');
            } else if (valueHasChanged && field === 'grate') {
                this.revealChangeDialog(previousValue, item, 'grate');
            } else if (valueHasChanged && (field === 'size' || field === 'air')) {
                this.calculateVentilationCoefficients();
            } else if (valueHasChanged) {
                this.isPlenumsEdited = true;
                this.recalculateCircuitsAndPlenums();
                this.calculateVentilationCoefficients();
                this.setPlenumDetails();
            }
            this.updatePlenums(valueHasChanged);
        },
        /**
         * Prepares and emits data to update plenums and their circuit count.
         * It constructs an item object containing the current room ID, local plenums,
         * and the actual circuit count, and then emits two events,
         * 'update-plenums' and 'update-circuit-count', with this item as the payload.
         */
        updatePlenums(isNewVersionRequired) {
            let item = {columns: {}, raw: {}};
            item.value = this.roomId;
            item.columns.air_volume = this.room.columns.air_volume;
            item.raw.air_volume = this.room.columns.air_volume;
            item.columns.plenums = this.localPlenums;
            item.columns.circuit_no_VMC = this.actualCircuits;
            item.isNewVersionRequired = isNewVersionRequired;
            this.$emit('update-plenums', item);
            this.$emit('update-circuit-count', item);
        },
        availableSizes(type) {
            if (!type) return [];
            const selectedItem = this.options.find((item) => item.type === Number(type));
            return selectedItem ? selectedItem.sizes : [];
        },
        removePlenum(index) {
            let plenumIndex = this.localPlenums.findIndex(element =>
                element.localId === index
            );
            // Remove the plenum at the given index
            this.localPlenums.splice(plenumIndex, 1);
            // impossible to remove a plenum if recalculation happens every time a plenum is removed
            //this.recalculateCircuitsAndPlenums();
            this.calculateVentilationCoefficients();
            this.setPlenumDetails();
            this.updatePlenums(true);
        },
        openDialog() {
            this.initializeGrateTypes(this.localPlenums);
            this.calculateVentilationCoefficients(this.roomInfo);
            this.setPlenumDetails();
            this.updatePlenums(false);
            this.dialog = true;
        },
        closeDialog() {
            this.dialog = false;
        },
        expandAllPlenumRows() {
            for (let key in this.$refs) {
                if (key.includes('expand') && this.$refs[key]?.$el)
                    this.$refs[key].$el.click();
            }
        },
        getAirTypeByValue(air) {
            return this.airTypes.find(airType => airType.type === air);
        },
        /**
         * Iterates over the `localPlenums` array, a reactive data property of the component, and updates each plenum's details.
         * This method assigns a unique identifier (`localId`) to each plenum using `uuidv4`. It then sets the `shortName` and `name`
         * for each plenum based on its `type`. This is done by matching the `type` with items in the `options` array, another
         * reactive property of the component. If a `short_name` is present in a plenum, it is used as the `shortName` and then removed.
         * This method is typically called when the component needs to update the details of plenums, potentially in response
         * to changes in `localPlenums` or `options`.
         *
         * @returns {void} This method does not return a value but updates the component's state.
         */
        setPlenumDetails() {
            this.localPlenums.forEach(
                // set the shortName based on the type of the plenum
                (plenum) => {
                    plenum.localId = uuidv4();
                    if (plenum.type) {
                        const selectedItem = this.options.find(
                            (item) => {
                                return item.type === Number(plenum.type);
                            });
                        plenum.shortName = plenum.short_name ? plenum.short_name : selectedItem.shortName;
                        plenum.name = selectedItem.name;
                        if (plenum.short_name) {
                            delete plenum.short_name;
                        }
                    }
                }
            )
        },
    },
    watch: {
        'room.columns.air_volume': {
            handler: function (newV, oldV) {
                if (newV !== oldV) {
                    this.roomInfo = JSON.parse(JSON.stringify(this.room.raw));
                    this.localPlenums = JSON.parse(JSON.stringify(this.room.raw.plenums));
                    this.recalculateCircuitsAndPlenums(true);
                    this.calculateVentilationCoefficients();
                    this.setPlenumDetails();
                    this.updatePlenums(false);
                }
            },
            deep: true
        },
        'room.columns.air': {
            handler: function (newV, oldV) {
                if (newV !== oldV) {
                    this.roomInfo = JSON.parse(JSON.stringify(this.room.raw));
                    this.resetPlenums()
                }
            },
            deep: true
        },
        reset: {
            handler: function (newV) {
                if (newV === true) {
                    this.resetPlenums();
                }
            },
            deep: true
        }
    },
};
</script>
<style scoped>
.suffix-color .v-input__control .v-field .v-field__field .v-text-field__suffix {
    color: rgb(251, 140, 0); /* Or whatever color you desire */
}

.text-right * {
    text-align: right;
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