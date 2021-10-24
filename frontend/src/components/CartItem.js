import React from "react";

const CartItem = (props) => {
	const { cartItem, cartKey } = props;

	const { product, amount } = cartItem;
	return (
		<div className=" column is-half">
			<div style={{ height: '135px' }} className="box">
				<div className="media">
					<div className="media-left">
						<figure className="image is-64x64">
							<img
								src={product.image}
								alt={product.name + ": " + product.description}
							/>
						</figure>
					</div>
					<div className="media-content">
						<b style={{ textTransform: "capitalize" }}>
							<span className="tag is-primary">0.01 ETH</span>
							{"          " + product.name}
						</b>
						<div>{product.description}</div>
						<small>{`${amount} in cart`}</small>
					</div>
					<div
						className="media-right"
						onClick={() => props.removeFromCart(cartKey)}
					>
						<span className="delete is-large"></span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartItem;
