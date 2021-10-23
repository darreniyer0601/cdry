import React, { useState, useEffect } from "react";
import axios from "axios";
//import jwt_decode from "jwt-decode";

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
	});

	// useEffect(() => {
	// 	const fetchUserData = async () => {
	// 	  let user = localStorage.getItem("user");
	// 	  user = user ? JSON.parse(user) : null;
	// 	  setState({ user });
	// 	}
	// fetchUserData();
	// }, [state]);

	const login = async (username, password) => {
		const res = await axios
			.post("/login", { username, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});

		if (res.status === 200) {
			// const { email } = jwt_decode(res.data.accessToken);
			// const user = {
			// 	email,
			// 	token: res.data.accessToken,
			// 	accessLevel: email === "admin@example.com" ? 0 : 1,
			// };
			// setState({ user });
			// localStorage.setItem("user", JSON.stringify(user));
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
			// const { email } = jwt_decode(res.data.accessToken);
			// const user = {
			// 	username,
			// 	token: res.data.accessToken,
			// 	accessLevel: username === "admin@example.com" ? 0 : 1,
			// };

			// setState({ user });
			// localStorage.setItem("user", JSON.stringify(user));
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
