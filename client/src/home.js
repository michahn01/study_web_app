import "./style.css"
import Navbar from "./Navbar.js"
import { useNavigate } from "react-router-dom"
const Home = () => {
    const navigate = useNavigate()
    return (
        <>
        <Navbar />
            <div className="main_content">
                <div className="homepage_left">
                    <div className="homepage_text">
                        <h1>Study using digital flashcards, anywhere. </h1>
                        <div style={{color: "grey"}}>
                        <p>Create flashcards that you can view, edit, and delete from
                        anywhere with your own user account. </p>
                        <p>Technologies used:</p>
                        </div>
                        
                        <ul className="checkmarks-list">
                            <li>RESTful API built using Python's Flask library.</li>
                            <li>SQLite for database.</li>
                            <li>Front end built with React.</li>
                            <li>Hosted on AWS, with Gunicorn serving the backend and NGINX 
                                handling reverse proxy.</li>
                            <li>Easy user registration and login using JSON web token (JWT) authentication.</li>
                        </ul>
                        <button onClick={() => {navigate("/register")}} className="get-started-button">Get Started</button>
                    </div>
                </div>
                <div className="homepage_right">
                    <div className="image-container">
                        <img src="homepage_img.png" id="homepage_img"></img>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;