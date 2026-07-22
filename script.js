const productsData = [
  { id: 1, name: "Dior Inspired Gold Jewelry Set with Pearls", price: 35000, category: "Accessories", stock: 2 },
  { id: 2, name: "Essential Neutral Knit Set", price: 850, category: "Clothes", stock: 5 },
  { id: 3, name: "Cozy Cream Ribbed Sweater", price: 850, category: "Clothes", stock: 3 },
  { id: 4, name: "Casual Autumn Outfit", price: 1500, category: "Clothes", stock: 4 },
  { id: 5, name: "Cropped Wool Jacket", price: 1250, category: "Clothes", stock: 6 },
  { id: 6, name: "Oversized Brown Knit Sweater", price: 750, category: "Clothes", stock: 8 },
  { id: 7, name: "Gabardina cropped", price: 2835, category: "Clothes", stock: 2 },
  { id: 8, name: "Gold Pearl Hoop Earrings", price: 150, category: "Accessories", stock: 10 },
  { id: 9, name: "Dior Diorshow On Stage Liner", price: 2100, category: "Makeup", stock: 5 }
];

let cart = [];
const promoCodes = { "SAVE10": 0.10, "CUBMART": 0.15 };

document.addEventListener("DOMContentLoaded", () => {
  createCartModalUI();
  setupAddToCartButtons();
  setupCategoryFilter();
});

function createCartModalUI() {
  const modalHTML = `
    <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="cartModalLabel" style="color: #b89059; font-weight: bold;">Shopping Cart</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="cart-items-container" class="mb-3">
              <p class="text-center text-muted">Your cart is empty.</p>
            </div>
            <div id="invoice-details" style="display: none; border-top: 2px dashed #C9A675; padding-top: 15px;">
              <div class="input-group mb-3">
                <input type="text" id="promo-code-input" class="form-control" placeholder="Enter Promo Code (e.g. CUBMART)">
                <button class="btn btn-outline-secondary" type="button" id="apply-promo-btn" style="background-color: #C9A675; color: white; border: none;">Apply</button>
              </div>
              <div class="d-flex justify-content-between mb-2"><span>Subtotal:</span><span id="invoice-subtotal">0.00 EGP</span></div>
              <div class="d-flex justify-content-between mb-2 text-danger"><span>Discount:</span><span id="invoice-discount">0.00 EGP</span></div>
              <div class="d-flex justify-content-between mb-2"><span>Tax (14%):</span><span id="invoice-tax">0.00 EGP</span></div>
              <div class="d-flex justify-content-between font-weight-bold" style="font-size: 1.2rem; color: #b89059; font-weight: bold;"><span>Total:</span><span id="invoice-total">0.00 EGP</span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="border-radius: 25px;">Close</button>
            <button type="button" class="btn" id="checkout-btn" style="background-color: #b89059; color: white; border-radius: 25px; display: none;">Checkout & Order</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.setAttribute("data-bs-toggle", "modal");
    cartIcon.setAttribute("data-bs-target", "#cartModal");
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      renderCartUI();
    });
  }

  const applyPromoBtn = document.getElementById("apply-promo-btn");
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("promo-code-input");
      renderCartUI(codeInput ? codeInput.value : "");
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("promo-code-input");
      generateReceipt(codeInput ? codeInput.value : "");
    });
  }
}

function renderCartUI(promoCode = "") {
  const container = document.getElementById("cart-items-container");
  const invoiceDetails = document.getElementById("invoice-details");
  const checkoutBtn = document.getElementById("checkout-btn");
  
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
    if (invoiceDetails) invoiceDetails.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  let html = '<ul class="list-group list-group-flush">';
  cart.forEach(item => {
    html += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0" style="color: #b89059;">${item.name}</h6>
          <small class="text-muted">${item.price} EGP each</small>
        </div>
        <span class="badge bg-secondary rounded-pill">${item.quantity}</span>
      </li>
    `;
  });
  html += '</ul>';
  container.innerHTML = html;

  if (invoiceDetails) invoiceDetails.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "block";

  const subtotal = calculateSubtotal();
  const discount = applyPromoCode(subtotal, promoCode);
  const amountAfterDiscount = subtotal - discount;
  const tax = calculateTax(amountAfterDiscount);
  const total = amountAfterDiscount + tax;

  document.getElementById("invoice-subtotal").textContent = `${subtotal.toFixed(2)} EGP`;
  document.getElementById("invoice-discount").textContent = `-${discount.toFixed(2)} EGP`;
  document.getElementById("invoice-tax").textContent = `+${tax.toFixed(2)} EGP`;
  document.getElementById("invoice-total").textContent = `${total.toFixed(2)} EGP`;
}

