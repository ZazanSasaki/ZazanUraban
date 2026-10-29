
/* =========================================================
   ZAZAN — Interactive Website
   File: js/app.js
   ========================================================= */

"use strict";

/* =========================
   CONFIGURATION
========================= */

const ZAZAN = {
  currency: "USD",
  locale: "en-US",
  taxRate: 0.05,
  freeShippingThreshold: 150,
  shippingFee: 9.99
};

/* =========================
   PRODUCT DATA
   Replace these demo products
   with your own products.
========================= */

const products = [
  {
    id: 1,
    name: "Nova Headphones",
    category: "Electronics",
    price: 129,
    oldPrice: 159,
    badge: "BESTSELLER",
    rating: 4.9,
    description: "Immersive sound, premium comfort, and all-day battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    id: 2,
    name: "Orbit Smartwatch",
    category: "Wearables",
    price: 189,
    oldPrice: 219,
    badge: "POPULAR",
    rating: 4.8,
    description: "A sleek smartwatch built for your everyday performance.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    id: 3,
    name: "Aero Sneakers",
    category: "Lifestyle",
    price: 95,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    rating: 4.7,
    description: "Lightweight design with a modern silhouette and soft cushioning.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    id: 4,
    name: "Pulse Speaker",
    category: "Electronics",
    price: 79,
    oldPrice: 99,
    badge: "LIMITED OFFER",
    rating: 4.8,
    description: "Powerful portable audio in a compact, minimalist design.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    id: 5,
    name: "Studio Backpack",
    category: "Lifestyle",
    price: 69,
    oldPrice: null,
    badge: "ESSENTIAL",
    rating: 4.6,
    description: "A functional everyday carry with a clean, versatile finish.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    id: 6,
    name: "Luma Desk Lamp",
    category: "Home",
    price: 59,
    oldPrice: 74,
    badge: "TRENDING",
    rating: 4.7,
    description: "Ambient lighting designed to elevate your workspace.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    featured: false
  }
];

/* =========================
   HELPERS
========================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const money = amount =>
  new Intl.NumberFormat(ZAZAN.locale, {
    style: "currency",
    currency: ZAZAN.currency,
    maximumFractionDigits: 2
  }).format(amount);

const escapeHTML = value =>
  String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

const getProduct = id =>
  products.find(product => product.id === Number(id));

function safeImage(url) {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : "";
  } catch {
    return "";
  }
}

/* =========================
   APP STATE
========================= */

const state = {
  cart: [],
  wishlist: new Set(),
  category: "All",
  search: "",
  sort: "featured",
  cartOpen: false
};

