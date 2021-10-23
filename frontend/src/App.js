import React, { useState, useEffect } from "react";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import axios from 'axios';
import jwt_decode from 'jwt-decode';

import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './components/Login';
import ProductList from './components/ProductList';

export default App = () => {
  const [state, setState] = useState({
      user: null,
      cart: {},
      products: []
  });

  useEffect(async () => {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");

    const products = await axios.get('http://localhost:3001/products');
    user = user ? JSON.parse(user) : null;
    cart = cart? JSON.parse(cart) : {};

    setState({ user,  products: products.data, cart });
  });

  login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:3001/login',
      { email, password },
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    })

    if(res.status === 200) {
      const { email } = jwt_decode(res.data.accessToken)
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === 'admin@example.com' ? 0 : 1
      }

      setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }

  logout = e => {
    e.preventDefault();
    setState({ user: null });
    localStorage.removeItem("user");
  };

  addProduct = (product, callback) => {
    let products = state.products.slice();
    products.push(product);
    setState({ products }, () => callback && callback());
  };

  addToCart = cartItem => {
    let cart = state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setState({ cart });
  };

  removeFromCart = cartItemId => {
    let cart = state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    setState({ cart });
  };

  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    setState({ cart });
  };

  checkout = () => {
    if (!state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    const products = state.products.map(p => {
      if (state.cart[p.name]) {
        p.stock = p.stock - state.cart[p.name].amount;

        axios.put(
          `http://localhost:3001/products/${p.id}`,
          { ...p },
        )
      }
      return p;
    });

    setState({ products });
    this.clearCart();
  };

  
  return (
    <div className="App">
      <nav
        className="navbar container"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <b className="navbar-item is-size-4 ">ecommerce</b>
          <label
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            onClick={e => {
              e.preventDefault();
              setState({ showMenu: !state.showMenu });
            }}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </label>
        </div>
        <div className={`navbar-menu ${
          state.showMenu ? "is-active" : ""
        }`}>
          <Link to="/products" className="navbar-item">
            Products
          </Link>
          {state.user && state.user.accessLevel < 1 && (
            <Link to="/add-product" className="navbar-item">
              Add Product
            </Link>
          )}
          <Link to="/cart" className="navbar-item">
            Cart
            <span
              className="tag is-primary"
              style={{ marginLeft: "5px" }}
            >
              { Object.keys(state.cart).length }
            </span>
          </Link>
          {!state.user ? (
            <Link to="/login" className="navbar-item">
              Login
            </Link>
          ) : (
            <Link to="/" onClick={this.logout} className="navbar-item">
              Logout
            </Link>
          )}
        </div>
      </nav>
      <Switch>
        <Route exact path="/" component={ProductList} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/cart" component={Cart} />
        <Route exact path="/add-product" component={AddProduct} />
        <Route exact path="/products" component={ProductList} />
      </Switch>
    </div>
  );
}
