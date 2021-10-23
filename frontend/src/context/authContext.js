import React, { useState } from "react";
import axios from "axios";
//import jwt_decode from "jwt-decode";

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
	});

	const login = async (username, password) => {
		const res = await axios
			.post("/login", { username, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});

		if (res.status === 200) {
			let data = res.data.data;
			let consumer = data.consumers[0];
            let consumerData = {
				username: consumer.profileUsername,
				firstName: consumer.firstName,
                lastName: consumer.lastName
            };
			setState({
				user: consumerData
			});
			return true;
		} else {
			return false;
		}
	};

	const register = async (username, firstName, lastName, password) => {
		const res = await axios
			.post("/register", { username, firstName, lastName, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});
		console.log(res);
		if (res.status === 200) {
			let data = res.data.data;
			let consumer = data.consumers[0];
            let consumerData = {
				username: consumer.profileUsername,
				firstName: consumer.firstName,
                lastName: consumer.lastName
            };
			setState({
				user: consumerData
			});
			return true;
		} else {
			return false;
		}
	};

	const logout = (e) => {
		e.preventDefault();
		setState({ user: null });
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider
			value={{
				login,
				register,
				logout,
				user: state.user,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