try {
  const savedCart = JSON.parse(
    localStorage.getItem("zazan-cart") || "[]"
  );

  if (Array.isArray(savedCart)) {
    state.cart = savedCart
      .filter(item =>
        getProduct(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
      .map(item => ({
        id: Number(item.id),
        quantity: Math.min(item.quantity, 99)
      }));
  }

  const savedWishlist = JSON.parse(
    localStorage.getItem("zazan-wishlist") || "[]"
  );

  if (Array.isArray(savedWishlist)) {
    state.wishlist = new Set(
      savedWishlist.filter(id => getProduct(id))
    );
  }
} catch {
  state.cart = [];
  state.wishlist = new Set();
}

/* =========================
   PERSISTENCE
========================= */

function saveCart() {
  try {
    localStorage.setItem(
      "zazan-cart",
      JSON.stringify(state.cart)
    );
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(
      "zazan-wishlist",
      JSON.stringify([...state.wishlist])
    );
  } catch {
    // Wishlist still works for the current page session.
  }
}

/* =========================
   TOAST NOTIFICATIONS
========================= */

let toastTimer;

function showToast(message) {
  let toast = $("#toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================
   NAVBAR
========================= */

const navbar = $(".navbar");
const menuToggle = $(
  ".menu-toggle, #menuToggle, [data-menu-toggle]"
);
const navLinks = $(
  ".nav-links, #navLinks, [data-navigation]"
);

function closeMobileMenu() {
  if (!navLinks || !menuToggle) return;

  navLinks.classList.remove("active");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function toggleMobileMenu() {
  if (!navLinks || !menuToggle) return;

  const isOpen = navLinks.classList.toggle("active");

  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle && navLinks) {
  menuToggle.setAttribute("aria-expanded", "false");

  menuToggle.addEventListener("click", toggleMobileMenu);

  $$(".nav-links a, #navLinks a, [data-navigation] a")
    .forEach(link => {
      link.addEventListener("click", closeMobileMenu);
    });

  document.addEventListener("click", event => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMobileMenu();
    }
  });
}

function updateNavbar() {
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }

  const backToTop = $(".back-to-top");

  if (backToTop) {
    backToTop.classList.toggle(
      "visible",
      window.scrollY > 450
    );
  }
}

window.addEventListener("scroll", updateNavbar, {
  passive: true
});

updateNavbar();

/* Active navigation link while scrolling */

const sectionLinks = $$(".nav-links a[href^='#']");

if ("IntersectionObserver" in window && sectionLinks.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      sectionLinks.forEach(link => {
        const active =
          link.getAttribute("href") === `#${entry.target.id}`;

        link.classList.toggle("active", active);

        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, {
    rootMargin: "-25% 0px -65% 0px"
  });

  sectionLinks.forEach(link => {
    const target = $(link.getAttribute("href"));

    if (target) sectionObserver.observe(target);
  });
}

/* =========================
   DARK / LIGHT THEME
========================= */

const themeToggle = $(
  "#themeToggle, .theme-toggle, [data-theme-toggle]"
);

function applyTheme(theme) {
  const light = theme === "light";

  document.body.classList.toggle("light-theme", light);

  if (themeToggle) {
    themeToggle.textContent = light ? "☾" : "☼";
    themeToggle.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme"
    );
    themeToggle.setAttribute("aria-pressed", String(light));
  }

  try {
    localStorage.setItem("zazan-theme", theme);
  } catch {
    // Theme remains applied until the page is refreshed.
  }
}

let initialTheme = "dark";

try {
  initialTheme = localStorage.getItem("zazan-theme") || "dark";
} catch {
  initialTheme = "dark";
}

applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme")
      ? "dark"
      : "light";

    applyTheme(nextTheme);
    showToast(
      nextTheme === "dark"
        ? "Dark theme enabled"
        : "Light theme enabled"
    );
  });
}

/* =========================
   PRODUCT CATEGORIES
========================= */

function getCategories() {
  return ["All", ...new Set(products.map(p => p.category))];
}

function setupCategoryFilters() {
  const container = $(".filter-pills, #categoryFilters");

  if (!container) return;

  container.innerHTML = getCategories().map(category => {
    const count = category === "All"
      ? products.length
      : products.filter(p => p.category === category).length;

    return `
      <button
        class="filter-pill ${category === state.category ? "active" : ""}"
        type="button"
        data-category="${escapeHTML(category)}"
        aria-pressed="${category === state.category}"
      >
        ${escapeHTML(category)}
        <span>${count}</span>
      </button>
    `;
  }).join("");

  container.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    state.category = button.dataset.category;
    setupCategoryFilters();
    renderProducts();
  });
}

/* =========================
   PRODUCT RENDERING
========================= */

function getVisibleProducts() {
  let visible = [...products];

  if (state.category !== "All") {
    visible = visible.filter(
      product => product.category === state.category
    );
  }

  if (state.search.trim()) {
    const term = state.search.toLowerCase().trim();

    visible = visible.filter(product =>
      [
        product.name,
        product.category,
        product.description,
        product.badge
      ].join(" ").toLowerCase().includes(term)
    );
  }

  switch (state.sort) {
    case "price-low":
      visible.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      visible.sort((a, b) => b.price - a.price);
      break;

    case "name":
      visible.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "rating":
      visible.sort((a, b) => b.rating - a.rating);
      break;

    case "featured":
    default:
      visible.sort((a, b) =>
        Number(b.featured) - Number(a.featured)
      );
  }

  return visible;
}

