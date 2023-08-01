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
    const [ studySetName, setStudySetName] = useState("");
    const [ termDefs, setTermDefs] = useState([]);
    const [ studySetFound, setStudySetFound ] = useState(true);
    const path_parts = location.pathname.split('/').filter(item => item !== '');

    if (path_parts[0] !== "my-study-sets") {
        navigate("/error")
    }
    if (path_parts[1] !== "study-set") {
        navigate("/error")
    }

    const studyset_id = path_parts[2]


    useEffect(() => {
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
                if (data["message"] === "No StudySet found.") {
                    setStudySetFound(false);
                }
                else {
                    setStudySetFound(true);
                    setStudySetName(data["StudySet Name"])
                    setTermDefs(data["Terms in StudySet"])
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    const getTermDefs = () => {
        if (termDefs.length === 0) {
            return (
                <div style={{width: "100%", paddingTop: "2em"}}>
                <center>
                This study set has no terms. 
                </center>
                </div>
            )
        }
        return (
            <div className="studySetsBox" style={{alignItems: "center"}}>
                <h2>Terms in this set</h2>
                {termDefs.map((termDef, index) => (
                    <div className="view_only_card" key={index}>
                        <div className="view_only_card_sub_area"
                             style={{width: "20%"}}>
                            {termDef["term"]}
                        </div>
                        <div className="view_only_card_sub_area"
                             style={{width: "60%", borderLeft: "2px solid grey"}}>
                            {termDef["definition"]}
                        </div>
                    </div>  
                ))}
            </div>
        )    
    }

    if (loading) {
        return (
            <>
                <Navbar logged_in={true} />
            </>
        )
    }

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
        <div className="page_content">

            <div style={{paddingBottom: "1em",
                         borderBottom: "2px solid black",
                         width: "100%",
                         display: "flex",
                         flexDirection: "row",
                         justifyContent: "space-between",
                         marginBottom: "2em"
                        }}>
                <h1 style={{ "margin": "0", maxWidth: "70%", wordWrap: "break-word", whiteSpace: "normal"}}>{studySetName}</h1>
                <motion.button className="small_button" whileHover={{scale: 1.1}} style={{height: "2.5em", minWidth: "8em"}}
                 onClick={() => {}}>
                    Edit this set
                </motion.button>
            </div>
            
            {getTermDefs()}
            
        </div>
        </>
    )
}

export default StudySet 