import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { connectAccount, sendEth } from '../utils/ethereum';
import ProductContext from "./productContext";

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
		cart: {},
		metaMaskAcc: null
	});
	const [transfer, setTransfer] = useState("");

	const { removeProduct } = useContext(ProductContext);

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
		// setTransfer("");
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
				removeProduct(id);
				data.push(id.charAt(0));
			})
			let payload = {
				tokenIDs: data,
				transactionHash: txHash,
				destinationAddress: state.metaMaskAcc
			};
<<<<<<< HEAD
			const res = await axios.post("http://cdry-go.ue.r.appspot.com/purchase-tokens", payload)
			//const res = await axios.get("http://cdry-go.ue.r.appspot.com/get-whale-tokens")
			//const res = axios.post("http://localhost:8080/purchase-tokens", payload)
=======
			const res = axios.post("http://cdry-go.ue.r.appspot.com/purchase-tokens", payload)
>>>>>>> dde8639697afff2228714dc1adb7e8308854648b
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
