//Doseservice.jsx
import axios from 'axios';
import { API_URL } from '../../config';

export const getSearchDoseManager = async (
  search,
  condition,
  rdOpen,
  rdClose
) => {
  const response = await axios.get(API_URL + '/dose/getSearchDoseManager', {
    params: {
      txtSearch: search || '',
      showDataFunc: condition,
      rdOpen: rdOpen,
      rdClose: rdClose,
    },
  });
  return response.data;
};
export const getDoseById = async (drugId) => {
  const response = await axios.get(API_URL + '/dose/getDrugById', {
    params: {
      drugId: drugId,
    },
  });
  return response.data[0];
};
export const dtdosageunit = async (capacityId) => {
  const response = await axios.get(API_URL + '/dose/getUnitByID', {
    params: {
      txtOrderUnit: capacityId,
    },
  });
  return response.data[0];
};

export const dtorderunit = async (capacityId) => {
  const response = await axios.get(API_URL + '/dose/getOrderUnitByID', {
    params: {
      txtOrderUnit: capacityId,
    },
  });
  return response.data.recordsets[0];
};
