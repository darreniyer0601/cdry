import React, { useContext } from "react";
import ProductContext from "../context/productContext";
import AuthContext from "../context/authContext";

import CartItem from "./CartItem";

const Cart = (props) => {
	const productContext = useContext(ProductContext);
	const authContext = useContext(AuthContext);

	const { cart } = productContext;

	const cartKeys = Object.keys(cart || {});

	return (
		<>
			<div className="hero is-primary">
				<div className="hero-body container">
					<h4 className="title">{authContext.user ? `My Cart` : 'Log In to Make Purchases'}</h4>
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
								removeFromCart={productContext.removeFromCart}
							/>
						))}
						<div className="column is-12 is-clearfix">
							<br />
							<div className="is-pulled-right">
								<button
									onClick={productContext.clearCart}
									className="button is-warning "
								>
									Clear cart
								</button>{" "}
								<button
									className="button is-success"
									onClick={productContext.checkout}
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
