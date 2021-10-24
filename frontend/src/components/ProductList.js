import React, { useContext } from "react";
import ProductContext from "../context/productContext";
import AuthContext from "../context/authContext";
import ProductItem from "./ProductItem";

const ProductList = (props) => {
	const productContext = useContext(ProductContext);
	const authContext = useContext(AuthContext);

	const { products, addToCart } = productContext;

	return (
		<>
			<div className="hero is-primary">
				<div className="hero-body container">
					<h4 className="title">{authContext.user ? `Hello, ${authContext.user.firstName} ${authContext.user.lastName}` : 'Our Products'}</h4>
				</div>
			</div>
			<br />
			<div className="container">
				<div className="column columns is-multiline">
					{products && products.length ? (
						products.map((product, index) => (
							<ProductItem
								product={product}
								key={index}
								addToCart={addToCart}
							/>
						))
					) : (
						<div className="column">
							<span className="title has-text-grey-light">
								No products found!
							</span>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default ProductList;
