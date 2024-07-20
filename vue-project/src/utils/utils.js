import emitter from "@/utils/emitter";
import apiClient from "@/utils/apiClient";
import router from "@/router";

export async function deleteClient(clientID, pathToPush) {
    try {
        const response = await apiClient.delete(`/api/delete_client/${clientID}/`);
        if (response.data.success) {
            // Remove client from sessionStorage
            const myClients = await JSON.parse(sessionStorage.getItem('myClients') || '[]');
            const updatedClients = myClients.filter(client => client.id !== clientID);
            await sessionStorage.setItem('myClients', JSON.stringify(updatedClients));

            // Remove client's locations from sessionStorage
            const myRecentLocations = await JSON.parse(sessionStorage.getItem('myRecentLocations') || '[]');
            const updatedLocations = myRecentLocations.filter(location => location.client !== clientID);
            await sessionStorage.setItem('myRecentLocations', JSON.stringify(updatedLocations));

            emitter.emit('clientDeleted', clientID);
            if (pathToPush) {
                await pushToRoute(pathToPush);
            }
        } else {
            console.error(response.data.message);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function deleteLocation(locationId, currentClient, recentLocations, location) {
    try {
        await apiClient.delete(`/api/delete_location/${locationId}/`);
        currentClient = null;
        // Delete the location from sessionStorage's myRecentLocations array
        const myRecentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations')) || [];
        const locationIndex = myRecentLocations.findIndex(location => location.id === locationId);
        if (locationIndex !== -1) {
            myRecentLocations.splice(locationIndex, 1);
            sessionStorage.setItem('myRecentLocations', JSON.stringify(myRecentLocations));
        }
        await fetchData('locations').then(() => {
            recentLocations = JSON.parse(sessionStorage.getItem('myRecentLocations'))
        });
        if (location) {
            location = location.filter(location => location.id !== locationId);
            return location
        } else {
            return recentLocations
        }
    } catch (error) {
        console.error('Error deleting location:', error);
    }
}

export async function pushToRoute(route) {
    await router.push(route)
}

export async function fetchData(type = 'all') {
    if (type === 'all' || type === 'users') {
        await apiClient.get('/api/users/')
            .then(response => {
                let myUsers = response.data
                sessionStorage.setItem('myUsers', JSON.stringify(myUsers));
            })
            .catch(error => {
                console.log(error);
            });
    }
    if (type === 'all' || type === 'locations') {
        await apiClient.get('/api/locations/last_modified/')
            .then(async response => {
                let recentLocations = await parseLocations(response.data);
                sessionStorage.setItem('myRecentLocations', JSON.stringify(recentLocations));
            })
            .catch(error => {
                console.log(error);
            });
    }
    if (type === 'all' || type === 'intermediaries') {
        let isSuperUser = JSON.parse(sessionStorage.getItem('superUser'))
        let userId = JSON.parse(sessionStorage.getItem('userId'))

        // Determine the endpoint URL
        let endpoint = '/api/intermediaries/';

        // If not a superuser, append the agent_id as a query parameter
        if (!isSuperUser && userId !== null) {
            endpoint += `?agent_id=${userId}`;
        }

        await apiClient.get(endpoint)
            .then(response => {
                let intermediaries = response.data;
                sessionStorage.setItem('intermediaries', JSON.stringify(intermediaries));
            })
            .catch(error => {
                console.log(error);
            });
    }
}

export async function getClientLocations(clientId) {
    let locations = [];
    try {
        const locationsResponse = await apiClient.get(`/api/list_locations/${clientId}/`);
        if (locationsResponse.data.locations && locationsResponse.data.locations.length > 0) {
            locations = await parseLocations(locationsResponse.data.locations);
        }
    } catch (e) {
        console.log(e)
    }
    return locations;
}

export async function parseLocations(locations) {
    return locations.map(location => {
        let totalArea = 0;
        if (location.rooms && location.rooms.length > 0) {
            totalArea = location.rooms.reduce((accumulator, room) => {
                const area = parseFloat(room.area);
                return accumulator + (isNaN(area) ? 0 : area);
            }, 0);
        }
        return {
            ...location,
            totalArea,
        };
    });
}

export async function saveSelectedProducts(selectedProducts) {
    try {
        const response = await apiClient.post('/api/create_offer_items/', {
            selected_products: selectedProducts
        });
        if (response.status === 201) {
            console.log('All items saved successfully');
        } else {
            console.log('Error while saving items');
        }
    } catch (error) {
        console.error('Error while saving items', error);
    }
}

export async function updateSelectedProducts(selectedProducts) {
    try {
        const response = await apiClient.put(`/api/update_offer_items/`, {
            updated_products: selectedProducts
        });

        if (response.status === 200) {
            return response.data;
        } else {
            return alert('Error while updating items');
        }
    } catch (error) {
        console.error('Error while updating items', error);
    }
}

export async function createOffer(offerType, products, offer, clientId, locationId, agent_id, offerPriceList, paymentTerms = [], recommendedProducts, units) {
    try {
        const offerData = {
            agent_id: agent_id,
            client_id: clientId,
            location_id: locationId,
            discount: offer.discount,
            offer_type: offerType,
            notes: offer.notes,
            status: 0,
            invoice: 0,
            cap_money: 0,
            price_list_id: offerPriceList,
            parent_offer: offer.parent_offer,
            payment_terms: paymentTerms,
            units: units,
            list_price_value: offer.totalPriceWithoutDiscount,
            value_with_discount: offer.totalFinalPrice,
            is_discount_mixed: offer.isDiscountMixed ? offer.isDiscountMixed : false,
            custom_pdf_heading: offer.customPDFHeading,
            selected_customer_type: offer.selectedCustomerType,
        };
        if (recommendedProducts) {
            offerData.recommended_products = recommendedProducts;
        }
        let response;
        if (offerType === 3) {
            response = await apiClient.post('/api/create-vmc-offer/', JSON.stringify(offerData), {
                headers: {'Content-Type': 'application/json'},
            });
        } else {
            response = await apiClient.post('/api/create-simple-offer/', JSON.stringify(offerData), {
                headers: {'Content-Type': 'application/json'},
            });
        }
        //check if response status is 201 else return and throw error
        if (response.status !== 201) {
            alert('Eroare la crearea ofertei: ' + response.data.message);
            console.error('Error creating offer:', response);
            return;
        }
        const offerId = response.data.offer.id;

        const updatedProducts = products.map(product => {
            return {...product, offer_id: offerId, offer: offerId};
        });

        await saveSelectedProducts(updatedProducts);
        return response.data.offer;
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

export async function updateOffer(offerType, offerId, products, offer, priceListId, paymentTerms, recommendedProducts, units) {
    try {
        const offerData = {
            discount: offer.discount,
            notes: offer.notes,
            status: 0,
            invoice: 0,
            cap_money: 0,
            price_list_id: priceListId,
            payment_terms: paymentTerms,
            units: units,
            list_price_value: offer.totalPriceWithoutDiscount,
            value_with_discount: offer.totalFinalPrice,
            is_discount_mixed: offer.isDiscountMixed ? offer.isDiscountMixed : false,
            custom_pdf_heading: offer.customPDFHeading,
            selected_customer_type: offer.selectedCustomerType,
        };

        if (recommendedProducts) {
            offerData.recommended_products = recommendedProducts;
        }

        if (offerType === 3) {
            await apiClient.post(`/api/update-vmc-offer/${offerId}/`, JSON.stringify(offerData), {
                headers: {'Content-Type': 'application/json'},
            });

        } else {
            await apiClient.post(`/api/update-simple-offer/${offerId}/`, JSON.stringify(offerData), {
                headers: {'Content-Type': 'application/json'},
            });
        }

        const updatedProducts = products.map(product => {
            return {...product, offer_id: offerId, offer: offerId};
        });

        return await updateSelectedProducts(updatedProducts);
    } catch
        (error) {
        console.error('Error creating offer:', error);
    }
}

// this method checks if the value passed to it is indeed an object, not an Array or null as other type checks might
// return true when checking if an array is an object
export function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

/**
 * Opens a PDF in a new tab.
 * @param {string} url - The URL of the PDF.
 */
function openPDFInNewTab(url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Creates a PDF file for the offer.
 * @param {string} offerId - The ID of the offer.
 * @param {number} type - The type of the PDF (0 - with price, 1 - without price, 2 - general offer).
 */
export function createPDFOffer(offerId, type, sorting) {
    const pdfLink = `${process.env.VUE_APP_API_BASE_URL}/api/pdf/offer/${offerId}/${type}/${sorting}/`;
    openPDFInNewTab(pdfLink);
}

export function createPDFSummary(summaryId) {
    const pdfLink = `${process.env.VUE_APP_API_BASE_URL}/api/pdf/summary/${summaryId}/`;
    openPDFInNewTab(pdfLink);
}

/**
 * Creates a PDF file for the dimensioning of the location.
 * @param {string} offerId - The ID of the offer.
 * @param {string} locationId - The ID of the location.
 * @param {number} sorting - The sorting type (0 - no sorting, 1 - by air type, 2 - by floor).
 */
export function createPDFDimensioning(offerId, locationId, sorting) {
    const pdfLink = `${process.env.VUE_APP_API_BASE_URL}/api/pdf/dimensioning/${offerId}/${locationId}/${sorting}`;
    openPDFInNewTab(pdfLink);
}

/**
 * Fetches price lists from the server and stores them in sessionStorage.
 * The function makes an asynchronous API call to retrieve the price lists.
 * If successful, it stores the data in sessionStorage under the key 'priceLists'.
 * @returns {Promise<Object[]|undefined>} A promise that resolves to an array of price list objects, or undefined if an error occurs.
 */
export async function fetchPriceLists() {
    try {
        const response = await apiClient.get('/api/price_lists');

        if (response.status === 200) {
            const priceLists = response.data;
            sessionStorage.setItem('priceLists', JSON.stringify(priceLists));
            return priceLists;
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching price lists:', error);
    }
}

/**
 * Fetches product data from the server.
 * This function makes an asynchronous API call to retrieve products and their associated price list ID.
 * It assumes the response will contain an object with 'items' and 'price_list_id' properties.
 *
 * @returns {Promise<{items: Object[], priceListId: string}>} A promise that resolves to an object containing an array of items and a price list ID.
 * @throws Will throw an error if the API call is unsuccessful.
 */
export async function fetchProducts() {

    let priceListProducts = JSON.parse(sessionStorage.getItem('PRICE_LIST_PRODUCTS'));
    if (!priceListProducts) {
        try {
            const response = await apiClient.get('/api/price_lists/items/');
            if (!response || !response.data) {
                throw new Error('Failed to fetch product data');
            }

            sessionStorage.setItem("PRICE_LIST_PRODUCTS", JSON.stringify(response.data));

            return {
                items: response.data.items,
                price_list_id: response.data.price_list_id,
            };
        } catch (error) {
            console.error('Error fetching product data:', error);
            throw error;
        }
    } else {
        const priceListId = priceListProducts.price_list_id;
        try {
            const response = await apiClient.get(`/api/price_lists/${priceListId}/modified/`);
            if (!response || !response.data) {
                throw new Error('Failed to fetch modified date');
            }

            const backendModifiedDate = response.data.modified;
            const sessionModifiedDate = priceListProducts.modified;

            if (backendModifiedDate !== sessionModifiedDate) {
                const updatedResponse = await apiClient.get(`/api/price_lists/items/`);
                if (!updatedResponse || !updatedResponse.data) {
                    throw new Error('Failed to fetch updated product data');
                }

                sessionStorage.setItem("PRICE_LIST_PRODUCTS", JSON.stringify(updatedResponse.data));

                return {
                    items: updatedResponse.data.items,
                    price_list_id: updatedResponse.data.price_list_id,
                };
            } else {
                return priceListProducts;
            }
        } catch (error) {
            console.error('Error checking modified date or fetching product data:', error);
            throw error;
        }
    }
}

export async function fetchPriceListProducts(priceListId) {
    return (await apiClient.get(`/api/price_lists/${priceListId}/items/`)).data;
}

/**
 * Retrieves client information based on the provided client ID.
 *
 * This function makes an asynchronous HTTP GET request to fetch client data. It expects
 * a client ID and returns the client's information if found. In case the client is not
 * found (404 error), it redirects to the "Page Not Found" route. For other errors, it
 * logs the error message to the console and throws an exception.
 *
 * @param {number|string} clientId - The unique identifier of the client.
 * @returns {Promise<Object|null>} A promise that resolves to the client's information object or null if not found.
 * @throws {Error} Throws an error for any network or server issues, except for 404 Not Found.
 */
export async function getClientInfo(clientId) {
    try {
        const clientResponse = await apiClient.get(`/api/get_client/${clientId}/`);
        return clientResponse.data.client;
    } catch (e) {
        if (e.response && e.response.status === 404) {
            // Push to the error route with a state indicating a missing client
            router.push({
                path: "/:pathMatch(.*)*",
                query: {error: 'client-not-found', clientId: clientId}
            });
            return null;
        } else {
            console.error('Error fetching client data:', e);
            throw e; // Re-throw the error for caller to handle
        }
    }
}

/**
 * Fetches location details by location ID.
 *
 * This function first attempts to retrieve the location details from sessionStorage.
 * If not found in sessionStorage, it makes an asynchronous HTTP GET request to fetch
 * the location details from the server. If the location is found, it returns the location data.
 * In case the location is not found (404 error), it redirects to a "Page Not Found" route.
 * For other types of errors, it logs the error message and re-throws the error.
 *
 * @param {number|string} locationId - The unique identifier of the location.
 * @returns {Promise<Object|null>} A promise that resolves to the location's data object or null if the location is not found.
 * @throws {Error} Throws an error for any network or server issues, except for 404 Not Found.
 */
export async function fetchLocationById(locationId) {
    let sessionLocation = await JSON.parse(sessionStorage.getItem('location' + locationId))
    if (sessionLocation) {
        return sessionLocation
    } else {
        try {
            const locationResponse = await apiClient.get(`/api/location/${locationId}/`);
            return locationResponse.data;
        } catch (e) {
            if (e.response && e.response.status === 404) {
                router.push({
                    path: "/:pathMatch(.*)*",
                    query: {error: 'location-not-found', locationId: locationId}
                });
                return null;
            } else {
                console.error('Error fetching location data:', e);
                throw e; // Re-throw the error for caller to handle
            }
        }
    }
}

export async function fetchDocuments(locationId) {
    try {
        const docResponse = await apiClient
            .get("/api/locations/" + locationId + "/documents/")
        return docResponse.data;
    } catch (error) {
        console.error(error);
    }

}

/**
 * Fetches an offer along with its items based on the provided offer ID.
 *
 * This function makes an asynchronous HTTP GET request to retrieve an offer and its associated items.
 * If the offer is found, it returns the offer data. In case the offer is not found (404 error),
 * it redirects to a "Page Not Found" route. For other types of errors, it logs the error and re-throws it.
 *
 * @param {number|string} offerId - The unique identifier of the offer.
 * @returns {Promise<Object|null>} A promise that resolves to the offer's data object or null if the offer is not found.
 * @throws {Error} Throws an error for any network or server issues, except for 404 Not Found.
 */
export async function fetchOfferWithItemsById(offerId) {
    try {
        const offerItemsResponse = await apiClient.get(`/api/offer_with_items/${offerId}/`);
        return offerItemsResponse.data;
    } catch (e) {
        if (e.response && e.response.status === 404) {
            router.push({
                path: "/:pathMatch(.*)*",
                query: {error: 'offer-not-found', offerId: offerId}
            });
            return null;
        } else {
            console.error('Error fetching offer data:', e);
            throw e;
        }
    }
}

/**
 * Triggers an alert modal in the application.
 * This function commits a series of mutations to the Vuex store to configure and show an alert modal.
 * @param {Object} context - The Vuex context object, which provides access to store properties and commit mutations.
 * @param {string} message - The message to be displayed in the alert modal.
 * @param {string} type - The type of the alert (e.g., 'success', 'error', 'warning').
 * @param {number} duration - The duration in milliseconds for which the alert should be displayed.
 */
export function showAlertModal(context, message, type, duration) {
    context.commit('configureAlert', {message, type, duration, visible: true});
}


/**
 * Formats a number according to the locale and currency preferences.
 *
 * @param {Object} context - The Vue component context to access global state.
 * @param {number} number - The number to be formatted.
 * @param {boolean} [currency=true] - Whether to display currency symbol.
 * @param {number} [decimals=2] - The number of decimal places to display.
 * @returns {string} The formatted number string with or without currency symbol.
 */
export function formatNumber(context, number, currency = true, decimals = 2) {
    let currencyShort = currency ? context.$store.state.currency[context.$store.state.locale].code : '';
    return new Intl.NumberFormat(context.$store.state.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number) + currencyShort;
}

export function getTextScaleColor(value, maxLimit, ascending = true, minLimit = 0) {
    let red = Object.freeze({min: 129, max: 255, range: 255 - 129});
    let green = Object.freeze({min: 30, max: 212, range: 212 - 30});
    let blue = Object.freeze({min: 26, max: 60, range: 60 - 26});

    //Calculating percent of value from min-max range.
    let valuePercent = (value - minLimit) / (maxLimit - minLimit) * 100
    valuePercent = valuePercent < 0 ? 0 : valuePercent > 100 || maxLimit === minLimit ? 100 : valuePercent;

    // Calculating 2% of each color range and multiplying it with the valuePercent based on ascending boolean
    //The 2% raise allows each color to reach 100% of range when valuePercent reaches 50% of its range
    let redValue = red.range / 100 * 2 * (ascending ? valuePercent : valuePercent - 50);
    let greenValue = green.range / 100 * 2 * (ascending ? valuePercent - 50 : valuePercent);
    //Blue value is calculated by 1% raise
    let blueValue = blue.range / 100 * valuePercent;

    // Calculating total color value based on ascending boolean
    let redTotal = ascending ? red.min + redValue : red.max - redValue;
    let greenTotal = ascending ? green.max - greenValue : green.min + greenValue;
    let blueTotal = ascending ? blue.min + blueValue : blue.max - blueValue;

    // Limiting color values to their original min/max limits
    redTotal = redTotal < red.min ? red.min : redTotal > red.max ? red.max : redTotal;
    greenTotal = greenTotal < green.min ? green.min : greenTotal > green.max ? green.max : greenTotal;
    blueTotal = blueTotal < blue.min ? blue.min : blueTotal > blue.max ? blue.max : blueTotal;

    return `rgb(${redTotal},${greenTotal},${blueTotal})`
}

export function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

export function normalizeString(str) {
    const map = {
        'ă': 'a',
        'â': 'a',
        'î': 'i',
        'ș': 's',
        'ț': 't',
        'ȃ': 'a',
        'Ă': 'A',
        'Â': 'A',
        'Î': 'I',
        'Ș': 'S',
        'Ț': 'T',
        'Ȃ': 'A',
    };
    return str.replace(/ă|â|î|ș|ț|ȃ|Ă|Â|Î|Ș|Ț|Ȃ/g, match => map[match]);
}

/**
 * Sorts products by their product code. This method can handle both segmented (e.g., "106.01.06")
 * and non-segmented (e.g., "85060604") product codes. If both codes are non-segmented, they are compared
 * as strings. If both are segmented, it compares each segment numerically. If one code is segmented and the
 * other is not, segmented codes are either prioritized first or last based on the sort direction.
 *
 * @param {Object} a - The first product object to compare.
 * @param {Object} b - The second product object to compare.
 * @param {number} direction - The direction of the sort. Positive for ascending, negative for descending.
 * @returns {number} A negative number if `a` should come before `b`, a positive number if `a` should come after `b`,
 * or 0 if they are considered equal for sorting purposes.
 */
export function sortByProductCode(a, b, direction) {
    // Check if both codes are in a segmented format
    const isASegmented = a.product_code.includes(".");
    const isBSegmented = b.product_code.includes(".");

    if (!isASegmented && !isBSegmented) {
        // If both codes are non-segmented, compare them as strings
        return direction * a.product_code.localeCompare(b.product_code);
    } else if (isASegmented && isBSegmented) {
        // If both codes are segmented, proceed with the original numeric comparison
        const aParts = a.product_code.split(".").map(Number);
        const bParts = b.product_code.split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            // Compare each segment; treat missing segments as 0 for comparison
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            if (aPart !== bPart) {
                return direction * (aPart - bPart);
            }
        }
    } else {
        // If one code is segmented and the other is not, prioritize segmented codes first or last based on direction
        return isASegmented ? -1 * direction : 1 * direction;
    }
    return 0;
}

export function getPermissionsByRole(role) {
    const permissions = {
        superuser: {
            canEditClientAgent: true,
            canEditPlenumSize: true,
            canDeletePlenum: true,
            canAddPlenum: true,
            canExcludeRoom: true,
            canEditUnitFloors: true,
            canViewAllUnitModels: true,
            canEditTubingDiameters: true,
            canAddUnitsAboveNeeded: true,
            canViewAllClientsListHeaders: true,
            canViewPriceListsPage: true,
            canAddAnyOfferTypeInSummary: true,
        },
        technicalUser: {
            canEditClientAgent: true,
            canEditPlenumSize: true,
            canDeletePlenum: true,
            canAddPlenum: true,
            canExcludeRoom: true,
            canEditUnitFloors: true,
            canViewAllUnitModels: true,
            canEditTubingDiameters: true,
            canAddUnitsAboveNeeded: true,
            canViewAllClientsListHeaders: true,
            canViewPriceListsPage: false,
            canAddAnyOfferTypeInSummary: true,
        },
        agent: {
            canEditClientAgent: false,
            canEditPlenumSize: true,
            canDeletePlenum: true,
            canAddPlenum: true,
            canExcludeRoom: true,
            canEditUnitFloors: false,
            canViewAllUnitModels: true,
            canEditTubingDiameters: false,
            canAddUnitsAboveNeeded: false,
            canViewAllClientsListHeaders: false,
            canViewPriceListsPage: false,
            canAddAnyOfferTypeInSummary: false,
        },
        superAgent: {
            canEditClientAgent: true,
            canEditPlenumSize: true,
            canDeletePlenum: true,
            canAddPlenum: true,
            canExcludeRoom: true,
            canEditUnitFloors: false,
            canViewAllUnitModels: true,
            canEditTubingDiameters: false,
            canAddUnitsAboveNeeded: false,
            canViewAllClientsListHeaders: true,
            canViewPriceListsPage: false,
            canAddAnyOfferTypeInSummary: false,
        }
        // Add more roles as needed
    };

    return permissions[role] || {};
}

export async function getUserData(context, userId) {
    let userData = await apiClient.get(`/api/get_user_data/${userId}/`);
    let role = '';

    if (userData.data.is_superuser) {
        role = 'superUser';
    } else if (userData.data.is_technicaluser) {
        role = 'technicalUser';
    } else if (userData.data.is_superagent) {
        role = 'superAgent';
    } else {
        role = 'agent';
    }

    setUserPermissionsByRole(context, role);
}

export function setUserPermissionsByRole(context, role) {
    if (role === 'superUser') {
        context.dispatch('setUserPermissions', {
            role: 'superuser',
            permissions: getPermissionsByRole('superuser')
        });
    } else if (role === 'technicalUser') {
        context.dispatch('setUserPermissions', {
            role: 'technicalUser',
            permissions: getPermissionsByRole('technicalUser')
        });
    } else if (role === 'superAgent') {
        context.dispatch('setUserPermissions', {
            role: 'superAgent',
            permissions: getPermissionsByRole('superAgent')
        });
    } else {
        context.dispatch('setUserPermissions', {
            role: 'agent',
            permissions: getPermissionsByRole('agent')
        });
    }
}

// Function to automatically set the main category and category for products in the admin panel
// Change categories in the admin panel console
var partNumbersForEtapa1 = [
    "806.01.50", "806.02.50", "806.03.50", "806.04.50", "806.05.50", "806.06.91",
    "806.07.91", "806.08.91", "806.09.91", "806.10.91", "806.11.91", "806.12.91",
    "806.13.91", "806.14.91", "806.15.91", "806.16.91", "806.17.91", "806.18.91",
    "806.19.91", "813.08.91", "813.10.91", "813.11.91", "807.01.50", "807.02.50",
    "807.03.50", "807.04.50", "807.05.50", "807.06.50", "807.07.50", "807.08.50",
    "807.09.50", "807.10.50", "807.11.50", "807.12.50", "807.13.91", "807.14.91",
    "807.15.91", "807.16.91", "809.01.50", "809.02.50", "809.02.66", "809.03.50", "809.04.50", "809.53.32", "809.54.20",
    "809.54.20", "809.05.91", "809.35.91", "809.06.75", "809.08.91", "809.09.91",
    "809.10.75", "809.11.75", "809.12.75", "1401.02.65", "1401.03.65", "1401.05.65",
    "1401.12.81", "1401.13.81", "1401.14.81", "1401.20.74", "1401.21.74", "1401.22.74",
    "1401.23.74", "809.13.66", "809.14.66", "809.15.66", "809.16.66", "809.17.66",
    "809.18.66", "809.19.66", "809.20.66", "809.21.66", "809.22.66", "809.23.83",
    "809.40.32", "809.41.32", "809.42.32", "809.24.83", "809.43.32", "809.44.32",
    "809.45.32", "809.25.83", "809.46.32", "809.47.32", "809.48.32", "809.26.83",
    "809.49.32", "809.50.32", "809.51.32", "809.52.32", "809.27.83", "809.28.83",
    "809.29.83", "809.30.83", "809.31.66", "809.33.66", "809.34.66", "813.01.91",
    "813.02.91", "813.03.91", "813.04.91", "813.05.91", "813.06.91", "813.07.91",
    "813.08.91", "813.09.91", "813.10.91", "813.11.91", "813.14.91", "809.37.91",
    "809.38.91", "809.39.91", "813.18.91", "813.19.91"
]; // Add your part numbers for Etapa 1 here

var partNumbersForEtapa2 = [
    "803.01.50", "803.02.50", "803.04.50", "803.05.50", "803.07.83", "803.08.83",
    "803.10.83", "803.11.83", "803.13.83", "803.14.83", "803.27.83", "803.28.83",
    "803.29.83", "803.30.83", "803.31.83", "803.32.83", "803.33.83", "803.34.83",
    "803.15.83", "803.16.83", "803.17.83", "803.18.83", "803.19.83", "803.20.83",
    "803.21.83", "803.22.83", "803.23.83", "803.24.83", "803.25.83", "803.26.83",
    "804.01.50", "804.02.50", "804.03.50", "804.04.83", "804.05.83", "804.06.83",
    "804.07.83", "804.08.83", "804.09.83", "805.03.50", "805.06.83",
    "805.07.83", "805.09.83", "805.10.83", "805.11.83",
    "805.14.83", "805.15.83", "805.20.83", "805.16.83", "805.17.83",
    "808.10.50", "808.11.50", "808.13.74",
    "808.05.50", "808.14.50", "808.06.50", "808.07.50", "808.08.50", "808.09.50"
]; // Add your part numbers for Etapa 2 here

var partNumbersForSuplimentare = [
    "801.01.50", "801.07.50", "801.09.50", "801.10.50", "801.19.50", "801.28.50", "805.04.50", "805.05.50",
    "802.03.50", "802.04.50", "802.04.50", "805.01.50", "811.01.50", "811.02.50", "811.03.50",
    "811.05.50", "811.06.50", "811.07.50", "811.08.83", "811.09.83", "811.10.83", "811.11.83", "805.12.83", "805.13.83",
    "811.12.83", "811.13.83", "811.14.83", "811.15.83", "811.16.83", "811.17.83", "811.20.83", "805.18.83",
    "811.18.83", "811.19.83", "812.01.70", "812.02.70", "812.05.70", "812.06.70", "805.19.83",
    "810.01.63", "810.02.63", "810.03.63", "810.04.63", "810.05.63", "810.06.63", '815.02.19', '815.03.19', "815.01.19",
    "809.38.83"
]; // Add your part numbers for Suplimentare here

var partNumbersForShowInOffer = [
    '801.01.50', '801.07.50', '801.09.50', '801.10.50',
    '801.19.50', '801.28.50', '802.03.50', '802.04.50',
    '805.01.50', '805.12.83', '805.13.83', '805.18.83',
    '805.19.83', '815.02.19', '815.03.19'
]; // Add your part numbers for Show in Offer here

// Access all rows in the table
var rows = document.querySelectorAll('tr');

// Iterate through each row
rows.forEach(function (row) {
    // Find the th.field-part_no element within the row
    var partNoElement = row.querySelector('th.field-part_no');

    // Check if the element exists
    if (partNoElement) {
        // Get the text content of the part number element
        var partNo = partNoElement.textContent.trim();

        // Check if the part number is in any of our arrays
        if (partNumbersForEtapa1.includes(partNo)) {
            // Change the category to 'Produse Etapa 1'
            setCategory(row, 'VMC_ETAPA_1');
            setMainCategory(row, 'VMC');
        } else if (partNumbersForEtapa2.includes(partNo)) {
            // Change the category to 'Produse Etapa 2'
            setCategory(row, 'VMC_ETAPA_2');
            setMainCategory(row, 'VMC');
        } else if (partNumbersForSuplimentare.includes(partNo)) {
            // Change the category to 'Produse Suplimentare'
            setCategory(row, 'ADITIONALE');
            setMainCategory(row, 'VMC');
        }
        // Update 'show in offer' based on part number
        var showInOfferCheckbox = row.querySelector('td.field-show_in_offer input[type="checkbox"]');
        if (showInOfferCheckbox) {
            showInOfferCheckbox.checked = partNumbersForShowInOffer.includes(partNo);
        }
    }
});

// Function to set the category
function setCategory(row, categoryValue) {
    // Find the category select element
    var categorySelect = row.querySelector('td.field-category select');

    // Check if the category select element exists
    if (categorySelect) {
        // Change the category
        categorySelect.value = categoryValue;
    }
}

// Function to set the main category
function setMainCategory(row, mainCategoryValue) {
    // Find the main category select element
    var mainCategorySelect = row.querySelector('td.field-main_category select');

    // Check if the main category select element exists
    if (mainCategorySelect) {
        // Change the main category
        mainCategorySelect.value = mainCategoryValue;
    }
}
