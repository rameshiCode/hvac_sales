<template>
    <v-card class="mt-2">
        <v-toolbar>
            <v-toolbar-title>
                Detalii Unități
            </v-toolbar-title>
            <v-toolbar-items v-if="units && units.length > 0">
                <v-btn append-icon @click="addUnit"
                       label>
                    Adaugă unitate
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
            <v-row v-if="!units || units.length < 1">
                <v-col cols="2">
                    <v-alert color="danger" density="compact">
                        Nu sunt unități disponibile, deoarece locația nu are camere cu tipul de aer setat (necesită
                        salvarea locației).
                    </v-alert>
                </v-col>
            </v-row>
            <v-row>
                <v-col sm="12" md="12" lg="6" justify-sm="end" v-for="(unit, index) in units" :key="index">
                    <v-card class="mb-3">
                        <v-toolbar>
                            <!-- :extended="unit.model && isSuperUser"
                                :extension-height="unit.model && isSuperUser ? 100 : 0" -->
                            <v-toolbar-title>
                                {{ `Unitatea ${index + 1}` }}<span class="fs-6" v-if="unit.unitModel">{{
                                    ' - ' + unit.unitModel
                                }}</span>
                                <br>
                                <h6>
                                    <span v-if="unit.floor.length === 0" class="d-inline">Etaje</span>
                                    <span v-else v-for="(floor, fIndex) in unit.floor" :key="fIndex"
                                          class="d-inline">{{
                                            fIndex === 0 ? getFloorNameByValue(floor) : ' | ' + getFloorNameByValue(floor)
                                        }} </span>
                                    <v-chip v-if="unit.floor.length > 0" size="small" color="black"
                                            variant="outlined" class="ml-2">Pierdere
                                        presiune:
                                        {{
                                            formatNumber(this, unit.totalPressureLoss, false)
                                        }}
                                        Pa
                                    </v-chip>
                                    <v-chip v-if="unit.floor.length > 0" size="small" color="black"
                                            variant="outlined" class="ml-2">
                                        Volum aer:
                                        {{
                                            formatNumber(this, unit.totalAirVolume, false)
                                        }}
                                        m<sup>3</sup></v-chip>
                                </h6>
                            </v-toolbar-title>
                            <v-toolbar-items>
                                <v-btn
                                    v-if="units.length > 1"
                                    icon
                                    @click="removeUnit(index)"
                                    color="danger"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-toolbar-items>
                        </v-toolbar>
                        <v-card-text>
                            <v-row>
                                <v-col>
                                    <v-select
                                        label="Selecție Etaj"
                                        multiple
                                        :items="availableFloors"
                                        v-model="unit.floor"
                                        :menu-props="{ closeOnContentClick: false }"
                                        item-title="floorName"
                                        item-value="floor"
                                        hide-details
                                        variant="outlined"
                                        density="compact"
                                        ref="unitFloorSelect"
                                    >
                                        <template v-slot:item="{ item }">
                                            <v-list-item
                                                @click="selectFloor(true, item.value, index)"
                                                :disabled="!this.userPermissions.canEditUnitFloors && usedFloors.includes(item.value) && !unit.floor.includes(item.value)"
                                            >
                                                <template v-slot:prepend>
                                                    <v-icon
                                                        v-if="!( !this.userPermissions.canEditUnitFloors && usedFloors.includes(item.value) && !unit.floor.includes(item.value) )">
                                                        {{
                                                            usedFloors.includes(item.value) && unit.floor.includes(item.value) ? 'mdi-minus-box-outline' : 'mdi-plus-box-outline'
                                                        }}
                                                    </v-icon>
                                                </template>

                                                <v-list-item-title>
                                                    {{ item.title }}
                                                </v-list-item-title>
                                            </v-list-item>
                                        </template>
                                    </v-select>
                                    <!-- Cascading checkbox -->
                                    <v-switch
                                        v-if="units.length > 1 && unit.model && unit.model.type === 'Premium'"
                                        :variant="this.$store.state.vuetifyFieldType"
                                        v-model="unit.cascading"
                                        :id="'cascading-' + index"
                                        :label="'Cascadare'"
                                        color="success"
                                        hide-details
                                    ></v-switch>
                                </v-col>
                            </v-row>
                            <!-- Unit model dropdown -->
                            <v-row>
                                <v-col>
                                    <v-menu
                                        v-model="unit.filterMenu"
                                        location="bottom"
                                        transition="slide-y-transition"
                                        :close-on-content-click="false"
                                    >
                                        <template v-slot:activator="{props}">
                                            <v-row>
                                                <v-col cols="10">
                                                    <v-btn
                                                        v-if="unit.floor.length > 0"
                                                        variant="outlined"
                                                        v-bind="props"
                                                        block
                                                    >
                                                        Filtrare unități
                                                    </v-btn>
                                                </v-col>
                                                <v-col cols="2" justify="end"
                                                >
                                                    <v-btn
                                                        v-if="unit.floor.length > 0"
                                                        variant="outlined"
                                                        block
                                                        :disabled="!unit.selectedOrientationFilter && !unit.unitVersionFilter && !unit.unitMountingFilter"
                                                        @click="resetUnitFilters(index)"
                                                    >
                                                        <v-icon>mdi-restart</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </template>
                                        <v-card>
                                            <v-toolbar>
                                                <v-toolbar-title>
                                                    <v-row align="center" justify="center">
                                                        <v-col cols="6">
                                                            Filtre modele unități
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-switch
                                                                label="Afișează toate modelele"
                                                                v-if="unit.floor.length > 0 && this.userPermissions.canViewAllUnitModels"
                                                                color="success"
                                                                v-model="unit.showAllUnits"
                                                                @update:modelValue="changeAvailableUnitModels(unit, index, '', null, unit.showAllUnits)"
                                                                hide-details
                                                            >
                                                            </v-switch>
                                                        </v-col>
                                                    </v-row>
                                                </v-toolbar-title>

                                            </v-toolbar>
                                            <v-list>
                                                <v-fade-transition
                                                    v-if="unit.floor.length > 0">
                                                    <v-list-item>
                                                        <v-select
                                                            class="mt-3"
                                                            v-if="units.length >= 1"
                                                            :items="unitOrientationOptions"
                                                            v-model="unit.selectedOrientationFilter"
                                                            item-title="title"
                                                            item-value="value"
                                                            variant="outlined"
                                                            density="compact"
                                                            label="Orientare"
                                                            hide-details
                                                            @update:modelValue="changeAvailableUnitModels(unit, index, unit.selectedOrientationFilter, null, unit.showAllUnits)"
                                                        ></v-select>
                                                    </v-list-item>
                                                </v-fade-transition>
                                                <v-fade-transition>
                                                    <v-list-item>
                                                        <v-select
                                                            class="mt-3"
                                                            v-if="units.length >= 1"
                                                            :items="unitExtensionOptions"
                                                            v-model="unit.unitVersionFilter"
                                                            item-title="name"
                                                            item-value="value"
                                                            variant="outlined"
                                                            density="compact"
                                                            return-object
                                                            label="Versiune unitate"
                                                            hide-details
                                                            @update:modelValue="changeAvailableUnitModels(unit, index, unit.selectedOrientationFilter, unit.unitVersionFilter, unit.showAllUnits)"
                                                        ></v-select>
                                                    </v-list-item>
                                                </v-fade-transition>
                                                <v-fade-transition>
                                                    <v-list-item>
                                                        <v-select
                                                            class="mt-3"
                                                            v-if="units.length >= 1"
                                                            :items="unitMountingOptions"
                                                            v-model="unit.unitMountingFilter"
                                                            item-title="name"
                                                            item-value="value"
                                                            variant="outlined"
                                                            density="compact"
                                                            return-object
                                                            label="Montaj unitate"
                                                            hide-details
                                                            @update:modelValue="changeAvailableUnitModels(unit, index, unit.selectedOrientationFilter, unit.unitVersionFilter, unit.showAllUnits,)"
                                                        ></v-select>
                                                    </v-list-item>
                                                </v-fade-transition>
                                            </v-list>
                                        </v-card>
                                    </v-menu>
                                    <v-fade-transition>
                                        <v-select
                                            class="mt-3"
                                            :disabled="!unit.floor.length > 0"
                                            variant="outlined"
                                            density="compact"
                                            label="Model"
                                            v-model="unit.model"
                                            :items="compatibleUnits[index]"
                                            :item-title="itemDescription"
                                            item-value="id"
                                            return-object
                                            style="width: 100%"
                                            :menu-props="{ offsetY: true }"
                                            hide-details
                                            ref="unitModelSelect"
                                        >
                                            <template v-slot:item="{ item }">
                                                <v-list-item @click="selectModel(item.raw, index)">
                                                    <v-list-item-title
                                                        :class="item.value.matched && unit.showAllUnits ? 'font-weight-bold' : ''"
                                                    >
                                                        {{ itemDescription(item.value) }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                    </v-fade-transition>
                                    <v-fade-transition v-if="unit.model && unit.model.mountingOptions">
                                        <!-- Radio group for mounting options -->
                                        <v-card density="compact" class="my-2">
                                            <v-card-subtitle density="compact" size="small" class="mt-1">Montaj
                                            </v-card-subtitle>
                                            <v-card-text density="compact">
                                                <v-radio-group
                                                    v-model="unit.selected_mounting"
                                                    inline
                                                    class="d-flex flex-row"
                                                    density="compact"
                                                >
                                                    <v-radio v-for="(option) in unit.model.mountingOptions"
                                                             :key="option.name"
                                                             :label="option.name"
                                                             :value="option.value"
                                                             density="compact"
                                                             class="mr-2"
                                                             :disabled="unit.model.mountingOptions.length === 1"
                                                    ></v-radio>
                                                </v-radio-group>
                                            </v-card-text>
                                        </v-card>
                                    </v-fade-transition>
                                    <v-fade-transition>
                                        <v-alert
                                            v-if="compatibleUnits[index] && compatibleUnits[index].length < 1 && unit.floor.length"
                                            type="error"
                                            title="Eroare"
                                            text="Pentru selectia actuala valorile caderii totale de presiune si
                                            volumul de aer sunt prea mari pentru orice unitate, va rugam mai adaugati o unitate."
                                        ></v-alert>
                                    </v-fade-transition>
                                </v-col>
                            </v-row>
                            <v-divider></v-divider>
                            <v-fade-transition>
                                <v-row v-if="unit.floor.length > 0 && unit.model">
                                    <v-col sm="12" md="6" lg="6">
                                        <!-- Heating checkbox: if true display inputs for cold and warm temperatures  -->
                                        <v-card variant="outlined">
                                            <v-toolbar density="compact">
                                                <v-toolbar-title>
                                                    <h6>
                                                        Încălzire / Răcire
                                                    </h6>
                                                </v-toolbar-title>
                                                <v-toolbar-items>
                                                    <v-switch
                                                        density="compact"
                                                        color="success"
                                                        :variant="this.$store.state.vuetifyFieldType"
                                                        v-model="unit.heating"
                                                        :id="'heating-' + index"
                                                        hide-details
                                                        class="mr-4"
                                                    ></v-switch>
                                                </v-toolbar-items>
                                            </v-toolbar>
                                            <v-card-text>
                                                <v-row>
                                                    <v-col cols="12">
                                                        <v-text-field
                                                            type="number"
                                                            placeholder="Temperatură încălzire"
                                                            v-model="unit.warmTemp"
                                                            :disabled="!unit.heating"
                                                            class="no-arrows"
                                                            color="red"
                                                            hide-details
                                                        >
                                                            <template v-slot:append-inner>
                                                                <span style="color: red;">°C</span>
                                                            </template>
                                                        </v-text-field>
                                                        <v-text-field
                                                            type="number"
                                                            placeholder="Temperatură răcire"
                                                            v-model="unit.coldTemp"
                                                            :disabled="!unit.heating"
                                                            class="no-arrows mt-2"
                                                            color="blue"
                                                            hide-details
                                                        >
                                                            <template v-slot:append-inner>
                                                                <span style="color: blue;">°C</span>
                                                            </template>
                                                        </v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col sm="12" md="6" lg="6" v-if="unit.floor && unit.model">
                                        <!-- Sensors -->
                                        <v-card variant="outlined">
                                            <v-toolbar density="compact">
                                                <v-toolbar-title>
                                                    <h6>Selecție senzori / auxiliare:</h6>
                                                </v-toolbar-title>
                                            </v-toolbar>
                                            <v-card-text>
                                                <v-row>
                                                    <template v-for="(sensor, sIndex) in unit.model.sensors"
                                                              :key="`sensor-${sIndex}`">
                                                        <v-col
                                                            v-if="sensor.name !== 'Modul modbus' || (sensor.name === 'Modul modbus' && shouldDisplayModbus(sensor.name, index))"
                                                            sm="12" md="6" lg="6"
                                                            class="unit-sensor-column"
                                                        >
                                                            <v-checkbox
                                                                class="w-100"
                                                                density="compact"
                                                                :ripple="true"
                                                                v-model="unit.selectedSensors"
                                                                :value="sensor.name"
                                                                :label="sensor.name"
                                                                hide-details
                                                            ></v-checkbox>
                                                        </v-col>
                                                    </template>
                                                </v-row>
                                            </v-card-text>
                                        </v-card>
                                        <!-- Tubing selection-->
                                        <v-select
                                            variant="outlined"
                                            density="compact"
                                            class="mt-5 pt-1"
                                            :items="unit.resultedTubingOptions"
                                            item-title="name"
                                            item-value="value"
                                            v-model="unit.tubing"
                                            label="Tip tubulatură"
                                            @update:modelValue="onTubingChange(unit)"
                                        >
                                        </v-select>
                                        <v-select
                                            variant="outlined"
                                            density="compact"
                                            :color="unit.tubing_diameter ? 'black' : 'danger'"
                                            class="mt-0 pt-0"
                                            :items="unit.tubingDiameterOptions"
                                            item-value="value"
                                            item-title="value"
                                            v-model="unit.tubing_diameter"
                                            label="Diametru tubulatura"
                                            ref="unitTubingSelect"
                                        >
                                            <template v-slot:item="{ item }">
                                                <v-list-item @click="setUnitTubingDiameter(unit,item, index)">
                                                    <span :style="item.raw.isRecommended ? 'font-weight: bold' : ''">
                                                        {{ item.value }}
                                                    </span>
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                    </v-col>
                                </v-row>
                            </v-fade-transition>
                            <!-- Distributors -->
                            <v-fade-transition>
                                <v-card variant="outlined" class="mt-2" v-if="unit.floor.length > 0 && unit.model">
                                    <v-toolbar density="compact">
                                        <v-toolbar-title>
                                            <h6>
                                                Distribuitoare
                                            </h6>
                                        </v-toolbar-title>
                                        <v-toolbar-items>
                                            <v-btn icon variant="text" @click="calculateDistributors(unit)">
                                                <v-icon>mdi-restart-alert</v-icon>
                                            </v-btn>
                                        </v-toolbar-items>
                                    </v-toolbar>
                                    <v-card-text>
                                        <v-row>
                                            <v-col v-for="airType in distributorAirTypes" :key="airType.value" sm="12"
                                                   md="12" lg="6">
                                                <v-card variant="outlined" class="m-0">
                                                    <v-toolbar density="compact">
                                                        <v-toolbar-title>
                                                            <h6 class="mb-0 mt-3"
                                                                :style="`color:${airType.value === 1 ? '#2196F3': '#B00020'}`">
                                                                {{ airType.name }}
                                                            </h6>
                                                            <p :style="`font-size: small; margin:0; 
                                                                color:${getUnitNeededAndTotalCircuits(unit, airType.value).totalCircuits !== getUnitNeededAndTotalCircuits(unit, airType.value).neededCircuits ? 'red' :'black'}`">
                                                                {{
                                                                    `Necesar circuite: ${getUnitNeededAndTotalCircuits(unit, airType.value).neededCircuits}
                                                                ${getUnitNeededAndTotalCircuits(unit, airType.value).totalCircuits !== getUnitNeededAndTotalCircuits(unit, airType.value).neededCircuits ?
                                                                        ` - Total circuite: ${getUnitNeededAndTotalCircuits(unit, airType.value).totalCircuits}` : ''}`
                                                                }}
                                                            </p>
                                                            <v-tooltip
                                                                activator='parent'
                                                                location='top'>
                                                                <p v-for="floor in unit.floor" :key="floor"
                                                                   style="font-size: small; margin:0; padding:0">
                                                                    {{
                                                                        `Necesar circuite ${getFloorNameByValue(floor)}: `
                                                                    }}
                                                                    <span style="font-weight: 700;">
                                                                        {{
                                                                            calculateTotalFloorCircuitsByAirType([floor], airType.value)
                                                                        }}</span>
                                                                </p>
                                                            </v-tooltip>
                                                        </v-toolbar-title>
                                                        <v-toolbar-items>
                                                            <v-btn
                                                                icon
                                                                variant="text"
                                                                color="primary"
                                                                :disabled="unit.tubing === 2 && unit.tubing_diameter === 125"
                                                                @click="addDistributor(index, airType.value)">
                                                                <v-icon>mdi-plus</v-icon>
                                                            </v-btn>
                                                        </v-toolbar-items>
                                                    </v-toolbar>
                                                    <v-card-text>
                                                        <v-row
                                                            v-for="(distributor, duIndex) in getUnitDistributorsByAirType(unit, airType.value)"
                                                            :key="duIndex"
                                                            justify="start">
                                                            <v-col cols="12">
                                                                <v-row>
                                                                    <v-col sm="12" md="12" lg="12" xl="6">
                                                                        <v-select v-model="distributor.type"
                                                                                  :items="distributorTypes"
                                                                                  variant="outlined"
                                                                                  label="Tip distribuitor"
                                                                                  :menu-props="{ offsetY: true }"
                                                                                  item-title="name"
                                                                                  item-value="value" density="compact"
                                                                                  hide-details
                                                                                  :class="distributor.editedFields?.includes('type') ? 'text-warning' : ''"
                                                                                  @update:modelValue="handleDistributorFieldEdit('type', distributor), handleUnitDistributorChoice(unit, true)">
                                                                        </v-select>
                                                                    </v-col>
                                                                    <v-col sm="12" md="12" lg="12" xl="6">
                                                                        <v-select v-model="distributor.floors"
                                                                                  multiple
                                                                                  :items="getDistributorAvailableFloors(unit)"
                                                                                  variant="outlined"
                                                                                  label="Selecție Etaj"
                                                                                  :menu-props="{ closeOnContentClick: false }"
                                                                                  item-text="name"
                                                                                  item-value="value"
                                                                                  item-title="name"
                                                                                  density="compact"
                                                                                  hide-details
                                                                                  :class="distributor.editedFields?.includes('floors') ? 'text-warning':''"
                                                                        >
                                                                            <template v-slot:item="{ item }">
                                                                                <v-list-item
                                                                                    @click="selectDistributorFloor(item.value, distributor)"
                                                                                >
                                                                                    <template v-slot:prepend>
                                                                                        <v-icon>
                                                                                            {{
                                                                                                distributor.floors.includes(item.value) ? 'mdi-minus-box-outline' : 'mdi-plus-box-outline'
                                                                                            }}
                                                                                        </v-icon>
                                                                                    </template>

                                                                                    <v-list-item-title>
                                                                                        {{ item.title }}
                                                                                    </v-list-item-title>
                                                                                </v-list-item>
                                                                            </template>
                                                                        </v-select>
                                                                    </v-col>
                                                                </v-row>
                                                                <v-row>
                                                                    <v-col sm="9" md="9" lg="9" xl="9">
                                                                        <v-text-field
                                                                            type="number"
                                                                            label="Nr. circuite"
                                                                            placeholder="Nr. circuite"
                                                                            v-model.number="distributor.circuitNo"
                                                                            variant="outlined"
                                                                            density="compact"
                                                                            class="text-right no-arrows"
                                                                            hide-details
                                                                            :class="distributor.editedFields?.includes('circuitNo') ? 'text-warning':''"
                                                                            @input="distributor.circuitNo = parseDistributorCircuitInput($event.target.value, distributor)"
                                                                            @update:modelValue="handleDistributorFieldEdit('circuitNo', distributor), handleUnitDistributorChoice(unit, true)"
                                                                        ></v-text-field>
                                                                    </v-col>
                                                                    <v-col align-self="center" sm="3" md="3" lg="3"
                                                                           xl="3"
                                                                           class="text-right">
                                                                        <v-btn icon variant="text" color="danger"
                                                                               @click="removeDistributor(index, distributor)">
                                                                            <v-icon>mdi-delete</v-icon>
                                                                        </v-btn>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-col>
                                                            <v-divider
                                                                v-if="getUnitDistributorsByAirType(unit, airType.value).length > 1 && duIndex !== getUnitDistributorsByAirType(unit, airType.value).length -1"></v-divider>
                                                        </v-row>
                                                    </v-card-text>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-fade-transition>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

import {UNIT_EXTENSIONS, UNIT_MOUNTING_OPTIONS, vmcUnits} from "@/VMC/vmcData";
import {v4 as uuidv4} from 'uuid';
import {formatNumber, showAlertModal} from "@/utils/utils";
import {mapGetters} from "vuex";

export default {
    name: "UnitSetup",
    props: {
        location: {
            type: Object,
            required: true
        },
        totalPressureLoss: {
            type: String,
        },
        totalAirVolume: {
            type: String,
        },
        floorGroupValues: {
            type: Array,
        },
    },
    emits: ['updated-floor-groups', 'updated-units', 'selected-unit'],
    created() {
        this.usedFloors = [];
        this.activeUnit = 0;
        this.units = this.getUnits;
        //If unit distributors were manually edited, set unit distributor choice to manual
        this.units.forEach(unit => {
            if (unit.distributors.some(distributor => distributor.isEdited))
                unit.isDistributorChoiceManual = true;
            if (unit.model_id) {
                unit.model = vmcUnits.find(model => {
                    return model.product_code === unit.model_id;
                })
                if (unit.model) {
                    this.getTubingOption(unit);
                }
            }
        });
        this.usedFloors = this.units.flatMap((unit) => unit.floor);
        this.recalculateUnitsDistributors();
        this.setupFloorGroups();
        this.calculateUnitValues();
    },
    mounted() {
        setTimeout(() => {
            this.alertRestriction = false;
        }, 3000)
    },
    data() {
        return {
            floorNames: [
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
            ],
            usedFloors: null,
            units: null,
            matchingUnits: null,
            activeUnit: null,
            distributorTypes: [{name: 'Metalic', value: 1}, {name: 'Modular', value: 2}],
            distributorAirTypes: [
                {name: 'Proaspăt', value: 1},
                {name: 'Viciat', value: 2}],
            mixedAir: {name: 'Mixt', value: 3},
            defaultDistributorType: {name: 'Modular', value: 2},
            metalicDistribuitorPossibleCircuits: [4, 6, 10, 15],
            tubingOptions: [
                {name: 'EPS', value: 1, diameters: [125, 160, 200]},
                {name: 'Flexibilă', value: 2, diameters: [125, 160]},
            ],
            selectedUnitModel: null,
            menu: false,
            unitOrientationOptions: [
                {
                    title: 'Toate',
                    value: 'none'
                },
                {
                    title: 'Orizontală',
                    value: 'horizontal'
                },
                {
                    title: 'Verticală',
                    value: 'vertical'
                }
            ],
            floorData: [],
            compatibleUnits: [],
            floorGroups: [],
            unitExtensions: UNIT_EXTENSIONS,
            // this variable is used for restricting the alert modal from firing up when the component is mounted
            alertRestriction: true,
            oldUnits: [],
        };
    },
    computed: {
        ...mapGetters(['userPermissions']),
        /**
         * A computed property that checks if all units are considered "Premium" and if there are more than one unit.
         * This is used to determine if certain sensors, like the "Modul modbus", can be displayed under specific conditions.
         * The conditions are:
         * 1. There must be more than one unit.
         * 2. Each unit's model type must include the string "Premium".
         *
         * @returns {boolean} True if all units are "Premium" and there are more than one, false otherwise.
         */
        allUnitsArePremium() {
            return this.units.length > 1 && this.units.every(unit => unit.model?.type?.includes('Premium'));
        },
        // computed property to return the unit extensions variants as objects in an array and also
        // adding the All option with no filter
        unitExtensionOptions() {
            let options = Object.values(UNIT_EXTENSIONS).map(extension => ({
                name: extension.name,
                value: extension.value
            }));

            // Add 'All' option at the beginning
            options.unshift({
                name: 'Toate',
                value: null  // null or any distinctive value to represent 'All'
            });

            return options;
        },
        unitMountingOptions() {
            let options = Object.values(UNIT_MOUNTING_OPTIONS).map(option => ({
                name: option.name,
                value: option.value,
            }));

            options.unshift({
                name: 'Toate',
                value: null
            });

            return options;
        },
        availableFloors() {
            return this.floors('')
        },
        floors() {
            const floorNames = this.floorNames;
            return (attributeName) => {
                return this.location.rooms.reduce((result, room) => {
                    const floorIndex = result.findIndex(floor => floor.floor === room.floor);
                    const floorValue = room.floor;
                    const floorName = floorNames.find(floor => floor.value === floorValue)?.name;

                    if (floorIndex === -1) {
                        if (attributeName === 'air_volume') {
                            result.push({
                                floor: floorValue,
                                floorName,
                                [attributeName]: parseFloat(room[attributeName])
                            });
                        } else {
                            result.push({
                                floor: floorValue,
                                floorName,
                                [attributeName]: room[attributeName]
                            });
                        }
                    } else {
                        if (attributeName === 'air_volume') {
                            result[floorIndex][attributeName] += parseFloat(room[attributeName]);
                        } else {
                            result[floorIndex][attributeName] += room[attributeName];
                        }
                    }
                    return result;
                }, []);
            }
        },
        maxUnits() {
            return this.availableFloors.length;
        },
        getUnits() {
            return this.location.units?.length ? this.location.units : [this.defaultUnit()]
        },

    },
    methods: {
        /**
         * Determines if the "Modul modbus" sensor should be displayed for a specific unit.
         * It checks two conditions:
         * 1. If the "Modul modbus" sensor is already selected in the current unit, it should always be displayed.
         * 2. If the "Modul modbus" sensor is not selected in any other unit, and all conditions are met
         *    (all units are premium and more than one unit exists), then the sensor can be displayed.
         *
         * @param {string} sensorName - The name of the sensor to check, specifically looking for "Modul modbus".
         * @param {number} unitIndex - The index of the current unit within the units array to determine its selection state.
         * @returns {boolean} True if the "Modul modbus" sensor should be displayed for the given unit, false otherwise.
         */
        shouldDisplayModbus(sensorName, unitIndex) {
            // Check if the current unit has Modul modbus selected
            const isModbusSelectedInCurrentUnit = this.units[unitIndex].selectedSensors.includes('Modul modbus');

            // Check if Modul modbus is selected in any OTHER unit
            const isModbusSelectedInOtherUnits = this.units.some((unit, index) => index !== unitIndex && unit.selectedSensors.includes('Modul modbus'));

            // Conditions to display Modul modbus:
            // 1. It's selected in the current unit OR
            // 2. It's not selected in any other unit AND all units are premium AND there are more than 1 unit
            return isModbusSelectedInCurrentUnit || (!isModbusSelectedInOtherUnits && this.allUnitsArePremium && this.units.length > 1);
        },
        formatNumber,
        // Method that is called for changing available unit models
        changeAvailableUnitModels(unit, index, orientationFilter, unitVersionFilter, showAllUnits) {
            this.matchFloorValuesForUnit(unit, index, showAllUnits, orientationFilter, unitVersionFilter);
        },
        getFloorNameByValue(floorValue) {
            return this.floorNames.find(floor => floor.value === floorValue)?.name ?? "Floor not found"
        },
        getDistributorAvailableFloors(unit) {
            return unit.floor.map(floor => this.floorNames.find(fl => fl.value === floor))
        },
        /**
         * Determines and assigns a suitable tubing option to the specified unit based on the unit's model available tubing.
         * This method enriches the model's available tubing options with their corresponding 'value' from a predefined set
         * of tubing options. It prioritizes tubing options marked as 'recommended'. If no such option exists, it defaults
         * to the first available option. The selected tubing's value is then assigned to the unit if the unit does not
         * already have a tubing option set. Additionally, this method updates the unit's diameter options based on the
         * selected tubing and sets the unit's resulted tubing options based on the available tubing names.
         *
         * @param {Object} unit - The unit object containing the model and current tubing information. The model's availableTubing
         *                        array should include objects with 'name' and optionally 'diameter' and 'recommended' properties.
         *                        This method enriches these objects with a 'value' property corresponding to their match in a
         *                        predefined set of tubing options and selects an appropriate tubing option for the unit based on
         *                        these enriched objects.
         */
        getTubingOption(unit) {
            // Convert the available tubing options to include their 'value' from tubingOptions
            const availableTubingWithOptions = unit.model.availableTubing.map(tubing => {
                const foundOption = this.tubingOptions.find(option => option.name === tubing.name);
                return {
                    ...tubing,
                    value: foundOption ? foundOption.value : null
                };
            });

            // Attempt to find a recommended tubing option, otherwise default to the first available option
            const selectedTubing = availableTubingWithOptions.find(tubing => tubing.recommended) || availableTubingWithOptions[0];

            // Set unit tubing if not already set
            if (!unit.tubing && selectedTubing) {
                unit.tubing = selectedTubing.value;
            }

            // Update the unit's diameter options based on the selected tubing
            this.getTubingDiameterOptionByValue(unit);

            // Filter and set the unit's resulted tubing options based on available tubing names
            const availableTubingNames = unit.model.availableTubing.map(item => item.name);
            unit.resultedTubingOptions = this.tubingOptions.filter(option => availableTubingNames.includes(option.name));
        },
        /**
         * Determines the tubing diameter options based on the selected tubing option.
         * For super users, it returns all diameters while marking the recommended ones.
         * For non-super users, it only returns the recommended diameters.
         *
         * @param {Object} unit - The unit object for which the tubing diameter options are determined.
         */
        getTubingDiameterOptionByValue(unit) {

            let matchedOption = this.tubingOptions.find(option => option.value === unit.tubing);
            let resultedDiameters = [];

            if (!matchedOption) {
                unit.tubingDiameterOptions = [];
                return [];
            }

            // Determine diameters based on user type
            if (this.userPermissions.canEditTubingDiameters) {
                resultedDiameters = matchedOption.diameters.map(diameter => ({
                    value: diameter,
                    isRecommended: unit.model.availableTubing.some(recommendation =>
                        recommendation.name === matchedOption.name && recommendation.diameter === diameter
                    )
                }));
            } else {
                resultedDiameters = unit.model.availableTubing
                    .filter(recommendation => recommendation.name === matchedOption.name)
                    .map(recommendation => ({
                        value: recommendation.diameter,
                        isRecommended: true
                    }));
            }

            unit.tubingDiameterOptions = resultedDiameters;

            // Set the recommended tubing diameter if not already set
            if (!unit.tubing_diameter) {
                const recommendedDiameter = resultedDiameters.find(tubing => tubing.isRecommended);
                unit.tubing_diameter = recommendedDiameter ? recommendedDiameter.value : null;
            }
        },
        /**
         * Event handler for when the tubing option changes.
         * It updates the tubing diameter options based on the new selection.
         * If there are diameters available it sets the recommended diameter.
         *
         * @param {Object} unit - The unit object for which the tubing selection has changed.
         */
        onTubingChange(unit) {
            this.getTubingDiameterOptionByValue(unit);

            const diameters = unit.tubingDiameterOptions;
            if (diameters.length > 0) {
                const recommended = diameters.find(d => d.isRecommended);
                unit.tubing_diameter = recommended ? recommended.value : null;
            }
        },
        setUnitTubingDiameter(unit, item, index) {
            unit.tubing_diameter = item.value;
            this.$refs.unitTubingSelect[index].menu = false;
            this.calculateDistributors(unit);
        },
        itemDescription(item) {
            if (item) {
                return `${item.name}${item.options.includes('enthalpic') ? ' Entalpic ' : ' '}${item.version}`
            }
        },
        defaultUnit() {
            return {
                id: uuidv4(),
                floor: [],
                type: '',
                model: '',
                cascading: false,
                heating: false,
                warmTemp: null,
                coldTemp: null,
                selectedSensors: [],
                collapsed: false,
                isDistributorChoiceManual: false,
                distributors: [{type: this.defaultDistributorType.value, floors: []}],
                possibleModels: [],
            }
        },
        setupFloorGroups() {
            let groups = []
            this.units.forEach(unit => {
                if (unit.floor.length) {
                    let floors = unit.floor
                    let isGroupUnique = true;
                    groups.forEach(group => {
                        if (JSON.stringify(group.floors.slice().sort()) === JSON.stringify(floors.slice().sort())) {
                            isGroupUnique = false
                            unit.floorGroupId = group.id
                        }
                    });
                    if (isGroupUnique) {
                        let newGroupId = uuidv4()
                        unit.floorGroupId = newGroupId
                        groups.push({id: newGroupId, floors})
                    }
                }
            });
            this.floorGroups = groups
            this.$emit('updated-floor-groups', this.floorGroups)
        },
        /**
         * Calculates and updates the total pressure loss and total air volume values for each unit within a specific floor group.
         * This method iterates over each floor group, identifying all units associated with the current group. For each unit within the group,
         * it sets the `totalPressureLoss` to the highest pressure loss found in the group and calculates the `totalAirVolume` as half of the
         * total air volume required by all rooms within the group. This method also updates `this.oldUnits` to a snapshot of the units before
         * these calculations are applied, preserving their state for future comparisons or operations. This snapshot is deep-copied to ensure
         * that subsequent changes to the units do not affect the stored previous state.
         */
        calculateUnitValues() {
            this.floorGroupValues.forEach(group => {
                let units = this.units.filter(unit => unit.floorGroupId === group.floorGroupId);
                this.oldUnits = JSON.parse(JSON.stringify(units));
                units.forEach(unit => {
                    unit.totalPressureLoss = group.highestPressureLoss || 0;
                    unit.totalAirVolume = group.roomsTotalAirVolume / 2 || 0;
                });
            });
        },
        selectDistributorFloor(floor, distributor) {
            if (!distributor.floors.includes(floor)) {
                distributor.floors.push(floor);
            } else {
                distributor.floors = distributor.floors.filter(distFloor => distFloor !== floor);
            }
            this.handleDistributorFieldEdit('floors', distributor)
            this.handleDistributorSelectFloor(distributor)
        },
        /**
         * Handles the selection of a floor for a unit. This method manages the assignment and reassignment of floor groups based on the selection.
         * It performs several checks and operations:
         * 1. Determines if the selected floor already belongs to an existing group.
         * 2. Merges floor groups if necessary.
         * 3. Assigns a new floor group to the floor if it doesn't belong to any.
         * 4. Updates floor groups and unit floor group IDs as needed.
         * 5. Emits an event with updated floor groups.
         * 6. Recalculates unit distributors and unit models based on the new floor assignments.
         *
         * @param isManualUpdate - Flag indicating if the update is manual.
         * @param {string} floor - The identifier of the selected floor.
         * @param {number} unitIndex - The index of the unit in the units array for which the floor is being selected.
         */
        selectFloor(isManualUpdate = false, floor, unitIndex) {
            //Check to see if floor selected already belongs to a group
            const unit = this.units[unitIndex];

            let unitGroup = this.floorGroups.find(group => group.id === unit.floorGroupId);
            let existingFloorGroup = this.floorGroups.find(group => group?.floors?.includes(floor));
            let currentGroupId = unitGroup && !existingFloorGroup ? unitGroup.id : existingFloorGroup?.id;

            // Set unit's isManualUpdate to the value passed to the method
            unit.isManualUpdate = isManualUpdate;

            if (!unit.floor.includes(floor)) {
                //If floor belongs to a group, but unit also has a group, combine the 2 floor Groups
                if (existingFloorGroup && unitGroup) {
                    existingFloorGroup.floors.push(...unitGroup.floors.splice(0, unitGroup.floors.length))
                    unit.floorGroupId = existingFloorGroup.id
                }
                //If floor has its own floor group, add the floor to it
                else if (unitGroup)
                    unitGroup.floors.push(floor);
                //If floor has an existing floor group, add that floorGroupId to this unit
                else if (existingFloorGroup)
                    unit.floorGroupId = existingFloorGroup.id;
                //Else, create a new floorGroup with a new Id and add the selected floor
                else {
                    let newFloorGroup = {id: uuidv4(), floors: [floor]};
                    this.floorGroups.push(newFloorGroup)
                    unit.floorGroupId = newFloorGroup.id;
                    currentGroupId = newFloorGroup.id;
                }
            } else {
                //If the floor already exists in the unit floor group, remove it
                if (unitGroup) {
                    unitGroup.floors = unitGroup.floors?.filter(f => f !== floor);
                    unit.distributors.forEach(distributor =>
                        distributor.floors = distributor.floors.filter(distFloor => distFloor !== floor));
                }

            }
            //Find the group that is currently being processed               
            let currentGroup = this.floorGroups.find(group => group.id === currentGroupId);
            //For that specific floor group id, update the correct floors for all units bound to it
            this.units.filter(unit => unit.floorGroupId === currentGroupId)
                .forEach(unit => {
                    unit.floor = currentGroup?.floors
                    if (!currentGroup?.floors?.length)
                        unit.floorGroupId = null
                });
            //Remove any redundant floor group that has no floors
            this.floorGroups = this.floorGroups.filter(group => group.floors?.length)
            this.$emit('updated-floor-groups', this.floorGroups)

            if (unit.floor.length < 1) {
                this.units[unitIndex].model = null;
            }

            this.usedFloors = this.units.flatMap((unit) => unit.floor);

            this.closeUnitFloorSelect(this.availableFloors, unitIndex);

            //If unit floors are added/removed and the distributorChoice is not set to manual, the distributors will be recalculated
            this.recalculateUnitsDistributors()
            // Recalculate the values for all units
            this.calculateUnitValues();
            this.recalculateUnitModels();
        },
        // this method closes the unit floor select depending on how many floors there are available and using the unit's index
        closeUnitFloorSelect(floors, index) {
            if (floors.length < 2) {
                this.$refs.unitFloorSelect[index].menu = false;
            }
        },
        /**
         * Updates the list of compatible units for a specified unit, based on input criteria such as total pressure loss, total air volume,
         * and various filters. This method leverages the `findUnits` function to determine compatible units and assigns the result to a
         * variable for subsequent display. It also evaluates whether the current selection of a unit model remains valid against the newly
         * found compatible units. If the selected model is not within the updated list of compatible units, or if there have been changes in
         * the unit's total pressure loss or air volume that render the current selection incompatible, the method will clear the current
         * unit model selection. Additionally, depending on user permission settings, it may display a warning message to alert the user
         * about the removal of the unit model due to these incompatibilities or changes.
         *
         * @param {Object} unit - The unit object, including properties such as totalPressureLoss and totalAirVolume.
         * @param {number} unitIndex - The index within the `units` array for which compatible units are being updated.
         * @param {boolean} displayAllUnits - A boolean flag indicating whether to display all units or to apply filtering based on the provided criteria.
         * @param {string} orientationFilter - A filter for the orientation of the units.
         * @param {string} unitVersionFilter - A filter for the version of the units.
         */
        matchFloorValuesForUnit(unit, unitIndex, displayAllUnits, orientationFilter, unitVersionFilter) {
            // Updates the compatible units array for the specified unit index by finding units that meet the specified criteria.
            this.compatibleUnits[unitIndex] = this.findUnits(vmcUnits, unit?.totalPressureLoss, unit?.totalAirVolume, displayAllUnits, orientationFilter, unitVersionFilter, unit.unitMountingFilter);

            // Checks if the currently selected unit model is not within the compatible units, and checks if totalPressureLoss or totalAirVolume has changed.
            if (
                unit.model &&
                this.compatibleUnits[unitIndex].length > 0 &&
                this.compatibleUnits[unitIndex].filter(unitModel => unitModel.product_code.includes(unit.model.product_code)).length < 1 &&
                (this.oldUnits[unitIndex]?.totalPressureLoss !== unit?.totalPressureLoss || this.oldUnits[unitIndex]?.totalAirVolume !== unit?.totalAirVolume)
            ) {
                if (!this.alertRestriction) {
                    this.units[unitIndex].model = null;
                    // Shows a warning modal to the user about the removed unit model due to incompatibility or changes in totalPressureLoss/totalAirVolume.
                    showAlertModal(this.$store, 'Modelul de unitate a fost sters deoarece acesta nu se mai potriveste dimensionarii actuale sau au fost schimbari in pierderea de presiune/ volumul de aer', 'warning', 5000);
                }
            }
        },
        /**
         * Filters and returns a list of VMC units based on specified criteria, dynamically comparing each unit's computed pressure loss against a specified threshold. This method evaluates the suitability of units by applying a combination of filters (if provided) and by dynamically assessing whether each unit's computed pressure loss from its `value` function—given the input volume—exceeds the specified minimum pressure loss. A special consideration is implemented for units with versions '600v' and '800v', which are only included if units with '550v' or '500h' versions do not meet the pressure loss criteria. This function also supports a superuser mode that can override other filters to return all units.
         *
         * @param {Array<Object>} vmcUnits - An array of VMC unit objects to be filtered. Each unit object should include properties such as `version`, `value` (a function to compute pressure loss), and filtering criteria like `orientation` and `mountingOptions`.
         * @param {number} pressureLoss - The minimum pressure loss (as a numerical value) that units must exceed to be considered a match.
         * @param {number} volume - The volume input (as a numerical value) used in each unit's `value` function to compute the pressure loss.
         * @param {boolean} returnAllForSuperUser - A flag indicating whether all units should be returned if the caller is identified as a superuser, bypassing standard filter criteria.
         * @param {string|null} orientationFilter - A filter for unit orientation (e.g., 'horizontal', 'vertical'), or 'none' to apply no orientation filter. Units not matching the specified orientation are excluded from the results.
         * @param {Object|null} unitVersionFilter - An optional filter object specifying criteria for unit versions. Units not matching these criteria are excluded. The filter should be structured to match properties within each unit's `options` array.
         * @param {Object|null} unitMountingFilter - An optional filter object specifying criteria for unit mounting options. Similar to `unitVersionFilter`, units not matching these criteria are excluded.
         * @returns {Array<Object>} An array of filtered VMC unit objects. Units that meet the specified criteria are included in the result, with each potentially modified to include a 'matched' property indicating its suitability based on the applied filters.
         */
        findUnits(vmcUnits, pressureLoss, volume, returnAllForSuperUser, orientationFilter, unitVersionFilter, unitMountingFilter) {
            if (returnAllForSuperUser) {
                // Immediately return all units if the superuser flag is set, bypassing all filters.
                return vmcUnits.map(unit => ({...unit}));
            }

            let results = [];
            let includedTypes = new Set();
            // Special condition for Premium Home 600 and 800 units
            let isLargePremiumHomeNeeded = true;

            // Evaluate Premium Home types needed
            vmcUnits.forEach(unit => {
                if ((unit.type === 'Premium H' || unit.type === 'Premium V') && unit.value(volume) > pressureLoss) {
                    isLargePremiumHomeNeeded = false;
                }
            });

            // Filtering based on criteria
            vmcUnits.forEach(unit => {
                let valueResult = unit.value ? unit.value(volume) : null;

                if (valueResult !== null && valueResult > pressureLoss) {
                    let unitCopy = {...unit};
                    let isMatch = true; // Assume match initially

                    // Filtering logic for unit version, orientation, and mounting
                    if (unitVersionFilter && unitVersionFilter.value !== null && unit.options) {
                        const hasMatchingOption = unit.options.some(option =>
                            Object.entries(unitVersionFilter).every(([key, value]) => option[key] === value)
                        );
                        if (!hasMatchingOption) isMatch = false;
                    }

                    if (orientationFilter && orientationFilter !== 'none' && unit.orientation !== orientationFilter) {
                        isMatch = false;
                    }

                    // Special Premium Home condition
                    if ((unit.version.includes('600') || unit.version.includes('800')) && !isLargePremiumHomeNeeded) {
                        isMatch = false;
                    }

                    if (unitMountingFilter && unitMountingFilter.value !== null) {
                        const matchesMounting = unit.mountingOptions.some(option => option.value === unitMountingFilter.value);
                        if (!matchesMounting) isMatch = false;
                    }

                    // Add to results if all criteria matched
                    if (isMatch && !includedTypes.has(unit.type)) {
                        unitCopy.matched = true;
                        includedTypes.add(unit.type);
                        results.push(unitCopy);
                    }
                }
            });

            // Sort units as needed
            return this.sortUnits(results);
        },
        /**
         * Sorts an array of VMC unit objects based on a two-tiered set of criteria to ensure a specific order. The primary sorting is based on unit names in the following order:
         * Units that include "Standard" are sorted first, followed by "Premium" units, and then "Premium Home" units.
         * As a secondary sorting criterion, units are further sorted based on the number of options they contain, with units having fewer options (simpler configurations) appearing before those with more options (more complex configurations).
         * This secondary sorting applies when units are equivalent in the primary sorting criterion (i.e., when they are of the same type according to the primary sorting order).
         *
         * @param {Array<Object>} units - An array of VMC unit objects to be sorted.
         * @returns {Array<Object>} A sorted array of VMC unit objects, first by their type as per the primary criteria and then by the simplicity of their options as per the secondary criteria.
         */
        sortUnits(units) {
            const typeToOrder = {
                'Standard': 1,
                'Standard E': 2,
                'Premium V': 3,
                'Premium V ++': 4,
                'Enthalpic V': 5,
                'Premium H': 6,
                'Premium H ++': 7,
                'Enthalpic H': 8,
                'Premium Home': 9
            };

            // Add orderNumber based on type
            units.forEach(unit => {
                unit.orderNumber = typeToOrder[unit.type] || 999; // Use 999 as a fallback for undefined types
            });

            return units.sort((a, b) => a.orderNumber - b.orderNumber);
        },
        getUnitDistributorsByAirType(unit, airType) {
            return unit.distributors.filter(distributor => distributor.airType === airType)
        },
        getUnitNeededAndTotalCircuits(unit, airType) {
            let neededCircuits = this.calculateTotalUnitCircuitsByAirType(unit, airType);
            let totalCircuits = this.calculateFloorGroupTotalAllocatedCircuits(unit, airType);
            return {totalCircuits, neededCircuits}
        },
        /**
         * Handles the selection of a unit's model. It updates the unit's model with the selected model,
         * resets selected sensors, sets model ID, orientation, and default mounting option. It also clears
         * existing tubing and tubing diameter selections, recalculates unit values, and closes the model selection menu.
         *
         * @param {Object} model - The selected model object.
         * @param {number} index - The index of the unit in the units array.
         */
        selectModel(model, index) {
            // Assign selected model to the unit
            this.units[index].model = model;

            // Reset selected sensors and set model properties
            this.units[index].selectedSensors = [];
            this.units[index].model_id = model.product_code;
            this.units[index].orientation = model?.orientation;
            this.units[index].selected_mounting = model.mountingOptions[0].value;

            // Clear existing tubing and diameter selections
            this.units[index].tubing = null;
            this.units[index].tubing_diameter = null;

            // Recalculate tubing options and unit values
            this.getTubingOption(this.units[index]);
            this.calculateUnitValues();

            // Close the model selection menu
            this.$refs.unitModelSelect[index].menu = false;
        },
        recalculateUnitModels() {
            // Recalculate the values for all units
            this.units.forEach((unit, index) => {
                this.matchFloorValuesForUnit(unit, index, this.showAllUnits, null, null);
            });
        },
        /**
         * Adds a new distributor to a specific unit unless the unit's tubing is 2 and the tubing diameter is 125.
         * This method is designed to conditionally append a new distributor object to the unit's distributors array based on
         * the unit's tubing configuration. The new distributor inherits properties from the default distributor type and
         * includes additional details such as floor, airType, and circuit number. It also marks the distributor choice as manual.
         *
         * @param {number} index - The index of the unit in the `units` array to which the distributor is to be added.
         * This index is used to locate the specific unit object within the array.
         * @param {string} airType - The type of air (e.g., "supply" or "return") that the distributor will handle.
         * This parameter specifies the air flow direction or purpose for the new distributor.
         */
        addDistributor(index, airType) {
            let unit = this.units[index];
            if (!(unit.tubing === 2 && unit.tubing_diameter === 125)) {
                let newDistributor = {
                    type: this.defaultDistributorType.value,
                    floors: [...unit.floor],
                    airType,
                    circuitNo: 0
                }
                unit.isDistributorChoiceManual = true
                this.units[index].distributors.push(newDistributor)
            }
        },
        removeDistributor(index, distributor) {
            let distributorIndex = this.units[index].distributors.indexOf(distributor)
            this.units[index].distributors.splice(distributorIndex, 1)
        },
        handleUnitDistributorChoice(unit, isManual) {
            return unit.isDistributorChoiceManual = isManual
        },
        handleDistributorFieldEdit(field, distributor) {
            if (!distributor.editedFields)
                distributor.editedFields = []
            distributor.editedFields.push(field);
            distributor.isEdited = true;
        },
        // this method calculates the choices available for a distributor's circuitNo value while
        // returning it along with a maximum value possible, if there are no choices available it returns the actual
        // value that was inserted by the user
        parseDistributorCircuitInput(value, distributor) {
            value = parseInt(value);

            let choices = this.getDistributorCircuitsChoices(distributor);

            // If there are no choices, return the input value directly
            if (choices.length === 0) {
                return value;
            }

            let distributorTypeMaxCircuits = Math.max(...choices);
            return value > distributorTypeMaxCircuits ? distributorTypeMaxCircuits : value < 0 ? 0 : value;
        },
        getDistributorCircuitsChoices(distributor, unit) {
            if (distributor.type === 1) { // Assuming '1' is the type for metallic distributors
                // Return the possible choices based on the tubing diameter
                if (unit && unit.tubing_diameter === 125) {
                    return [4, 6, 10];
                } else if (unit && unit.tubing_diameter === 160) {
                    return [10, 15];
                } else if (unit && unit.tubing_diameter === 200) {
                    // Return a default or an empty array if the diameter doesn't match any case
                    this.$store.commit('pushVmcError', {
                        type: 'error',
                        text: 'Pentru selectia curenta de tubulatura nu exista distribuitoare metalice compatibile, va rugam ajustati manual'
                    })
                    return [];
                } else {
                    return [];
                }
            } else {
                // Assuming other types of distributors can have any number of circuits from 1 to 15
                return Array.from({length: 16}, (_, i) => i + 1);
            }
        },
        calculateDistributors(unit) {
            unit.distributors = []
            this.distributorAirTypes.forEach(airType => {
                //Calculate necessary, allocated, and unallocated circuits for unit's floorGroup
                let totalCircuits = this.calculateTotalUnitCircuitsByAirType(unit, airType.value);
                let allocatedCircuits = this.calculateFloorGroupTotalAllocatedCircuits(unit, airType.value);
                let unallocatedCircuits = totalCircuits - allocatedCircuits;

                // Calculate how many distributors are needed for the unallocated circuit count
                let defaultDistributor = {type: this.defaultDistributorType.value};
                let maxCircuitsPerDistributor = Math.max(...this.getDistributorCircuitsChoices(defaultDistributor, unit));
                let remainder = unallocatedCircuits % maxCircuitsPerDistributor;
                let quotient = Math.floor(unallocatedCircuits / maxCircuitsPerDistributor);

                //If there are more circuits than the max value of a distributor, add as many distributors as needed + the remainder
                let permutations = Array.from({length: quotient}, () => maxCircuitsPerDistributor).concat(remainder);
                permutations.forEach(permutation => {
                    if (permutation > 0)
                        unit.distributors.push({
                            type: this.defaultDistributorType.value,
                            floors: [...unit.floor],
                            airType: airType.value,
                            circuitNo: permutation
                        });
                });
            })
            unit.isDistributorChoiceManual = false;
        },
        handleDistributorSelectFloor(distributor) {
            //Check the circuit count for the distributor floor group
            let floorCircuitCount = this.calculateTotalFloorCircuitsByAirType(distributor.floors, distributor.airType)
            //Reset the distributor circuit count as to not affect the calculation for allocated circuits
            distributor.circuitNo = 0;
            //Calculate the circuit count of allocated circuits for the distributor floor group
            let sharingDistributors = this.units.flatMap(unit => unit.distributors.filter(d => d.floors.every(floor => distributor.floors.includes(floor)) && d.airType === distributor.airType));
            let allocatedFloorCircuitCount = sharingDistributors.reduce((total, distributor) => total += distributor.circuitNo, 0);
            distributor.circuitNo = floorCircuitCount - allocatedFloorCircuitCount;
        },
        recalculateUnitsDistributors() {
            let autoChoiceUnits = this.units.filter(unit => !unit.isDistributorChoiceManual);
            this.resetUnitsDistributors(autoChoiceUnits);
            autoChoiceUnits.forEach(unit => this.calculateDistributors(unit));
        },
        resetUnitsDistributors(units) {
            units.forEach(unit => unit.distributors = []);
        },
        //Method that calculates the total circuit count necessary for a unit
        calculateTotalUnitCircuitsByAirType(unit, airType) {
            return this.calculateTotalFloorCircuitsByAirType(unit.floor, airType);
        },
        //Method that calculates the total allocated circuit count for a floor group
        calculateFloorGroupTotalAllocatedCircuits(unit, airType) {
            let sharingUnits = this.units.filter(u => u.floorGroupId === unit.floorGroupId)
            return sharingUnits.flatMap(u => u.distributors.filter(d => d.airType === airType).map(d => d.circuitNo))
                .reduce((total, circuitNo) => total += circuitNo, 0);
        },
        //Method that calculates the total circuit count necessary for a group of floors
        calculateTotalFloorCircuitsByAirType(floors, airType) {
            let coveredRooms = this.location.rooms.filter(room => floors.includes(room.floor) && !room.isExcludedFromAdjust);
            return coveredRooms.flatMap(room => room.plenums).filter(plenum => plenum.air === airType)
                .reduce((total, plenum) => total += plenum.size, 0);
        },
        addUnit() {
            if (
                this.userPermissions.canAddUnitsAboveNeeded ||
                (this.units.length < this.maxUnits && this.usedFloors.length < this.availableFloors.length)
            ) {
                this.units.push(this.defaultUnit());
                this.activeUnit = this.units.length - 1;
            } else {
                alert(
                    `Poți să adaugi un maxim de ${this.maxUnits} unități (o unitate per etaj).`
                );
            }
        },
        /**
         * Resets the filters for a specific unit by setting various filter properties to null or their default states.
         * It also updates the available unit models based on the reset filters by calling `changeAvailableUnitModels` method.
         *
         * @param {number} index - The index of the unit in the `units` array to reset the filters for.
         */
        resetUnitFilters(index) {
            let unit = this.units[index];
            // Resetting the unit version filter to its default state (null).
            unit.unitVersionFilter = null;
            // Resetting the unit mounting filter to its default state (null).
            unit.unitMountingFilter = null;
            // Resetting the selected orientation filter to its default state (null).
            unit.selectedOrientationFilter = null;
            // Resetting the model to its default state (null).
            unit.model = null;
            // Updating the available unit models based on the reset filters.
            // The method `changeAvailableUnitModels` is expected to handle the logic for updating the unit's available models.
            // It's passed the current unit, its index, an empty string, null, and false as parameters, though their specific purposes are not detailed here.
            this.changeAvailableUnitModels(unit, index, '', null, false);
        },
        removeUnit(index) {
            let unit = this.units[index]
            const removedFloor = unit.floor;
            this.units.splice(index, 1);
            this.activeUnit = 0;
            this.usedFloors = this.usedFloors.filter((floor) => !removedFloor.includes(floor));
            //If a unit is removed, the floorGroups are also updated
            let groupSharingUnits = this.units.filter(u => u.floorGroupId === unit.floorGroupId);
            if (!groupSharingUnits.length) {
                this.floorGroups = this.floorGroups.filter(group => group.id !== unit.floorGroupId);
                this.$emit('updated-floor-groups', this.floorGroups)
            }
            this.calculateUnitValues();
            this.recalculateUnitModels();
            this.recalculateUnitsDistributors();
        },
    },
    watch: {
        /**
         * Vue watcher for the 'location.rooms' property. This watcher manages the synchronization of floors between units and rooms.
         * It performs the following operations:
         * 1. Identifies new floors in rooms and adds them to the respective units using the selectFloor method.
         * 2. Remove floors from units that are no longer present in any room.
         * 3. Eliminates duplicate floor entries in a unit.
         * Additional logic is applied to handle single units and manual updates, as well as to respond to specific route parameters.
         *
         * @param {Array} newVal - The new value of the 'location.rooms' property, typically an array of room objects.
         */
        'location.rooms': {
            handler(newVal) {
                this.units.forEach((unit, unitIndex) => {
                    // Extract floors from all rooms
                    const roomFloors = newVal.map(room => room.floor);


                    // Conditionally add new floors to each unit
                    if (this.units.length === 1) {
                        roomFloors.forEach(floor => {
                            if (!unit.floor.includes(floor) &&
                                !unit.isManualUpdate &&
                                !this.$route.params.offerId) {
                                this.selectFloor(false, floor, unitIndex);
                            }
                        });
                    }

                    // Store the original floors for comparison
                    const originalFloors = [...unit.floor];

                    // Filter out floors not present in any room
                    unit.floor = unit.floor.filter(floor => roomFloors.includes(floor));

                    // Check if any floors were removed
                    const removedFloors = originalFloors.filter(floor => !unit.floor.includes(floor));
                    if (removedFloors.length > 0) {
                        // We need to call this function if floors we're removed since the update of FloorGroupValues
                        // triggers before this one (for some reason) resulting in unit's floors not being updated if any are removed
                        this.recalculateUnitsDistributors();
                    }

                    // Eliminate any duplicates that might have been added
                    unit.floor = Array.from(new Set(unit.floor));
                });
            }
        },
        floorGroupValues: {
            handler() {
                this.calculateUnitValues();
                this.recalculateUnitModels();
                this.recalculateUnitsDistributors();
            },
            deep: true,
        },
        units: {
            handler() {
                this.$emit('updated-units', this.units)
            },
            deep: true,
        }
    },
};
</script>
<style scoped>
.no-arrows input[type='number'] {
    -moz-appearance: textfield;
}

.no-arrows input::-webkit-outer-spin-button,
.no-arrows input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.v-row + .v-row {
    margin-top: 0;
}

.v-checkbox .v-label, .v-checkbox .v-selection-control {
    align-items: flex-start;
}

.unit-sensor-column {
    padding: 6px 12px !important;
}
</style>