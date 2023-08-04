import { Outlet, Navigate } from 'react-router'
import { useState, useEffect } from 'react'
import "./style.css"


const ProtectedRoutes = () => {
    
    const [isLoading, setLoading] = useState(true);
    const [loginSuccess, setLoginSuccess] = useState(false)


    useEffect(() => {
        checkAuth();
    }, [])

    const checkAuth = () => {
        
        if (localStorage.getItem('token') === null) {
            console.log("no token")
            setLoginSuccess(false);
            setLoading(false);
        }
        else {
            // console.log("token found")
            fetch(`/api/login/verify`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                if (data["message"] === "Token is missing." ||
                    data["message"] === "Token has expired." ||
                    data["message"] === "Token is invalid.") {
                    console.log(data["message"])
                    setLoginSuccess(false);
                    setLoading(false);
                }
                else {
                    console.log("Good token")
                    setLoginSuccess(true);
                    setLoading(false);
                }
            })
        }
    }

    if (isLoading) {
        return (
            <div style={{height: "800px", width: "auto"}}>

            </div>
        )
    }
    if (loginSuccess) {
        console.log("login success")
        return <Outlet />
    }
    else {
        console.log("login failure")
        return <Navigate to="/login"></Navigate>
    }
}

export default ProtectedRoutes 