
import React, { Fragment, useContext, useEffect } from "react";
import moment from "moment";

import { OrderContext } from "./index";
import { fetchData, editOrderReq, deleteOrderReq } from "./Actions";

const apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AllOrders = (props) => {
  const { data, dispatch } = useContext(OrderContext);
  const { orders, loading } = data;

  useEffect(() => {
    fetchData(dispatch);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="w-12 h-12 animate-spin text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          <span className="text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="col-span-1 overflow-auto bg-white shadow-lg p-4">
        <table className="table-auto border w-full my-2">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Product Info</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Transaction ID</th>
              <th className="px-4 py-2 border">User Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Created at</th>
              <th className="px-4 py-2 border">Updated at</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((item, i) => {
                return (
                  <OrderTableRow
                    key={item._id || i}
                    order={item}
                    editOrder={(oId, type, status) =>
                      editOrderReq(oId, type, status, dispatch)
                    }
                  />
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-xl text-center font-semibold py-8"
                >
                  No Orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-sm text-gray-600 mt-2">
          Total {orders && orders.length} orders found
        </div>
      </div>
    </Fragment>
  );
};

/* Single Order Row Component */
const OrderTableRow = ({ order, editOrder }) => {
  const { dispatch } = useContext(OrderContext);

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrderReq(orderId, dispatch);
    }
  };

  const renderProductInfo = () => {
    if (!order.allProduct || order.allProduct.length === 0) {
      return <span className="text-gray-500">No products</span>;
    }

    return order.allProduct.map((product, i) => (
      <div className="flex items-center space-x-2 mb-1" key={i}>
        {product.id && product.id.pImages && product.id.pImages[0] ? (
          <img
            className="w-8 h-8 object-cover object-center rounded"
            src={`${apiURL}/uploads/products/${product.id.pImages[0]}`}
            alt="Product"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-xs">No img</span>
          </div>
        )}
        <span className="text-sm">
          {product.id?.pName || 'Unknown Product'} - ${product.id?.pPrice || 'N/A'}
        </span>
      </div>
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Not processed": "text-red-600",
      "Processing": "text-yellow-600", 
      "Shipped": "text-blue-600",
      "Delivered": "text-green-600",
      "Cancelled": "text-red-600"
    };

    return (
      <span className={`block rounded-full text-center text-xs px-2 py-1 font-semibold ${statusConfig[status] || 'text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <Fragment>
      <tr className="border-b hover:bg-gray-50">
        <td className="w-48 p-2">
          <div className="flex flex-col space-y-1">
            {renderProductInfo()}
          </div>
        </td>
        <td className="p-2 text-center">
          {getStatusBadge(order.status)}
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">{order.transactionId || 'N/A'}</span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">{order.user?.name || 'N/A'}</span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">{order.user?.email || 'N/A'}</span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">{order.phone || 'N/A'}</span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">{order.address || 'N/A'}</span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">
            {order.createdAt ? moment(order.createdAt).format("MMM DD, YYYY") : 'N/A'}
          </span>
        </td>
        <td className="p-2 text-center">
          <span className="text-sm">
            {order.updatedAt ? moment(order.updatedAt).format("MMM DD, YYYY") : 'N/A'}
          </span>
        </td>
        <td className="p-2">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => editOrder(order._id, true, order.status)}
              className="hover:bg-gray-200 rounded-lg p-2 transition-colors"
              title="Edit Order"
            >
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(order._id)}
              className="hover:bg-gray-200 rounded-lg p-2 transition-colors"
              title="Delete Order"
            >
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </Fragment>
  );
};

export default AllOrders;