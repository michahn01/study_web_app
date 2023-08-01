import "./style.css"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar.js"

const Login = (props) => {
    const [ userName, setUserName ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ instructions, setInstructions ] = useState("");
    const navigate = useNavigate()

    function waitForToken(x) {
        return new Promise((resolve) => {
          const checkLocalStorage = () => {
            const token = localStorage.getItem('token');
            if (token === x) {
              resolve(token);
            } else {
              setTimeout(checkLocalStorage, 500); // Retry after 500ms
            }
          };
      
          checkLocalStorage();
        });
      }
    
    const loginToServer = () => {
        let encoded = window.btoa(`${userName}:${password}`);
        let auth = 'Basic ' + encoded;
        fetch(`http://127.0.0.1:5000/login`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            mode: 'cors'
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        setInstructions("Failed to verify username and password.");
                        return {"token": "Verification failed."}
                    } 
                    else {
                        setInstructions('An error occurred. Please try again later.');
                        return {"token": "Verification failed."}
                    }
                }
                else {
                    return response.json();
                }
            })
            .then((data) => {
                if (data["token"] !== "Verification failed.") {
                    localStorage.setItem("token", data["token"])
                }
                return data["token"]
            })
            .then((token) => waitForToken(token))
            .then((token) => {
                navigate(`/my-study-sets`)
            })
    }
    
    const handleLogin = (e) => {
        if (userName.trimEnd() === "" && password === "") {
            setInstructions("Please enter a valid username and password.")
        }
        else if (userName.trimEnd() === "") {
            setInstructions("Please enter a valid username.")
        }
        else if (password === "") {
            setInstructions("Please enter a password.")
        }
        else {
            setInstructions("")
            loginToServer();
        }
    }

    return (
        <>
        <Navbar />
        <div className="page_content">
            <h1>Welcome back!</h1>
            <div id="login_box">
                <h2>Username:</h2>
                <input type="text" name="username" onChange={(e) => {setUserName(e.target.value)}} />
                <h2>Password:</h2>
                <input type="password" name="password" onChange={(e) => {setPassword(e.target.value)}}/>
                <motion.button id="login_button"
                 whileHover={{scale: 1.1}}
                 onClick={handleLogin}
                >
                    Login
                </motion.button>
                <div style={{height: "1.5em", width: "20em", wordWrap: "break-word"}}>
                <center><p style={{ fontSize: "1em", color: "red" }}>{instructions}</p></center>
                </div>
            </div>
        </div>
        </>
    )
}

export default Login