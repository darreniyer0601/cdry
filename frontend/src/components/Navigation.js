import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import AuthContext from "../context/authContext";
import ProductContext from "../context/productContext";

const Navigation = () => {
	const { user, logout } = useContext(AuthContext);
	const { cart } = useContext(ProductContext);

	const [state, setState] = useState({
		showMenu: false,
	});

	return (
		<div>
			<nav
				className="navbar container"
				role="navigation"
				aria-label="main navigation"
			>
				<div className="navbar-brand">
					<b className="navbar-item is-size-4 ">CRDY</b>
					<label
						role="button"
						class="navbar-burger burger"
						aria-label="menu"
						aria-expanded="false"
						data-target="navbarBasicExample"
						onClick={(e) => {
							e.preventDefault();
							setState({ showMenu: !state.showMenu });
						}}
					>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</label>
				</div>
				<div className={`navbar-menu ${state.showMenu ? "is-active" : ""}`}>
					<Link to="/products" className="navbar-item">
						Products
					</Link>
					{user && user.accessLevel < 1 && (
						<Link to="/add-product" className="navbar-item">
							Add Product
						</Link>
					)}
					<Link to="/cart" className="navbar-item">
						Cart
						<span className="tag is-primary" style={{ marginLeft: "5px" }}>
							{Object.keys(cart).length}
						</span>
					</Link>
					{!user ? (
						<>
							<Link to="/login" className="navbar-item is-pulled-right">
								Login
							</Link>
							<Link to="/register" className="navbar-item is-pulled-right">
								Register
							</Link>
						</>
					) : (
						<Link to="/" onClick={logout} className="navbar-item">
							Logout
						</Link>
					)}
				</div>
			</nav>
		</div>
	);
};

export default Navigation;
