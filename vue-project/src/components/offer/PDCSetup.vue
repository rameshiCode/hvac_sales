<template>
    <v-row class="mt-3">
        <v-col cols="6" md="12" lg="6" sm="12" v-for="(unit, index) in selectedUnits" :key="unit">
            <v-card>
                <v-toolbar>
                    <v-toolbar-title>
                        Unitate {{ index + 1 }}
                    </v-toolbar-title>
                    <v-toolbar-items>
                        <v-btn color="primary" density="compact" size="small" @click="prepareHeadersAndData">Tabel
                            puteri
                            pompe
                        </v-btn>
                        <!-- Dialog for Data Table -->
                        <v-dialog v-model="showTable" persistent>
                            <v-card>
                                <v-card-title class="d-flex flex-row justify-content-between align-items-center">
                                    Detalii pompe
                                    <v-spacer></v-spacer>
                                    <v-btn icon @click="showTable = false" variant="plain">
                                        <v-icon color="danger">mdi-close</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-card-text>
                                    <v-data-table :headers="headers" :items="selectedUnitDetails" class="elevation-1"
                                                  fixed-header sticky>
                                    </v-data-table>
                                </v-card-text>
                            </v-card>
                        </v-dialog>

                        <v-btn v-if="index === selectedUnits.length - 1" @click="addUnit" icon>
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn v-if="selectedUnits.length > 1" @click="removeUnit(index)" icon color="danger">
                            <v-icon>mdi-trash-can</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <v-row>
                        <v-col sm="12" md="3" lg="3">
                            <v-select
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.unitType"
                                :items="unit.types"
                                item-title="text"
                                item-value="value"
                                label="Tip"
                                return-object
                                @update:modelValue="onTypeChange(index)"
                            ></v-select>
                        </v-col>
                        <v-col sm="12" md="3" lg="3">
                            <v-select
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.selectedManufacturer"
                                :items="unit.manufacturers"
                                item-title="text"
                                item-value="value"
                                return-object
                                label="Brand"
                                @update:modelValue="updateAvailableUnits(index)"
                            ></v-select>
                        </v-col>
                        <v-col sm="12" md="3" lg="3">
                            <v-select
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.current"
                                item-title="text"
                                item-value="value"
                                :items="unit.currentOptions"
                                return-object
                                label="Curent"
                                @update:modelValue="onCurrentOptionChange(unit.current.value, index)"
                            ></v-select>
                        </v-col>
                        <v-col sm="12" md="3" lg="3">
                            <v-select
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.selectedResistance"
                                item-title="text"
                                item-value="value"
                                :items="unit.availableResistances"
                                label="Rezistență electrică"
                                return-object
                                :disabled="!unit.selectedManufacturer || unit.selectedManufacturer.value !== 1"
                                @update:modelValue="updateAvailableUnits(index); updateUnits(index)"
                            ></v-select>
                        </v-col>
                        <v-col sm="12" md="12" lg="4">
                            <v-text-field
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.selectedPumpPower"
                                label="Putere pompa -15 grade"
                                return-object
                                dirty
                                @update:modelValue="updateAvailableUnits(index)"
                            ></v-text-field>
                        </v-col>
                        <v-col sm="12" md="12" lg="8">
                            <v-select
                                variant="outlined"
                                density="compact"
                                hide-details
                                v-model="unit.selectedUnit"
                                :items="unit.availableUnits"
                                item-title="name"
                                item-value="product_code"
                                label="Model Unitate PDC"
                                return-object
                                ref="unitModelSelect"
                            >
                                <template v-slot:item="{ item }">
                                    <v-list-item @click="selectModel(item.raw, index)">
                                        <v-list-item-title
                                            :style="{ fontWeight: item.value.matched ? 'bold' : 'normal' }"
                                        >
                                            {{ item.title }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                    </v-row>
                    <v-row v-if="unit.selectedUnit?.type === 2">
                        <v-col cols="12" v-for="internalUnit in selectedUnits[index].internalUnits" :key="internalUnit">
                            <v-card>
                                <v-card-title>Unitate interna</v-card-title>
                                <v-card-text>
                                    <v-select
                                        variant="outlined"
                                        density="compact"
                                        hide-details
                                        v-model="internalUnit.selectedInternalUnitModel"
                                        :items="internalUnit.availableInternalUnitModels"
                                        item-title="name"
                                        item-value="product_code"
                                        label="Model"
                                        @update:modelValue="updateUnits"
                                        return-object
                                    ></v-select>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import {pdcInternalUnits, pdcUnits} from '@/PDC/pdcData.js'; // Adjust the path accordingly
import {VDataTable} from "vuetify/lib/labs/VDataTable";

export default {
    name: "PDCSetup",
    components: {
        VDataTable
    },
    data() {
        return {
            unitType: null,
            selectedFilter: '',
            selectedManufacturer: null,
            current: null,
            selectedResistance: '',
            availableResistances: [
                {
                    text: 'Fara rezistenta',
                    value: 0
                },
                {
                    text: '2 kW',
                    value: 2
                },
                {
                    text: '3 kW',
                    value: 3
                },
                {
                    text: '4,5 kW',
                    value: 4.5
                },
            ],
            types: [{text: 'Toate', value: null}, {text: 'Monobloc', value: 1}, {text: 'Split', value: 2}],
            manufacturers: [
                {
                    text: 'Toate',
                    value: null
                },
                {
                    text: 'Sistema',
                    value: 1
                },
                {
                    text: 'Domusa',
                    value: 2
                },
                {
                    text: 'Mitsubishi',
                    value: 3
                }
            ],
            availableUnits: [],
            selectedUnit: null,
            currentOptions: [
                {
                    text: 'Toate',
                    value: null
                },
                {
                    text: 'Monofazic',
                    value: 1,
                },
                {
                    text: 'Trifazic',
                    value: 2,
                }
            ],
            selectedUnits: [],
            defaultUnit: null,
            defaultInternalUnit: null,
            showTable: false, // Controls visibility of the dialog
            selectedUnitDetails: [], // Data to be displayed in the table
            headers: [
                {title: 'Cod produs', key: 'product_code'},
                {title: 'Denumire', key: 'name'},
            ],
            defaultHeaders: [
                {title: 'Cod produs', key: 'product_code'},
                {title: 'Denumire', key: 'name'},
            ],
        };
    },
    emits: ['selected-unit-model'],
    created() {
        if (!this.offerId) {
            this.initializeUnits();
            this.initializeFilters(0);
        }
    },
    methods: {
        prepareHeadersAndData() {
            let temperatureSet = new Set();
            this.headers = JSON.parse(JSON.stringify(this.defaultHeaders));

            // Collect all temperatures
            pdcUnits.forEach(unit => {
                Object.keys(unit.pump_power).forEach(temp => {
                    temperatureSet.add(temp);
                });
            });

            // Convert the set to an array and sort it
            let sortedTemperatures = Array.from(temperatureSet).sort((a, b) => parseFloat(a) - parseFloat(b));

            // Create dynamic headers based on sorted temperatures
            sortedTemperatures.forEach(temp => {
                this.headers.push({
                    title: `Putere la ${temp}°C (kW)`,
                    key: `power_${temp}`
                });
            });

            // Prepare data according to these headers
            this.selectedUnitDetails = pdcUnits.map(unit => {
                let rowData = {
                    product_code: unit.product_code,
                    name: unit.name,
                };
                sortedTemperatures.forEach(temp => {
                    rowData[`power_${temp}`] = unit.pump_power[temp] || 'N/A'; // Assign 'N/A' if no power is defined for this temp
                });
                return rowData;
            });

            this.showTable = true;
        },
        initializeUnits() {
            this.defaultUnit = {
                unitType: null,
                selectedFilter: '',
                selectedManufacturer: null,
                current: null,
                selectedResistance: '',
                selectedPumpPower: null,
                types: [...this.types],
                availableResistances: [...this.availableResistances],
                manufacturers: [...this.manufacturers],
                currentOptions: [...this.currentOptions],
                internalUnits: [],
                // Initialize other properties as needed
            };
            this.defaultInternalUnit = {
                availableInternalUnitModels: pdcInternalUnits,
                selectedInternalUnitModel: null,
            };
            this.addUnit();
            this.updateAvailableUnits(0);
        },
        selectModel(model, index) {
            if (model.type === 2 && this.selectedUnits[index].internalUnits.length === 0) {
                this.addInternalUnit(index);
            }
            this.selectedUnits[index].selectedUnit = model;
            this.updateUnits(index);
            this.$refs.unitModelSelect[index].menu = false;
        },
        addInternalUnit(index) {
            this.updateAvailableInternalUnits(index);
            this.selectedUnits[index].internalUnits.push(JSON.parse(JSON.stringify(this.defaultInternalUnit)));
            this.$emit('selected-unit-model', this.selectedUnits);
        },
        updateAvailableInternalUnits(index) {
            if (this.selectedUnits[index]) {
                const selectedUnit = this.selectedUnits[index].selectedUnit;

                // Check and update available internal unit models based on the selected unit's available internal units
                if (selectedUnit && selectedUnit.availableInternalUnits) {
                    this.defaultInternalUnit.availableInternalUnitModels = pdcInternalUnits.filter(internalUnitModel => {
                        return selectedUnit.availableInternalUnits.includes(internalUnitModel.product_code);
                    });
                }

                // Process each internal unit within the selected unit
                if (this.selectedUnits[index].internalUnits && this.selectedUnits[index].internalUnits.length > 0) {
                    this.selectedUnits[index].internalUnits.forEach(internalUnit => {
                        // Update the availableInternalUnitModels if exists
                        if (internalUnit.availableInternalUnitModels) {
                            internalUnit.availableInternalUnitModels = pdcInternalUnits.filter(model => {
                                return selectedUnit.availableInternalUnits?.includes(model.product_code);
                            });
                        }

                        // Set the selectedInternalUnitModel to null if not found in the updated availableInternalUnitModels
                        if (!internalUnit.availableInternalUnitModels.some(model => model.product_code === internalUnit.selectedInternalUnitModel?.product_code)) {
                            internalUnit.selectedInternalUnitModel = null;
                        }
                    });
                }
            }
        },
        removeInternalUnit(index) {
            this.selectedUnits[index].internalUnits.splice(0, 1);
            this.$emit('selected-unit-model', this.selectedUnits);
        },
        addUnit() {
            this.selectedUnits.push(JSON.parse(JSON.stringify(this.defaultUnit)));
            this.initializeFilters(this.selectedUnits.length - 1);
            this.updateAvailableUnits(this.selectedUnits.length - 1);
        },
        removeUnit(index) {
            this.selectedUnits.splice(index, 1);
            this.$emit('selected-unit-model', this.selectedUnits);
        },
        updateManufacturers(selectedManufacturer, index) {
            if (selectedManufacturer && selectedManufacturer.value === 1) {
                this.selectedUnits[index].manufacturers = [{text: 'Toate', value: null}, {text: 'Sistema', value: 1}, {
                    text: 'Domusa',
                    value: 2
                }];
                if (this.selectedUnits[index].internalUnits && this.selectedUnits[index].internalUnits.length > 0) {
                    this.removeInternalUnit(index);
                }
            } else if (selectedManufacturer && selectedManufacturer.value === 2) {
                this.selectedUnits[index].manufacturers = [{text: 'Toate', value: null}, {
                    text: 'Mitsubishi',
                    value: 3
                }]; // Assuming Split is only for Mitsubishi in this context
                this.selectedUnits[index].selectedManufacturer = {text: 'Mitsubishi', value: 3};
                this.addInternalUnit(index);
            } else {
                this.selectedUnits[index].manufacturers = [{text: 'Toate', value: null}, {text: 'Sistema', value: 1}, {
                    text: 'Domusa',
                    value: 2
                }, {text: 'Mitsubishi', value: 3}];
            }
            this.updateAvailableUnits(index);
        },
        updateUnits(index) {
            this.updateAvailableInternalUnits(index);
            this.$emit('selected-unit-model', JSON.parse(JSON.stringify(this.selectedUnits)));
        },
        onTypeChange(index) {
            this.resetFilters(index);
            this.updateManufacturers(this.selectedUnits[index].unitType, index)
            this.updateAvailableUnits(index);
        },
        /**
         * Adjusts the available resistance options for a specific unit based on the selected current type.
         * It updates the options to match either monofazic or trifazic current requirements.
         *
         * @param {number} current - The current type selected, where 1 represents monofasic and 2 represents trifazic.
         * @param {number} index - The index of the unit in the `selectedUnits` array to update.
         */
        onCurrentOptionChange(current, index) {
            // Adjust available resistances based on the selected current type
            switch (current) {
                case null: // Toate
                    this.selectedUnits[index].availableResistances = [
                        {text: 'Fara rezistenta', value: 0},
                        {text: '2 kW', value: 2},
                        {text: '3 kW', value: 3},
                        {text: '4,5 kW', value: 4.5},
                    ];
                    break;
                case 1:  // Monofazic
                    this.selectedUnits[index].availableResistances = [
                        {text: 'Fara rezistenta', value: 0},
                        {text: '2 kW', value: 2},
                        {text: '3 kW', value: 3},
                    ];
                    break;
                case 2:  // Trifazic
                    this.selectedUnits[index].availableResistances = [
                        {text: 'Fara rezistenta', value: 0},
                        {text: '2 kW', value: 2},
                        {text: '3 kW', value: 3},
                        {text: '4,5 kW', value: 4.5},
                    ];
                    break;
            }
            // Call `updateAvailableUnits` to refresh the list based on the new resistance settings.
            this.updateAvailableUnits(index);
        },
        initializeFilters(index) {
            this.selectedUnits[index].unitType = this.types[0];
            this.selectedUnits[index].selectedManufacturer = this.manufacturers[0];
            this.selectedUnits[index].selectedResistance = this.availableResistances[0];
            this.selectedUnits[index].selectedPumpPower = '';
            this.selectedUnits[index].current = this.currentOptions[0];
        },
        resetFilters(index) {
            this.selectedUnits[index].selectedManufacturer = this.manufacturers[0];
            this.selectedUnits[index].selectedResistance = this.availableResistances[0];
            this.selectedUnits[index].selectedPumpPower = '';
            this.selectedUnits[index].current = this.currentOptions[0];
            this.selectedUnits[index].selectedUnit = null;
        },
        /**
         * Updates the list of available units based on the selected criteria, including adjusted pump power.
         * Pump power for each unit is considered after adjusting for resistance value if the unit's manufacturer value is '1'.
         *
         * @param {number} index - The index of the unit in the `selectedUnits` array to update.
         */
        updateAvailableUnits(index) {
            if (this.selectedUnits[index]) {
                const seenManufacturers = new Set();

                // Filter all units that match the criteria, adding `matched: true` to the first unit of each manufacturer.
                this.selectedUnits[index].availableUnits = pdcUnits.map(unit => {
                    // Calculate resistanceValue for each unit based on its manufacturer value
                    // Assuming manufacturer values could be strings, compare with '1' as a string
                    const resistanceValue = (unit.manufacturer === 1) ? (this.selectedUnits[index].selectedResistance?.value ? this.selectedUnits[index].selectedResistance?.value : 0) : 0;
                    const adjustedPumpPower = unit.pump_power['-15'] + resistanceValue; // Add resistanceValue to each unit's pump power

                    // Basic filter checks
                    const matchesType = !this.selectedUnits[index].unitType?.value || unit.type === this.selectedUnits[index].unitType.value;
                    const matchesManufacturer = !this.selectedUnits[index].selectedManufacturer?.value || unit.manufacturer === this.selectedUnits[index].selectedManufacturer.value;
                    const matchesCurrent = !this.selectedUnits[index].current?.value || unit.current === this.selectedUnits[index].current.value;
                    const matchesPower = !this.selectedUnits[index].selectedPumpPower || adjustedPumpPower >= parseInt(this.selectedUnits[index].selectedPumpPower);

                    if (matchesType && matchesManufacturer && matchesCurrent && matchesPower) {
                        const isFirstFromManufacturer = !seenManufacturers.has(unit.manufacturer);
                        if (isFirstFromManufacturer) {
                            seenManufacturers.add(unit.manufacturer);
                            return {...unit, matched: true}; // Mark this unit as matched
                        }
                        return unit;
                    }
                    return null;
                }).filter(unit => unit !== null); // Remove any units that didn't match the filters

                // Reset selected unit if the current selection is not available in the filtered list
                this.selectedUnits[index].selectedUnit = null;
            }
        },
    },
}
</script>

<style scoped>

</style>