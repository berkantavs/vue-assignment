import axiosInstance from '../axiosConfig';

export const fetchContacts = async (tableName) => {
  try {
    const response = await axiosInstance.get(`/${tableName}`);
    return response.data.records;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

