import React, { useState, useEffect } from "react";
import axios from "axios";
import { connectAccount, sendEth } from '../utils/ethereum';

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
		cart: {},
		metaMaskAcc: null
	});

	const [transfer, setTransfer] = useState("");

	useEffect(() => {
		let user = localStorage.getItem("user");
		user = user ? JSON.parse(user) : null;
		let metaMaskAcc = localStorage.getItem("metaMaskAcc");
		metaMaskAcc = metaMaskAcc ? metaMaskAcc : null;
		setState({ ...state, user, metaMaskAcc });
		setTransfer("");
		// eslint-disable-next-line
	}, []);

	const login = async (username, password) => {
		try {
			const res = await axios.post("/login", { username, password })

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
		} catch (err) {
			console.log(err.message);
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
				localStorage.setItem("metaMaskAcc", acc);
			} else {
				alert("MetaMask extension not added");
				window.location.replace("https://metamask.io/download.html");
			}
		} catch (err) {
			alert(err.message);
		}
	}

	const register = async (username, firstName, lastName, password) => {
		try {
			const res = await axios.post("/register", { username, firstName, lastName, password })
			if (res.status === 200) {
				let consumerData = {
					username,
					firstName,
					lastName
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
		} catch (err) {
			console.log(err.message)
		}
	};

	const addToCart = (cartItem) => {
		let cart = state.cart;
		if (!cart[cartItem.id]) {
			cart[cartItem.id] = cartItem;
		}
		localStorage.setItem("cart", JSON.stringify(cart));
		setState({ ...state, cart });
		console.log(cart)
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
		setTransfer("");
	};

	const checkout = async () => {
		const cart = state.cart;

		let total = Object.keys(cart).length;
		total *= 0.01;
		const txHash = await sendEth(state.metaMaskAcc, total);
		if (txHash) {
			let data = []
			Object.keys(cart).forEach(async (id) => {
				await axios.post("/removeItem", {ID: id});
				data.push(id.charAt(0));
			})
			let payload = {
				tokenIDs: data,
				transactionHash: txHash,
				destinationAddress: state.metaMaskAcc
			};
			const res = await axios.post("/purchase-tokens", payload)
			console.log(res);
			setTransfer("success");
			clearCart();
		} else {
			setTransfer("failure")
		}
	};

	const logout = (e) => {
		e.preventDefault();
		setState({ user: null, cart: {}, metaMaskAcc: null });
		localStorage.removeItem("cart");
		localStorage.removeItem("user");
		localStorage.removeItem("metaMaskAcc");
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
				transfer,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
