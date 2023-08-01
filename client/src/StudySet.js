import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom"
import "./css_animations/blob_decos.css"

const StudySet = () => {

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

export default StudySet 