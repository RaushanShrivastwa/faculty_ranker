import axios from 'axios';

// Create an Axios instance with a dynamic base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE + '/faculty'
});

/**
 * Fetches a page of faculty data from the server.
 * @param {number} page The current page number (defaults to 1).
 * @param {number} facultiesPerPage The number of faculties to fetch per page.
 * @param {string} searchTerm The search term to filter faculties by name or department.
 * @returns {Promise<Object>} A promise that resolves to the faculty data, total pages, etc.
 */
export const getFacultyPage = async (page = 1, facultiesPerPage = 10, searchTerm = '') => {
  try {
    const res = await API.get('/all', {
      params: {
        page,
        limit: facultiesPerPage,
        search: searchTerm
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching faculty page:', error);
    throw error;
  }
};
