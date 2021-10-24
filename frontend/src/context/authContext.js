import React, { useState, useEffect } from "react";
import axios from "axios";
import { connectAccount } from '../utils/ethereum';

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
		cart: {},
		metaMaskAcc: null
	});

	useEffect(() => {
		let user = localStorage.getItem("user");
		user = user ? JSON.parse(user) : null;
		setState({ ...state, user });
		// eslint-disable-next-line
	}, []);

	const login = async (username, password) => {
		const res = await axios
			.post("/login", { username, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});

		if (res.status === 200) {
			let data = res.data.data;
			let consumer = data.consumers[0];
            let consumerData = {
				username: consumer.profileUsername,
				firstName: consumer.firstName,
                lastName: consumer.lastName
            };
			setState({
				...state,
				user: consumerData
			});
			localStorage.setItem("user", JSON.stringify(consumerData));
			return true;
		} else {
			return false;
		}
	};

	const setMetaMaskAccount = async () => {
		try {
			const acc = await connectAccount();
			console.log(acc);
			if (acc != null) {
				setState({
					...state,
					metaMaskAcc: acc
				});
			} else {
				alert("MetaMask extension not added");
			}
		} catch (err) {
			alert(err.message);
		}
	}

	const register = async (username, firstName, lastName, password) => {
		const res = await axios
			.post("/register", { username, firstName, lastName, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});
		console.log(res);
		if (res.status === 200) {
			let data = res.data.data;
			let consumer = data.consumers[0];
            let consumerData = {
				username: consumer.profileUsername,
				firstName: consumer.firstName,
                lastName: consumer.lastName
            };
			setState({
				...state,
				user: consumerData
			});
			localStorage.setItem("user", JSON.stringify(consumerData));
			return true;
		} else {
			return false;
		}
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
		setState({ ...state, cart });
	};

	const clearCart = () => {
		let cart = {};
		localStorage.removeItem("cart");
		setState({ ...state, cart });
	};

	const checkout = () => {
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

	const logout = (e) => {
		e.preventDefault();
		setState({ user: null, cart: {}, metaMaskAcc: null });
		localStorage.removeItem("cart");
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider
			value={{
				login,
				register,
				logout,
				addToCart,
				removeFromCart,
				clearCart,
				checkout,
				setMetaMaskAccount,
				...state,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
