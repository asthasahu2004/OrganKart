import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: apiURL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.request);
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    throw error;
  }
);

export const getAllOrder = async () => {
  try {
    const res = await api.get("/api/order/get-all-orders");
    return res.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    // Return empty structure to prevent app crashes
    return { Orders: [] };
  }
};

export const editCategory = async (oId, status) => {
  if (!oId || !status) {
    console.error("Missing required parameters for order update");
    return { error: "Missing required parameters" };
  }

  const data = { oId, status };
  console.log("Updating order with data:", data);
  
  try {
    const res = await api.post("/api/order/update-order", data);
    return res.data;
  } catch (error) {
    console.error("Error updating order:", error);
    return { error: "Failed to update order" };
  }
};

export const deleteOrder = async (oId) => {
  if (!oId) {
    console.error("Missing order ID for deletion");
    return { error: "Missing order ID" };
  }

  const data = { oId };
  console.log("Deleting order with ID:", oId);
  
  try {
    const res = await api.post("/api/order/delete-order", data);
    return res.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    return { error: "Failed to delete order" };
  }
};