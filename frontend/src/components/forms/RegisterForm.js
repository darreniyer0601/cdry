import React, { useState } from 'react'

const RegisterForm = (props) => {
    const [user, setUser] = useState({
        username: '',
        password: '',
        passwordConfirm: ''
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Check if passwords match
        props.register(user);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username: </label>
                <input name='username' type='text' onChange={handleChange} />
            </div>
            <div>
                <label>Password: </label>
                <input name='password' type='password' onChange={handleChange} />
            </div>
            <div>
                <label>Confirm Password: </label>
                <input name='passwordConfirm' type='password' onChange={handleChange} />
            </div>
            <button type='submit'>Register</button>
        </form>
    )
}

export default RegisterForm
