document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartTotal = document.getElementById("cart-total");
  const loader = document.getElementById("loader");
  const order = document.getElementById("checkout-btn");

  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  order.addEventListener("click", () => {
    if (cartItems.length > 0) {
      alert("Order successfully placed!");
      cartItems = []; // Clear the cart after order
      saveCart();
      renderCartItems(cartItems);
      updateCartTotals(cartItems);
    } else {
      alert("Your cart is empty.");
    }
  });

  // Update Cart Totals
  function updateCartTotals(items) {
    let subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cartSubtotal.textContent = `Rs. ${subtotal.toFixed(2)}`;
    cartTotal.textContent = `Rs. ${subtotal.toFixed(2)}`;
  }

  // Render Cart Items
  function renderCartItems(items) {
    cartItemsContainer.innerHTML = "";

    if (items.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cartItemsContainer.innerHTML = `
      <table class="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr class="cart-item">
              <td><img src="${item.image}" alt="${item.title}" class="product-image"></td>
              <td><p class="product-title">${item.title}</p></td>
              <td class="product-price">Rs. ${item.price}</td>
              <td>
                <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="item-quantity">
              </td>
              <td class="product-subtotal">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button class="remove-item" data-id="${item.id}">
                  <img src="images/delete.png" alt="Remove" class="remove-icon">
                </button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    // Attach event listeners for removing items and updating quantity
    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.currentTarget.dataset.id;
        showModal(itemId);
      });
    });

    document.querySelectorAll(".item-quantity").forEach((input) => {
      input.addEventListener("change", (e) => {
        const itemId = parseInt(e.target.dataset.id);
        const newQuantity = parseInt(e.target.value);
        if (newQuantity > 0) {
          updateItemQuantity(itemId, newQuantity);
        } else {
          alert("Quantity must be at least 1.");
          e.target.value = 1; // Reset to 1 if invalid
          updateItemQuantity(itemId, 1);
        }
      });
    });
  }

  // Update the item quantity in the cart
  function updateItemQuantity(itemId, newQuantity) {
    cartItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    saveCart();
    renderCartItems(cartItems);
    updateCartTotals(cartItems);
  }

  // Save cart to LocalStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }

  // Fetch cart data from API with error handling
  function fetchCartDataFromAPI() {
    loader.style.display = "block"; // Show loader

    fetch("https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        cartItems = data.items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.presentment_price / 100,
          quantity: item.quantity,
          image: item.featured_image.url,
        }));
        saveCart();
        renderCartItems(cartItems);
        updateCartTotals(cartItems);
      })
      .catch((error) => {
        console.error("Failed to fetch cart data:", error);
        alert("Could not load cart data. Please try again.");
      })
      .finally(() => {
        loader.style.display = "none"; // Hide loader after data is loaded
      });
  }

  // Remove cart item
  function removeCartItem(itemId) {
    cartItems = cartItems.filter((item) => item.id != itemId);
    saveCart();
    renderCartItems(cartItems);
    updateCartTotals(cartItems);
  }

  // Modal for remove confirmation
  const modal = document.getElementById("removeModal");
  const confirmRemove = document.getElementById("confirmRemove");
  const cancelRemove = document.getElementById("cancelRemove");
  let currentItemIdToRemove = null;

  function showModal(itemId) {
    currentItemIdToRemove = itemId;
    modal.style.display = "flex"; // Show the modal
  }

  confirmRemove.addEventListener("click", () => {
    removeCartItem(currentItemIdToRemove);
    modal.style.display = "none"; // Hide modal after removal
  });

  cancelRemove.addEventListener("click", () => {
    modal.style.display = "none"; // Hide modal if cancelled
  });

  // Initial load
  if (cartItems.length > 0) {
    renderCartItems(cartItems);
    updateCartTotals(cartItems);
  } else {
    fetchCartDataFromAPI();
  }
});