function productCard(product) {
  const image = safeImage(product.image);
  const wished = state.wishlist.has(product.id);

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          decoding="async"
        >

        <span class="product-badge">
          ${escapeHTML(product.badge)}
        </span>

        <button
          class="icon-button product-quick wishlist-button"
          type="button"
          data-wishlist="${product.id}"
          aria-label="${wished ? "Remove from" : "Add to"} wishlist"
          aria-pressed="${wished}"
          title="Wishlist"
        >${wished ? "♥" : "♡"}</button>
      </div>

      <div class="product-info">
        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h3 class="product-name">
          ${escapeHTML(product.name)}
        </h3>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="product-bottom">
          <div class="product-pricing">
            <span class="product-price">
              ${money(product.price)}
            </span>

            ${product.oldPrice
              ? `<span class="product-old-price">${money(product.oldPrice)}</span>`
              : ""}
          </div>

          <button
            class="add-to-cart-btn"
            type="button"
            data-add-to-cart="${product.id}"
          >
            <span aria-hidden="true">+</span> Add to cart
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const grid = $("#productsGrid, .products-grid");

  if (!grid) return;

  const visible = getVisibleProducts();

  grid.innerHTML = visible.length
    ? visible.map(productCard).join("")
    : `
      <div class="no-products">
        <h3>No products found</h3>
        <p>Try another search or choose a different category.</p>
        <button class="btn btn-ghost" type="button" data-reset-filters>
          Clear filters
        </button>
      </div>
    `;

  const count = $(".product-count strong, #productCount");

  if (count) count.textContent = visible.length;

  const resultText = $("#productResults");

  if (resultText) {
    resultText.textContent =
      `${visible.length} product${visible.length === 1 ? "" : "s"} found`;
  }
}

/* Search */

const searchInput = $(
  "#productSearch, .search-box input, [data-product-search]"
);

if (searchInput) {
  searchInput.addEventListener("input", event => {
    state.search = event.target.value;
    renderProducts();
  });
}

/* Sort */

const sortSelect = $(
  "#sortProducts, [data-product-sort]"
);

if (sortSelect) {
  sortSelect.addEventListener("change", event => {
    state.sort = event.target.value;
    renderProducts();
  });
}

/* Product grid interactions */

const productGrid = $("#productsGrid, .products-grid");

if (productGrid) {
  productGrid.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-to-cart]");
    const wishlistButton = event.target.closest("[data-wishlist]");
    const resetButton = event.target.closest("[data-reset-filters]");

    if (addButton) {
      addToCart(Number(addButton.dataset.addToCart));
    }

    if (wishlistButton) {
      toggleWishlist(Number(wishlistButton.dataset.wishlist));
    }

    if (resetButton) {
      state.category = "All";
      state.search = "";

      if (searchInput) searchInput.value = "";

      setupCategoryFilters();
      renderProducts();
    }
  });
}

/* =========================
   WISHLIST
========================= */

function toggleWishlist(id) {
  const product = getProduct(id);

  if (!product) return;

  if (state.wishlist.has(id)) {
    state.wishlist.delete(id);
    showToast(`${product.name} removed from wishlist`);
  } else {
    state.wishlist.add(id);
    showToast(`${product.name} added to wishlist`);
  }

  saveWishlist();
  renderProducts();
  updateWishlistCount();
}

function updateWishlistCount() {
  const count = $(
    "#wishlistCount, [data-wishlist-count]"
  );

  if (count) count.textContent = state.wishlist.size;
}

/* =========================
   SHOPPING CART
========================= */

const cartDrawer = $(
  "#cartDrawer, .cart-drawer"
);

const cartBackdrop = $(
  "#cartBackdrop, .cart-backdrop"
);

