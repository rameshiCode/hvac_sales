<template>
    <v-card class="mt-2"
    >
        <v-toolbar title="Detalii camere">
            <v-btn
            > Grupare
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item append-icon="mdi-weather-windy"
                                     @click="changeGroupingProperty('air')"
                        >
                            <v-list-item-title>Tip Aer</v-list-item-title>
                        </v-list-item>
                        <v-list-item append-icon="mdi-floor-plan"
                                     @click="changeGroupingProperty('floor')"
                        >
                            <v-list-item-title>Etaj</v-list-item-title>
                        </v-list-item>
                        <v-list-item append-icon="mdi-cancel"
                                     @click="changeGroupingProperty('')"
                        >
                            <v-list-item-title>Negrupat</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-btn icon
                   @click="addRoom()"
            >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent"
                           location="top"
                >
                    Adaugă cameră
                </v-tooltip>
            </v-btn>
            <v-btn v-if="isNewVersionRequired"
                   icon
                   @click="setDescriptionDialogTrue()"
            >
                <v-icon>mdi-content-save-plus-outline</v-icon>
                <v-tooltip activator="parent"
                           location="top"
                >
                    Salvează versiune nouă
                </v-tooltip>
            </v-btn>
            <v-btn v-else
                   icon
                   @click="saveLocation()"
            >
                <v-icon>mdi-content-save-edit-outline</v-icon>
                <v-tooltip activator="parent"
                           location="top"
                >
                    Salvează locație
                </v-tooltip>
            </v-btn>
            <v-dialog
                v-model="descriptionDialog"
                width="600px"
            >
                <v-card>
                    <v-card-title>
                        Descriere modificare
                    </v-card-title>
                    <v-card-text>
                        <v-textarea v-model="change_description" label="Descriere schimbare"></v-textarea>
                    </v-card-text>
                    <v-card-actions class="justify-content-between">
                        <v-btn @click="setDescriptionDialogFalse"
                               variant="elevated"
                        >Anulează
                        </v-btn>
                        <v-btn @click="saveLocation()"
                               variant="elevated"
                        >Salvează
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-btn icon

            >
                <v-icon>
                    mdi-restart-alert
                </v-icon>
                <v-tooltip activator="parent"
                           location="top"
                >
                    Resetează camerele
                </v-tooltip>
                <!-- A dialog to explain that resetting all rooms will remove any manual changes and add a confirmation and cancel button to it-->
                <v-dialog v-model="resetDialog"
                          width="600px"
                          activator="parent"
                >
                    <v-card>
                        <v-toolbar>
                            <v-toolbar-title>
                                Resetează camerele
                            </v-toolbar-title>
                        </v-toolbar>

                        <v-card-text>
                            <p>Resetează camerele la valorile inițiale. Toate modificările manuale vor fi pierdute.</p>
                            <p>Resetează camerele?</p>
                        </v-card-text>
                        <v-card-actions class="justify-content-between">
                            <v-btn @click="resetDialog = false"
                                   variant="elevated"

                            >Anulează
                            </v-btn>
                            <v-btn @click="resetAndRecalculateAllRooms()"
                                   variant="elevated"
                                   color="danger"
                            >Resetează
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-btn>
        </v-toolbar>
        <v-data-table :headers="vHeaders"
                      :items="rooms"
                      class="elevation-1"
                      item-key="localId"
                      item-value="localId"
                      items-per-page="-1"
                      :group-by="groupBy"
                      show-expand
        >
            <template v-slot:[`item.data-table-expand`]="{toggleExpand, isExpanded, item}">
                <td v-if="item.selectable.air === 3">
                    <v-icon @click="()=>{toggleExpand(item)}">
                        {{ isExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                </td>
            </template>
            <template v-slot:expanded-row="{ columns, item}">
                <RoomExpandedRow
                    v-for="airType in airTypes.filter(airType=> item.selectable.plenums.map(p=> p.air).includes(airType.value))"
                    :key="airType.value"
                    :columns="columns"
                    :item="parseExpandedRoomObject(item.selectable, airType)">
                </RoomExpandedRow>
            </template>
            <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
                <tr>
                    <td :colspan="columns.length">
                        <v-btn
                            :ref="'expandButton' + item.value"
                            size="small"
                            variant="text"
                            :icon="isGroupOpen(item) ? '$expand' : '$next'"
                            @click="toggleGroup(item)"
                        ></v-btn>
                        {{ getGroupName(item.value) + ' (' + item.items.length + ')' }}
                    </td>
                </tr>
            </template>
            <template v-if="this.userPermissions.canExcludeRoom" v-slot:[`item.isExcludedFromAdjust`]="{ item }">
                <v-checkbox
                    v-model="item.columns.isExcludedFromAdjust"
                    @update:modelValue="setRoomExcludedAdjustProperty(item.raw)"
                    color="success"
                    hide-details
                >
                    <v-tooltip
                        activator="parent"
                        location="top"
                    >
                        Bifarea acestei casute v-a exclude camera din <br/>
                        calcularea valorilor ajustate ale camerelor.
                    </v-tooltip>
                </v-checkbox>
            </template>
            <template v-slot:[`item.name`]="{ item }">
                <v-text-field :ref="'roomName' + item.value"
                              v-model="item.columns.name"
                              hide-details
                              :class="getTextColor(item)"
                              :variant="item.columns.name === '' ? 'underlined' : 'plain'"
                              density="compact"
                              @blur="updateField(item, 'name', false, false)"
                              @keyup.enter="updateField(item, 'name', false, false)"
                ></v-text-field>
            </template>
            <template v-slot:[`item.floor_name`]="{ item }">
                <v-select v-model="item.columns.floor_name"
                          variant="underlined"
                          hide-details
                          :class="getTextColor(item)"
                          density="compact"
                          :items="floors"
                          item-title="name"
                          item-value="name"
                          @update:modelValue="updateFloorValue(item)"
                >
                </v-select>
            </template>
            <template v-slot:[`item.air`]="{ item }">
                <v-select v-model="item.columns.air"
                          hide-details
                          :class="getTextColor(item)"
                          :variant="item.columns.air === 5 ? 'underlined' : 'plain'"
                          density="compact"
                          :items="airTypes"
                          item-title="name"
                          item-value="value"
                          @update:modelValue="updateField(item, 'air', false, true)"
                >
                </v-select>
            </template>
            <template v-slot:[`item.area.sq_m`]="{ item }">
                <v-text-field :ref="'roomArea' + item.value"
                              type="number"
                              v-model="item.columns['area.sq_m']"
                              variant="underlined"
                              density="compact"
                              :class="'text-right no-arrows ' + getTextColor(item)"
                              hide-details
                              @focus="$event.target.select()"
                              @keyup.enter="updateField(item, 'area', true, true)"
                              @blur="updateField(item, 'area', true, true)"
                              @keydown.tab.prevent=" handleTab(item, 'area')"
                >
                    <template v-slot:append>
                        <span :class="getTextColor(item)"
                        >m²</span>
                    </template>
                </v-text-field>
            </template>
            <template v-slot:[`item.height`]="{ item }">
                <v-text-field type="number"
                              hide-details
                              v-model="item.columns.height"
                              variant="plain"
                              density="compact"
                              class="text-right no-arrows"
                              :class="item.columns.height !== 250 ? 'text-warning' : '' + getTextColor(item)"
                              @focus="$event.target.select()"
                              @blur="updateField(item, 'height', true, true)"
                              @keyup.enter="updateField(item, 'height', true, true)"
                >
                    <template v-slot:append>
                        <span :class="getTextColor(item)"
                        >cm</span>
                    </template>
                </v-text-field>
            </template>
            <template v-slot:[`item.air_volume`]="{ item, index }">
                <v-text-field type="text"
                              :disabled="item.columns.air === 4 || item.columns.isExcludedFromAdjust"
                              hide-details
                              :value="tempInputValue[index] || this.formatNumber(this, item.columns.air_volume, false)"
                              variant="plain"
                              density="compact"
                              class="text-right no-arrows"
                              :class="item.raw.is_air_volume_edited ? 'text-warning' : '' + getTextColor(item)"
                              @input="tempInputValue[index] = $event.target.value"
                              @focus="$event.target.select()"
                              @change="item.raw.is_air_volume_edited = true"
                              @blur="processInput(item, 'air_volume', index)"
                              @keyup.enter="processInput(item, 'air_volume', index)"
                >
                    <v-tooltip v-if="item.selectable.is_air_volume_edited && item.selectable.adjusted_volume > 0"
                               activator="parent"
                               location="top">
                        {{ 'Volumul calculat: ' + item.selectable.adjusted_volume + 'm³' }}
                    </v-tooltip>
                    <template v-slot:append>
                        <span :class="getTextColor(item)"
                        >m³</span>
                    </template>
                </v-text-field>
            </template>
            <template v-slot:[`item.airExchangeCycles`]="{ item }">
                <v-tooltip v-if="item.selectable.hasError"
                           activator="parent"
                           location="top">
                    Atenție! Numărul de schimburi de aer pe această cameră este mai mare decât limita de 2,5!
                </v-tooltip>
                <v-expand-transition>
                    <v-icon v-if="item.selectable.hasError" color="danger" size="x-small">mdi-alert</v-icon>
                </v-expand-transition>
                <span :class="item.selectable.hasError ? ' text-danger' : ''">
                    {{ item.columns.airExchangeCycles }}
                </span>
            </template>
            <template v-slot:[`item.circuit_no_VMC`]="{ item }"
            >
                <span :class="getTextColor(item)"
                      v-if="item.columns.air !== 4 && !item.columns.isExcludedFromAdjust">{{
                        item.columns.circuit_no_VMC
                    }}</span>
            </template>
            <template v-slot:[`item.plenums`]="{ item }">
                <PlenumSelector
                    :ref="'plenum_' + item.value"
                    v-if="(item.columns.air !== 4 && item.columns.air_volume > 0 && !item.columns.isExcludedFromAdjust)"
                    :color="item.raw.is_plenums_edited ? 'text-warning' : getTextColor(item)"
                    :room="item"
                    :reset="item.raw.resetPlenums"
                    :previous-plenum-type="previousPlenumType"
                    :previous-plenum-grate="previousPlenumGrate"
                    :hide-plenum-type-change-dialog="hidePlenumTypeChangeDialog"
                    :hide-delay-minutes="hideDelayMinutes"
                    @update-plenums="updateField($event, 'plenums', false, true)"
                    @update-circuit-count="updateField($event, 'circuit_no_VMC', false, true)"
                    @reset-done="item.raw.resetPlenums = false"
                    @change-plenum-type-or-grate="handleChangePlenumTypeOrGrate($event)"
                    @request-hide-plenum-type-change-dialog="hidePlenumTypeChangeDialog = true"
                >
                </PlenumSelector>
            </template>
            <template v-slot:[`item.pressureLossPerRoom`]="{ item }">
                <span v-if="item.columns.air !== 4 && !item.columns.isExcludedFromAdjust"
                      :style="{fontWeight:550, color:getPressureLossColor(item.raw)}"
                >{{ roundToTwo(this.roomPressureLoss(item.columns.plenums)) + ' Pa' }} </span>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon
                       variant="plain"
                >
                    <v-icon color="primary"
                    >
                        mdi-dots-vertical
                    </v-icon>
                    <v-menu activator="parent">
                        <v-list>
                            <v-list-item @click="deleteRoom(item.value)"
                            >
                                <v-list-item-title>Șterge cameră</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="resetAndRecalculateRoom(item.value)">
                                <v-list-item-title>Resetează valori</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>
            </template>
            <template v-slot:bottom>
                <v-toolbar v-for="group in getFloorGroupValues" :key="group.floorGroupId"
                           :title="`Totaluri ${group.floorGroupId ? getFloorGroupFloorNames(group.floorGroupId)  : 'Nealocate'}: `">
                    <v-chip color="black"
                            text-color="white"
                            class="ma-2"
                            size="large"
                            variant="outlined"
                    >
                        Suprafață: {{ formatNumber(this, group.roomsTotalArea, false) }} m<sup>2</sup>
                    </v-chip>
                    <v-chip color="black"
                            text-color="white"
                            class="ma-2"
                            size="large"
                            variant="outlined"
                    >
                        Volum aer total: {{ formatNumber(this, group?.roomsTotalAirVolume, false) }} m<sup>3</sup>
                        <v-tooltip
                            v-if="totalInitialAirVolume !== group?.roomsTotalAirVolume"
                            activator="parent"
                            location="top"
                        >{{
                                'Total aer inițial: ' + formatNumber(this, group.roomsTotalAirVolumeInitial, false) + ' m³'
                            }}
                        </v-tooltip>
                    </v-chip>
                    <v-chip color="blue"
                            text-color="black"
                            class="ma-2"
                            variant="outlined"
                            size="large"

                    >
                        Proaspăt: {{ formatNumber(this, group?.roomsTotalAirVolumeGood, false) }} m<sup>3</sup>
                        <v-tooltip
                            v-if="goodAirInitialTotal > 0"
                            activator="parent"
                            location="top"
                        >{{
                                'Total aer proaspăt inițial: ' + formatNumber(this, group.roomsTotalAirVolumeGoodInitial, false) + ' m³'
                            }}
                        </v-tooltip>
                    </v-chip>
                    <v-chip v-if="group.totalPoorGoodDifference > 1"
                            class="ma-2"
                            color="danger"
                            text-color="danger"
                            variant=outlined
                    >
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >
                            Diferența între volumul de aer viciat și cel de aer proaspăt este de
                            {{ formatNumber(this, group?.totalPoorGoodDifference, false) }} m³!
                        </v-tooltip>
                        {{ formatNumber(this, group?.totalPoorGoodDifference, false) }} m³
                        <v-icon>mdi-fan-alert</v-icon>
                    </v-chip>
                    <div v-else>
                        <v-icon color="success">
                            mdi-fan
                        </v-icon>
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >
                            Diferența între volumul de aer viciat și cel de aer proaspăt nu este semnificativă!
                        </v-tooltip>
                    </div>

                    <v-chip color="danger"
                            text-color="black"
                            class="ma-2" size="large"
                            variant="outlined"

                    >
                        Viciat: {{ formatNumber(this, group?.roomsTotalAirVolumePoor, false) }} m<sup>3</sup>
                        <v-tooltip
                            v-if="poorAirInitialTotal > 0"
                            activator="parent"
                            location="top"
                        >{{
                                'Total aer viciat initial: ' + formatNumber(this, group.roomsTotalAirVolumePoorInitial, false) + ' m³'
                            }}
                        </v-tooltip>
                    </v-chip>
                    <v-chip color="black"
                            text-color="white"
                            class="ma-2" size="large"
                            variant="outlined"
                    >
                        Plenumuri: <span v-for="(sum, index) in group.roomsTotalPlenums"
                                         :key="index">{{ sum.shortName }}{{ sum.size }}({{
                            sum.count
                        }})</span>
                    </v-chip>
                </v-toolbar>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import {VDataTable} from "vuetify/lib/labs/VDataTable";
import {v4 as uuidv4} from 'uuid';
import PlenumSelector from "@/components/offer/PlenumSelector.vue";
import {formatNumber, getTextScaleColor, roundToTwo} from "@/utils/utils";
import RoomExpandedRow from "@/components/offer/RoomExpandedRow.vue";
import {mapGetters} from "vuex";

export default {
    name: "RoomsDetails",
    components: {
        PlenumSelector,
        VDataTable,
        RoomExpandedRow,
    },
    props: {
        location: {
            type: Object,
            required: true
        },
        floorGroups: {
            type: Array,
        },
        initialLocation: {
            type: Object,
        }
    },
    emits: ['save-location', 'update-location', 'pressure-loss-updated', 'total-air-volume-updated', 'updated-floor-groups-values', 'delete-unit-model'],
    data() {
        return {
            isDebug: false,
            resetDialog: false,
            resetPlenums: false,
            roomsTotalPlenums: null,
            newRoomId: null,
            hideDelayMinutes: 5,
            hidePlenumTypeChangeDialog: false,
            plenumsDialog: false,
            plenumOptions: [
                {type: 1, name: "Modular", sizes: [1, 2], shortName: "MO"},
                {type: 2, name: "Metalic spate", sizes: [1, 2], shortName: "MS"},
                {type: 3, name: "Metalic lateral", sizes: [1, 2], shortName: "ML"},
                {type: 4, name: "Design spate", sizes: [1, 2], shortName: "DS"},
                {type: 5, name: "Design lateral", sizes: [1, 2], shortName: "DL"},
                {type: 6, name: "Dublu tavan modular", sizes: [1, 2], shortName: "TMO"},
                {type: 7, name: "Dublu tavan metalic", sizes: [1, 2], shortName: "TME"},
            ],
            floors: [
                {name: 'Demisol', value: 1},
                {name: 'Parter', value: 2},
                {name: 'Mansardă', value: 3},
                {name: 'Nivel 1', value: 4},
                {name: 'Nivel 2', value: 5},
                {name: 'Nivel 3', value: 6},
                {name: 'Nivel 4', value: 7},
                {name: 'Nivel 5', value: 8},
                {name: 'Nivel 6', value: 9},
                {name: 'Nivel 7', value: 10},
                {name: 'Nivel 8', value: 11},
                {name: 'Nivel 9', value: 12},
                {name: 'Nivel 10', value: 13},
                {name: 'Nivel 11', value: 14},
                {name: 'Nivel 12', value: 15},
                {name: 'Nivel 13', value: 16},
                {name: 'Nivel 14', value: 17},
                {name: 'Nivel 15', value: 18},
                {name: 'Nivel 16', value: 19},

                // Add more floors if necessary
            ],
            descriptionDialog: false,
            description: null,
            change_description: null,
            rooms: null,
            uuid: uuidv4(),
            activeTab: 'floor',
            activeDialog: null,
            activeCard: 'table',
            exchangeCoefficient: 0.5,
            roomsTotalAirVolumeInitial: 0,
            roomsTotalAirVolumeGoodInitial: 0,
            roomsTotalAirVolumePoorInitial: 0,
            roomsTotalAirVolumePoor: 0,
            roomsTotalAirVolumeGood: 0,
            roomsTotalAirVolume: 0,
            totalPoorGoodDifference: 0,
            roomsByAirType: [],
            roomsTotalArea: 0,
            airTypes: [
                {name: 'Proaspăt', value: 1},
                {name: 'Viciat', value: 2},
                {name: 'Mixt', value: 3},
                {name: 'Transfer', value: 4},
                {name: 'Nedefinit', value: 5},
            ],
            groupBy: [{key: ''}],
            roomHeaders: [
                {
                    text: 'Denumire',
                    formatting: 'col-3'
                },
                {
                    text: 'Nivel',
                    formatting: 'col-2'
                },
                {
                    text: 'Tip aer',
                    formatting: 'col-2'
                },
                {
                    text: 'Suprafață',
                    formatting: 'col-2'
                },
                {
                    text: 'Volum aer',
                    formatting: 'col-2'
                },
                {
                    text: 'Circuite',
                    formatting: 'col-2'
                },
                {
                    text: 'Plenumuri',
                    formatting: 'col-3'
                },
                {
                    text: 'Pierdere Presiune',
                    formatting: 'col-2'
                },
                {
                    text: '',
                    formatting: 'col-1'
                }
            ],
            totalPressureLoss: null,
            floorGroupsValues: [],
            isDescriptionNeeded: false,
            tempInputValue: {},
            isRoomAreaChanged: false,
            previousPlenumType: null,
            previousPlenumGrate: null,
        }
    },
    async created() {
        if (this.isDebug) {
            console.log('created')
        }
        this.rooms = JSON.parse(JSON.stringify(this.location.rooms));
        this.change_description = this.location.change_description;
        this.description = this.location.description;
        this.setupRooms();
        this.recalculateRooms(false);
        this.groupBy[0].key = await this.getPreferredGrouping(this.location)
        this.changeGroupingProperty(this.groupBy[0].key)
        this.toggleAll();
    },
    computed: {
        ...mapGetters(['userPermissions']),
        vHeaders() {
            const headers = [
                {title: 'Denumire', align: 'start', key: 'name'},
                {title: 'Nivel', align: 'start', key: 'floor_name'},
                {title: 'Tip aer', align: 'center', key: 'air', isExpandable: true},
                {title: 'Suprafață', align: 'end', key: 'area.sq_m'},
                {title: 'Înălțime', align: 'end', key: 'height'},
                {title: 'Volum aer', align: 'end', key: 'air_volume', isExpandable: true},
                {title: 'Nr. de schimburi', align: 'end', key: 'airExchangeCycles', isExpandable: true},
                {title: 'Circuite', align: 'center', key: 'circuit_no_VMC', isExpandable: true},
                {title: 'Plenumuri', align: 'center', key: 'plenums', sortable: false, isExpandable: true},
                {title: 'Pierdere Presiune', align: 'center', key: 'pressureLossPerRoom', isExpandable: true},
                {title: '', align: 'center', key: 'actions', sortable: false},
            ];

            // If the user is a superuser, add the 'Ajustare' header to the beginning
            if (this.userPermissions.canExcludeRoom) {
                headers.unshift({title: 'Ajustare', align: 'start', key: 'isExcludedFromAdjust'});
            }

            return headers;
        },
        /**
         * Determines if a new version of the room data is required.
         *
         * This method evaluates whether any room in the `rooms` array requires a new description,
         * indicating a need for a new version. It uses the `some` method to check if any room meets
         * this criterion by having `isDescriptionNeeded` set to true and also passing the
         * `checkIsNewVersionRequired` condition. Additionally, it checks if the `location.rooms`
         * array is empty, in which case a new version is deemed unnecessary.
         *
         * @returns {boolean} True if a new version is required, false otherwise.
         */
        isNewVersionRequired() {
            let isRequired = this.rooms.some(room => room.isDescriptionNeeded && this.checkIsNewVersionRequired());
            if (this.location.rooms.length < 1) {
                isRequired = false;
            }
            return isRequired;
        },
        /**
         * Calculates the total volume of poor air across all rooms.
         *
         * This method sums up the volume of poor air in each room contained in the `rooms` array.
         * It takes into account whether the air volume for each room has been edited or not.
         * If a room's air volume hasn't been edited, `air_volume_poor` is added to the total.
         * If a room's air volume has been edited, `adjusted_volume_poor` is used instead.
         *
         * @returns {number} The total volume of poor air across all rooms.
         */
        poorAirInitialTotal() {
            let totalPoorVolume = 0;
            this.rooms.forEach((room) => {
                if (!room.is_air_volume_edited) {
                    totalPoorVolume += room.air_volume_poor
                } else {
                    totalPoorVolume += room.adjusted_volume_poor
                }
            });
            return totalPoorVolume;
        },
        /**
         * Calculates the total volume of good air across all rooms.
         *
         * This method iterates over the `rooms` array and accumulates the total volume of good air.
         * It distinguishes between rooms where the air volume has been edited and those where it hasn't.
         * For rooms without edited air volume, `air_volume_good` is used in the calculation.
         * For rooms with edited air volume, `adjusted_volume_good` is used instead.
         *
         * @returns {number} The total volume of good air across all rooms.
         */
        goodAirInitialTotal() {
            let totalGoodVolume = 0;
            this.rooms.forEach((room) => {
                if (!room.is_air_volume_edited) {
                    totalGoodVolume += room.air_volume_good
                } else {
                    totalGoodVolume += room.adjusted_volume_good
                }
            });
            return totalGoodVolume;
        },
        /**
         * Calculates the total initial air volume across all rooms.
         *
         * This method iterates over each room in the `rooms` array and adds up the air volume.
         * It checks whether the air volume for each room has been manually edited.
         * If the air volume has not been edited (`is_air_volume_edited` is false), the original `air_volume` is added to the total.
         * If the air volume has been edited, the `adjusted_volume` is used instead.
         * This provides a cumulative measure of the initial air volume across all rooms.
         *
         * @returns {number} The total initial air volume across all rooms.
         */
        totalInitialAirVolume() {
            let totalVolume = 0;
            this.rooms.forEach((room) => {
                if (!room.is_air_volume_edited) {
                    totalVolume += room.air_volume
                } else {
                    totalVolume += room.adjusted_volume
                }
            });
            return totalVolume;
        },
        /**
         * Retrieves the calculated values for each floor group.
         *
         * This getter method simply returns the `floorGroupsValues` property,
         * which is expected to hold an array of values calculated for each group of rooms on a floor.
         * These values are typically set by other methods that perform various calculations on room groups.
         *
         * @returns {Array} An array containing the calculated values for each floor group.
         */
        getFloorGroupValues() {
            return this.floorGroupsValues
        },
    },
    methods: {
        /**
         * Handles the changes of type or grate for plenums across all rooms based on specified conditions.
         * It iterates over all rooms and their respective plenums, applying changes to either all plenums or
         * those that match certain criteria, based on the action specified in the event.
         *
         * @param {Object} event - The event object containing details necessary for implementing the changes.
         *                         Actions include 'change-same-plenum-type', 'change-same-plenum-grate',
         *                         'change-all-plenum-type', and 'change-all-plenum-grate'.
         */
        handleChangePlenumTypeOrGrate(event) {
            switch (event.action) {
                case 'change-same-plenum-type':
                case 'change-same-plenum-grate':
                    this.rooms.forEach(room => {
                        room.plenums.forEach(plenum => {
                            if (event.action === 'change-same-plenum-type' && plenum.type === event.previousType) {
                                plenum.type = event.futureType;
                            }
                            if (event.action === 'change-same-plenum-grate' && plenum.grate === event.previousGrate) {
                                plenum.grate = event.futureGrate;
                            }
                            event.type = plenum.type;
                            this.reinitializePlenums(room.localId, event);
                        });
                    });
                    break;
                case 'change-all-plenum-type':
                case 'change-all-plenum-grate':
                    this.rooms.forEach(room => {
                        room.plenums.forEach(plenum => {
                            if (event.action === 'change-all-plenum-type') {
                                plenum.type = event.futureType;
                                plenum.grate = event.grate;
                            }
                            if (event.action === 'change-all-plenum-grate') {
                                if (!(event.plenumGrateMapping && event.plenumGrateMapping[plenum.type] && event.plenumGrateMapping[plenum.type].grateTypes.includes(event.grate))) {
                                    return;
                                } else {
                                    plenum.grate = event.futureGrate;
                                }
                            }
                            event.type = plenum.type;
                            this.reinitializePlenums(room.localId, event);
                        });
                    });
                    break;
                case 'change-room-plenum-type':
                    this.rooms.forEach(room => {
                        if (room.localId === event.roomId) {
                            room.plenums.forEach(plenum => {
                                plenum.type = event.futureType;
                                plenum.grate = event.grate;
                                event.type = plenum.type;
                                this.reinitializePlenums(room.localId, event);
                            });
                        }
                    });
                    break;
                case 'change-floor-plenum-type':
                    this.rooms.forEach(room => {
                        if (room.floor === event.floor) {
                            room.plenums.forEach(plenum => {
                                plenum.type = event.futureType;
                                plenum.grate = event.grate;
                                event.type = plenum.type;
                                this.reinitializePlenums(room.localId, event);
                            });
                        }
                    });
                    break;
            }
        },
        /**
         * Reinitializes the plenums for a given room by calling the initializePlenums method on the corresponding Vue reference.
         *
         * The function constructs a reference key based on the provided room ID and checks if this reference exists within the
         * Vue component's `$refs` object. If the reference exists (i.e., the component with the corresponding `ref` attribute is
         * rendered and available in the DOM), it calls the `initializePlenums` method of that component. If the reference is
         * not found or the roomId is undefined, it logs an error message to the console. This function is typically used to
         * reinitialize plenums when a room's data or configuration changes.
         *
         * @param {string|number} roomId - The ID of the room whose plenums are to be reinitialized.
         */
        reinitializePlenums(roomId, plenumInfo) {
            const refKey = 'plenum_' + roomId;
            if (roomId !== undefined && this.$refs[refKey]) {
                this.$refs[refKey].changePlenum(plenumInfo);
            } else {
                console.log('Ref not found or localId is undefined', refKey, roomId);
            }
        },
        /**
         * Processes the input value for a specific field of an item, handling numeric conversion and format normalization.
         *
         * This function takes an input value (stored temporarily), normalizes its format by replacing commas with dots
         * and removing non-numeric characters except for the dot. It then attempts to convert this normalized value into
         * a numeric format. If successful, the numeric value is assigned to the specified field of the item. In case of
         * an invalid input (non-numeric), a default action is performed, such as resetting the field to a previous or
         * default value. After processing, the temporary input value is cleared.
         *
         * @param {Object} item - The item whose field needs to be updated.
         * @param {string} field - The field within the item that is being updated.
         * @param {number} index - The index of the temporary input value in `this.tempInputValue`.
         */
        processInput(item, field, index) {
            let inputValue = this.tempInputValue[index];
            if (inputValue) {

                // Replace commas with dots and remove non-numeric characters except the dot
                inputValue = inputValue.replace(/,/g, '.').replace(/[^\d.]/g, '');

                // Convert to a number and handle non-numeric input
                const numericValue = parseFloat(inputValue);
                if (!isNaN(numericValue)) {
                    item.columns[field] = numericValue;

                    // Call updateField with the processed value
                    this.updateField(item, field, true, true);
                } else {
                    // Handle invalid input, e.g., reset to previous value or set a default value
                    item.columns[field] = ''; // or some default value
                }

                // Clear the temporary input value
                this.tempInputValue[index] = undefined;
            }
        },
        getTextColor(item) {
            if (this.groupBy[0].key === 'air') {
                if (item.selectable.air === 1) return 'text-blue';
                else if (item.selectable.air === 2) return 'text-red';
                else if (item.selectable.air === 3) return 'text-purple';
                else return 'text-black';
            }
        },
        getPressureLossColor(room) {
            let pressureLoses = this.rooms.filter(r => r.air === room?.air).map(r => this.calculatePressureLoss([r]));
            let roomPressureLoss = this.calculatePressureLoss([room]);
            if (pressureLoses.length === 1)
                return "black";
            return getTextScaleColor(roomPressureLoss, Math.max(...pressureLoses), true, Math.min(...pressureLoses))
        },
        getRoomsByUnitFloors(floorNames) {
            let roomsList = [];

            floorNames.forEach((floorName) => {
                let matchedFloor = this.floors.find(
                    (floor) => floor.name === floorName
                );

                if (matchedFloor) {
                    let matchedRooms = this.rooms.filter(
                        (room) => room.floor === matchedFloor.value
                    );
                    // Deep copying matched rooms before pushing
                    roomsList.push(...JSON.parse(JSON.stringify(matchedRooms)));
                }
            });

            return roomsList;
        },
        getFloorNameByValue(floorValue) {
            return this.floors.find(floor => floor.value === floorValue)?.name ?? "Floor not found"
        },
        getFloorGroupFloorNames(floorGroupId) {
            return this.floorGroups.find(group => group.id === floorGroupId)?.floors.map(fl => this.getFloorNameByValue(fl))
        },
        initializeRoomExcludedAdjustProperty(room) {
            room.isExcludedFromAdjust = false;
            return room;
        },
        setRoomExcludedAdjustProperty(room) {
            room.isExcludedFromAdjust = !room.isExcludedFromAdjust;
            this.recalculateRooms();
        },
        setupRooms() {
            if (this.isDebug) {
                console.log('setupRooms')
            }
            this.rooms.forEach(room => {
                room.localId = room.id
                let airTypes = [1, 2, 3, 4, 5]
                this.initializeRoomExcludedAdjustProperty(room);
                //check if room.air is a value from this.airTypes
                if (room.air === undefined || !airTypes.includes(room.air)) {
                    room.air = 5
                }
                if (!room.circuit_no_VMC)
                    room.circuit_no_VMC = 0
                if (room.air_volume === undefined || room.air_volume === null || room.air_volume === "" || room.air_volume === "0.00" || room.air_volume === 0) {
                    room.air_volume = 0
                } else if (parseFloat(room.air_volume) > 0) {
                    room.air_volume = parseFloat(room.air_volume)
                }
                room.floor_name = this.floors.find(floor => floor.value === room.floor).name;
                room.adjusted_volume = 0
                room.isDescriptionNeeded = false
                room.pressureLossPerRoom = 0
            })
        },
        getRoomsTotalPlenums(rooms) {
            if (this.isDebug) {
                console.log('roomsTotalPlenums')
            }
            rooms = rooms.filter(room => !room.isExcludedFromAdjust)
            const groupedCounts = rooms.reduce((acc, room) => {
                room.plenums.forEach((plenum) => {
                    const key = `${plenum.shortName}-${plenum.size}`;
                    if (!acc[key]) {
                        acc[key] = {
                            shortName: plenum.shortName,
                            size: plenum.size,
                            count: plenum.count,
                            combination: key
                        };
                    } else {
                        acc[key].count += plenum.count;
                    }
                });
                return acc;
            }, {});
            this.roomsTotalPlenums = Object.values(groupedCounts).map(({shortName, size, count, combination}) => ({
                shortName,
                size,
                count,
                combination
            }));
        },
        // method sets the grouping property of the table
        getGroupName(keyValue) {
            if (this.isDebug) {
                console.log('getGroupName')
            }
            if (this.groupBy[0].key === 'air') {
                return this.airTypes.find(airType => airType.value === keyValue).name;
            } else if (this.groupBy[0].key === 'floor') {
                return this.floors.find(floor => floor.value === keyValue).name;
            }
        },
        /**
         * Handles tab key events for different fields within a room.
         *
         * The method primarily focuses on handling the tab event for 'area' and 'name' fields.
         * It updates the respective field and manages the focus based on the field and certain conditions.
         * For the 'area' field, it checks if the next room's name is empty, or if the current room is the last one.
         * In the case of the 'name' field, it simply shifts the focus to the 'area' field of the same room.
         *
         * @param {Object} item - The current room object that contains details like column names and values.
         * @param {string} field - The field that is currently being tabbed from ('area' or 'name').
         */
        handleTab(item, field) {
            if (this.isDebug) {
                console.log('handleTab')
            }
            // workaround the issue of not updating correctly since the blur event triggers after the tab event
            if (field === 'area') {
                this.updateField(item, field, true, true);
            } else if (field === 'name') {
                this.updateField(item, field, false, false);
            }

            let roomRef;
            const lastIndex = this.rooms.length - 1;

            switch (field) {
                case 'area':
                    if (item.columns.name === '') {
                        roomRef = this.$refs['roomName' + item.value];
                        roomRef.focus();
                    } else if (this.rooms[lastIndex].localId === item.value) {
                        this.addRoom();
                    }
                    break;
                case 'name':
                    roomRef = this.$refs['roomArea' + item.value];
                    roomRef.focus();
                    break;
            }
        },
        /**
         * Updates a specified field in the rooms array based on the provided item and field.
         * This method handles different field types, including numeric values and specific fields like 'area' and 'air'.
         * It checks for changes in the field value and updates accordingly, while also managing related states
         * like `isDescriptionNeeded` and triggering other methods such as `recalculateRooms` and `updateLocation`.
         *
         * @param {Object} item - The item object containing the field to be updated along with its new value.
         * @param {string} field - The name of the field in the room object that needs to be updated.
         * @param {boolean} isNumber - Flag to indicate if the field is of a numeric type.
         * @param {boolean} shouldUpdate - Flag to determine if certain operations like recalculating rooms should be executed.
         */
        updateField(item, field, isNumber, shouldUpdate) {
            if (this.isDebug) {
                console.log('updateField: item', item)
            }

            let valueHasChanged = false;
            this.rooms = this.rooms.map(room => {
                if (room.localId === item.value) {
                    if (field === 'area') {
                        valueHasChanged = room.area.sq_m.toString() !== item.columns['area.sq_m'].toString();
                        this.isRoomAreaChanged = valueHasChanged;
                        room.area.sq_m = item.columns['area.sq_m'];
                    } else if (isNumber) {
                        valueHasChanged = room[field].toString() !== this.roundToTwo(item.columns[field]).toString();
                        room[field] = this.roundToTwo(item.columns[field]);
                    } else if (field === 'plenums' || field === 'circuit_no_VMC') {
                        if (field === 'plenums') {
                            this.setPreviousPlenumValues(item.columns[field]);
                        }
                        room[field] = item.columns[field];
                        valueHasChanged = item.isNewVersionRequired;
                    } else if (field === 'air' && item.columns[field] === 4) {
                        // if we change to TRANSFER (4) air type we need to clear the plenums and the circuits
                        valueHasChanged = room[field].toString() !== item.columns[field].toString();
                        room[field] = item.columns[field];
                        room.plenums = [];
                        room.circuit_no_VMC = 0;
                    } else {
                        if (room[field] !== undefined) {
                            valueHasChanged = room[field].toString() !== item.columns[field].toString();
                            room[field] = item.columns[field];
                        } else {
                            console.log('update failed for: ', field, room[field], room)
                        }
                    }
                    // if the new version is triggered by a user action, the isNewVersionRequired is set to true
                    // if true will trigger a new version of the location in the database
                    if (!room.isDescriptionNeeded && valueHasChanged && this.location.version !== 0) {
                        room.isDescriptionNeeded = shouldUpdate;
                        this.isDescriptionNeeded = shouldUpdate;
                    }
                }
                return room;
            });
            // a new location should not trigger a new version
            if (field !== 'name') {
                this.recalculateRooms(valueHasChanged);
            }

            if (valueHasChanged) {
                this.updateLocation(valueHasChanged);
            }
        },
        setPreviousPlenumValues(plenums) {
            this.previousPlenumType = plenums[plenums.length - 1]?.type;
            this.previousPlenumGrate = plenums[plenums.length - 1]?.grate;
        },
        /**
         * Finds the highest pressure loss per section within a given array of plenums.
         * Iterates through each plenum in the array to determine the maximum pressure loss value.
         *
         * @param {Object[]} plenums - An array of plenum objects, where each plenum object should have a
         *                             'pressureLossPerSection' property.
         * @returns {number} The highest value of pressure loss per section found among the provided plenums.
         *                   Returns 0 if no plenum has a 'pressureLossPerSection' property, or if all
         *                   pressure loss values are 0 or undefined.
         */
        roomPressureLoss(plenums) {
            let maxPressureLoss = 0;
            for (let i = 0; i < plenums.length; i++) {
                if (plenums[i].pressureLossPerSection && plenums[i].pressureLossPerSection > maxPressureLoss) {
                    maxPressureLoss = plenums[i].pressureLossPerSection;
                }
            }
            return maxPressureLoss;
        },
        /**
         * Recalculates various properties for each room grouped by floors.
         *
         * This method performs a series of calculations related to room volumes, areas, and other metrics
         * after grouping rooms by their respective floor groups. It iteratively processes each group of rooms,
         * applying a sequence of calculation methods such as `calculateInitialVolumes`, `calculateAdjustedVolumes`,
         * `calculateTotalArea`, `calculateCurrentVolumes`, `getRoomsTotalPlenums`, and saves the calculated
         * values for each floor group. It concludes by triggering an update to the location.
         *
         * Assumes `this.rooms` is an array of room objects that need to be recalculated.
         * Relies on `groupRoomsByFloorGroup` to group rooms by floors.
         * Updates `this.floorGroupsValues` with the recalculated data for each floor group.
         */
        recalculateRooms(isLocationChanged) {
            if (this.isDebug) {
                console.log('recalculateRooms', this.rooms)
            }
            let roomsGroupedByFloors = this.groupRoomsByFloorGroup(this.rooms)
            this.floorGroupsValues = []
            roomsGroupedByFloors.forEach(roomGroup => {
                let rooms = roomGroup.rooms
                this.calculateInitialVolumes(rooms);
                this.calculateAdjustedVolumes(rooms);
                this.calculateTotalArea(rooms);
                this.calculateCurrentVolumes(rooms);
                this.getRoomsTotalPlenums(rooms);
                this.saveFloorGroupValues(roomGroup);
            });
            this.updateLocation(isLocationChanged);
        },
        /**
         * Updates the location with the current state of rooms and versioning information, then emits an event to notify about the update.
         *
         * This function first checks if the debug mode is active and logs a message if so. It then closes the description dialog
         * and prepares an updated location object, which includes the current state of rooms and the flag indicating if a new
         * version is required. It also sets the preferred grouping for the location before emitting an 'update-location' event
         * with the updated location data. This function is typically used to propagate changes in the location state to a parent
         * component or a broader application context.
         *
         * @emits update-location - Emits an event with the updated location object.
         */
        updateLocation(isLocationChanged) {
            if (this.isDebug) {
                console.log('saveLocation')
            }
            this.descriptionDialog = false;
            let updatedLocation = this.location;
            updatedLocation.rooms = this.rooms;
            updatedLocation.newVersion = this.isNewVersionRequired;
            if (!updatedLocation.isLocationChanged) {
                updatedLocation.isLocationChanged = isLocationChanged;
            }
            // TODO update the code to this:
            // const updatedLocation = {
            //     ...location,
            //     rooms: rooms,
            //     newVersion: isNewVersion,
            // };
            this.setPrefferedGrouping(this.location, this.groupBy[0].key)
            this.$emit('update-location', updatedLocation);
        },
        // this method changes the floor value of the given item based on floor name which is displayed in the table
        updateFloorValue(item) {
            const selectedFloor = this.floors.find(
                (floor) => floor.name === item.columns.floor_name
            );
            if (selectedFloor) {
                item.columns.floor = selectedFloor.value;
                this.updateField(item, 'floor');
                this.updateField(item, 'floor_name');
                item.raw.floorGroupId = this.floorGroups.find(group => group.floors.includes(selectedFloor.value))?.id
            } else {
                // Handle the case where the selected floor name is not found
                item.columns.floor = null;
            }
            this.recalculateRooms(true);
        },
        // this method handles the formatting of a number. It accepts the number and a boolean value that indicates if the number is a currency or not
        formatNumber,
        // rounds a given number to 2 decimals
        roundToTwo,
        // deleteRoom handles the deletion of a room from the rooms array
        deleteRoom(localId) {
            if (this.isDebug) {
                console.log('deleteRoom');
            }
            let roomIndex = this.rooms.findIndex(room => room.localId === localId);

            if (this.rooms[roomIndex].id && this.isDescriptionNeeded) {
                this.isDescriptionNeeded = true;
            }

            this.findAndEmitUnitsWithSharedFloor(roomIndex);

            this.rooms.splice(roomIndex, 1);
            this.recalculateRooms(true);
        },
        // method used for finding the unit indexes that contain the floor of the room being deleted and emitting the
        // respective units' indexes to the parent for deletion
        findAndEmitUnitsWithSharedFloor(roomIndex) {
            if (this.location && this.location.units) {
                let unitIndexesToDelete = [];

                // Find all unit indexes that contain the floor of the room being deleted
                this.location.units.forEach((unit, index) => {
                    if (unit.floor.includes(this.rooms[roomIndex].floor)) {
                        unitIndexesToDelete.push(index);
                    }
                });

                if (unitIndexesToDelete.length > 0) {
                    this.$emit('delete-unit-model', unitIndexesToDelete);
                }
            }
        },
        /**
         * Resets each room to its initial values, recalculates room data, and updates dialog and plenums states.
         * This method iterates over all rooms, resetting them to their initial state, then recalculates room configurations
         * and finally updates the dialog and plenums states to reflect these changes.
         */
        resetAndRecalculateAllRooms() {
            this.rooms.forEach(room => {
                this.resetRoom(room.localId);
                room.resetPlenums = true;
            });
            this.recalculateRooms(true);
            this.resetDialog = false;
            this.resetPlenums = true;
        },
        /**
         * Resets the plenums for a specific room based on the localId and recalculates the rooms.
         * @param {number} localId - The local identifier for the room whose plenums need to be reset.
         */
        resetAndRecalculateRoom(localId) {

            // Find the room with the matching localId and set its resetPlenums to true
            const room = this.rooms.find(room => room.localId === localId);
            if (room) {
                room.resetPlenums = true; // Set the resetPlenums flag to true for the matched room
            } else {
                console.log(`No room found with localId: ${localId}`);
            }

            this.resetRoom(localId);
            this.recalculateRooms(true);
        },
        /**
         * Resets the room with the given local ID to its initial state based on the initial room configurations.
         * @param {string|number} localId - The local identifier for the room to reset.
         * This function finds the room by its local ID and resets its description, air volume edits, plenums edits, and air volume to their initial states.
         * If debug mode is enabled, it logs the reset action.
         */
        resetRoom(localId) {
            if (this.isDebug) {
                console.log('Resetting room:', localId);
            }
            let index = this.rooms.findIndex(room => room.localId === localId);
            let initialIndex = this.location.rooms.findIndex(room => room.id === this.rooms[index].id);

            if (index !== -1 && initialIndex !== -1) {
                const initialRoom = this.location.rooms[initialIndex];
                const room = this.rooms[index];
                room.isDescriptionNeeded = !!initialRoom.is_air_volume_edited;
                room.is_air_volume_edited = false;
                room.is_plenums_edited = false;
                room.air_volume = 0;
            } else if (this.isDebug) {
                console.log('Room not found for reset:', localId);
            }
        },
        groupRoomsByFloorGroup(rooms) {
            return rooms.reduce((acc, room) => {
                let existingFloorGroup = acc.find(group => group.floorGroupId === room.floorGroupId)
                if (existingFloorGroup) {
                    existingFloorGroup.rooms.push(room)
                } else {
                    acc.push({floorGroupId: room.floorGroupId, rooms: [room]})
                }
                return acc
            }, [])
        },
        saveFloorGroupValues(roomGroup) {
            let roomsNotExcluded = roomGroup.rooms.filter(room => !room.isExcludedFromAdjust)
            let totalPressureLoss = this.calculatePressureLoss(roomsNotExcluded)
            let highestPressureLoss = Math.max(...roomsNotExcluded.map(room => this.getHighestPressureLoss([room])))
            let mixedAndTransferAirInitialTotal = roomGroup.rooms.reduce((total, room) =>
                room.air === 3 || room.air === 4 ? total += room.area.sq_m * room.height / 100 : total, 0)
            this.floorGroupsValues.push({
                floorGroupId: roomGroup.floorGroupId,
                roomsTotalArea: this.roomsTotalArea,
                roomsTotalAirVolume: this.roomsTotalAirVolume,
                roomsTotalAirVolumePoor: this.roomsTotalAirVolumePoor,
                roomsTotalAirVolumeGood: this.roomsTotalAirVolumeGood,
                totalPoorGoodDifference: this.totalPoorGoodDifference,
                roomsTotalPlenums: this.roomsTotalPlenums,
                //Add total initial air volume for mixed and transfer air rooms, after excluding them from adjustment
                roomsTotalAirVolumeInitial: this.roomsTotalAirVolumeInitial + mixedAndTransferAirInitialTotal,
                roomsTotalAirVolumeGoodInitial: this.roomsTotalAirVolumeGoodInitial,
                roomsTotalAirVolumePoorInitial: this.roomsTotalAirVolumePoorInitial,
                totalPressureLoss,
                highestPressureLoss
            })
            this.$emit('updated-floor-groups-values', this.floorGroupsValues)
        },
        calculateTotalArea(rooms) {
            if (this.isDebug) {
                console.log('calculateTotalArea')
            }
            let totalArea = 0;
            rooms.filter(room => !room.isExcludedFromAdjust).forEach(room => {
                totalArea += this.roundToTwo(room.area.sq_m);
            })
            this.roomsTotalArea = totalArea;
        },
        calculateCurrentVolumes(rooms) {
            if (this.isDebug) {
                console.log('calculateCurrentVolumes')
            }
            let totalAirVolume = 0;
            let totalAirVolumePoor = 0;
            let totalAirVolumeGood = 0;
            let property = 'air_volume';
            rooms.forEach(room => {
                if (room.isExcludedFromAdjust)
                    return
                totalAirVolume += room[property];
                if (room.air === 1) {
                    totalAirVolumeGood += room[property];
                } else if (room.air === 2) {
                    totalAirVolumePoor += room[property];
                } else if (room.air === 3 || room.air === 4) {
                    if (!room.is_air_volume_edited) {
                        totalAirVolumePoor += room['air_volume_poor'] ? room['air_volume_poor'] : 0;
                        totalAirVolumeGood += room['air_volume_good'] ? room['air_volume_good'] : 0;
                    } else {
                        totalAirVolumePoor += room['adjusted_volume_poor'] ? room['adjusted_volume_poor'] : 0;
                        totalAirVolumeGood += room['adjusted_volume_good'] ? room['adjusted_volume_good'] : 0;
                    }
                }
            })
            this.roomsTotalAirVolumePoor = totalAirVolumePoor;
            this.roomsTotalAirVolumeGood = totalAirVolumeGood;
            this.roomsTotalAirVolume = totalAirVolume;
            this.$emit('total-air-volume-updated', this.formatNumber(this, this.roomsTotalAirVolume, false))
            this.totalPoorGoodDifference = Math.abs(this.roomsTotalAirVolumePoor - this.roomsTotalAirVolumeGood);
        },
        calculateInitialVolumes(rooms) {
            if (this.isDebug) {
                console.log('calculateInitialVolumes')
            }
            let totalAirVolume = 0;
            let poorAirVolume = 0;
            let goodAirVolume = 0;
            rooms.forEach(room => {
                if (room.isExcludedFromAdjust) {
                    return;
                }
                let roomAirVolume = room.area.sq_m * room.height / 100;
                if (room.air === 1) {
                    totalAirVolume += roomAirVolume;
                    goodAirVolume += roomAirVolume;
                } else if (room.air === 2) {
                    totalAirVolume += roomAirVolume;
                    poorAirVolume += roomAirVolume;
                }
            })
            this.roomsTotalAirVolumeInitial = totalAirVolume;
            this.roomsTotalAirVolumeGoodInitial = goodAirVolume;
            this.roomsTotalAirVolumePoorInitial = poorAirVolume;
            return rooms;
        },
        /**
         * Calculates the highest pressure loss per section among all plenums in a collection of rooms.
         * Iterates through each room and its plenums to find the maximum pressure loss value.
         *
         * @param {Object[]} rooms - An array of room objects. Each room object should have a 'plenums' property,
         *                           which is an array of plenum objects.
         * @returns {number} The highest value of pressure loss per section found among all plenums in the rooms.
         *                   Returns 0 if no plenum is found or if all pressure loss values are 0 or undefined.
         */
        getHighestPressureLoss(rooms) {
            let maxPressureLoss = 0;
            rooms.forEach(room => {
                if (room.plenums && room.plenums.length > 0) {
                    room.plenums.forEach(plenum => {
                        if (plenum.pressureLossPerSection && plenum.pressureLossPerSection > maxPressureLoss) {
                            maxPressureLoss = plenum.pressureLossPerSection;
                        }
                    });
                }
            });
            return maxPressureLoss;
        },
        calculatePressureLoss(rooms) {
            return rooms.flatMap(room => room.plenums).reduce((total, plenum) => total += plenum?.pressureLossPerSection, 0)
        },
        calculateDefaultVolume(room) {
            return this.roundToTwo(room.area.sq_m * room.height / 100);
        },
        calculateAdjustedVolumes(rooms) {
            if (this.isDebug) {
                console.log('calculateAdjustedVolumes')
            }

            for (let room of rooms) {
                let defaultVolume = this.calculateDefaultVolume(room);
                let maxAllowedVolume = 2.5 * defaultVolume;

                if (room.isExcludedFromAdjust) {
                    if (!room.is_air_volume_edited)
                        room.air_volume = defaultVolume;
                    else
                        room.adjusted_volume = defaultVolume;
                } else {
                    if (!room.is_air_volume_edited) {
                        room.air_volume_good = this.roundToTwo(this.adjustRoomVolume('good', room));
                        room.air_volume_poor = this.roundToTwo(this.adjustRoomVolume('poor', room));
                        room.air_volume = this.roundToTwo(room.air_volume_poor + room.air_volume_good);
                    } else {
                        room.adjusted_volume_good = this.roundToTwo(this.adjustRoomVolume('good', room));
                        room.adjusted_volume_poor = this.roundToTwo(this.adjustRoomVolume('poor', room));
                        room.adjusted_volume = this.roundToTwo(room.adjusted_volume_poor + room.adjusted_volume_good);
                    }

                    // Check if the adjusted volume exceeds the maximum allowed volume 2.5x the default value (area*height)
                    let adjustedVolume = room.air_volume;

                    room.airExchangeCycles = roundToTwo(adjustedVolume / defaultVolume);
                    room.hasError = adjustedVolume > maxAllowedVolume;
                }
            }
            return rooms;
        },
        // method to calculate the air volume of a room based on the air type and the room's area and height
        // if the room air is transfer or mixed it calculates the air volume based on the exchange coefficient and the air volume of both poor and good air
        adjustRoomVolume(type, roomDetails) {
            let volume = roomDetails.area.sq_m * roomDetails.height / 100;
            let airVolumeGood = 0;
            let airVolumePoor = 0;

            if (roomDetails.air === 1) {
                airVolumeGood = this.roomsTotalAirVolumeInitial * this.exchangeCoefficient * volume / this.roomsTotalAirVolumeGoodInitial;
            } else if (roomDetails.air === 2) {
                airVolumePoor = this.roomsTotalAirVolumeInitial * this.exchangeCoefficient * volume / this.roomsTotalAirVolumePoorInitial;
            } else if (roomDetails.air === 3 || roomDetails.air === 4) {
                if (roomDetails.is_air_volume_edited) {
                    volume = roomDetails.air_volume;
                }
                airVolumeGood = volume / 2;
                airVolumePoor = volume / 2;
            }
            if (type === 'good') {
                return this.roundToTwo(airVolumeGood);
            } else {
                return this.roundToTwo(airVolumePoor);
            }
        },
        // method to set the descriptionDialog to true and open the dialog for editing the description
        setDescriptionDialogTrue() {
            if (this.isDescriptionNeeded)
                this.descriptionDialog = true;
            this.isDescriptionNeeded = false;
        },
        // method to set the descriptionDialog to false and resets the value of the flag that is used for
        // opening the dialog for editing the description
        setDescriptionDialogFalse() {
            this.descriptionDialog = false;
            if (!this.isDescriptionNeeded)
                this.isDescriptionNeeded = true;
        },
        /**
         * Checks if a new version is required based on the type of all client offers for a specific location.
         *
         * This method evaluates whether all fetched client offers, filtered by location, are of a specific type (type 1 or 4).
         * If all offers are of type 1 or 4, it sets the `isDescriptionNeeded` flag to false and returns false,
         * indicating a new version is not required under these conditions. If not all offers are of type 1 or 4,
         * or if the room area has changed, it sets the `isDescriptionNeeded` flag to true,
         * suggesting that a new version might be required.
         *
         * @returns {boolean} False if all offers are of type 1 or 4 and the room area has not changed,
         *                    true otherwise, indicating a new version might be required.
         */
        checkIsNewVersionRequired() {
            // Check if there are fetched client offers available
            if (this.$store.state.fetchedClientOffers && this.$store.state.fetchedClientOffers.length > 0) {
                // Filter offers by location, matching against this instance's location ID
                let locationOffers = this.$store.state.fetchedClientOffers.filter(offer => offer.location.toString() === this.location.id.toString());

                // Check if all offers are of type 1 or 4
                if (locationOffers.every(offer => offer.type === 1 || offer.type === 4) && !this.isRoomAreaChanged) {
                    // All offers are of type 1 or 4 and the room area hasn't changed
                    this.isDescriptionNeeded = false;
                    return false;
                }

                // Not all offers are of type 1 or the room area has changed
                this.isDescriptionNeeded = true;
                return true; // Indicates there are offers that may require a new version
            }

            // Default to false if there are no fetched client offers, implying no new version is required
            this.isDescriptionNeeded = false;
            return false;
        },
        // method to save the location
        // it updates each room before saving to have the latest info
        // sets the newVersionRequired flag to true if there are changes in the rooms
        saveLocation() {
            if (this.isDescriptionNeeded) {
                this.setDescriptionDialogTrue();
            } else {
                // this.$nextTick(() => {
                //     this.rooms.forEach(room => {
                //         let item = {
                //             value: room.localId,
                //             columns: {
                //                 air_volume: room.air_volume,
                //             }
                //         }
                //         this.updateField(item, 'air_volume', true, false);
                //     })
                // });
                let change_description = this.change_description;
                this.deleteEmptyRooms();
                this.updateLocation(true);
                this.$emit('save-location', change_description);
                this.setDescriptionDialogFalse();
            }
        },
        // method used for setting the preferred grouping for the current location in the local storage
        // for providing a better and more seamless user experience
        async setPrefferedGrouping(location, groupingKey) {
            if (this.isDebug) {
                console.log('setPrefferedGrouping');
            }
            let existingGrouping = await JSON.parse(localStorage.getItem('dimensioningGrouping')) || [];
            let grouping = {
                locationId: location.id,
                key: groupingKey
            }
            let foundGroupingIndex = existingGrouping.findIndex(group => group.locationId === location.id);

            if (foundGroupingIndex !== -1) {
                existingGrouping[foundGroupingIndex] = grouping; // Replace the existing grouping object
            } else {
                existingGrouping.push(grouping); // Add a new grouping object
            }

            let stringifiedExistingGrouping = JSON.stringify(existingGrouping)
            localStorage.setItem('dimensioningGrouping', stringifiedExistingGrouping);
        },
        // method used for getting the preferred grouping for the current location in the local storage
        // for providing a better and more seamless user experience
        async getPreferredGrouping(location) {
            if (this.isDebug) {
                console.log('getPreferredGrouping');
            }
            let existingGrouping = await JSON.parse(localStorage.getItem('dimensioningGrouping'));
            if (existingGrouping && existingGrouping.length > 0) {
                let foundGrouping = existingGrouping.find(grouping => grouping.locationId === location.id);
                if (foundGrouping) {
                    return foundGrouping.key;
                }
            }
            return '';
        },
        // method used for setting the preferred grouping for the current location in the local storage
        // for providing a better and more seamless user experience
        async setPreferredGrouping(location, groupingKey) {
            if (this.isDebug) {
                console.log('setPreferredGrouping');
            }
            let existingGrouping = await JSON.parse(localStorage.getItem('dimensioningGrouping')) || [];
            let grouping = {
                locationId: location.id,
                key: groupingKey
            }
            let foundGroupingIndex = existingGrouping.findIndex(group => group.locationId === location.id);

            if (foundGroupingIndex !== -1) {
                existingGrouping[foundGroupingIndex] = grouping; // Replace the existing grouping object
            } else {
                existingGrouping.push(grouping); // Add a new grouping object
            }

            let stringifiedExistingGrouping = JSON.stringify(existingGrouping)
            localStorage.setItem('dimensioningGrouping', stringifiedExistingGrouping);
        },
        // method to toggle opening all the groups in the table
        // it is referencing the expandButton ref of each group inside the v-data-table
        // it goes through all the refs that contain expandButton and clicks them, triggering the toggle event
        toggleAll() {
            if (this.isDebug) {
                console.log('toggleAll')
            }
            this.$nextTick(() => {
                // for each key in this.refs run a separate log
                for (let key in this.$refs) {
                    if (key.includes('expandButton') && this.$refs[key]) {
                        this.$refs[key].$el.click();
                    }
                }
            });
        },
        /**
         * Changes the grouping property based on the specified column.
         * Toggles item states and updates grouping settings accordingly.
         * Deletes empty rooms if the grouping property is changed to 'floor' or 'air'.
         *
         * @param {string} column - The column name to group by. Accepts 'floor', 'air', or an empty string.
         */
        changeGroupingProperty(column) {
            if (!['floor', 'air', ''].includes(column)) {
                console.error(`Invalid column: ${column}`);
                return;
            }

            this.toggleAll();
            this.groupBy = [{key: column}];
            this.setPreferredGrouping(this.location, column);
            this.deleteEmptyRooms();

            if (this.isDebug) {
                console.log(`Grouping property changed to: ${column}`);
            }

            if (['floor', 'air'].includes(column)) {
                this.toggleAll();
            }
        },
        /**
         * Adds a new room to the `rooms` array. The new room inherits certain properties
         * (floor ID, floor name, and default air type) from the last room in the array,
         * if available. Otherwise, it uses default values from the `floors` array.
         *
         * This method generates a unique ID for the new room and pushes a room object
         * with default properties and computed values to the `rooms` array. After updating
         * the array, it sets focus to the newly added room element in the DOM, if found.
         *
         * Note: This method assumes that `this.floors[1]` is always defined and valid.
         * If `this.floors` is likely to be empty or have different structure, additional
         * error handling should be implemented.
         *
         * Uses `uuidv4` to generate a unique ID for the new room.
         *
         * @method
         * @returns {void} Does not return a value.
         * @example
         * // Assuming `this.rooms` and `this.floors` are initialized and structured correctly.
         * addRoom();
         * // This will add a new room to the `rooms` array and focus the new room's input element (if found).
         */
        addRoom() {
            if (this.isDebug) {
                console.log('addRoom');
            }

            const DEFAULT_ROOM_HEIGHT = 250;
            const DEFAULT_CIRCUIT_LENGTH = 15;
            const {floorName, floorId, defaultAirType} = this.getLastRoomDetails();
            let floorGroupId = this.floorGroups.find(group => group.floors.includes(floorId))?.id;

            const newRoomId = uuidv4();
            const newRoom = {
                localId: newRoomId,
                name: '',
                type: '',
                area: {"sq_m": 0},
                height: DEFAULT_ROOM_HEIGHT,
                floor: floorId,
                floor_name: floorName,
                air: defaultAirType,
                air_volume: 0,
                plenums: [],
                circuit_no_VMC: 0,
                is_air_volume_edited: false,
                isDescriptionNeeded: false,
                is_air_volume_available: false,
                initial_circuit_length: DEFAULT_CIRCUIT_LENGTH,
                floorGroupId
            };
            this.rooms.push(newRoom);
            this.$nextTick(() => {
                let roomRef = this.$refs['roomName' + newRoomId];
                if (roomRef) roomRef.focus();
                else console.error('Room reference not found');
            });
        },
        getLastRoomDetails() {
            const DEFAULT_AIR_TYPE = 5;
            if (this.rooms.length > 0) {
                const lastRoom = this.rooms[this.rooms.length - 1];
                return {floorName: lastRoom.floor_name, floorId: lastRoom.floor, defaultAirType: lastRoom.air};
            }
            return {floorName: this.floors[1].name, floorId: this.floors[1].value, defaultAirType: DEFAULT_AIR_TYPE};
        },
        /**
         * Iterates over the `rooms` array and removes any rooms that have an area of zero.
         * This method is intended to clean up the `rooms` array by getting rid of rooms
         * that are considered 'empty' based on their area.
         *
         * It leverages the `deleteRoom` method for each room that meets the criteria,
         * which means that any additional logic or side effects implemented in `deleteRoom`
         * will be applied here as well.
         *
         * This method checks the `isDebug` flag before logging its action, which helps in
         * debugging without cluttering the console in the production environment.
         *
         * @method
         * @returns {void} Does not return a value.
         * @example
         * // Assuming `this.rooms` is an array of room objects.
         * deleteEmptyRooms();
         * // This will remove all rooms from `this.rooms` where the `area.sq` property is zero.
         */
        deleteEmptyRooms() {
            if (this.isDebug) {
                console.log('deleteEmptyRooms');
            }
            let emptyRooms = this.rooms.filter(room => room.area.sq_m === 0);
            emptyRooms.forEach(room => {
                this.deleteRoom(room.localId);
            });
        },
        /**
         * Parses and transforms a given room object into a more detailed structure based on a specified air type.
         * This method filters the room's plenums to include only those matching the specified air type,
         * calculates certain properties like air volume and circuit number, and adds additional details
         * specific to the given air type.
         *
         * The method also determines if the room's air type is mixed (specifically checks for air type 3)
         * and includes this information in the returned object.
         *
         * Note: This method relies on `roundToTwo` for rounding off the calculated pressure loss. Ensure
         * that `roundToTwo` is defined and works as expected.
         *
         * @param {Object} room - The room object to be parsed.
         * @param {Object} airType - The air type object, expected to have `value` and `name` properties.
         * @returns {Object} A new room object with expanded details including filtered plenums,
         *                   calculated air_volume, circuit_no_VMC, pressureLossPerRoom, and an isMixed flag.
         * @example
         * // Assuming `room` is an object with `plenums`, `air_volume`, and other properties,
         * // and `airType` is an object with `value` and `name` properties.
         * const expandedRoom = parseExpandedRoomObject(room, airType);
         * // expandedRoom will now contain detailed information based on the specified airType.
         */
        parseExpandedRoomObject(room, airType) {
            let filteredPlenums = room.plenums.filter(plenum => plenum.air === airType.value)
            return {
                air: airType?.name,
                air_volume: room.air_volume / 2 + ' m³',
                circuit_no_VMC: filteredPlenums.reduce((total, plenum) => total += plenum.size, 0),
                pressureLossPerRoom: this.roundToTwo(filteredPlenums.reduce((total, plenum) => total += plenum.pressureLossPerSection, 0)) + ' Pa',
                plenums: filteredPlenums,
                isMixed: room.air === 3
            }
        }
    },
    watch: {
        floorGroups: {
            handler: function () {
                this.recalculateRooms();
            },
            deep: true,
        },
        rooms: {
            handler(rooms) {
                rooms.forEach((room) => {
                    if (room.localId === undefined) {
                        room.localId = uuidv4()
                    }
                });
            },
            deep: true,
        },
        hidePlenumTypeChangeDialog: {
            handler: function (newV) {
                if (newV === true) {
                    // set a one minute timer after which false
                    setTimeout(() => {
                            this.hidePlenumTypeChangeDialog = false;
                        },
                        this.hideDelayMinutes * 60000);
                }
            },
            deep: true
        }
    },
};
</script>
<style>
.text-right * {
    text-align: right;
}

.suffix-color .v-input__control .v-field .v-field__field .v-text-field__suffix {
    color: rgb(251, 140, 0); /* Or whatever color you desire */
}

.no-arrows input[type='number'] {
    -moz-appearance: textfield;
}

.no-arrows input::-webkit-outer-spin-button,
.no-arrows input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.v-input--horizontal .v-input__append {
    margin: 0 !important;
}
</style>