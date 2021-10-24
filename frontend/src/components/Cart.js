import React, { useContext } from "react";
import AuthContext from "../context/authContext";

import CartItem from "./CartItem";

const Cart = (props) => {
	const authContext = useContext(AuthContext);

	const { cart, removeFromCart, clearCart, checkout } = authContext;

	const cartKeys = Object.keys(cart || {});

	return (
		<>
			<div className="hero is-primary">
				<div className="hero-body container">
					<h4 className="title">"My Cart"</h4>
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
									onClick={checkout}
								>
									Checkout
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="column">
						<div className="title has-text-grey-light">No item in cart!</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Cart;
