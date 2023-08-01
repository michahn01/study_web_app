import "./style.css"
import Navbar from "./Navbar.js"
const Home = () => {

    return (
        <>
        <Navbar />
        <div className="main_content">
            <img id="bookshelf" src="bookshelf.webp" alt="Bookshelf"></img>
            <div id="about_description">
                <h1>Study efficiently using StudyCards.</h1>
            </div>
        </div>
        </>
    )
}

export default Home;