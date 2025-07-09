import React, { Fragment, useContext, useState, useEffect } from "react";
import { OrderContext } from "./index";
import { getAllOrder, editCategory } from "./FetchApi";

const UpdateOrderModal = (props) => {
  const { data, dispatch } = useContext(OrderContext);
  const [status, setStatus] = useState("");
  const [oId, setOid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data.updateOrderModal.modal) {
      setOid(data.updateOrderModal.oId);
      setStatus(data.updateOrderModal.status);
    }
  }, [data.updateOrderModal.modal]);

  const fetchData = async () => {
    try {
      const responseData = await getAllOrder();
      if (responseData && responseData.Orders) {
        dispatch({
          type: "fetchOrderAndChangeState",
          payload: responseData.Orders,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const submitForm = async () => {
    if (!oId || !status) {
      console.error("Missing order ID or status");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const responseData = await editCategory(oId, status);
      
      if (responseData && responseData.error) {
        console.error("Update error:", responseData.error);
        alert("Failed to update order: " + responseData.error);
      } else if (responseData && responseData.success) {
        console.log("Update successful:", responseData.success);
        dispatch({ type: "updateOrderModalClose" });
        await fetchData();
      } else {
        console.error("Unexpected response:", responseData);
        alert("Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      dispatch({ type: "updateOrderModalClose" });
    }
  };

  if (!data.updateOrderModal.modal) {
    return null;
  }

  return (
    <Fragment>
      {/* Black Overlay */}
      <div
        onClick={handleClose}
        className="fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 m-4 flex items-center z-30 justify-center">
        <div className="relative bg-white w-11/12 md:w-3/6 max-w-md shadow-lg rounded-lg flex flex-col items-center space-y-4 overflow-y-auto px-4 py-4 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between w-full pt-4">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Update Order
            </span>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex flex-col space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Order Status
              </label>
              <select
                value={status}
                name="status"
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="status"
                disabled={isSubmitting}
              >
                <option value="">Select Status</option>
                <option value="Not processed">Not processed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2 pb-4">
              <button
                onClick={submitForm}
                disabled={isSubmitting || !status}
                className="rounded-md bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white text-lg font-medium py-3 px-6 transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UpdateOrderModal;