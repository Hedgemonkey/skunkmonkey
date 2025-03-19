/**
 * api-client-examples.js - Examples of how to use the API client
 * 
 * This file provides practical examples of using the API client
 * with the product and category management functionality.
 */
import apiClient from './api-client.js';
import notifications from '../products/static/js/utilities/notifications.js';

/**
 * Example: Integrating API client with ProductManager
 */
export const productApiExamples = {
    /**
     * Fetch products with the API client
     * @param {string} url - URL to fetch products from
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise resolving with product data
     */
    fetchProducts(url, params = {}) {
        return apiClient.get(url, params)
            .then(response => {
                if (response.success) {
                    return response.data;
                } else {
                    notifications.displayError("Failed to fetch products: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                return Promise.reject(error);
            });
    },
    
    /**
     * Delete a product with the API client
     * @param {string} productSlug - Product slug to delete
     * @returns {Promise} - Promise resolving when product is deleted
     */
    deleteProduct(productSlug) {
        const deleteUrl = `/products/staff/product/${productSlug}/delete/`;
        
        return apiClient.post(deleteUrl)
            .then(response => {
                if (response.success) {
                    notifications.displaySuccess(response.message || "Product deleted successfully");
                    return response;
                } else {
                    notifications.displayError("Failed to delete product: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                notifications.displayError("Error deleting product: " + error.message);
                return Promise.reject(error);
            });
    },
    
    /**
     * Submit a product form with the API client
     * @param {HTMLFormElement} form - The form to submit
     * @returns {Promise} - Promise resolving with form submission result
     */
    submitProductForm(form) {
        const formData = new FormData(form);
        
        return apiClient.post(form.action, formData, {
            skipGlobalErrorHandler: true // Handle errors locally
        })
        .then(response => {
            if (response.success) {
                notifications.displaySuccess(response.message || "Form submitted successfully");
                return response;
            } else {
                // Format and display validation errors
                const errorMessage = Object.entries(response.errors || {})
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                
                notifications.displayError(errorMessage || "Form submission failed");
                return Promise.reject(response);
            }
        })
        .catch(error => {
            if (error.errors) {
                // Format validation errors
                const errorMessage = Object.entries(error.errors)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return `${field}: ${messages.join(', ')}`;
                        }
                        return `${field}: ${messages}`;
                    })
                    .join('\n');
                
                notifications.displayError(errorMessage);
            } else {
                notifications.displayError("Error submitting form: " + error.message);
            }
            
            return Promise.reject(error);
        });
    }
};

/**
 * Example: Integrating API client with CategoryManager
 */
export const categoryApiExamples = {
    /**
     * Fetch categories with the API client
     * @param {string} url - URL to fetch categories from
     * @returns {Promise} - Promise resolving with category data
     */
    fetchCategories(url) {
        return apiClient.get(url)
            .then(response => {
                if (response.success) {
                    return response.data;
                } else {
                    notifications.displayError("Failed to fetch categories: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
                return Promise.reject(error);
            });
    },
    
    /**
     * Add a new category with the API client
     * @param {string} url - URL for adding the category
     * @param {string} categoryName - Name of the category to add
     * @returns {Promise} - Promise resolving when category is added
     */
    addCategory(url, categoryName) {
        return apiClient.post(url, { name: categoryName })
            .then(response => {
                if (response.success) {
                    notifications.displaySuccess(response.message || "Category added successfully");
                    return response;
                } else {
                    notifications.displayError("Failed to add category: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                notifications.displayError("Error adding category: " + error.message);
                return Promise.reject(error);
            });
    },
    
    /**
     * Delete a category with the API client
     * @param {string} categorySlug - Category slug to delete
     * @returns {Promise} - Promise resolving when category is deleted
     */
    deleteCategory(categorySlug) {
        const deleteUrl = `/products/staff/category/${categorySlug}/delete/`;
        
        return apiClient.post(deleteUrl)
            .then(response => {
                if (response.success) {
                    notifications.displaySuccess(response.message || "Category deleted successfully");
                    return response;
                } else {
                    notifications.displayError("Failed to delete category: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                notifications.displayError("Error deleting category: " + error.message);
                return Promise.reject(error);
            });
    },
    
    /**
     * Check products in a category before deletion
     * @param {string} categorySlug - Category slug to check
     * @returns {Promise} - Promise resolving with products in the category
     */
    checkCategoryProducts(categorySlug) {
        const url = `/products/staff/category/${categorySlug}/products/`;
        
        return apiClient.get(url)
            .then(response => {
                if (response.success) {
                    return response.data;
                } else {
                    notifications.displayError("Failed to check category products: " + response.message);
                    return Promise.reject(response);
                }
            })
            .catch(error => {
                notifications.displayError("Error checking category products: " + error.message);
                return Promise.reject(error);
            });
    }
};

/**
 * General usage examples of the API client
 */
export const generalApiExamples = {
    /**
     * Example of handling a form with file uploads
     * @param {HTMLFormElement} form - The form to submit
     * @returns {Promise} - Promise resolving with form submission result
     */
    uploadFile(form) {
        const formData = new FormData(form);
        
        return apiClient.post(form.action, formData)
            .then(response => {
                if (response.success) {
                    notifications.displaySuccess("File uploaded successfully");
                    return response.data;
                } else {
                    notifications.displayError("Failed to upload file: " + response.message);
                    return Promise.reject(response);
                }
            });
    },
    
    /**
     * Example of handling a paginated API endpoint
     * @param {string} url - Base URL for the paginated endpoint
     * @param {number} page - Page number to fetch
     * @param {number} pageSize - Number of items per page
     * @returns {Promise} - Promise resolving with paginated data
     */
    getPaginatedData(url, page = 1, pageSize = 10) {
        return apiClient.get(url, { page, page_size: pageSize })
            .then(response => {
                if (response.success) {
                    return {
                        items: response.data.results || response.data,
                        totalItems: response.data.count || 0,
                        totalPages: response.data.total_pages || 1,
                        currentPage: page
                    };
                } else {
                    return Promise.reject(response);
                }
            });
    },
    
    /**
     * Example of making multiple requests in parallel
     * @param {Array<string>} urls - Array of URLs to fetch
     * @returns {Promise} - Promise resolving when all requests complete
     */
    fetchMultiple(urls) {
        const requests = urls.map(url => apiClient.get(url));
        
        return Promise.all(requests)
            .then(responses => {
                // Filter out only successful responses
                return responses.filter(response => response.success)
                    .map(response => response.data);
            });
    },
    
    /**
     * Example of implementing a retry mechanism for transient failures
     * @param {Function} requestFn - Function that returns a promise for the request
     * @param {number} maxRetries - Maximum number of retry attempts
     * @param {number} delayMs - Delay between retries in milliseconds
     * @returns {Promise} - Promise resolving with the request result
     */
    withRetry(requestFn, maxRetries = 3, delayMs = 1000) {
        return new Promise((resolve, reject) => {
            const attempt = (retryCount) => {
                requestFn()
                    .then(resolve)
                    .catch(error => {
                        // Don't retry if it's not a transient error
                        if (error.status === 400 || error.status === 403 || error.status === 404) {
                            reject(error);
                            return;
                        }
                        
                        if (retryCount < maxRetries) {
                            setTimeout(() => attempt(retryCount + 1), delayMs);
                        } else {
                            reject(error);
                        }
                    });
            };
            
            attempt(0);
        });
    }
};