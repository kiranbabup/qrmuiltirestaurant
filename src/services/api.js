// api.js
import axios from 'axios'

export const baseURL = 'https://api-multi-qr.invtechnologies.in/'
// export const baseURL = 'http://192.168.0.103:1537/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})

// users menu API's start
export const fetchCategoriesById = (id) =>
  api.get(`fetch-categories/${id}`);

// fetch by id
export const fetchQRStatsByTableId = (id) =>
  api.get(`fetch-qr-stats/${id}`);

// post data
export const addToCart = (data) =>
  api.post('add-to-cart', data)

export const removeFromCart = (data) =>
  api.patch('remove-from-cart', data)

export const clearCart = (payload) =>
  api.delete('clear-cart', { data: payload })

export const createOrder = (data) =>
  api.post('create-order', data)

export const fetchTodayOrders = (data) =>
  api.post('fetch-today-orders', data)

export const payBill = (data) =>
  api.put('pay-bill', data)

export const getOrderDetailsById =(id) =>
  api.get(`get-order-details/${id}`);

export const confirmBill =(id, payload) =>
  api.patch(`confirm-bill/${id}`, payload);

// users menu API's end

// login API
export const login = (data) =>
  api.post('login_pos', data);

// super admin api's start
// create or post-data API's
export const createRestaurants = (data) =>
  api.post('create_restaurants', data);

// fetch API's
export const fetchSubscriptions = () =>
  api.get(`fetch-subscriptions`);
// super admin api's end

export default api;