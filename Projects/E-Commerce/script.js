
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. SELECT ELEMENTS
    // ==========================================

    const search = document.getElementById("product-search");
    const products = document.querySelectorAll(".product-card");
    const categoryList = document.getElementById("category-list");

    const sortSelect = document.getElementById("sort-select");
    const productContainer = document.querySelector(".product-grid");

    const cartButton = document.getElementById("cart-btn");
    const cartPanel = document.getElementById("cart-panel");
    const closeCart = document.getElementById("close-cart");
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-btn");

    let selectedCategory = "all";

    // Load saved cart
    let cart;

    try {
        cart = JSON.parse(localStorage.getItem("electromart-cart")) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch {
        cart = [];
    }


    // ==========================================
    // 2. SEARCH + CATEGORY FILTERING
    // ==========================================

    function filterProducts() {
        const searchText = search
            ? search.value.trim().toLowerCase()
            : "";

        products.forEach(product => {
            const name = product.querySelector(".product-details h3");

            if (!name) return;

            const productName = name.textContent.toLowerCase();
            const productCategory = product.dataset.category;

            const matchesSearch = productName.includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                productCategory === selectedCategory;

            product.style.display =
                matchesSearch && matchesCategory ? "" : "none";
        });
    }

    if (search) {
        search.addEventListener("input", filterProducts);
    }

    if (categoryList) {
        categoryList.addEventListener("click", event => {
            const button = event.target.closest(".category-btn");

            if (!button || !categoryList.contains(button)) return;

            selectedCategory = button.dataset.category;

            categoryList.querySelectorAll(".category-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            filterProducts();
        });
    }


    // ==========================================
    // 3. PRODUCT SORTING
    // ==========================================

    if (sortSelect && productContainer) {
        const originalOrder = Array.from(products);

        sortSelect.addEventListener("change", () => {
            const sortedProducts = [...originalOrder];
            const sortType = sortSelect.value;

            const getPrice = product =>
                Number(product.dataset.price) || 0;

            if (sortType === "price-low") {
                sortedProducts.sort((a, b) =>
                    getPrice(a) - getPrice(b)
                );
            }

            else if (sortType === "price-high") {
                sortedProducts.sort((a, b) =>
                    getPrice(b) - getPrice(a)
                );
            }

            else if (sortType === "name-az") {
                sortedProducts.sort((a, b) => {
                    const nameA = a.querySelector("h3").textContent;
                    const nameB = b.querySelector("h3").textContent;

                    return nameA.localeCompare(nameB);
                });
            }

            sortedProducts.forEach(product => {
                productContainer.appendChild(product);
            });

            filterProducts();
        });
    }


    // ==========================================
    // 4. CART STORAGE
    // ==========================================

    function saveCart() {
        localStorage.setItem(
            "electromart-cart",
            JSON.stringify(cart)
        );
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    }


    // ==========================================
    // 5. ADD PRODUCT TO CART
    // ==========================================

    function addToCart(product) {
        const id = product.dataset.id;
        const name = product.querySelector(".product-details h3");
        const price = Number(product.dataset.price);

        if (!id || !name || !Number.isFinite(price)) return;

        const existingProduct = cart.find(item => item.id === id);

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({
                id,
                name: name.textContent.trim(),
                price,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
    }

    products.forEach(product => {
        const addButton = product.querySelector(
            ".add-to-cart, .add-to-cart-btn"
        );

        if (addButton) {
            addButton.addEventListener("click", () => {
                addToCart(product);
            });
        }
    });


    // ==========================================
    // 6. RENDER SHOPPING CART
    // ==========================================

    function renderCart() {
        const totalQuantity = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }

        if (cartTotal) {
            cartTotal.textContent = formatPrice(totalPrice);
        }

        if (!cartItems) return;

        cartItems.replaceChildren();

        if (cart.length === 0) {
            const message = document.createElement("p");
            message.textContent = "Your cart is empty.";
            cartItems.appendChild(message);
            return;
        }

        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item";

            const info = document.createElement("div");
            info.className = "cart-item-info";

            const title = document.createElement("h4");
            title.textContent = item.name;

            const price = document.createElement("p");
            price.textContent = formatPrice(item.price);

            info.append(title, price);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const decrease = document.createElement("button");
            decrease.textContent = "−";
            decrease.dataset.action = "decrease";
            decrease.dataset.id = item.id;

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const increase = document.createElement("button");
            increase.textContent = "+";
            increase.dataset.action = "increase";
            increase.dataset.id = item.id;

            const remove = document.createElement("button");
            remove.textContent = "Remove";
            remove.dataset.action = "remove";
            remove.dataset.id = item.id;

            controls.append(decrease, quantity, increase, remove);
            row.append(info, controls);
            cartItems.appendChild(row);
        });
    }


    // ==========================================
    // 7. QUANTITY AND REMOVE CONTROLS
    // ==========================================

    if (cartItems) {
        cartItems.addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const id = button.dataset.id;
            const action = button.dataset.action;

            const item = cart.find(product => product.id === id);

            if (!item) return;

            if (action === "increase") {
                item.quantity++;
            }

            if (action === "decrease") {
                item.quantity--;

                if (item.quantity <= 0) {
                    cart = cart.filter(product => product.id !== id);
                }
            }

            if (action === "remove") {
                cart = cart.filter(product => product.id !== id);
            }

            saveCart();
            renderCart();
        });
    }


    // ==========================================
    // 8. OPEN AND CLOSE CART
    // ==========================================

    if (cartButton && cartPanel) {
        cartButton.addEventListener("click", () => {
            cartPanel.classList.add("open");
        });
    }

    if (closeCart && cartPanel) {
        closeCart.addEventListener("click", () => {
            cartPanel.classList.remove("open");
        });
    }


    // ==========================================
    // 9. CHECKOUT (DEMO ONLY)
    // ==========================================

    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            alert(
                "Demo checkout only. No payment has been processed."
            );
        });
    }


    // ==========================================
    // 10. INITIALIZE WEBSITE
    // ==========================================

    filterProducts();
    renderCart();

});
