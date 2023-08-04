import Navbar from "./Navbar.js"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import "./style.css"


const FlashCards = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true);
    const [ studySetName, setStudySetName] = useState("");
    const [ termDefs, setTermDefs] = useState([]);
    const [ studySetFound, setStudySetFound ] = useState(true);
    const [ studySetID, setStudySetID ] = useState("");
    const [ indices, setIndices ] = useState([])
    const [ currentIndex, setCurrentIndex ] = useState(0)
    const [ cardPos, setCardPos ] = useState(0);
    const [ shuffleButtonText, setShuffleButtonText ] = useState("shuffle")

    const ProgressBar = ({ length, index }) => {
        const progressPercentage = (index / length) * 100;
        
        return (
            <div className="flashcards_progress_bar">
            <div
                style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: '#4caf50'
                }}
            />
            </div>
        );
    };


    function Card({index=0}) {
        const [rotation, setRotation] = useState(0);
    
        const handleFlip = () => {
            if (rotation === 0) {
                setRotation(180)
            }
            else if (rotation === 180) {
                setRotation(0)
            }
        };
    
        return (
            <div 
            className="card" 
            onClick={handleFlip}
            style={{ transform: `rotateX(${rotation}deg)` }}
            >
                <div className="card_face card_front">
                    {termDefs[indices[currentIndex]]["term"]}
                </div>
                <div className="card_face card_back">
                    {termDefs[indices[currentIndex]]["definition"]}
                </div>
            </div>
        );
    }

    useEffect(() => {
        const path_parts = location.pathname.split('/').filter(item => item !== '');
        if (path_parts[0] !== "my-study-sets") {
            navigate("/error")
        }
        if (path_parts[1] !== "study-set") {
            navigate("/error")
        }
        const studyset_id = path_parts[2]
        setStudySetID(studyset_id)
        

        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`http://127.0.0.1:5000/api/my-study-sets/${studyset_id}`, {
                method: "GET",
                mode: 'cors',
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
                    if (data["Terms in StudySet"].length === 0) {
                        navigate(`/my-study-sets/study-set/${studyset_id}`)
                    }
                    setIndices(Array.from({ length: data["Terms in StudySet"].length }, (_, index) => index))
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    useEffect(() => {
        if (cardPos === 0) {
            return;
        }
        // console.log(cardPos);
        setTimeout(() => {
            setCardPos(0);
        }, 100); 
    }, [cardPos])

    const handleIndexChange = (x) => {
        if ((currentIndex === 0 && x === -1) || 
            (currentIndex === (indices.length - 1) && x === 1)) {
            return;
        }
        setCurrentIndex(currentIndex + x);
        setCardPos(x)
    }

    const handleShuffle = () => {
        if (shuffleButtonText === "unshuffle") {
            setShuffleButtonText("shuffle")
            setIndices(Array.from({ length: indices.length }, (_, index) => index))
            // console.log(indices)
            return
        }
        let shuffled = indices;
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setIndices(shuffled);
        console.log(indices)
        setShuffleButtonText("unshuffle")
    }

    if (loading) {
        return (
            <>
            <Navbar logged_in={true} />
            <div className="page_content">
                Loading...
            </div>
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

            <div className="page_content" style={{marginTop: "7em"}}>

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
                </div>

            </div>

            <motion.div
                className="card_container"
                style={{ opacity: (cardPos === 0) ? 1 : 0 }} // Set the opacity based on the showCard state
                initial={{ x: '0%' }} // Initial position of the Card (off the screen to the right)
                animate={{ x: `${cardPos*25}%` }} // Animation to slide in from right and fade in
                transition={{ duration: 0.1 }} // Adjust the duration of the animation to your preference
            >
                <Card />
            </motion.div>


            <div className="menu-bar">
                <button className="left-button" onClick={() => {navigate(`/my-study-sets/study-set/${studySetID}`)}}>
                    Back to Set</button>
                <div className="center-buttons">
                    <button className="center-button" onClick={() => {handleIndexChange(-1)}}>Prev</button>
                    <button className="center-button" onClick={() => {handleIndexChange(1)}}>Next</button>
                </div>
                <button className="right-button" onClick={handleShuffle}>{shuffleButtonText}</button>
            </div>

                <ProgressBar length={indices.length} index={currentIndex + 1} />
                {currentIndex===0 ? <center style={{paddingTop: "1em", width: "100%", color: "green"}}>
                Click the card to flip</center> : <></>}
            </div>


        </>
    ) 
}

export default FlashCards