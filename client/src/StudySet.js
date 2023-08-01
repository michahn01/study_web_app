import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "./Navbar.js"
import "./css_animations/blob_decos.css"

const StudySet = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true);
    const [ studySet, setStudySet] = useState({});
    const [ studySetFound, setStudySetFound ] = useState(true);
    const path_parts = location.pathname.split('/').filter(item => item !== '');

    if (path_parts[0] !== "my-study-sets") {
        navigate("/error")
    }
    if (path_parts[1] !== "study-set") {
        navigate("/error")
    }

    const studyset_id = path_parts[2]

    const retrieveData = () => {
        console.log("Retrieving Data")
        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`http://127.0.0.1:5000/my-study-sets/${studyset_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Method': 'GET',
                    'x-access-token': localStorage.getItem('token')
                }
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setLoading(false)
                if (data.hasOwnProperty("message") && data["message"] === "No StudySet found.") {
                    setStudySetFound(false);
                }
                else {
                    setStudySetFound(true);
                    setStudySet(data)
                }
            })
        }
    }
    useEffect(() => {
        retrieveData()
    }, [])

    if (!studySetFound) {
        return (
            <>
                <Navbar logged_in={true} />
                <div className="page_content">
                    <h1>The study set you were looking for does not exist.</h1>
                    Maybe it was deleted, moved, or never existed in the first place.
                </div>
            </>
        )
    }
    return (
        <>
        <Navbar logged_in={true} />
        <div className="flush_left_column_page">
            <h1></h1>
        </div>
        </>
    )
}

export default StudySet 