import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom"
import "./css_animations/blob_decos.css"

const MyStudySets = () => {
    const [isLoading, setLoading] = useState(true);
    const [studySets, setStudySets] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        retrieveData();
    }, [])

    const retrieveData = () => {
        console.log("Retrieving Data")
        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`http://127.0.0.1:5000/my-study-sets`, {
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
                    <motion.button className="studySetButton" key={set["name"]} whileHover={{scale: 1.035}}>
                        {set["name"]}
                    </motion.button>
                ))}
            </div>
        )    
    }

    return (
        <div className="page_content">
            <div style={{paddingBottom: "1em",
                         borderBottom: "2px solid black",
                         width: "100%",
                         display: "flex",
                         flexDirection: "row",
                         justifyContent: "space-between"
                        }}>
                <h1 style={{margin: "0"}}>Your Study Sets</h1>
                <motion.button className="small_button" whileHover={{scale: 1.1}}
                 onClick={handleCreateStudySet}>
                    Create a Study Set
                </motion.button>
            </div>
            <UserStudySets />
        </div>
    )
}

export default MyStudySets 