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
				console.log(data);
				setState({
					...state,
					products: data.data.data
				});
			})
			.catch((res) => {
				console.log(res)
			})
			// eslint-disable-next-line
	}, [])

	const addProduct = (product, callback) => {
		let products = state.products.slice();
		products.push(product);
		setState({ products }, () => callback && callback());
	};

	const removeProduct = (id) => {
		let products = [...state.products];
		products = products.filter(product => product.tokenID !== id);
		setState({ products });
	}

	return (
		<ProductContext.Provider
			value={{
				addProduct,
				removeProduct,
				products: state.products,
			}}
		>
			{props.children}
		</ProductContext.Provider>
	);
};

export default ProductContext;