function setupAddToCartButtons() {
  const spotlightBtn = document.getElementById("spotlight-buy-btn");
  if (spotlightBtn) {
    spotlightBtn.addEventListener("click", () => {
      addToCart("Dior Inspired Gold Jewelry Set with Pearls");
    });
  }

  const allButtons = document.querySelectorAll(".products .button");
  allButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const productContainer = e.target.closest(".products");
      if (productContainer) {
        const titleElement = productContainer.querySelector(".h2");
        if (titleElement) {
          addToCart(titleElement.textContent.trim());
        }
      }
    });
  });
}

function setupCategoryFilter() {
  const dropdownItems = document.querySelectorAll(".dropdown-menu .dropdown-item");
  dropdownItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const targetHref = e.target.getAttribute("href");
      if (targetHref && targetHref.startsWith("#")) {
        const categoryName = targetHref.substring(1);
        filterByCategory(categoryName);
      }
    });
  });
}

function filterByCategory(category) {
  const bars = document.querySelectorAll(".container5");
  bars.forEach(bar => {
    const text = bar.textContent.trim();
    if (text.toLowerCase() === category.toLowerCase()) {
      bar.style.display = "flex";
      if (bar.nextElementSibling && bar.nextElementSibling.classList.contains("container4")) {
        bar.nextElementSibling.style.display = "grid";
      }
    } else {
      bar.style.display = "none";
      if (bar.nextElementSibling && bar.nextElementSibling.classList.contains("container4")) {
        bar.nextElementSibling.style.display = "none";
      }
    }
  });
}

function addToCart(productName) {
  const product = productsData.find(p => p.name === productName);
  if (!product) return;

  const cartItem = cart.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  if (currentQuantity >= product.stock) {
    alert("Sorry, out of stock!");
    return;
  }

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  renderCartUI();
  alert(`"${productName}" has been successfully added to your cart!`);
}

function updateCartCount() {
  const countSpan = document.getElementById("cart-count");
  if (countSpan) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countSpan.textContent = totalItems;
  }
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getDiscountRate(promoCode) {
  if (!promoCode) return 0;
  const upperCode = promoCode.toUpperCase().trim();
  return promoCodes[upperCode] || 0;
}

function applyPromoCode(subtotal, promoCode) {
  const rate = getDiscountRate(promoCode);
  return subtotal * rate;
}

function calculateTax(amountBeforeTax) {
  const taxRate = 0.14;
  return amountBeforeTax * taxRate;
}

function generateReceipt(promoCode = "") {
  const subtotal = calculateSubtotal();
  if (subtotal === 0) return;

  const discount = applyPromoCode(subtotal, promoCode);
  const amountAfterDiscount = subtotal - discount;
  const tax = calculateTax(amountAfterDiscount);
  const total = amountAfterDiscount + tax;

  let itemsSummary = "";
  cart.forEach(item => {
    itemsSummary += `${item.name} x${item.quantity} - ${item.price * item.quantity} EGP\n`;
  });

  const receiptMessage = `
--- CUBMART ORDER RECEIPT ---
Items Ordered:
${itemsSummary}
Subtotal: ${subtotal.toFixed(2)} EGP
Discount: -${discount.toFixed(2)} EGP
Tax (14%): +${tax.toFixed(2)} EGP
Total Amount: ${total.toFixed(2)} EGP
----------------------------
Thank you for shopping with FASHION STYLE!
  `;

  alert(receiptMessage);
  alert("Order Processed Successfully!");
  
 
const cartModalElement = document.getElementById('cartModal');
if (cartModalElement) {
  const modalInstance = bootstrap.Modal.getInstance(cartModalElement);
  if (modalInstance) {
    modalInstance.hide();
  }
}
}