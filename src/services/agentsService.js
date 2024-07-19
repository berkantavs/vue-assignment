import axiosInstance from '../axiosConfig';

export const fetchAgents = async (tableName) => {
  try {
    const response = await axiosInstance.get(`/${tableName}`);
    return response.data.records;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

