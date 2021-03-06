import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import AuthContext from "../context/authContext";

const Navigation = () => {
	const { user, cart, logout, metaMaskAcc, setMetaMaskAccount } = useContext(AuthContext);

	const [state, setState] = useState({
		showMenu: false,
	});

	const metaMask = () => {
		try {
			setMetaMaskAccount();
		} catch (err) {
			alert(err.message);
		}
	};

	return (
		<div>
			<nav
				style={{ alignItems: "stretch" }}
				className="container"
				role="navigation"
				aria-label="main navigation"
			>
				<div className="navbar-brand">
					<b className="navbar-item is-size-4 ">CDRY</b>
					<label
						role="button"
						className="navbar-burger burger"
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
					<Link to="/products" className="navbar-item">
						NFTs
					</Link>
					{user && (
						<Link to="/cart" className="navbar-item">
							Cart
							<span className="tag is-primary" style={{ marginLeft: "5px" }}>
								{Object.keys(cart).length}
							</span>
						</Link>
					)}
					<div
						style={{
							marginLeft: "auto",
							display: "flex",
							alignItems: "stretch",
						}}
						className={`${state.showMenu ? "is-active" : ""}`}
					>
						{!user ? (
							<>
								<Link to="/register" className="navbar-item">
									Register
								</Link>
								<Link to="/login" className="navbar-item">
									Login
								</Link>
							</>
						) : (
							<>
								{!metaMaskAcc ? (
									<a href="#connect" onClick={metaMask} className="navbar-item">
										Connect MetaMask
									</a>
								) : (
									<p className="navbar-item">
										MetaMask Connected
									</p>
								)}
								<Link to="/" onClick={logout} className="navbar-item">
									Logout
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>
		</div>
	);
};

export default Navigation;
