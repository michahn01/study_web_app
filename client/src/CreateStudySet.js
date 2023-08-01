import "./style.css"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom"
import "./css_animations/blob_decos.css"
import Navbar from "./Navbar.js"

const MyStudySets = () => {
    const [isLoading, setLoading] = useState(true);
    const [numCards, setNumCards] = useState(3);
    const navigate = useNavigate()

    const sendDataToServer = () => {
        let studyset_name = document.querySelector(`.studyset_title_input`).value
        if (studyset_name === "") {
            studyset_name = "Untitled Study Set"
        }
        if (localStorage.getItem('token') === null) {
            setLoading(false);
        }
        else {
            fetch(`http://127.0.0.1:5000/my-study-sets`, {
                method: 'POST',
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
                let termdefs = []
                for (let index = 0; index < numCards; ++index) {
                    let term = document.querySelector(`#creation_card${index}term`).value
                    let def = document.querySelector(`#creation_card${index}def`).value
                    if (!(term === "" && def === "")) {
                        termdefs.push({"term": term, "definition": def})
                    }
                }
                fetch(`http://127.0.0.1:5000/my-study-sets/${data["studyset_id"]}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({

                        "new_termdefs": termdefs

                    })
                })
            })
            .catch((error) => {
                console.error("Error: Could not add terms to newly created studyset.")
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

    return (
        <>
        <Navbar logged_in={true} />
        <div className="create_studyset_page">
            

            <div style={{
                width: "100%", display: "flex", flexDirection: "row",
                alignItems: "center", justifyContent: "space-between",
                marginBottom: "1em"
            }}>
                <h1 style={{ margin: "0" }}>Create a New Study Set</h1>
                <motion.button className="small_button" whileHover={{ scale: 1.1 }} onClick={sendDataToServer}>
                    Create
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

export default MyStudySets 