const openCartButton = $(
  "#openCartBtn, .cart-nav, [data-open-cart]"
);

const closeCartButton = $(
  "#closeCartBtn, [data-close-cart]"
);

const cartItemsContainer = $(
  "#cartItems, .cart-items"
);

function addToCart(id) {
  const product = getProduct(id);

  if (!product) return;

  const existing = state.cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Maximum quantity reached");
      return;
    }

    existing.quantity += 1;
  } else {
    state.cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(id) {
  const product = getProduct(id);

  state.cart = state.cart.filter(item => item.id !== id);

  saveCart();
  renderCart();

  if (product) showToast(`${product.name} removed`);
}

function changeQuantity(id, change) {
  const item = state.cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  if (item.quantity > 99) {
    item.quantity = 99;
    showToast("Maximum quantity is 99");
  }

  saveCart();
  renderCart();
}

function cartSubtotal() {
  return state.cart.reduce((total, item) => {
    const product = getProduct(item.id);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function cartTax() {
  return cartSubtotal() * ZAZAN.taxRate;
}

function cartShipping() {
  const subtotal = cartSubtotal();

  if (subtotal === 0 || subtotal >= ZAZAN.freeShippingThreshold) {
    return 0;
  }

  return ZAZAN.shippingFee;
}

function cartTotal() {
  return cartSubtotal() + cartTax() + cartShipping();
}

function renderCart() {
  const count = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartCount = $("#cartCount, [data-cart-count]");

  if (cartCount) cartCount.textContent = count;

  if (cartItemsContainer) {
    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon" aria-hidden="true">◇</div>
          <strong>Your cart is empty</strong>
          <p>Explore the collection and add something you love.</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = state.cart.map(item => {
        const product = getProduct(item.id);

        if (!product) return "";

        return `
          <article class="cart-item" data-cart-item="${product.id}">
            <img
              class="cart-item-image"
              src="${escapeHTML(safeImage(product.image))}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
            >

            <div class="cart-item-details">
              <strong>${escapeHTML(product.name)}</strong>
              <small>${escapeHTML(product.category)}</small>

              <div class="quantity-controls">
                <button
                  type="button"
                  data-quantity="${product.id}"
                  data-change="-1"
                  aria-label="Decrease quantity"
                >−</button>

                <span>${item.quantity}</span>

                <button
                  type="button"
                  data-quantity="${product.id}"
                  data-change="1"
                  aria-label="Increase quantity"
                >+</button>

                <button
                  class="remove-item"
                  type="button"
                  data-remove-item="${product.id}"
                  aria-label="Remove ${escapeHTML(product.name)}"
                >×</button>
              </div>
            </div>

            <strong class="cart-item-price">
              ${money(product.price * item.quantity)}
            </strong>
          </article>
        `;
      }).join("");
    }
  }

  const subtotalElement = $("#cartSubtotal");
  const taxElement = $("#cartTax");
  const shippingElement = $("#cartShipping");
  const totalElement = $("#cartTotal");

  if (subtotalElement) {
    subtotalElement.textContent = money(cartSubtotal());
  }

  if (taxElement) {
    taxElement.textContent = money(cartTax());
  }

  if (shippingElement) {
    shippingElement.textContent = money(cartShipping());
  }

  if (totalElement) {
    totalElement.textContent = money(cartTotal());
  }

  const checkoutButton = $("#checkoutBtn, .checkout-btn");

  if (checkoutButton) {
    checkoutButton.disabled = state.cart.length === 0;
  }

  const clearCartButton = $("#clearCartBtn");

  if (clearCartButton) {
    clearCartButton.disabled = state.cart.length === 0;
  }

  const shippingMessage = $("#shippingMessage");

  if (shippingMessage) {
    const remaining =
      ZAZAN.freeShippingThreshold - cartSubtotal();

    shippingMessage.textContent = cartSubtotal() === 0
      ? `Free shipping on orders over ${money(ZAZAN.freeShippingThreshold)}.`
      : remaining > 0
        ? `Add ${money(remaining)} more for free shipping.`
        : "Your order qualifies for free shipping!";
  }
}

function openCart() {
  if (!cartDrawer) return;

  state.cartOpen = true;

  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");

  if (cartBackdrop) {
    cartBackdrop.hidden = false;
    cartBackdrop.setAttribute("aria-hidden", "false");
  }

  if (openCartButton) {
    openCartButton.setAttribute("aria-expanded", "true");
  }

  if (closeCartButton) closeCartButton.focus();
}

function closeCart() {
  if (!cartDrawer) return;

  state.cartOpen = false;

  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");

  if (cartBackdrop) {
    cartBackdrop.hidden = true;
    cartBackdrop.setAttribute("aria-hidden", "true");
  }

  if (openCartButton) {
    openCartButton.setAttribute("aria-expanded", "false");
  }

  if (openCartButton) openCartButton.focus();
}

if (openCartButton) {
  openCartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
  closeCartButton.addEventListener("click", closeCart);
}

if (cartBackdrop) {
  cartBackdrop.addEventListener("click", closeCart);
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-quantity]");
    const removeButton = event.target.closest("[data-remove-item]");

    if (quantityButton) {
      changeQuantity(
        Number(quantityButton.dataset.quantity),
        Number(quantityButton.dataset.change)
      );
    }

    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.removeItem));
    }
  });
}

