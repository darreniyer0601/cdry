import React, { useState } from 'react'

const LoginForm = (props) => {
    const [user, setUser] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        props.login(user);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Login: </label>
                <input name='username' type='text' onChange={handleChange} />
            </div>
            <div>
                <label>Password: </label>
                <input name='password' type='password' onChange={handleChange} />
            </div>
            <button type='submit'>Login</button>
        </form>
    )
}

export default LoginForm
