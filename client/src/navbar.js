import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import "./navbar.css";

const Navbar = ({logged_in = false}) => {
    const location = useLocation();
    const path_parts = location.pathname.split('/').filter(item => item !== '');

    if (logged_in) {
        return (
            <div className="topnav">
            <Link id="navbar_title" to="/my-study-sets">
                <motion.div whileHover={{scale: 1.3}}>
                    StudyCards
                </motion.div>
            </Link>
            
            <Link className="navbar_option" to="/my-study-sets">
                <motion.div className="motiondiv" animate={{ opacity: location.pathname==="/my-study-sets" ? 1 : .5}}>
                    My Study Sets
                    <div className="underline"></div>
                </motion.div>
            </Link>

            <Link className="navbar_option" to="/login">
                <motion.div animate={{ opacity: location.pathname==="/login" ? 1 : .5}}>
                    Log Out
                    <div className="underline"></div>
                </motion.div>
            </Link>
            </div>
        )
    }
    return (
        <div className="topnav">
            <Link id="navbar_title" to="/">
                <motion.div whileHover={{scale: 1.3}}>
                 StudyCards
                </motion.div>
            </Link>
            
            <Link className="navbar_option" to="/login">
                <motion.div className="motiondiv" animate={{ opacity: location.pathname==="/login" ? 1 : .5}}>
                    Login
                    <div className="underline"></div>
                </motion.div>
            </Link>

            <Link className="navbar_option" to="/register">
                <motion.div animate={{ opacity: location.pathname==="/register" ? 1 : .5}}>
                    Sign up
                    <div className="underline"></div>
                </motion.div>
            </Link>
        </div>
    )
}

export default Navbar