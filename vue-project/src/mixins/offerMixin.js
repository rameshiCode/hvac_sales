import {
    createOffer,
    createPDFOffer,
    createPDFDimensioning,
    fetchLocationById,
    fetchOfferWithItemsById,
    getClientInfo, showAlertModal,
    updateOffer, isObject
} from "@/utils/utils";
import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";

export default {
    data() {
        return {
            isProductsChanged: false,
            discount: 0,
            clientId: null,
            locationId: null,
            offer: null,
            offerProducts: null,
            offerPaymentTerms: [],
            offeredProducts: null,
            offerInformation: {
                price_list_id: '',
                discount: 0,
                notes: '',
                totalFinalPrice: 0,
                totalPriceWithoutDiscount: 0,
            },
            client: null,
            location: null,
            initialLocation: null,
            offerId: null,
            isOfferButtonsInView: true,
            offerTypes: [
                {
                    name: 'IPA',
                    type: 1,
                    routeName: '',
                    color: '#e32829',
                },
                {
                    name: 'Sanitare',
                    type: 2,
                    routeName: 'OfferPlumbing',
                    color: '#8774B3',
                },
                {
                    name: 'VMC',
                    type: 3,
                    routeName: 'OfferVMC',
                    color: '#57c0da',
                },
                {
                    name: 'Simple',
                    type: 4,
                    routeName: 'OfferSimple',
                    color: 'black',
                },
                {
                    name: 'Technical Room',
                    type: 5,
                    routeName: 'OfferTechnicalRoom',
                    color: '#8D9B6C',
                },
                {
                    name: 'Ceiling',
                    type: 6,
                    routeName: 'OfferCeiling',
                    color: '#3777BB',
                },
                {
                    name: 'Walls',
                    type: 7,
                    routeName: 'OfferWalls',
                    color: '#F8AC8C',
                },
                {
                    name: 'Automation',
                    type: 8,
                    routeName: 'OfferAutomation',
                    color: '#1F4690',
                },
                {
                    name: 'FanCoilUnit',
                    type: 9,
                    routeName: 'OfferFanCoilUnit',
                    color: '#AB9E9A',
                },
                {
                    name: 'ThermalChannel',
                    type: 10,
                    routeName: 'OfferThermalChannel',
                    color: '#b269ab',
                },
                {
                    name: 'HeatPump',
                    type: 11,
                    routeName: 'OfferPDC',
                    color: '#F37928',
                },
            ],
            buttons: [
                {
                    text: 'Calculează produse',
                    onClick: this.processRequiredProducts,
                    disabled: () => false,
                    color: 'success',
                    visible: () => this.$options.name === "OfferVMC" || this.$options.name === "OfferPDC",
                },
                {
                    text: 'Salvează oferta',
                    onClick: this.createSaveOffer,
                    disabled: () => !this.isProductsChanged || this.isDifferentCreator,
                    color: 'success',
                    visible: () => true,
                },
                {
                    text: 'Creează ofertă nouă',
                    onClick: this.createOffer,
                    disabled: () => !this.offerId,
                    color: 'primary',
                    visible: () => true,
                }
            ],
            pdfOptions: {
                simple: [
                    {
                        text: 'Ofertă cu preț',
                        onClick: () => createPDFOffer(this.offerId, 0, this.sortingPDF),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    },
                    {
                        text: 'Ofertă fără preț',
                        onClick: () => createPDFOffer(this.offerId, 1, this.sortingPDF),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    }
                ],
                vmc: [
                    {
                        text: 'Ofertă cu preț',
                        onClick: () => createPDFOffer(this.offerId, 0, 0),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    },
                    {
                        text: 'Ofertă fără preț',
                        onClick: () => createPDFOffer(this.offerId, 1, 0),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    },
                    {
                        text: 'Ofertă generală',
                        onClick: () => createPDFOffer(this.offerId, 2, 0),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    },
                    {
                        text: 'Dimensionare',
                        onClick: () => createPDFDimensioning(this.offerId, this.locationId, 0),
                        disabled: () => !this.offerId,
                        color: 'primary',
                    },
                ],
            },
            measurementUnits: [
                {value: 1, text: 'm²'},
                {value: 2, text: 'm'},
                {value: 3, text: 'pungă'},
                {value: 4, text: 'buc'},
                {value: 5, text: 'l'},
                {value: 6, text: 'set'},
                {value: 7, text: 'cutie'},
                {value: 8, text: 'rolă'},
            ],
            loadProductTable: false,
            isChangedOfferPriceList: false,
            isDifferentCreator: true,
            isCustomPDFHeaderEmpty: false,
        }
    },
    async created() {
        let offerAndProducts = {};
        if (!this.$route.params.offerId) {
            this.offerId = null
        } else {
            this.offerId = this.$route.params.offerId
            offerAndProducts = await fetchOfferWithItemsById(this.offerId)
            if (!offerAndProducts) {
                throw new Error('Offer not found');
            }
            this.offer = offerAndProducts.offer;
            this.offeredProducts = offerAndProducts.products;
            this.recommendedProducts = offerAndProducts.recommended_products;
            this.discount = Number(this.offer.discount);
            this.offerPaymentTerms = this.offer.payment_terms;
        }
        this.clientId = this.$route.params.clientId
        this.client = await getClientInfo(this.clientId);
        this.locationId = this.$route.params.locationId
        this.location = await fetchLocationById(this.locationId);
        // UNITS data is now related to the offer in the back-end and not to the location
        this.location.units = offerAndProducts.units;
        // here we also store the units in the locationUnits variable for saving in the offer as
        // the location.units gets overwritten when location is updated
        this.locationUnits = offerAndProducts.units;
        this.initialLocation = JSON.parse(JSON.stringify(this.location));
        this.loadProductTable = true;
    },
    methods: {
        setPDFCustomSorting(sorting) {
            this.sortingPDF = sorting;
        },
        setCustomPDFHeading(heading) {
            this.offerInformation.customPDFHeading = heading;
            this.isProductsChanged = true;
        },
        updateOfferPriceList(priceListId) {
            if (this.offerPriceList && this.offerPriceList !== priceListId) {
                // here we set the changedOfferPriceList to true for displaying different confirmation messages
                this.isChangedOfferPriceList = true;
                // here we reset the isProductsChanged flag to make the save offer button available again
                // without having to modify any products
                this.isProductsChanged = true;
            }
            this.offerPriceList = priceListId;
        },
        /**
         * Replaces the measurement unit text in each product with its corresponding numeral value based on a given list of measurement units.
         * Each product's `measurement_unit` is matched against the provided `measurementUnits` array to find a corresponding unit. If a match is found,
         * the product's `measurement_unit` is updated to the numeral value of the matching unit.
         *
         * @param {Object[]} products - An array of product objects. Each product should have a `measurement_unit` property.
         * @param {Object[]} measurementUnits - An array of measurement unit objects, where each object has a `text` property (the text representation of the unit)
         *                                       and a `value` property (the numeral representation of the unit).
         * @returns {Object[]} The updated array of products with their `measurement_unit` properties replaced by their corresponding numeral values, if matches were found.
         */
        replaceMeasurementUnits(products, measurementUnits) {
            // Loop through each product
            products.forEach(product => {
                // Find the matching measurement unit
                const match = measurementUnits.find(unit => unit.text === product.measurement_unit);

                // If a match is found, replace the measurement_unit with the numeral value
                if (match) {
                    product.measurement_unit = match.value;
                }
            });

            return products;
        },
        /**
         * Determines the offer type based on the current route name. It searches through an array of `offerTypes` to find
         * an offer that matches the current route name. The `offerTypes` array is expected to be available within the context
         * of where this method is defined.
         *
         * @returns {Object|undefined} Returns the matching offer object if found; otherwise, returns `undefined`. The offer object is expected
         *                             to contain at least a `routeName` property that matches the current route name.
         */
        getOfferType() {
            let routeName = this.$route.name;
            const offer = this.offerTypes.find(offer => offer.routeName === routeName);
            return offer;
        },
        /**
         * Initiates the process of saving or creating an offer.
         * If the current component is 'OfferVMC' and the location is not saved, it triggers 'handleOfferVMCAction'.
         * Otherwise, it decides whether to save an existing offer or create a new one based on the presence of 'offerId'.
         */
        createSaveOffer() {
            if (this.$options.name === "OfferVMC" && !this.savedLocation) {
                this.isSaveOfferClicked = true;
                this.handleOfferVMCAction();
                return;
            }

            // create a variable that holds the current vue route's name
            if (this.offerId) {
                this.saveOffer();
            } else {
                this.createOffer();
            }
        },
        checkDifferentOfferCreator() {
            if (this.offer) {
                const offerAgentId = this.offer.agent;
                const userId = JSON.parse(sessionStorage.getItem('userId'));

                this.isDifferentCreator = offerAgentId !== userId;
                return offerAgentId !== userId;
            }

            return false;
        },
        handleRemoveCustomHeaderError() {
          this.isCustomPDFHeaderEmpty = false;
        },
        /**
         * Saves the existing offer details.
         * Updates the offered products and offer products with measurement units, filters them based on quantity,
         * and then sends the updated offer data to the server.
         * On successful update, navigates to a specified route and displays a success message.
         */
        async saveOffer() {
            if (this.offer.type === 4 && !this.offerInformation.customPDFHeading) {
                showAlertModal(this.$store, 'Vă rugăm completați câmpul Titlu ofertă PDF!', 'danger', 8000);
                this.isCustomPDFHeaderEmpty = true;
                return;
            }
            emitter.emit('save-offer-clicked');

            if (this.checkDifferentOfferCreator()) {
                await this.createOffer();
                return;
            }

            let offer = this.getOfferType();
            this.isSaveOfferClicked = true;
            if (this.offeredProducts) {
                this.offeredProducts = this.offeredProducts.filter(product => product.quantity !== 0);
                this.offeredProducts = this.replaceMeasurementUnits(this.offeredProducts, this.measurementUnits);
            }
            if (this.offerProducts) {
                this.offerProducts = this.offerProducts.filter(product => product.quantity !== 0);
                this.offerProducts = this.replaceMeasurementUnits(this.offerProducts, this.measurementUnits);
            }

            // in this code we check if the offer's products (offerProducts) are empty which happens when no products are updated,
            // and we need to set the offer's products to the ones that are offered already
            if (this.offeredProducts && !this.offerProducts) {
                this.offerProducts = [...this.offeredProducts];
            }

            await updateOffer(offer.type, this.offerId, this.offerProducts, this.offerInformation, this.offerPriceList, this.offerPaymentTerms, this.recommendedProducts, this.locationUnits)
                .then((response) => {
                    this.offeredProducts = response
                    this.isProductsChanged = false;
                    this.$router.push({
                        name: offer.routeName,
                        params: {
                            offerId: this.offerId,
                            clientId: this.clientId,
                            locationId: this.locationId,
                        }
                    });
                    if (this.isSaveOfferClicked && this.location.isLocationChanged && this.savedLocation) {
                        if (this.isChangedOfferPriceList) {
                            showAlertModal(
                                this.$store,
                                `<b>Locația</b> a fost salvată. <br> <b>Oferta</b> a fost salvată cu o altă listă de preț fată de cea inițială.`,
                                "warning",
                                8000
                            );
                        } else {
                            showAlertModal(
                                this.$store,
                                `<b>Locația</b> si <b>oferta</b> au fost salvate cu succes.`,
                                "success",
                                2000
                            );
                        }
                    } else if (this.isSaveOfferClicked) {
                        if (this.isChangedOfferPriceList) {
                            showAlertModal(
                                this.$store,
                                "Oferta a fost salvată cu o altă listă de preț fată de cea inițială.",
                                "warning",
                                8000
                            );
                        } else {
                            showAlertModal(
                                this.$store,
                                "Oferta a fost salvată cu succes.",
                                "success",
                                2000
                            );
                        }
                    }
                    this.resetFlagsAfterOfferSave();
                })
        },
        /**
         * Creates a new offer.
         * If the current component is 'OfferVMC' and the location is not saved, it triggers 'handleOfferVMCAction'.
         * Otherwise, it validates the offer products and sends the new offer data to the server.
         * On successful creation, sets the 'offerId', displays a success message, and navigates to a specified route.
         */
        async createOffer() {
            let offer = this.getOfferType();
            if (offer.type === 4 && !this.offerInformation.customPDFHeading) {
                showAlertModal(this.$store, 'Vă rugăm completați câmpul Titlu ofertă PDF!', 'danger', 8000);
                this.isCustomPDFHeaderEmpty = true;
                return;
            }
            this.createNewOfferClicked = true;
            if (this.$options.name === "OfferVMC" && !this.savedLocation) {
                this.handleOfferVMCAction();
                return;
            }
            emitter.emit('save-offer-clicked');

            if (this.offeredProducts.length > 0) {
                this.offerProducts = [...this.offeredProducts];
            }
            if (!this.offerProducts && !this.isProductsChanged || this.offeredProducts.length === 0 && !this.isProductsChanged) {
                alert('Nu se poate crea oferta, deoarece nu există produse adăugate (cantitate mai mare ca 0).');
            } else {
                if (this.offeredProducts) {
                    this.offeredProducts = this.replaceMeasurementUnits(this.offeredProducts, this.measurementUnits);
                }
                if (this.offerProducts) {
                    this.offerProducts = this.replaceMeasurementUnits(this.offerProducts, this.measurementUnits);
                }
                this.offeredProducts = this.offeredProducts.filter(product => product.quantity !== 0);
                this.offerProducts = this.offerProducts.filter(product => product.quantity !== 0);

                try {
                    await createOffer(offer.type, this.offerProducts, this.offerInformation, this.clientId, this.locationId, sessionStorage.getItem('userId'), this.offerPriceList, this.offerPaymentTerms, this.recommendedProducts, this.locationUnits)
                        .then((response) => {
                            this.offerId = response.id.toString();
                            this.$store.commit('setFetchedClientOffers', response);
                            this.isProductsChanged = false;

                            if (this.savedLocation) {
                                showAlertModal(
                                    this.$store,
                                    `<b>Locația</b> a fost salvată.</br> <b>Oferta</b> a fost creată cu succes.`,
                                    "success",
                                    3000
                                );
                            } else if (!this.savedLocation) {
                                showAlertModal(
                                    this.$store,
                                    "Oferta a fost creată cu succes.",
                                    "success",
                                    3000
                                );
                            }
                        });
                    fetchOfferWithItemsById(this.offerId).then((response) => {
                        this.offeredProducts = response.products;
                    })
                    this.resetFlagsAfterOfferSave();

                    this.$router.push({
                        name: offer.routeName,
                        params: {
                            offerId: this.offerId,
                            clientId: this.clientId,
                            locationId: this.locationId,
                        }
                    });
                } catch (error) {
                    // Handle error, e.g., display an error message or perform alternative actions
                    console.error(error);
                }
            }
        },
        /**
         * Resets various flags related to the offer state and UI indications post saving an offer.
         * This includes resetting product change flags, save offer click indicators, and offer price list change flags.
         * Additionally, it handles resetting location change flags and description requirements for rooms
         * if applicable, ensuring the UI state reflects the latest saved state of an offer.
         *
         * The method performs the following actions:
         * - Resets the flags indicating if products have changed, if the save offer button was clicked,
         *   and if there has been a change in the offer's price list.
         * - If the location has been changed (indicated by `isLocationChanged`), this flag is also reset.
         * - For each room in `roomsDetails` (if present and is an array), it resets the flag indicating
         *   if a description is needed for each room.
         * - Directly resets the `isDescriptionNeeded` flag on `roomsDetails` if it exists.
         *
         * This method is typically called after an offer is successfully saved or created,
         * to ensure the application's state is correctly updated to reflect that no pending changes
         * need to be saved or addressed.
         *
         * @see createOffer - Method where `resetFlagsAfterOfferSave` is called after creating an offer.
         * @see saveOffer - Similar usage as in `createOffer`, for when an offer is saved.
         */
        resetFlagsAfterOfferSave() {
            this.isProductsChanged = false;
            this.isSaveOfferClicked = false;
            this.isChangedOfferPriceList = false;
            if (this.location.isLocationChanged) {
                this.location.isLocationChanged = false;
            }

            // emitting event for setting showOnlyOfferQty on true in ProductTable
            emitter.emit('set-products-with-quantity-true');

            // Safely reset roomsDetails flags according to new version increment requirements
            if (this.$refs.roomsDetails) {
                // Check if roomsDetails has a rooms property and it is an array
                if (Array.isArray(this.$refs.roomsDetails.rooms)) {
                    this.$refs.roomsDetails.rooms.forEach(room => {
                        // Safely set isDescriptionNeeded to false if room exists
                        if (room) {
                            room.isDescriptionNeeded = false;
                        }
                    });
                }
                // Directly set isDescriptionNeeded on roomsDetails if it exists
                if ('isDescriptionNeeded' in this.$refs.roomsDetails) {
                    this.$refs.roomsDetails.isDescriptionNeeded = false;
                }
            }
        },
        /**
         * Handles specific actions for 'OfferVMC'.
         * If a new version of the room details is required, it sets the description dialog to true.
         * Otherwise, it saves the location details.
         */
        handleOfferVMCAction() {
            if (this.$refs.roomsDetails.isNewVersionRequired) {
                this.$refs.roomsDetails.setDescriptionDialogTrue();
            } else {
                this.$refs.roomsDetails.saveLocation();
            }
        },
        /**
         * Updates the offered and offer products with new products data and marks that the products have changed.
         * @param {Array} products - The new products data to update.
         */
        updateOfferProducts(products) {
            this.offeredProducts = products;
            this.offerProducts = products;
            this.isProductsChanged = true;
        },
        /**
         * Updates the payment terms of the offer.
         * @param {Object} paymentTerms - The new payment terms data to update.
         */
        updatePaymentTerms(paymentTerms) {
            this.offerPaymentTerms = paymentTerms;
            this.isProductsChanged = true;
        },
        /**
         * Updates various fields of the offer information.
         * This can include notes, price list ID, totals and discount values.
         * @param {Object} data - An object containing the offer data fields to update.
         */
        updateOfferData(data) {
            // check if data.notes not undefined
            if (data.notes) {
                this.offerInformation = data.notes;
                this.isProductsChanged = true;
            }
            // check if data.price_list_id not undefined
            if (data.price_list_id) {
                this.offerInformation.price_list_id = data.price_list_id;
            }
            // check if data.discount not undefined
            if (data.discount || data.discount === 0) {
                this.offerInformation.discount = data.discount;
                this.discount = data.discount;
            }
            // check if data.totalFinalPrice and data.totalPriceWithoutDiscount exists, if they do assign them
            if (data.totalFinalPrice) {
                this.offerInformation.totalFinalPrice = data.totalFinalPrice;
            }
            if (data.totalPriceWithoutDiscount) {
                this.offerInformation.totalPriceWithoutDiscount = data.totalPriceWithoutDiscount;
            }
            if (data.isDiscountMixed) {
                this.offerInformation.isDiscountMixed = data.isDiscountMixed;
            }
            if (data.selectedCustomerType) {
                this.offerInformation.selectedCustomerType = data.selectedCustomerType;
                this.isProductsChanged = true;
            }
        },
        objectsAreEqual(objA, objB) {
            // If both are primitive types or null or undefined
            if (objA === objB) return true;

            // If one of them is null or undefined
            if (!objA || !objB) return false;

            // If one of them is not an object
            if (typeof objA !== "object" || typeof objB !== "object") return false;

            let keysA = Object.keys(objA);
            let keysB = Object.keys(objB);

            if (keysA.length !== keysB.length) return false;

            return keysA.every((key) => {
                if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
                return this.objectsAreEqual(objA[key], objB[key]);
            });
        },
         getUnitProduct(unitProductCode, products) {
            let unitProductIndex = products.findIndex((item) => item.product_code === unitProductCode);

            if (unitProductIndex !== -1) {
                return {...products[unitProductIndex]};
            }
        },
        getProducts(requirementsObj, products) {
            let newProductAdded = true;


            while (newProductAdded) {
                newProductAdded = false;

                for (let requirement of requirementsObj.requirements) {
                    if (requirement.processed) continue;

                    for (let product of products) {
                        let isMatch = Object.keys(requirement).every((key) => {
                            if (
                                key === "processed" ||
                                key === "quantity" ||
                                (key === "isRecommendedProduct" && !requirement.processed)
                            )
                                return true;

                            let hasProperty = Object.prototype.hasOwnProperty.call(product.specifications, key);

                            if (isObject(product.specifications[key]) && isObject(requirement[key])) {
                                // Use the deep comparison method if both values are objects
                                let valueMatches = this.objectsAreEqual(product.specifications[key], requirement[key]);

                                return hasProperty && valueMatches;
                            } else if (Array.isArray(product.specifications[key]) && Array.isArray(requirement[key])) {
                                let valueMatches = requirement[key].some((reqItem) =>
                                    product.specifications[key].includes(reqItem)
                                );
                                return hasProperty && valueMatches;
                            } else {
                                let valueMatches = product.specifications[key] === requirement[key];
                                return hasProperty && valueMatches;
                            }
                        });
                        if (isMatch) {
                            if (requirement.quantity && !requirement.isRecommendedProduct) {
                                // Added productQuantity variable that will be incremented so that onily one instance
                                // of the product is pushed with the right quantity
                                let productQuantity = 0;
                                for (
                                    let i = 0;
                                    i <
                                    (requirement.quantity !== undefined && requirement.quantity !== null
                                        ? requirement.quantity
                                        : 1);
                                    i++
                                ) {
                                    productQuantity++;
                                    requirement.processed = true;
                                    newProductAdded = true;
                                    this.processProduct(product);
                                }
                                product.quantity = productQuantity;
                                this.resultedProducts.push(JSON.parse(JSON.stringify(product)));
                            } else if (requirement.isRecommendedProduct) {
                                requirement.processed = true;
                                this.recommendedProducts.push(JSON.parse(JSON.stringify(product.product_code)));
                            } else {
                                requirement.processed = true;
                                this.processProduct(product);
                                product.quantity = requirement.quantity;
                                this.resultedProducts.push(product);
                                newProductAdded = true;
                                break;
                            }
                        }
                    }
                }
            }
        },
        addRecommendedProducts(existingProducts, products) {
            existingProducts.forEach((existingProduct) => {
                if (existingProduct.recommendations) {
                    existingProduct.recommendations.forEach((recommendation) => {
                        let recommendationExists = this.requirementsObj.requirements.some((req) => {
                            if (!req.quantity) {
                                return false;
                            }
                            return this.compareRequirements(req, recommendation);
                        });

                        if (!recommendationExists) {
                            let newRecommendation = JSON.parse(JSON.stringify(recommendation));
                            newRecommendation.isRecommendedProduct = true;
                            this.requirementsObj.requirements.push(newRecommendation);
                            this.recommendedProductAdded = true;
                        }
                    });
                }
            });
            if (this.recommendedProductAdded) {
                this.getProducts(this.requirementsObj, products);
            }
        },
        reassignSubCategories(products) {
            return products.map((product) => {
                        // Filter out the category_assignments that don't match the productCategories
                        const filteredAssignments = product.category_assignments.filter((assignment) =>
                            this.offerType.productCategories.includes(assignment.main_category.name)
                        );
                        product.assigned_sub_category = filteredAssignments[0] ? filteredAssignments[0]?.sub_category?.name : 'Alte produse';

                        // Return the product with adjusted category_assignments
                        return {
                            ...product,
                        };
                    });
        },
        matchProducts(primaryArray, secondaryArray) {
            primaryArray = JSON.parse(JSON.stringify(primaryArray));
            primaryArray.forEach((primaryProduct) => {
                const matchingProduct = secondaryArray.find(
                    (secondaryProduct) => secondaryProduct.product_code === primaryProduct.product_code
                );

                if (matchingProduct) {
                    // Setting the show property based on the quantity of the product (if it's 0, then it's true)
                    primaryProduct.quantity = matchingProduct.quantity;
                    primaryProduct.show = matchingProduct.quantity === 0;
                }
            });

            return primaryArray;
        },
        /**
         * Fetches a list of priced products from the server and stores it in session storage.
         * If the session storage already contains the price list, it uses that data instead.
         * The method handles any errors during the fetching process and logs them.
         */
        async fetchPriceListProducts() {
            //check if the session storage PRICE_LIST_PRODUCTS is empty, if empty fetch from the server
            let priceListProducts = JSON.parse(sessionStorage.getItem("PRICE_LIST_PRODUCTS"));
            if (!priceListProducts) {
                console.log("Fetching products from the server");
                try {
                    const response = await apiClient.get("/api/price_lists/items/");
                    if (!response || !response.data) {
                        throw new Error("Failed to fetch product data");
                    }
                    sessionStorage.setItem("PRICE_LIST_PRODUCTS", JSON.stringify(response.data));
                    return response.data;
                } catch (error) {
                    console.error("Error fetching product data:", error);
                    throw error;
                }
            } else {
                return priceListProducts;
            }
        },
        setZeroQtyForBackendProducts(products) {
            products.forEach((product) => {
                product.quantity = 0;
            });
            return products;
        },
        processProduct(product) {
            if (product.requirements && Array.isArray(product.requirements)) {
                product.requirements.forEach((req) => {
                    const existingRequirementIndex = this.requirementsObj.requirements.findIndex((r) =>
                        this.compareRequirements(r, req)
                    );
                    if (existingRequirementIndex !== -1) {
                        // Overwriting the value at the found index with the updated requirement
                        this.requirementsObj.requirements[existingRequirementIndex].quantity += req.quantity;
                    } else {
                        req.quantity = req.quantity !== null && req.quantity !== undefined ? req.quantity : 1;
                        req = JSON.parse(JSON.stringify(req));
                        this.requirementsObj.requirements.push(req);
                    }
                });
            }
        },
        processResultedProducts() {
            const indicesToRemove = [];
            this.resultedProducts.forEach((product, index) => {
                const existingProductIndex = this.finalResultedProducts.findIndex(
                    (p) => p.product_code === product.product_code
                );

                if (existingProductIndex !== -1) {
                    // Update quantity in finalResultedProducts
                    this.finalResultedProducts[existingProductIndex].quantity +=
                        product.quantity !== undefined && product.quantity !== null ? product.quantity : 1;

                    // Store the index to remove this product from resultedProducts
                    indicesToRemove.push(index);
                } else {
                    // Add new product to finalResultedProducts
                    this.finalResultedProducts.push({
                        ...product,
                        quantity: product.quantity,
                    });
                }
            });

            // Remove the products from resultedProducts
            this.resultedProducts = this.resultedProducts.filter((_, index) => !indicesToRemove.includes(index));
        },
        compareRequirements(objA, objB) {
            const keysA = Object.keys(objA).filter((key) => key !== "quantity" && key !== "processed");
            const keysB = Object.keys(objB).filter((key) => key !== "quantity" && key !== "processed");

            if (keysA.length !== keysB.length) {
                return false;
            }

            for (let key of keysA) {
                if (typeof objA[key] === "object" && typeof objB[key] === "object") {
                    if (!this.compareRequirements(objA[key], objB[key])) {
                        return false;
                    }
                } else if (objA[key] !== objB[key]) {
                    return false;
                }
            }
            return true;
        },
        addOrUpdateOfferedProducts() {
            if (this.offeredProducts) {
                // this.offeredProducts = [];
                this.finalResultedProducts.forEach((resultedProduct) => {
                    // Check if the product already exists in the offeredProducts array
                    const existingIndex = this.offeredProducts.findIndex(
                        (offeredProduct) => offeredProduct.product_code === resultedProduct.product_code
                    );

                    if (existingIndex !== -1) {
                        // If the product exists and its manual_update property is either false or doesn't exist
                        if (!this.offeredProducts[existingIndex].manual_added) {
                            // Replace the product in the offeredProducts array
                            this.offeredProducts[existingIndex] = resultedProduct;
                        }
                    } else {
                        // If the product doesn't exist, push it to the offeredProducts array
                        this.offeredProducts.push(resultedProduct);
                    }
                });
            } else {
                this.offeredProducts = [];
                this.offeredProducts = this.finalResultedProducts.filter(
                    (item) => item.quantity !== null && item.quantity !== undefined
                );
            }

            // Filter the offeredProducts to only include products with a quantity
            this.offeredProducts = this.offeredProducts.filter(
                (item) => item.quantity !== null && item.quantity !== undefined
            );
            this.offerProducts = [...this.offeredProducts];
            this.isProductsChanged = true;
            setTimeout(() => {
                emitter.emit("trigger-overlay");
                showAlertModal(this.$store, "Produsele au fost calculate cu succes!", "success", 3000);
            }, 50);
        },
    },
    watch: {
        isProductsChanged: function () {
            this.isDifferentCreator = this.checkDifferentOfferCreator();
        },
        discount: function (oldVal, newVal) {
            if (newVal < 0) {
                this.discount = null;
            } else if (newVal > 100) {
                this.discount = 100;
            }
        },
        offer(newVal) {
            if (newVal) {
                this.discount = Number(newVal.discount)
            }
        }
    }
}