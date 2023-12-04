import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";

const AppRouter = () =>{
    return(
        <Router>
            <div>
                <Routes>
                    <Route exact path="/" Component={Signup}/>
                    <Route path="/login" Component={Login}/>
                    <Route path="/home" Component={Home}/>
                </Routes>
            </div>
        </Router>
    )
}

export default AppRouter