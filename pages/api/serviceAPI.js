import axios from "axios";

import { API_URL } from "./url";

const getServices = () => {
  return axios({
    method: "GET",
    url: API_URL + `/services`,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};

const getServiceById = (id) => {
  return axios({
    method: "GET",
    url: API_URL + `/services/${id}`,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};


const getServiceByCode = (code) => {
  return axios({
    method: "GET",
    url: API_URL + `/services/${code}`,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};
const createService = (data) => {
  return axios({
    method: "POST",
    url: API_URL + `/services/create`,
    data: data,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};

const updateService = (data, id) => {
  return axios({
    method: "POST",
    url: API_URL + `/services/update/${id}`,
    data: data,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};

const searchService = async (data) => {
  return axios({
    method: "POST",
    url: API_URL + "/services/search",
    data: data,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};

const disableService = (id) => {
  return axios({
    method: "POST",
    url: API_URL + `/services/disable-service/${id}`,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};

export {
  disableService,
  getServices,
  getServiceById,
  getServiceByCode,
  createService,
  updateService,
  searchService,
};
