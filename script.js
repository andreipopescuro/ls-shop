const client = contentful.createClient({
  space: `4mr2xks63jzb`,

  accessToken: `pBcRgNOwTqRCuw2dJsMdR3cZUtnIucS9RvOm05o0_lE`,
});

const cartBtn = document.querySelector("#cart-button");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-container");
const confirmCommand = document.querySelector("#confirm");

let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let content = await client.getEntries({
        content_type: "barberShop",
      });
      let products = content.items;
      products = products.map((product) => {
        const { title, price } = product.fields;
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayPoducts(products) {
    let result = "";
    products.forEach((product) => {
      const { image, title, price, id } = product;
      result += `
        <div class="product">
        <div class="img-container">
          <img src=${image} alt="product" class="product-img" />
        </div>
        <h3 class="product-name">${title}</h3>
        <div class="price">RON ${price}</div>
        <button class="bag-btn" data-id=${id}>
          <i class="fa fa-shopping-cart"></i> add to cart
        </button>
      </div>
        `;
    });
    productsDOM.innerHTML = result;
  }

  addToCart() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "in cart";
        button.disabled = true;
        button.addEventListener("click", (e) => {
          e.target.innerText = "in cart";
          e.target.disabled = true;
          let cartItem = { ...storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
        });
      } else {
        button.addEventListener("click", (e) => {
          e.target.innerText = "in cart";
          e.target.disabled = true;
          let cartItem = { ...storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    const { image, title, price, id, amount } = item;
    div.innerHTML = `
    <img src=${image} alt="product" />
          <div class="about-item-cart">
            <h4>${title}</h4>
            <h5>RON ${price}</h5>
            <span class="remove-item" data-id=${id}>Sterge din cos</span>
          </div>
          <div class="amount-control">
            <i class="fa fa-arrow-up" data-id=${id}></i>
            <h5 class="item-amount">${amount}</h5>
            <i class="fa fa-arrow-down" data-id=${id}></i>
          </div>
    `;
    cartContent.appendChild(div);
  }

  setApp() {
    cart = storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.remove();
        this.removeItem(id);
      }
      if (e.target.classList.contains("fa-arrow-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      if (e.target.classList.contains("fa-arrow-down")) {
        let decreaseAmount = e.target;
        let id = decreaseAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        if (tempItem.amount > 1) {
          tempItem.amount -= 1;
          storage.saveCart(cart);
          this.setCartValues(cart);
          decreaseAmount.previousElementSibling.innerText = tempItem.amount;
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i> add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  addToLS(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id === id);
  }
  getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

cartBtn.addEventListener("click", () => {
  cartDOM.classList.add("active");
});

closeCartBtn.addEventListener("click", () => {
  cartDOM.classList.remove("active");
});

const products = new Products();
const ui = new UI();
const storage = new Storage();

ui.setApp();

products
  .getProducts()
  .then((products) => {
    ui.displayPoducts(products);
    storage.addToLS(products);
  })
  .then(() => ui.addToCart())
  .then(ui.cartLogic());

const pay = () => {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        // This function sets up the details of the transaction, including the amount and line item details.
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: cartTotal.innerText,
              },
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        // This function captures the funds from the transaction.
        return actions.order.capture().then(function (details) {
          // This function shows a transaction success message to your buyer.
          ui.clearCart();
          alert("Transaction completed by " + details.payer.name.given_name);
        });
      },
    })
    .render("#total");
};
confirmCommand.addEventListener("click", pay, { once: true });
