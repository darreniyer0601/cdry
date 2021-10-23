import React from "react";
import { Switch, Route } from "react-router-dom";

import AddProduct from "./components/AddProduct";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import Navigation from "./components/Navigation";
import ProductList from "./components/ProductList";

import { AuthContextProvider } from "./context/authContext";
import { ProductContextProvier } from "./context/productContext";

const App = () => {

	return (
		<div className="App">
			<AuthContextProvider>
				<ProductContextProvier>
					<Navigation />
					<Switch>
						<Route exact path="/" component={ProductList} />
						<Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
						<Route exact path="/cart" component={Cart} />
						<Route exact path="/add-product" component={AddProduct} />
						<Route exact path="/products" component={ProductList} />
					</Switch>
				</ProductContextProvier>
			</AuthContextProvider>
		</div>
	);
};

export default App;
