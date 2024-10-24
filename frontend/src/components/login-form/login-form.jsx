import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { login } from '../../actionCreators/authAction';

import './login-form.css';

function LoginForm() {
    const dispatch = useDispatch();
    const isLoading = useSelector((state) => state.auth.isLoading); 
    
    const { register, handleSubmit, formState: { errors } } = useForm();


    const onSubmit = (data) => {
        dispatch(login({ email: data.email, password: data.password })); 
    };

    
    

    return (
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <h1 className='formHeader'>LOG IN</h1>
            <div>
            <input
                {...register('email', { 
                    required: 'Email is required', 
                    pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address'
                    }
                })} 
                placeholder='Email'
                className='formInput'
            />
            {errors.email && <div className='ErrorField'>{errors.email.message}</div>}
            </div>
            <div>
            <input 
                {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long'
                    },
                    pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d).+$/,
                        message: 'Password must contain at least one uppercase letter and one number'
                    }
                })}
                type="password"
                placeholder='Password'
                className='formInput'
            />
            {errors.password && <div className='ErrorField'>{errors.password.message}</div>}
            </div>
            <button type="submit" className='formBtn' disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
            </button>
            <a className="formLink" href="/registration">DONT HAVE AN ACCOUNT</a>
        </form>
    );
}

export default LoginForm;
