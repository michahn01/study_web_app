import "./style.css"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from "react-router-dom"
import "./css_animations/blob_decos.css"
import Navbar from "./Navbar.js"


// "editing_mode" indicates that the user is editing a set that had already been
// created rather than creating a new set from scratch.
const CreateStudySet = ({ editing_mode = true }) => {
    const navigate = useNavigate()

    // If in editing mode, the first necessary step is to retrieve information about the set
    // being edited from the server. The following state is to check whether the set being
    // edited even exists.
    const [studySetFound, setStudySetFound] = useState(true)

    // If in editing mode, the ID of the set to be edited will be determined using the path of
    // request.
    const location = useLocation();
    const path_parts = location.pathname.split('/').filter(item => item !== '');
    const [studyset_id, setStudySetID] = useState("")

    // Set-ups that need to be done as soon as the page is loaded if the page is in
    // editing_mode.
    useEffect(() => {
        if (!editing_mode) {
            return
        }
        // set the ID of the set based on the frontend request path.
        setStudySetID(path_parts[2]);

        // determine the term-definition pairs of the set by fetching them from the server.
        fetch(`http://127.0.0.1:5000/api/my-study-sets/${path_parts[2]}`, {
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
                throw new Error("No StudySet found.");
            }
            else {
                setStudySetFound(true);
                document.querySelector(`.studyset_title_input`).value = data["StudySet Name"]
                let termDefs = data["Terms in StudySet"]

                // set the number of "cards" (flashcard-like display objects)
                // in the set to the number of term-def pairs.
                // Every render, the CreateStudySet component will create numCards number of 
                // cards on the user's screen.
                setNumCards(termDefs.length)

                return termDefs
            }
        })
        .then((termDefs) => {
            // the purpose of this clause is to wait for all numCards
            // number of cards have been created and rendered before
            // moving on to the next "then" clause

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
            // populate the created cards on screen with the actual termDefs retrieved from
            // the server
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
        .catch((error) => {
            console.log(error)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    // A state to keep track of the number of termsDefs (which will be referred to as 'cards' on
    // the frontend, because they're displayed as cards on the user screen) being created or
    // modified.
    const [numCards, setNumCards] = useState(editing_mode ? 0 : 3);

    // The indices of the terms that have been deleted by the user and won't be added to the database.
    // These are still counted in numCards, but they will be skipped when sending data to server.
    const [deletedIndices, setDeletedIndices] = useState([]);


    // the function to be called when the final button ("create" if creating studyset for the first
    // time and "done" if editing preexisting study set). Will send data to server and appropriately
    // create or update termDefs in set.
    const sendDataToServer = () => {

        // retrieve the name of the studyset (perhaps modified) from the title input field.
        let studyset_name = document.querySelector(`.studyset_title_input`).value
        if (studyset_name === "") {
            studyset_name = "Untitled Study Set"
        }

        // if somehow token is missing, do not proceed further (ideally, this should never happen).
        if (localStorage.getItem('token') === null) {
            return
        }

        // what to do if creating studyset for the first time
        if (!editing_mode) {
            // request to CREATE a new empty studyset
            fetch(`http://127.0.0.1:5000/api/my-study-sets`, {
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
                throw new Error("Error: Could not initialize & create studyset.")
            })
            .then((data) => {
                let termdefs = []
                for (let index = 0; index < numCards; ++index) {
                    if (deletedIndices.includes(index)) {
                        continue;
                    }
                    let term = document.querySelector(`#creation_card${index}term`).value
                    let def = document.querySelector(`#creation_card${index}def`).value
                    if (!(term === "" && def === "")) {
                        termdefs.push({ "term": term, "definition": def })
                    }
                }
                // request to POPULATE the created studyset
                fetch(`http://127.0.0.1:5000/api/my-study-sets/${data["studyset_id"]}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
    
                        "new_termdefs": termdefs
    
                    })
                })
                .then(() => {
                    // navigate to the newly created set
                    navigate(`/my-study-sets/study-set/${data["studyset_id"]}`)
                })
                .catch((error) => {
                    throw new Error("Error: Could not add terms to studyset.")
                })
            })
            .catch((error) => {
                console.log(error)
            })
        }
        // what to do if in editing_mode
        else {
            let termdefs = []
            for (let index = 0; index < numCards; ++index) {
                if (deletedIndices.includes(index)) {
                    continue;
                }
                let term = document.querySelector(`#creation_card${index}term`).value
                let def = document.querySelector(`#creation_card${index}def`).value
                if (!(term === "" && def === "")) {
                    termdefs.push({ "term": term, "definition": def })
                }
            }
            // bulk-edit the terms in the studyset
            fetch(`http://127.0.0.1:5000/api/my-study-sets/${studyset_id}/all-contents`, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
    
                    "new_termdefs": termdefs,
                    "new_name": studyset_name

                })
            })
            .catch((error) => {
                throw new Error("Error: Could not bulk edit termDefs in studyset.")
            })
            .then((response) => {
                return response.json();
            })
            .then(() => {
                navigate(`/my-study-sets/study-set/${studyset_id}`)
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    // a helper function for getting an auto-growing textarea. Will be used inside
    // every "card", where each term-definition pair of the study set will be displayed.
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

    // a helper function for getting all cards (displaying term-def pairs) at once for the set.
    const get_cards = () => {
        let items = []
        let display_index = 1;
        for (let index = 0; index < numCards; ++index) {
            if (deletedIndices.includes(index)) {
                continue;
            }
            items.push(
                <div className="creation_card" key={index}>
                    <div style={{ marginBottom: "1em", width: "100%" }}>{display_index}</div>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "0.3em", width: "40%" }}>
                        {get_text_area(index, "term")}
                        TERM
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "0.3em", width: "40%" }}>
                        {get_text_area(index, "def")}
                        DEFINITION
                    </div>
                    <motion.img className="trashBinIcon" src="/trash-can.png" whileHover={{ scale: 1.1 }}
                     onClick={() => {deleteCard(index)}}></motion.img>
                </div>
            )
            display_index = display_index + 1;
        }
        return items;
    }


    const addNewCard = () => {
        setNumCards(numCards + 1)
    }

    const deleteCard = (index) => {
        setDeletedIndices([...deletedIndices, index])
    }

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
                        onClick={addNewCard}>
                        Add a card
                    </motion.button>
                </center>


            </div>
        </>
    )
}

export default CreateStudySet 