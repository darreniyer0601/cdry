import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import withContext from "../withContext";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstName: "",
      lastName: "",
      password: ""
    };
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value, error: "" });

  register = (e) => {
    e.preventDefault();

    const { username, firstName, lastName, password } = this.state;
    if (!username || !password) {
      return this.setState({ error: "Fill all fields!" });
    }
    this.props.context.register(username, firstName, lastName, password)
      .then((loggedIn) => {
        if (!loggedIn) {
          this.setState({ error: "Already Registered!" });
        }
      })
  };

  render() {
    return !this.props.context.user ? (
      <>
        <div className="hero is-primary ">
          <div className="hero-body container">
            <h4 className="title">Register</h4>
          </div>
        </div>
        <br />
        <br />
        <form onSubmit={this.register}>
          <div className="columns is-mobile is-centered">
            <div className="column is-one-third">
              <div className="field">
                <label className="label">Email: </label>
                <input
                  className="input"
                  type="email"
                  name="username"
                  onChange={this.handleChange}
                />
              </div>
              <div className="field">
                <label className="label">First Name: </label>
                <input
                  className="input"
                  type="text"
                  name="firstName"
                  onChange={this.handleChange}
                />
              </div>
              <div className="field">
                <label className="label">Last Name: </label>
                <input
                  className="input"
                  type="text"
                  name="lastName"
                  onChange={this.handleChange}
                />
              </div>
              <div className="field">
                <label className="label">Password: </label>
                <input
                  className="input"
                  type="password"
                  name="password"
                  onChange={this.handleChange}
                />
              </div>
              <div className="field">
                <label className="label">Confirm Password: </label>
                <input
                  className="input"
                  type="password"
                  onChange={ (e) => {
                    if (this.state.password != e.target.value) {
                        this.setState({ error: "Passwords do not match!" });
                    }
                  }}
                />
              </div>
              {this.state.error && (
                <div className="has-text-danger">{this.state.error}</div>
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
  }
}

export default withContext(Register);