const clearCartButton = $("#clearCartBtn");

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    if (!state.cart.length) return;

    state.cart = [];
    saveCart();
    renderCart();
    showToast("Cart cleared");
  });
}

/* Keyboard support */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (state.cartOpen) closeCart();
    closeMobileMenu();
  }
});

/* =========================
   CHECKOUT DEMO
========================= */

const checkoutButton = $("#checkoutBtn, .checkout-btn");

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (!state.cart.length) {
      showToast("Your cart is empty");
      return;
    }

    showToast(
      "Demo checkout only — connect a payment provider to accept orders."
    );
  });
}

/* =========================
   NEWSLETTER
========================= */

const newsletterForm = $(
  "#newsletterForm, .newsletter-form"
);

if (newsletterForm) {
  newsletterForm.addEventListener("submit", event => {
    event.preventDefault();

    const emailInput = $('input[type="email"]', newsletterForm);

    if (!emailInput || !emailInput.checkValidity()) {
      if (emailInput) emailInput.reportValidity();
      return;
    }

    showToast("Thanks for your interest in ZAZAN!");

    newsletterForm.reset();
  });
}

/* =========================
   CONTACT LINKS
========================= */

$$("[data-contact-email]").forEach(element => {
  element.addEventListener("click", () => {
    const email = element.dataset.contactEmail;

    if (!email) return;

    window.location.href =
      `mailto:${encodeURIComponent(email)}`;
  });
});

/* =========================
   REVEAL ANIMATIONS
========================= */

const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(element => {
    element.classList.add("visible");
  });
}

/* =========================
   DASHBOARD COUNTERS
========================= */

function animateCounter(element) {
  const target = Number(element.dataset.count);

  if (!Number.isFinite(target)) return;

  const suffix = element.dataset.suffix || "";
  const prefix = element.dataset.prefix || "";
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = target * eased;

    element.textContent =
      prefix +
      (Number.isInteger(target)
        ? Math.round(current).toLocaleString(ZAZAN.locale)
        : current.toFixed(1)) +
      suffix;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counters = $$("[data-count]");

if ("IntersectionObserver" in window && counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

/* =========================
   BACK TO TOP
========================= */

const backToTop = $(".back-to-top");

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* =========================
   CURRENT YEAR
========================= */

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================
   INITIALIZE
========================= */

setupCategoryFilters();
renderProducts();
renderCart();
updateWishlistCount();
updateNavbar();

console.log("ZAZAN website initialized successfully.");
