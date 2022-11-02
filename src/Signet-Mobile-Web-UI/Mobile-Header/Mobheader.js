import React, { useEffect, useState } from "react";
import { useThemeUpdate, useTheme } from "../../Context/MenuContext";

import './Mobheader.css';

function Mobheader() {
    const toggleMenu = useThemeUpdate();
    const sidebarOpen = useTheme();
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (window.location.pathname === '/mobtickets') {
            setTitle('Tickets');
        } else if (window.location.pathname === '/mobdashboard') {
            setTitle('Dashboard');
        } else if (window.location.pathname === '/mobnotification') {
            setTitle('Notification');
        } else if (window.location.pathname === '/mobprofile') {
            setTitle('Profile');
        } else if (window.location.pathname === '/mobusers') {
            setTitle('Users');
        }
    }, [window.location.pathname]);

    return (
        <div>
            <div className="headerBlock">
                {!sidebarOpen ?
                    (<img
                        className="menuBtn"
                        src={process.env.REACT_APP_PUBLIC_URL + 'images/header/menu.svg'}
                        aria-hidden="true"
                        alt=""
                        onClick={toggleMenu}
                    />) :
                    (
                        <img src="images/signetImage/close.png"
                            alt=""
                            className="menuBtn"
                            onClick={toggleMenu}
                        />
                    )}
                <h4 className="headTitle">{title}</h4>
            </div>
        </div>
    );
}

export default Mobheader;