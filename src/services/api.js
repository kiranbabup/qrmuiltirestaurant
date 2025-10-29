import axios from 'axios'

export const baseURL = 'https://tom.invtechnologies.in/'
// export const baseURL = 'http://192.168.0.102:1436/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})

// login API
export const loginUser = (data) =>
  api.post('login-user', data);

// fetch API's
export const getFetchAccountTypes = () =>
  api.get('fetch-account-types');

export const getFetchGroups = () =>
  api.get('fetch-groups');

export const getFetchSubCompanies = () =>
  api.get('get-sub-companies');

export const getFetchCompanyTypes = () =>
  api.get('fetch-company-types');

export const getFetchRoles = () =>
  api.get('fetch-roles');

export const getFetchPaymentTerms = (params) =>
  api.get('fetch-payment-terms', { params });

export const getFetchAllAccounts = (params) =>
  api.get('fetch-all-chart-of-accounts', { params });

export const getFetchAllCompanies = (params) =>
  api.get('get-all-companies', { params });

export const getFetchAllUsers = (params) =>
  api.get('get-all-users', { params });

export const getFetchCurrencyList = (params) =>
  api.get('fetch-currency', { params });

export const getFetchUOMList = (params) =>
  api.get('fetch-uom', { params });

export const getFetchFinYearList = (params) =>
  api.get('fetch-fy', { params });

export const getFetchSubCompanyList = (params) =>
  api.get('get-sub-companies', { params });

export const getFetchProjectList = (params) =>
  api.get('fetch-projects', { params });

export const getFetchCostCenterList = (params) =>
  api.get('fetch-cost-centers', { params });

export const getFetchInitSalesQuotation = (data) =>
  api.post('init-sales-quotation', data);

export const getFetchSalesQuotationList = (params) =>
  api.get('get-sales-quotations', { params });

export const getFetchSalesQuotationById = (id) =>
  api.get(`get-sales-quotation/${id}`);

// create API's
export const createChartAccount = (data) =>
  api.post('create-chart-of-account', data)

export const createCompany = (data) =>
  api.post('create-company', data)

export const createUser = (data) =>
  api.post('create-user', data)

export const createPaymentTerms = (data) =>
  api.post('create-payment-term', data)

export const createUOM = (data) =>
  api.post('create-uom-master', data)

export const createFinYear = (data) =>
  api.post('create-fy', data)

export const createSubCompany = (data) =>
  api.post('create-sub-company', data)

export const createProject = (data) =>
  api.post('create-project', data)

export const createCostCenter = (data) =>
  api.post('create-cost-center', data)

export const createSaleQuotation = (data) =>
  api.post('create-sales-quotation', data)

// Update API's
export const updateAccountDetails = (id, data) =>
  api.put(`update-account-details/${id}`, data)

export const updatePaymentTerms = (id, data) =>
  api.put(`update-payment-term/${id}`, data)

export const updateUOM = (id, data) =>
  api.put(`update-uom/${id}`, data)

export const updateFinYear = (id, data) =>
  api.put(`update-fy/${id}`, data)

export const updateSubCompany = (id, data) =>
  api.put(`update-sub-company-details/${id}`, data)

export const updateProject = (id, data) =>
  api.put(`update-project-details/${id}`, data)

export const updateCostCenter = (id, data) =>
  api.put(`update-cost-center/${id}`, data)

export const updateSaleQuotation = (id, data) =>
  api.put(`update-sales-quotation/${id}`, data)

export default api;