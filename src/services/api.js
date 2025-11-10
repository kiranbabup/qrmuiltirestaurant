// api.js
import axios from 'axios'

export const baseURL = 'https://api-multi-qr.invtechnologies.in/'
// export const baseURL = 'http://192.168.0.111:1537/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})

// users menu API's
export const fetchCategoriesById = (id) =>
  api.get(`fetch-categories/${id}`);

export const getMenuById = (id) =>
  api.get(`fetch-items/${id}`);

// login API
export const login = (data) =>
  api.post('login_pos', data);

// create API's
export const createRestaurants = (data) =>
  api.post('create_restaurants', data);

// fetch API's
export const fetchSubscriptions = () =>
  api.get(`fetch-subscriptions`);

export default api;