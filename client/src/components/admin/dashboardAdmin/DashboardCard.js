import React, { Fragment, useContext, useEffect, useState } from "react";
import { DashboardContext } from "./";
import { GetAllData } from "./Action";

const DashboardCard = (props) => {
  const { data, dispatch } = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await GetAllData(dispatch);
        setLoading(false);
      } catch (err) {
        console.error("Error in DashboardCard:", err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Helper function to safely get values
  const getValue = (key) => {
    if (data && data.totalData && typeof data.totalData[key] !== 'undefined') {
      return data.totalData[key];
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="m-4 flex justify-center items-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 flex justify-center items-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      
      {/* Card Start */}
      <div className="m-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col justify-center items-center bg-white p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in border-b-4 border-opacity-0 hover:border-opacity-100 border-indigo-200 rounded-lg">
          <div className="bg-indigo-200 p-3 cursor-pointer rounded-full mb-4">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {getValue('Users')}
          </div>
          <div className="text-sm font-medium text-gray-600">Centres Enrolled</div>
        </div>
        
        <div className="flex flex-col justify-center items-center bg-white p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in border-b-4 border-opacity-0 hover:border-opacity-100 border-red-200 rounded-lg">
          <div className="bg-red-200 p-3 cursor-pointer rounded-full mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {getValue('Orders')}
          </div>
          <div className="text-sm font-medium text-gray-600">Requests</div>
        </div>
        
        <div className="flex flex-col justify-center items-center bg-white p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in border-b-4 border-opacity-0 hover:border-opacity-100 border-green-200 rounded-lg">
          <div className="bg-green-200 p-3 cursor-pointer rounded-full mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 20s-8-4.5-8-8c0-2.757 5.373-6.918 8-9 2.627 2.082 8 6.243 8 9 0 3.5-8 8-8 8z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {getValue('Products')}
          </div>
          <div className="text-sm font-medium text-gray-600">Organs</div>
        </div>
        
        <div className="flex flex-col justify-center items-center bg-white p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in border-b-4 border-opacity-0 hover:border-opacity-100 border-orange-200 rounded-lg">
          <div className="bg-orange-200 p-3 cursor-pointer rounded-full mb-4">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {getValue('Categories')}
          </div>
          <div className="text-sm font-medium text-gray-600">Categories</div>
        </div>
      </div>
      {/* End Card */}
    </Fragment>
  );
};

export default DashboardCard;