import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Add default timeout and better error handling
const axiosInstance = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export const DashboardData = async () => {
  try {
    console.log("Making dashboard API call to:", `${apiURL}/api/customize/dashboard-data`);
    
    const res = await axiosInstance.post(`${apiURL}/api/customize/dashboard-data`);
    
    console.log("Dashboard API Response:", res.data);
    console.log("Response status:", res.status);
    
    return res.data;
  } catch (error) {
    console.error("Dashboard API Error Details:");
    console.error("- Status:", error.response?.status);
    console.error("- Status Text:", error.response?.statusText);
    console.error("- Data:", error.response?.data);
    console.error("- Message:", error.message);
    console.error("- URL:", error.config?.url);
    
    // For network errors or timeouts
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    }
    
    // For server errors
    if (error.response?.status >= 500) {
      throw new Error('Server error - please try again later');
    }
    
    // For client errors
    if (error.response?.status >= 400) {
      throw new Error(error.response.data?.message || 'Bad request');
    }
    
    throw error;
  }
};

export const getSliderImages = async () => {
  try {
    const res = await axiosInstance.get(`${apiURL}/api/customize/get-slide-image`);
    return res.data;
  } catch (error) {
    console.error("Get Slider Images Error:", error.response?.data || error.message);
    throw error;
  }
};

export const postUploadImage = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `${apiURL}/api/customize/upload-slide-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Upload Image Error:", error.response?.data || error.message);
    throw error;
  }
};

export const postDeleteImage = async (id) => {
  try {
    const res = await axiosInstance.post(`${apiURL}/api/customize/delete-slide-image`, {
      id,
    });
    return res.data;
  } catch (error) {
    console.error("Delete Image Error:", error.response?.data || error.message);
    throw error;
  }
};