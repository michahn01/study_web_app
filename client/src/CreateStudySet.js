import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from "react-router-dom"
import "./css_animations/blob_decos.css"
import Navbar from "./Navbar.js"

const CreateStudySet = ({ editing_mode = false }) => {

    const [studySetFound, setStudySetFound] = useState(true)
    const location = useLocation();
    const path_parts = location.pathname.split('/').filter(item => item !== '');

    const [numCards, setNumCards] = useState(3);
    const navigate = useNavigate()

    const [studyset_id, setStudySetID] = useState("")
    useEffect(() => {
        if (editing_mode) {
            setStudySetID(path_parts[3]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    const sendDataToServer = () => {


        let studyset_name = document.querySelector(`.studyset_title_input`).value
        if (studyset_name === "") {
            studyset_name = "Untitled Study Set"
        }
        if (localStorage.getItem('token') === null) {
            return
        }

        const addTermsToServer = (id) => {
            console.log("adding terms to server")
            let termdefs = []
            for (let index = 0; index < numCards; ++index) {
                let term = document.querySelector(`#creation_card${index}term`).value
                let def = document.querySelector(`#creation_card${index}def`).value
                if (!(term === "" && def === "")) {
                    termdefs.push({ "term": term, "definition": def })
                }
            }
            console.log(termdefs)
            fetch(`http://127.0.0.1:5000/my-study-sets/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify({

                    "new_termdefs": termdefs

                })
            })
            .catch((error) => {
                console.error("Error: Could not add terms to studyset.")
            })
            .then(() => {
                navigate(`/my-study-sets/study-set/${id}`)
            })
        }
/// my-study-sets/<study_set_id>/all-termdefs
        if (!editing_mode) {
            fetch(`http://127.0.0.1:5000/my-study-sets`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify({

                    "studyset_name": studyset_name

                })
            })
            .then((response) => {
                return response.json();
            })
            .catch((error) => {
                console.error("Error: Could not initialize & create studyset.")
            })
            .then((data) => {
                addTermsToServer(data["studyset_id"])
            })
        }
        else {
            fetch(`http://127.0.0.1:5000/my-study-sets/${studyset_id}/all-termdefs`, {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                }
            })
            .then((response) => {
                return response.json();
            })
            .catch((error) => {
                console.error("Error: Could not bulk delete termDefs in studyset.")
            })
            .then((data) => {
                addTermsToServer(studyset_id)
            })
        }

    }

    const get_text_area = (index, type) => {
        return (
            <textarea
                className="auto-growing-textarea"
                rows={1}
                placeholder="Type something..."
                id={`creation_card${index}${type}`}

                onInput={() => {
                    let textarea = document.querySelector(`#creation_card${index}${type}`);
                    textarea.style.height = 'auto'; // Reset the height to get the actual scrollHeight
                    textarea.style.height = `${textarea.scrollHeight}px`; // Set the new height

                    // Scroll to the bottom when the textarea content exceeds the visible area
                    textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
                }}
            ></textarea>
        )
    }

    const get_cards = () => {
        let items = []
        for (let index = 0; index < numCards; ++index) {
            items.push(
                <div className="creation_card" key={index}>
                    <div style={{ marginBottom: "1em", width: "100%" }}>{index + 1}</div>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "0.3em", width: "40%" }}>
                        {get_text_area(index, "term")}
                        TERM
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "0.3em", width: "40%" }}>
                        {get_text_area(index, "def")}
                        DEFINITION
                    </div>
                </div>
            )
        }
        return items;
    }


    const AddNewCard = () => {
        setNumCards(numCards + 1)
    }

    useEffect(() => {
        if (!editing_mode) {
            return
        }
        fetch(`http://127.0.0.1:5000/my-study-sets/${path_parts[3]}`, {
            method: "GET",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            }
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data["message"] === "No StudySet found.") {
                    setStudySetFound(false);
                }
                else {
                    setStudySetFound(true);
                    document.querySelector(`.studyset_title_input`).value = data["StudySet Name"]
                    let termDefs = data["Terms in StudySet"]
                    setNumCards(termDefs.length)

                    return termDefs
                }
            })
            .then((termDefs) => {
                let termArea = document.querySelector(`#creation_card${termDefs.length - 1}term`);
                let defArea = document.querySelector(`#creation_card${termDefs.length - 1}def`);
                
                return new Promise((resolve) => {
                    function waitForElements() {
                        termArea = document.querySelector(`#creation_card${termDefs.length - 1}term`);
                        defArea = document.querySelector(`#creation_card${termDefs.length - 1}def`);
            
                        if (termArea && defArea) {
                            resolve(termDefs);
                        } else {
                            setTimeout(waitForElements, 100);
                        }
                    }
            
                    waitForElements();
                });
            })                             
            .then((termDefs) => {
                console.log("setting cards")
                for (let index = 0; index < termDefs.length; ++index) {
                    let termArea = document.querySelector(`#creation_card${index}term`)
                    termArea.value = termDefs[index]["term"]
                    termArea.style.height = `${termArea.scrollHeight}px`;
                    termArea.scrollTop = termArea.scrollHeight - termArea.clientHeight;

                    let defArea = document.querySelector(`#creation_card${index}def`)
                    defArea.value = termDefs[index]["definition"]
                    defArea.style.height = `${defArea.scrollHeight}px`;
                    defArea.scrollTop = defArea.scrollHeight - defArea.clientHeight;
                }
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    if (editing_mode && !studySetFound) {
        return (
            <>
                <Navbar logged_in={true} />
                <div className="page_content">
                    <h1>The study set or page you were looking for does not exist.</h1>
                    Maybe it was deleted, moved, or never existed in the first place.
                </div>
            </>
        )
    }


    return (
        <>
            <Navbar logged_in={true} />
            <div className="flush_left_column_page">


                <div style={{
                    width: "100%", display: "flex", flexDirection: "row",
                    alignItems: "center", justifyContent: "space-between",
                    marginBottom: "1em"
                }}>
                    <h1 style={{ margin: "0" }}>{editing_mode ? "Edit Study Set" : "Create a New Study Set"}</h1>

                    <motion.button className="small_button" whileHover={{ scale: 1.1 }}
                        onClick={sendDataToServer}>
                        {editing_mode ? "Done" : "Create"}
                    </motion.button>
                </div>
                <h3 style={{ "margin": "0" }}>Title</h3>
                <input type="text" className="studyset_title_input"
                    placeholder="Enter a title for your study set" />

                <h3 style={{ "margin": "0", "marginTop": "1.5em" }}>Cards</h3>
                <div style={{
                    paddingBottom: "1em",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "1.5em",
                    justifyContent: "space-between"
                }}>
                    {get_cards()}
                </div>

                <center style={{ width: "100%" }}>
                    <motion.button className="small_button" whileHover={{ scale: 1.1 }}
                        style={{
                            border: "2px solid green",
                            borderRadius: "5px"
                        }}
                        onClick={AddNewCard}>
                        Add a card
                    </motion.button>
                </center>


            </div>
        </>
    )
}

export default CreateStudySet 