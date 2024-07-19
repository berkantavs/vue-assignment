import axios from 'axios';

const API_KEY = 'patiU2ES8mf3z2Np5.289d96c958e5582792e351afc11a6c5e99d219338fdc3caaf43b055acf9a6b5a';
const BASE_ID = 'appkTtnhXACqj0kag';

const instance = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}`,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  }
});

export default instance;
