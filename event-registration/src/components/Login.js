import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Login = () =>{

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    
    const handleSubmit = async(e)=>{
        e.preventDefault()

        const user = {
            username : username,
            password : password
        }

        try {
            
            const response = await axios.post('http://localhost:5000/users/login', user);
            console.log(response.data);

            if(response.data.message === 'Logged in successfully'){
                localStorage.setItem('token', response.data.token)
                const userObject = {
                    id: response.data.user.id,
                    username: response.data.user.username
                }
                localStorage.setItem('user', JSON.stringify(userObject))
                navigate('/home',)
            }

        } catch (err) {
            console.error(err)            
        }

    }

return(
    <div>
        <h3>Login</h3>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username: </label>
                <input type="text"
                 required 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 />
            </div>
            <div>
                <label>Password: </label>
                <input type="password"
                 required 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 />
            </div>
            <div>
                <input type="submit" value="Log In" />
            </div>

        </form>
        
        <div>
        <p>Don't have an account?</p>
      <Link to="/">Sign Up</Link>
        </div>
    </div>
)

}

export default Login