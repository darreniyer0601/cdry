import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";

import AuthContext from "../context/authContext";

const Login = (props) => {
	const [state, setState] = useState({
		username: "",
		password: "",
		error: "",
	});

	const authContext = useContext(AuthContext);

	const handleChange = (e) => {
		setState({
			...state,
			[e.target.name]: e.target.value,
		});
	};

	const login = (e) => {
		e.preventDefault();

		const { username, password } = state;
		if (!username || !password) {
			return this.setState({ error: "Fill all fields!" });
		}

		authContext.login(username, password).then((loggedIn) => {
			if (!loggedIn) {
				setState({
					...state,
					error: "Invalid Credentails",
				});
			}
		});
	};

	return !authContext.user ? (
		<>
			<div className="hero is-primary ">
				<div className="hero-body container">
					<h4 className="title">Login</h4>
				</div>
			</div>
			<br />
			<br />
			<form onSubmit={login}>
				<div className="columns is-mobile is-centered">
					<div className="column is-one-third">
						<div className="field">
							<label className="label">Email: </label>
							<input
								className="input"
								type="email"
								name="username"
								onChange={handleChange}
							/>
						</div>
						<div className="field">
							<label className="label">Password: </label>
							<input
								className="input"
								type="password"
								name="password"
								onChange={handleChange}
							/>
						</div>
						{state.error && (
							<div className="has-text-danger">{state.error}</div>
						)}
						<div className="field is-clearfix">
							<Link
								to="/register"
								className="button is-secondary is-outlined is-pulled-left"
							>
								New user?
							</Link>
							<button
								type="submit"
								className="button is-primary is-outlined is-pulled-right"
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			</form>
		</>
	) : (
		<Redirect to="/products" />
	);
};

export default Login;
