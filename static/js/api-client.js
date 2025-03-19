/**
 * api-client.js - Standardized API client for consistent AJAX operations
 * 
 * Provides a higher-level wrapper around AJAX requests with standardized
 * error handling, response parsing, and consistent promise handling.
 */
import { makeAjaxRequest, getCookie } from './ajax_helper.js';

/**
 * API Client for consistent handling of AJAX requests
 */
export class ApiClient {
    /**
     * Create a new ApiClient instance
     * @param {Object} options - Configuration options
     * @param {Function} options.errorHandler - Global error handler function
     * @param {string} options.baseUrl - Base URL for API requests
     */
    constructor(options = {}) {
        this.errorHandler = options.errorHandler || console.error;
        this.baseUrl = options.baseUrl || '';
        this.csrfToken = getCookie('csrftoken');
        this.pendingRequests = [];
    }

    /**
     * Builds a complete URL for the API request
     * @param {string} endpoint - API endpoint
     * @returns {string} - Complete URL
     */
    buildUrl(endpoint) {
        // If endpoint is already a full URL, return it as is
        if (endpoint.startsWith('http') || endpoint.startsWith('/')) {
            return endpoint;
        }
        
        // Otherwise, join baseUrl and endpoint
        return `${this.baseUrl}/${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
    }

    /**
     * Make a GET request to fetch data
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
    get(endpoint, params = {}, options = {}) {
        return this.request('GET', endpoint, params, options);
    }

    /**
     * Make a POST request to create or update data
     * @param {string} endpoint - API endpoint
     * @param {Object|FormData} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
    post(endpoint, data = {}, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    /**
     * Make a DELETE request to remove data
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
    delete(endpoint, data = {}, options = {}) {
        return this.request('DELETE', endpoint, data, options);
    }

    /**
     * Make a generic request with specified method
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object|FormData} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise} - Promise resolving with response
     */
    request(method, endpoint, data = {}, options = {}) {
        const url = this.buildUrl(endpoint);
        const abortable = options.abortable !== false;
        
        // Determine if we should process the data (false for FormData)
        const processData = !(data instanceof FormData);
        const contentType = processData ? 'application/x-www-form-urlencoded; charset=UTF-8' : false;
        
        return new Promise((resolve, reject) => {
            try {
                const ajaxRequest = makeAjaxRequest(
                    url,
                    method,
                    data,
                    (response) => {
                        // Remove from pending requests
                        this.removePendingRequest(ajaxRequest);
                        resolve(response);
                    },
                    (jqXHR, textStatus, errorThrown) => {
                        // Remove from pending requests
                        this.removePendingRequest(ajaxRequest);
                        
                        // Create standardized error object
                        const error = {
                            status: jqXHR.status,
                            statusText: jqXHR.statusText,
                            responseJSON: jqXHR.responseJSON,
                            message: jqXHR.responseJSON?.error || errorThrown || "Request failed"
                        };
                        
                        // Call the global error handler if provided
                        if (this.errorHandler && !options.skipGlobalErrorHandler) {
                            this.errorHandler(error);
                        }
                        
                        reject(error);
                    },
                    abortable,
                    processData,
                    contentType
                );
                
                // Track the request if abortable
                if (abortable && ajaxRequest) {
                    this.pendingRequests.push(ajaxRequest);
                }
                
                // If there's a timeout option, handle it
                if (options.timeout) {
                    setTimeout(() => {
                        if (ajaxRequest && ajaxRequest.readyState < 4) {
                            ajaxRequest.abort();
                            reject({
                                message: 'Request timed out',
                                status: 0,
                                statusText: 'timeout'
                            });
                        }
                    }, options.timeout);
                }
            } catch (error) {
                console.error("Error making request:", error);
                reject({
                    message: error.message || "Failed to make request",
                    error: error
                });
            }
        });
    }

    /**
     * Remove a request from the pending requests list
     * @param {Object} request - The request to remove
     */
    removePendingRequest(request) {
        const index = this.pendingRequests.indexOf(request);
        if (index !== -1) {
            this.pendingRequests.splice(index, 1);
        }
    }

    /**
     * Abort all pending requests
     */
    abortAll() {
        this.pendingRequests.forEach(request => {
            if (request && typeof request.abort === 'function') {
                request.abort();
            }
        });
        this.pendingRequests = [];
    }
}

// Create a default instance
export default new ApiClient();
