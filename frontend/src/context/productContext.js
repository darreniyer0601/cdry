import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductContext = React.createContext();

export const ProductContextProvier = (props) => {
	const [state, setState] = useState({
		cart: {},
		products: [],
	});

	useEffect(() => {
		axios
			.get("/getItems")
			.then((data) => {
				console.log(data.data.data)
				setState({
					...state,
					products: data.data.data
				});
			})
			.catch((res) => {
				console.log(res)
			})
			// eslint-disable-next-line
	}, [])

	const addProduct = (product, callback) => {
		let products = state.products.slice();
		products.push(product);
		setState({ products }, () => callback && callback());
	};

	const addToCart = (cartItem) => {
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
		setState({ ...state, cart });
	};

	const removeFromCart = (cartItemId) => {
		let cart = state.cart;
		delete cart[cartItemId];
		localStorage.setItem("cart", JSON.stringify(cart));
		setState({ cart });
	};

	const clearCart = () => {
		let cart = {};
		localStorage.removeItem("cart");
		setState({ ...state, cart });
	};

	const checkout = (user) => {
		if (user) {
			props.history.push("/login");
			return;
		}

		const cart = state.cart;

		const products = this.state.products.map((p) => {
			if (cart[p.name]) {
				p.stock = p.stock - cart[p.name].amount;

				axios.put(`http://localhost:3001/products/${p.id}`, { ...p });
			}
			return p;
		});

		setState({ ...state, products });
		clearCart();
	};

	return (
		<ProductContext.Provider
			value={{
				addToCart,
				addProduct,
				removeFromCart,
				clearCart,
				checkout,
				...state,
			}}
		>
			{props.children}
		</ProductContext.Provider>
	);
};

export default ProductContext;
