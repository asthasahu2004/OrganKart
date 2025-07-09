import {
  DashboardData,
  postUploadImage,
  getSliderImages,
  postDeleteImage,
} from "./FetchApi";
import { getAllOrder } from "../orders/FetchApi.js";

export const GetAllData = async (dispatch) => {
  try {
    console.log("Fetching dashboard data..."); // Debug log
    const responseData = await DashboardData();
    console.log("Dashboard data received:", responseData); // Debug log
    
    // Handle different response structures
    let dataToDispatch;
    
    if (responseData && responseData.success && responseData.data) {
      // If response has success flag and data property
      dataToDispatch = responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      // If response is directly the data object
      dataToDispatch = responseData;
    } else {
      // Fallback to empty data
      dataToDispatch = { Users: 0, Orders: 0, Products: 0, Categories: 0 };
    }
    
    // Ensure all required fields exist
    const finalData = {
      Users: dataToDispatch.Users || dataToDispatch.users || 0,
      Orders: dataToDispatch.Orders || dataToDispatch.orders || 0,
      Products: dataToDispatch.Products || dataToDispatch.products || 0,
      Categories: dataToDispatch.Categories || dataToDispatch.categories || 0,
    };
    
    console.log("Final data being dispatched:", finalData); // Debug log
    dispatch({ type: "totalData", payload: finalData });
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    // Dispatch empty data to prevent undefined errors
    dispatch({ 
      type: "totalData", 
      payload: { Users: 0, Orders: 0, Products: 0, Categories: 0 } 
    });
  }
};

export const todayAllOrders = async (dispatch) => {
  try {
    const responseData = await getAllOrder();
    if (responseData) {
      dispatch({ type: "totalOrders", payload: responseData });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    dispatch({ type: "totalOrders", payload: { Orders: [] } });
  }
};

export const sliderImages = async (dispatch) => {
  try {
    const responseData = await getSliderImages();
    if (responseData && responseData.Images) {
      dispatch({ type: "sliderImages", payload: responseData.Images });
    } else if (responseData && Array.isArray(responseData)) {
      dispatch({ type: "sliderImages", payload: responseData });
    }
  } catch (error) {
    console.error("Error fetching slider images:", error);
    dispatch({ type: "sliderImages", payload: [] });
  }
};

export const deleteImage = async (id, dispatch) => {
  dispatch({ type: "imageUpload", payload: true });
  try {
    const responseData = await postDeleteImage(id);
    if (responseData && responseData.success) {
      setTimeout(() => {
        sliderImages(dispatch);
        dispatch({ type: "imageUpload", payload: false });
      }, 1000);
    } else {
      dispatch({ type: "imageUpload", payload: false });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    dispatch({ type: "imageUpload", payload: false });
  }
};

export const uploadImage = async (image, dispatch) => {
  dispatch({ type: "imageUpload", payload: true });
  const formData = new FormData();
  formData.append("image", image);
  console.log("Uploading image:", formData.get("image"));
  
  try {
    const responseData = await postUploadImage(formData);
    if (responseData && responseData.success) {
      setTimeout(() => {
        dispatch({ type: "imageUpload", payload: false });
        sliderImages(dispatch);
      }, 1000);
    } else {
      dispatch({ type: "imageUpload", payload: false });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    dispatch({ type: "imageUpload", payload: false });
  }
};