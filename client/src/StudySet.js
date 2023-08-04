import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "./Navbar.js"
import "./css_animations/blob_decos.css"


const DeletePopup = ({ isVisible, onDelete, onCancel }) => {
    if (!isVisible) return null;
  
    return (
      <div className="popup-wrapper">
        <div className="popup">
          <h1>This action cannot be undone.</h1>
          <p>You will never be able to access this set and its data. Are you sure you want to delete it?</p>
          <div className="buttons">
            <button className="delete-button" onClick={onDelete}>Yes, delete set</button>
            <button className="cancel-button" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };
  
const StudySet = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true);
    const [ studySetName, setStudySetName] = useState("");
    const [ termDefs, setTermDefs] = useState([]);
    const [ studySetFound, setStudySetFound ] = useState(true);
    const [ deletePopUpVisible, setDeletePopUpVisible ] = useState(false);
    const path_parts = location.pathname.split('/').filter(item => item !== '');

    if (path_parts[0] !== "my-study-sets") {
        navigate("/error")
    }
    if (path_parts[1] !== "study-set") {
        navigate("/error")
    }

    const studyset_id = path_parts[2]


    const handleDeleteStudySet = () => {
        setDeletePopUpVisible(false);
        fetch(`/api/my-study-sets/${studyset_id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            }
        })
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.hasOwnProperty("message")) {
                if (data["message"] !== "StudySet deleted") {
                    throw new Error(data["message"])
                }
            }
            setLoading(false)
        })
        .then(() => {
            navigate("/my-study-sets")
        })
        .catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        console.log("Retrieving Data")
        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`/api/my-study-sets/${studyset_id}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
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
                <h2 style={{margin: "0"}}>Terms in this set</h2>
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
                         marginBottom: "1.5em",
                         rowGap: "1em",
                         flexWrap: "wrap"
                        }}>
                <h1 style={{ "margin": "0", maxWidth: "70%", wordWrap: "break-word", whiteSpace: "normal"}}>{studySetName}</h1>

                <div style={{height: "100%", display: "flex", flexDirection: "row", alignItems: "center", columnGap: "1em"}}>
                <motion.img className="trashBinIcon" src="/trash-can.png" whileHover={{ scale: 1.1 }}
                     onClick={() => {setDeletePopUpVisible(true)}}>
                </motion.img>
                <motion.button className="turqoise_button" whileHover={{scale: 1.05}} style={{minWidth: "7.2em"}}
                 onClick={() => {navigate(`/my-study-sets/study-set/${studyset_id}/edit`)}}>
                    Edit this set
                </motion.button>
                {termDefs.length !== 0 ?
                <motion.button className="turqoise_button" whileHover={{scale: 1.05}} style={{minWidth: "7em"}}
                 onClick={() => {navigate(`/my-study-sets/study-set/${studyset_id}/flashcards`)}}>
                    Flashcards
                </motion.button> : <></>}
                </div>

            </div>
            
            {getTermDefs()}
            
        </div>
        <DeletePopup isVisible={deletePopUpVisible} onDelete={handleDeleteStudySet} onCancel={() => {setDeletePopUpVisible(false)}}/>
        </>
    )
}

export default StudySet 