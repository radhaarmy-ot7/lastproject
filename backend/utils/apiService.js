const axios = require('axios');

class ApiService {
    constructor() {
        this.baseURL = process.env.API_URL || 'http://localhost:5000';
    }

    async get(endpoint, headers = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, { headers });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post(endpoint, data, headers = {}) {
        try {
            const response = await axios.post(`${this.baseURL}${endpoint}`, data, { headers });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async put(endpoint, data, headers = {}) {
        try {
            const response = await axios.put(`${this.baseURL}${endpoint}`, data, { headers });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async patch(endpoint, data, headers = {}) {
        try {
            const response = await axios.patch(`${this.baseURL}${endpoint}`, data, { headers });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(endpoint, headers = {}) {
        try {
            const response = await axios.delete(`${this.baseURL}${endpoint}`, { headers });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            return new Error(error.response.data.message || 'API request failed');
        } else if (error.request) {
            // The request was made but no response was received
            return new Error('No response from server. Please check your connection.');
        } else {
            // Something happened in setting up the request
            return new Error(error.message || 'Request failed');
        }
    }
}

module.exports = new ApiService();