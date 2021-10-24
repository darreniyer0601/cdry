import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";

import AuthContext from "../context/authContext";

const Register = (props) => {
	const authContext = useContext(AuthContext);

	const [state, setState] = useState({
		username: "",
		firstName: "",
		lastName: "",
		password: "",
		error: "",
	});

	const handleChange = (e) => {
		setState({
			...state,
			[e.target.name]: e.target.value,
		});
	};

	const register = (e) => {
		e.preventDefault();
		console.log(state)
		const { username, firstName, lastName, password } = state;

		if (!username || !password) {
			setState({ ...state, error: "Fill all fields!" });
			return;
		}

		authContext
			.register(username, firstName, lastName, password)
			.then((loggedIn) => {
				if (!loggedIn) {
					setState({ ...state, error: "Already Registered!" });
				} else {
					props.history.push('/');
				}
			});
	};

	return !authContext.user ? (
		<>
			<div className="hero is-primary ">
				<div className="hero-body container">
					<h4 className="title">Register</h4>
				</div>
			</div>
			<br />
			<br />
			<form onSubmit={register}>
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
							<label className="label">First Name: </label>
							<input
								className="input"
								type="text"
								name="firstName"
								onChange={handleChange}
							/>
						</div>
						<div className="field">
							<label className="label">Last Name: </label>
							<input
								className="input"
								type="text"
								name="lastName"
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
						<div className="field">
							<label className="label">Confirm Password: </label>
							<input
								className="input"
								type="password"
								onChange={(e) => {
									if (state.password !== e.target.value) {
										setState({...state, error: "Passwords do not match!" });
									} else {
										setState({...state, error: "" });
									}
								}}
							/>
						</div>
						{state.error && (
							<div className="has-text-danger">{state.error}</div>
						)}
						<div className="field is-clearfix">
							<Link
								to="/login"
								className="button is-secondary is-outlined is-pulled-left"
							>
								Already have an account?
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

export default Register;
