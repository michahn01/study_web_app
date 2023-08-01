import "./style.css"
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar.js"


const Register = () => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [userNameText, setUserNameText] = useState("")
    const [userNameTextColor, setUserNameTextColor] = useState("red")
    const [password, setPassword] = useState("")
    const [passwordText, setPasswordText] = useState("")
    const [passwordTextColor, setPasswordTextColor] = useState("")
    const [verifyText, setVerifyText] = useState("")
    const [verifyTextColor, setVerifyTextColor] = useState("red")
    const [userNameGood, setUserNameGood] = useState(false)
    const [passwordGood, setPasswordGood] = useState(false)
    const [passwordVerifyGood, setPasswordVerifyGood] = useState(false)
    

    const handleUserNameChange = (e) => {
        setUserName(e.target.value);
        if (e.target.value === "") {
            setUserNameText("")
            setUserNameGood(false)
        }
        else if (!/^[a-zA-Z0-9_]+$/.test(e.target.value)) {
            setUserNameTextColor("red")
            setUserNameText("Use only alphabet letters, numbers, or an underscore.")
            setUserNameGood(false)
        }
        else {
            if (e.target.value !== "" && /^[a-zA-Z0-9_]+$/.test(e.target.value)) {
                fetch(`http://127.0.0.1:5000/register/${e.target.value}`, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => {
                        return res.json()
                    })
                    .then((data) => {
                        console.log(data["message"])
                        if (data["message"] === "username already taken") {
                            setUserNameTextColor("red")
                            setUserNameText("Username already taken")
                            setUserNameGood(false)
                        }
                        else {
                            setUserNameTextColor("green")
                            setUserNameText("Username available!")
                            setUserNameGood(true)
                        }
                    })
            }
        }
    }

    const handlePasswordChange = (e) => {
        if (e.target.value === "") {
            setPasswordText("")
            setPasswordGood(false)
        }
        else if (e.target.value.length < 5) {
            setPasswordTextColor("red")
            setPasswordText("Password must be at least 5 characters long.")
            setPasswordGood(false)
        }
        else {
            setPasswordTextColor("green")
            setPasswordText("Password acceptable!")
            setPassword(e.target.value)
            setPasswordGood(true)
        }
    }
    const handleVerifyPassword = (e) => {
        if (e.target.value === "") {
            setVerifyText("")
            setPasswordVerifyGood(false)
        }
        else if (e.target.value !== password) {
            setVerifyTextColor("red")
            setVerifyText("Passwords do not match.")
            setPasswordVerifyGood(false)
        }
        else {
            setVerifyTextColor("green")
            setVerifyText("Password match!")
            setPasswordVerifyGood(true)
        }
    }

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

    const handleAccountCreation = () => {
        fetch(`http://127.0.0.1:5000/register`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                
                "username": `${userName}`,
                "password": `${password}`
                
            })
        })
            .then(res => {
                return res.json()
            })
            .then((data) => {
                return data["message"]
            })
            .then((data) => {
                let encoded = window.btoa(`${userName}:${password}`);
                let auth = 'Basic ' + encoded;
                fetch(`http://127.0.0.1:5000/login`, {
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    },
                })
                    .then((response) => {
                        if (!response.ok) {
                            if (response.status === 401) {
                                return {"token": "Verification failed."}
                            } 
                            else {
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
            }) 
    }

    return (
        <>
        <Navbar />
        <div className="page_content">

            <h1>Create an account to get started.</h1>

            <div id="account_creation_form">
                <h2>Username: </h2>
                <input type="text" name="username" onInput={handleUserNameChange}/> 
                <p style={{ height: "1.5em", color: userNameTextColor }}>{userNameText}</p>

                <h2>Password: </h2>
                <input type="password" name="password" onInput={handlePasswordChange} autoComplete="off"/>
                <p style={{ height: "1.5em", color: passwordTextColor }}>{passwordText}</p>

                <motion.div id="password_confirm_section"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{
                        x: (userNameGood && passwordGood) ? 0 : -100,
                        opacity: (userNameGood && passwordGood) ? 1 : 0
                    }}
                    transition={{ duration: 0.9 }}
                >
                    <center><h2>Confirm Password: </h2></center>
                    <input type="password" name="password" onInput={handleVerifyPassword} />
        
                    <center>
                        <p style={{ height: "1.5em", color: verifyTextColor }}>{verifyText}</p>
                    </center>
                </motion.div>

                <motion.button id="account_creation_button"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{
                        x: (userNameGood && passwordGood && passwordVerifyGood) ? 0 : 100,
                        opacity: (userNameGood && passwordGood && passwordVerifyGood) ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    whileHover={{scale: 1.1}}
                    onClick={handleAccountCreation}
                >
                    Create Account!
                </motion.button>
            </div>

        </div>
        </>
    )
}

export default Register