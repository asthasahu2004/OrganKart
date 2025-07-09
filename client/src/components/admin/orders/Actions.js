import { getAllOrder, deleteOrder } from "./FetchApi";

export const fetchData = async (dispatch) => {
  try {
    dispatch({ type: "loading", payload: true });
    const responseData = await getAllOrder();
    
    console.log("API Response:", responseData);
    
    if (responseData && responseData.Orders) {
      dispatch({
        type: "fetchOrderAndChangeState",
        payload: responseData.Orders,
      });
    } else if (responseData && Array.isArray(responseData)) {
      // Handle case where API directly returns array
      dispatch({
        type: "fetchOrderAndChangeState",
        payload: responseData,
      });
    } else {
      console.error("Invalid API response format:", responseData);
      dispatch({
        type: "fetchOrderAndChangeState",
        payload: [],
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    dispatch({
      type: "fetchOrderAndChangeState",
      payload: [],
    });
  } finally {
    // Always reset loading state
    dispatch({ type: "loading", payload: false });
  }
};

/* This method call the editmodal & dispatch category context */
export const editOrderReq = (oId, type, status, dispatch) => {
  if (type) {
    console.log("Opening update modal for order:", oId);
    dispatch({ type: "updateOrderModalOpen", oId: oId, status: status });
  }
};

export const deleteOrderReq = async (oId, dispatch) => {
  try {
    dispatch({ type: "loading", payload: true });
    const responseData = await deleteOrder(oId);
    console.log("Delete response:", responseData);
    
    if (responseData && responseData.success) {
      // Refresh the data after successful deletion
      await fetchData(dispatch);
    } else {
      console.error("Delete failed:", responseData);
      dispatch({ type: "loading", payload: false });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    dispatch({ type: "loading", payload: false });
  }
};

/* Filter All Order */
export const filterOrder = async (
  type,
  data,
  dispatch,
  dropdown,
  setDropdown
) => {
  try {
    dispatch({ type: "loading", payload: true });
    const responseData = await getAllOrder();
    
    if (responseData && responseData.Orders) {
      let filteredData;
      
      if (type === "All") {
        filteredData = responseData.Orders;
      } else if (type === "Not processed") {
        filteredData = responseData.Orders.filter(
          (item) => item.status === "Not processed"
        );
      } else if (type === "Under Scrutiny") {
        filteredData = responseData.Orders.filter(
          (item) => item.status === "Processing"
        );
      } else if (type === "Request Accepted") {
        filteredData = responseData.Orders.filter(
          (item) => item.status === "Shipped"
        );
      } else if (type === "Expired") {
        filteredData = responseData.Orders.filter(
          (item) => item.status === "Delivered"
        );
      } else if (type === "Cancelled") {
        filteredData = responseData.Orders.filter(
          (item) => item.status === "Cancelled"
        );
      } else {
        filteredData = responseData.Orders;
      }
      
      dispatch({ type: "fetchOrderAndChangeState", payload: filteredData });
    } else {
      console.error("Invalid filter response:", responseData);
      dispatch({ type: "fetchOrderAndChangeState", payload: [] });
    }
  } catch (error) {
    console.error("Error filtering orders:", error);
    dispatch({ type: "fetchOrderAndChangeState", payload: [] });
  } finally {
    dispatch({ type: "loading", payload: false });
    setDropdown(!dropdown);
  }
};