import {useState} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"

const Signup = () =>{
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e) =>{
        e.preventDefault();

        const user = {
            email: email,
            username: username,
            password: password
        }
        axios.post('http://localhost:5000/users/signup', user)
        .then(res=> {
             console.log(res.data);

             localStorage.setItem('user', JSON.stringify(user))
             localStorage.setItem('token', res.data.token);
             setEmail('')
             setUsername('')
             setPassword('')
        
                navigate('/home', { state: { user : user } })
             })
        .catch(err=>{
          console.error(err)
        })
        
    }
    return(
        <div>
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />
        </div>
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
          <input type="submit" value="Sign Up" />
        </div>
      </form>
      <p>Already have an account?</p>
      <Link to="/login">Log In</Link>
    </div>
    )
}

export default Signup