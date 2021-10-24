import React from "react";
import './ProductItem.css'

const ProductItem = (props) => {
	const { product, user } = props;
	return (
		<div className=" column is-half">
			<div style={{ height: '135px' }} className="box">
				<div className="media">
					<div className="media-left">
						<figure className="image is-64x64">
							<img
								src={product.image}
								alt={product.name + ": " + product.description}
								onClick={(e) => {
									document.getElementById("myModal").style.display = "block";
									document.getElementById("image").src = product.image;
									document.getElementById("caption").innerHTML = product.name + ": " + product.description;
								  }}
							/>
							<div id="myModal" className="modal">
								<span
									className="close"
									onClick={() => {
										document.getElementById("myModal").style.display = "none"
									}}
								>
									&times;
								</span>
								<img
									alt={product.name}
									className="modal-content"
									id={"image"}
								/>
								<div id="caption"/>
							</div>
						</figure>
					</div>
					<div className="media-content">
						<b style={{ textTransform: "capitalize" }}>
							{product.name}{" "}
							<span className="tag is-primary is-pulled-right">0.01 ETH</span>
						</b>
						<div>{product.description}</div>
						<div className="is-clearfix">
							<button
								id={product.tokenID}
								disabled={user == null}
								className="button is-small is-outlined is-primary is-pulled-right"
								onClick={(e) => {
									props.addToCart({
										id: product.tokenID,
										product: product,
										amount: 1,
									})
								}}
							>
								Add to Cart
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductItem;
