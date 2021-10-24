import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductContext = React.createContext();

export const ProductContextProvider = (props) => {
	const [state, setState] = useState({
		products: [],
	});

	useEffect(() => {
		axios
			.get("/getItems")
			.then((data) => {
				setState({
					...state,
					products: data.data.data
				});
			})
			.catch((res) => {
				console.log(res)
			})
			// eslint-disable-next-line
	}, [state])

	const addProduct = (product, callback) => {
		let products = state.products.slice();
		products.push(product);
		setState({ products }, () => callback && callback());
	};

	return (
		<ProductContext.Provider
			value={{
				addProduct,
				products: state.products,
			}}
		>
			{props.children}
		</ProductContext.Provider>
	);
};

export default ProductContext;
