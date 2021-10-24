import React from "react";
import { Switch, Route } from "react-router-dom";

import Cart from "./components/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import Navigation from "./components/Navigation";
import ProductList from "./components/ProductList";

import { AuthContextProvider } from "./context/authContext";
import { ProductContextProvider } from "./context/productContext";

const App = () => {

	return (
		<div className="App">
			<AuthContextProvider>
				<ProductContextProvider>
					<Navigation />
					<Switch>
						<Route exact path="/" component={ProductList} />
						<Route exact path="/login" component={Login} />
            			<Route exact path="/register" component={Register} />
						<Route exact path="/cart" component={Cart} />
						<Route exact path="/products" component={ProductList} />
					</Switch>
				</ProductContextProvider>
			</AuthContextProvider>
		</div>
	);
};

export default App;
