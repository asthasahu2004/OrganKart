// Mixins.js

export const subTotal = (id, price) => {
  let subTotalCost = 0;
  const carts = JSON.parse(localStorage.getItem("cart")) || [];
  carts.forEach((item) => {
    if (item.id === id) {
      subTotalCost = item.quantity * price;
    }
  });
  return subTotalCost;
};

export const quantity = (id) => {
  let productQuantity = 0;
  const carts = JSON.parse(localStorage.getItem("cart")) || [];
  carts.forEach((item) => {
    if (item.id === id) {
      productQuantity = item.quantity;
    }
  });
  return productQuantity;
};

export const totalCost = () => {
  let total = 0;
  const carts = JSON.parse(localStorage.getItem("cart")) || [];
  carts.forEach((item) => {
    total += item.quantity * item.price;
  });
  return total;
};
