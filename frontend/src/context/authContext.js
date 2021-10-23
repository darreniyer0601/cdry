import React, { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
	const [state, setState] = useState({
		user: null,
	});

	const login = async (email, password) => {
		const res = await axios
			.post("http://localhost:3001/login", { email, password })
			.catch((res) => {
				return { status: 401, message: "Unauthorized" };
			});

		if (res.status === 200) {
			const { email } = jwt_decode(res.data.accessToken);
			const user = {
				email,
				token: res.data.accessToken,
				accessLevel: email === "admin@example.com" ? 0 : 1,
			};

			setState({ user });
			localStorage.setItem("user", JSON.stringify(user));
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
				logout,
				user: state.user,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
