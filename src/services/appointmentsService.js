import axiosInstance from '../axiosConfig';

export const fetchRecords = async (tableName) => {
  try {
    const response = await axiosInstance.get(`/${tableName}`);
    return response.data.records;
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
};

export const createRecords = async (tableName, records, typecast = false) => {
  try {
    const response = await axiosInstance.post(`/${tableName}`, {
      records: records.map(record => ({ fields: record })),
      typecast: typecast
    });
    return response.data.records;
  } catch (error) {
    console.error('Error creating records:', error);
    throw error;
  }
};

export const updateRecords = async (tableName, records) => {
  try {
    const response = await axiosInstance.patch(`/${tableName}`, {
      records: records.map(record => ({
        id: record.id,
        fields: record.fields
      }))
    });
    return response.data.records;
  } catch (error) {
    console.error('Error updating records:', error);
    throw error;
  }
};

// Diğer API işlemleri için benzer fonksiyonlar ekleyebilirsiniz
