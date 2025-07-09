export const dashboardState = {
  totalData: {
    Users: 0,
    Orders: 0,
    Products: 0,
    Categories: 0
  },
  totalOrders: {
    Orders: []
  },
  uploadSliderBtn: false, // Changed to false to hide upload by default
  imageUpload: false,
  sliderImages: [],
};

export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "totalData":
      return {
        ...state,
        totalData: action.payload,
      };
    case "totalOrders":
      return {
        ...state,
        totalOrders: action.payload,
      };
    case "uploadSliderBtn":
      return {
        ...state,
        uploadSliderBtn: action.payload,
      };
    case "imageUpload":
      return {
        ...state,
        imageUpload: action.payload,
      };
    case "sliderImages":
      return {
        ...state,
        sliderImages: action.payload,
      };
    default:
      return state;
  }
};