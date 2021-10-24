import React, { useState, useContext } from "react";
import AuthContext from "../context/authContext";

import CartItem from "./CartItem";

const Cart = (props) => {
	const authContext = useContext(AuthContext);

	const [error, setError] = useState("");

	const { cart, removeFromCart, clearCart, checkout, metaMaskAcc, transfer } = authContext;

	const cartKeys = Object.keys(cart || {});

	return (
		<>
			<div className="hero is-primary">
				<div className="hero-body container">
					<h4 className="title">My Cart</h4>
				</div>
			</div>
			<br />
			<div className="container">
				{cartKeys.length ? (
					<div className="column columns is-multiline">
						{cartKeys.map((key) => (
							<CartItem
								cartKey={key}
								key={key}
								cartItem={cart[key]}
								removeFromCart={removeFromCart}
							/>
						))}
						<div className="column is-12 is-clearfix">
							<br />
							<div className="is-pulled-right">
								<button
									onClick={clearCart}
									className="button is-warning "
								>
									Clear Cart
								</button>{" "}
								<button
									className="button is-success"
									onClick={() => {
										if (metaMaskAcc != null) {
											checkout();
										} else {
											setError("Connect with MetaMask to continue with your purchase")
										}
									}}
								>
									Checkout
								</button>
							</div>
						</div>
						{error && (
							<div style={{marginLeft: "auto"}} className="has-text-danger">{error}</div>
						)}
						{transfer === "success" ? (
							<div style={{margin: "auto"}} className="is-success">Transaction was completed successfully.</div>
						) : transfer === "failure" ? (
							<div style={{margin: "auto"}} className="has-text-danger">Transaction failed. Please try again.</div>
						) : ("")}
					</div>
				) : (
					<div className="column">
						<div className="title has-text-grey-light">No items in cart!</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Cart;
