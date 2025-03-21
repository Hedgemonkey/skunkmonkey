/**
 * array-utils.js - Utility functions for array operations
 * 
 * Provides common array manipulation and comparison functions
 */

/**
 * Compare two arrays for equality, regardless of element order
 * @param {Array} a - First array to compare
 * @param {Array} b - Second array to compare
 * @returns {boolean} - Whether the arrays contain the same elements
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    
    // Normalize and sort arrays for consistent comparison
    const normalizedA = [...a].map(item => item?.toString()).sort();
    const normalizedB = [...b].map(item => item?.toString()).sort();
    
    // Use JSON.stringify for deep comparison
    return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
}

/**
 * Check if an array contains a specific value
 * Handles type conversion for more consistent results
 * @param {Array} array - The array to check
 * @param {*} value - The value to look for
 * @returns {boolean} - Whether the value exists in the array
 */
export function arrayContains(array, value) {
    if (!array || !Array.isArray(array)) return false;
    
    const valueStr = value?.toString();
    return array.some(item => item?.toString() === valueStr);
}

/**
 * Safely add an item to an array without duplicates
 * @param {Array} array - The array to modify
 * @param {*} item - The item to add
 * @returns {Array} - The updated array
 */
export function addToArray(array, item) {
    if (!array) array = [];
    
    if (!arrayContains(array, item)) {
        array.push(item);
    }
    
    return array;
}

/**
 * Remove an item from an array
 * @param {Array} array - The array to modify
 * @param {*} item - The item to remove
 * @returns {Array} - The updated array
 */
export function removeFromArray(array, item) {
    if (!array || !Array.isArray(array)) return [];
    
    const valueStr = item?.toString();
    return array.filter(arrItem => arrItem?.toString() !== valueStr);
}

/**
 * Toggle an item in an array (add if not present, remove if present)
 * @param {Array} array - The array to modify
 * @param {*} item - The item to toggle
 * @returns {Array} - The updated array with the item toggled
 */
export function toggleInArray(array, item) {
    if (!array || !Array.isArray(array)) array = [];
    
    return arrayContains(array, item) 
        ? removeFromArray(array, item) 
        : addToArray(array, item);
}

/**
 * Check if an array includes a value (alias for arrayContains)
 * @param {Array} array - The array to check
 * @param {*} value - The value to find
 * @returns {boolean} True if the array includes the value
 */
export function includesValue(array, value) {
    return arrayContains(array, value);
}

/**
 * Get unique values from an array
 * @param {Array} array - The array to process
 * @returns {Array} Array with duplicate values removed
 */
export function uniqueValues(array) {
    if (!array || !Array.isArray(array)) return [];
    return [...new Set(array)];
}

/**
 * Group array items by a property
 * @param {Array} array - Array of objects
 * @param {string} property - Property to group by
 * @returns {Object} Grouped items
 */
export function groupBy(array, property) {
    if (!array || !Array.isArray(array)) return {};
    
    return array.reduce((result, item) => {
        const key = item[property];
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
}

export default {
    arraysEqual,
    arrayContains,
    addToArray,
    removeFromArray,
    toggleInArray,
    includesValue,
    uniqueValues,
    groupBy
};
