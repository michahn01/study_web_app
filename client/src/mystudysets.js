import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar.js"
import "./css_animations/blob_decos.css"

const MyStudySets = () => {
    const [isLoading, setLoading] = useState(true);
    const [studySets, setStudySets] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        retrieveData();
    }, [])


    const retrieveData = () => {
        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`/api/my-study-sets`, {
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
                setStudySets(data["StudySets"])
            })
        }
    }

    const handleCreateStudySet = () => {
        navigate('/create-study-set')
    }

    const UserStudySets = () => {
        if (isLoading) {
            return (
                <div>
                    Loading... please wait.
                </div>
            )
        }
        if (studySets.length === 0) {
            return (
                <div>
                
                    <center style={{paddingTop: "3em"}}><div className="gooey"></div></center>

                </div>
            )
        }
        return (
            <div className="studySetsBox">
                {studySets.map((set) => (
                    <motion.button className="studySetButton" key={set["id"]} whileHover={{scale: 1.035}}
                     onClick={() => {navigate(`/my-study-sets/study-set/${set["id"]}`)}}>
                        {set["name"]}
                    </motion.button>
                ))}
            </div>
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
                         marginBottom: "1em"
                        }}>
                <h1 style={{margin: "0"}}>Your Study Sets</h1>
                <motion.button className="small_button" whileHover={{scale: 1.1}}
                 onClick={handleCreateStudySet}>
                    Create a Study Set
                </motion.button>
            </div>
            <UserStudySets />
        </div>
        </>
    )
}

export default MyStudySets 