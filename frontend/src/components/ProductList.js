import React, { useContext } from "react";
import ProductContext from "../context/productContext";
import AuthContext from "../context/authContext";
import ProductItem from "./ProductItem";

const ProductList = (props) => {
	const productContext = useContext(ProductContext);
	const authContext = useContext(AuthContext);

	const { products } = productContext;
	const { user, addToCart } = authContext;

	return (
		<>
			<div className="hero is-primary">
				<div className="hero-body container">
					<h4 className="title">{user ? `Hello, ${user.firstName} ${user.lastName}!` : 'NFTs'}</h4>
				</div>
			</div>
			<br />
			<div className="container">
				<div className="column columns is-multiline">
					{products && products.length ? (
						products.map((product, index) => (
							<ProductItem
								product={product}
								user={authContext.user}
								key={index}
								addToCart={addToCart}
							/>
						))
					) : (
						<div className="column">
							<span style={{ margin: "auto" }} className="title has-text-grey-light">
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
