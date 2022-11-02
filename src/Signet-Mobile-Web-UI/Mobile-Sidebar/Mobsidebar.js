import React, { useEffect, useState } from "react";
import { userRoleId } from "../../Utilities/AppUtilities";
import { Nav, Col } from 'react-bootstrap';
import useAnalyticsEventTracker from "../../Hooks/useAnalyticsEventTracker";
import { useNavigate } from "react-router-dom";
import { gaEvents, apiMethods, httpStatusCode } from "../../Constants/TextConstants";
import Loading from "../../Pages/Widgets/Loading";
import { useOktaAuth } from '@okta/okta-react';
import Alerts from "../../Pages/Widgets/Alerts";
import { fetchCall } from "../../Services/APIService";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { useTheme, useThemeUpdate } from "../../Context/MenuContext";

import './Mobsidebar.css';

function Mobsidebar() {
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertVarient, setAlertVarient] = useState('');
    const [unseenNotification, setUnseenNotification] = useState('');

    const sidebarOpen = useTheme();
    const toggleMenu = useThemeUpdate();
    const role = localStorage.getItem('roleId');
    const userEmail = localStorage.getItem('email');
    const userFirst = localStorage.getItem('firstName');
    const userLast = localStorage.getItem('lastName');
    const organizationName = localStorage.getItem('orgName');
    const { linkTracker, buttonTracker } = useAnalyticsEventTracker();
    const navigate = useNavigate();
    const { oktaAuth } = useOktaAuth();

    const alertCommand = (message, varient) => {
        setAlertMessage(message);
        setAlertVarient(varient);
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    };

    const Logout = async () => {
        setIsLoading(true);
        buttonTracker(gaEvents.USER_LOGOUT);
        const urlencoded = new URLSearchParams();
        urlencoded.append('userId', localStorage.getItem('id'));
        urlencoded.append('isSocial', localStorage.getItem('isSocial'));
        const [statusCode, response] = await fetchCall(APIUrlConstants.LOGOUT_API, apiMethods.POST, urlencoded);
        if (statusCode === 200) {
            oktaAuth.tokenManager.clear();
            localStorage.clear();
            window.fcWidget.destroy();
            window.location.href = '/';
            setIsLoading(false);
        } else {
            alertCommand(response.errorMessage || 'Log out failed, Try again', 'danger');
            setIsLoading(false);
        }
    };

    const fetchNotifications = async () => {
        const [statusCode, response] = await fetchCall(APIUrlConstants.LIST_NOTIFICATIONS, apiMethods.POST, {
            userId: localStorage.getItem('id'),
            orgName: organizationName,
        });
        if (statusCode === httpStatusCode.SUCCESS) {
            setUnseenNotification(response?.data?.unSeenList);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unSeenData = unseenNotification.length;

    return (
        <div className="sideBody">
            {isLoading && <Loading />}
            {showAlert && (
                <Alerts
                    varient={alertVarient}
                    onClose={() => setShowAlert(false)}
                    alertshow={alertMessage}
                />
            )}
            <Col lg={3} md={4} sm={4} className={'sidebarBox ' + (sidebarOpen ? 'showSidebar' : 'hideSidebar')}>
                <div className="signetBody">
                    <img src="images/signetImage/signet.png" alt="" className="signetImg" />
                    <p className="nameSignet"><span>{userFirst}</span><span>{userLast}</span></p>
                    <p className="nameSignet">{userEmail}</p>
                </div>
                <div className="sideWrap flex-column d-flex align-items-center justify-content-between">
                    <Nav>
                        {role === userRoleId.signetAdmin && (
                            <div>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_USERS);
                                        navigate('/mobusers');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/users.png" alt='' className="pe-3" />
                                    Users
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_PROFILE);
                                        navigate('/mobprofile');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/profile.png" alt='' className="pe-3" />
                                    Profile
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={Logout}
                                >
                                    <img src="images/signetImage/logout.png" alt='' className="pe-3" />
                                    Logout
                                </Nav.Link>
                            </div>
                        )}

                        {role === userRoleId.remoteSmartUser && (
                            <div>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_TICKETS);
                                        navigate('/mobtickets');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/token.png" alt='' className="pe-3" />
                                    Tickets
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_DASHBOARD);
                                        navigate('/mobdashboard');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/dashboard.png" alt='' className="pe-3" />
                                    Dashboard
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_NOTIFICATION);
                                        navigate('/mobnotification');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/bell.png" alt='' className="pe-3" />
                                    Notifications
                                    <span className="ps-5">{unSeenData}</span>
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_PROFILE);
                                        navigate('/mobprofile');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/profile.png" alt='' className="pe-3" />
                                    Profile
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={Logout}
                                >
                                    <img src="images/signetImage/logout.png" alt='' className="pe-3" />
                                    Logout
                                </Nav.Link>
                            </div>)}
                        {role === userRoleId.nonRemoteSmartUser && (
                            <div>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_TICKETS);
                                        navigate('/mobtickets');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/token.png" alt='' className="pe-3" />
                                    Tickets
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_DASHBOARD);
                                        navigate('/mobdashboard');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/dashboard.png" alt='' className="pe-3" />
                                    Dashboard
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_NOTIFICATION);
                                        navigate('/mobnotification');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/bell.png" alt='' className="pe-3" />
                                    Notifications
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={() => {
                                        linkTracker(gaEvents.NAVIGATE_MOB_PROFILE);
                                        navigate('/mobprofile');
                                        toggleMenu();
                                    }}
                                >
                                    <img src="images/signetImage/profile.png" alt='' className="pe-3" />
                                    Profile
                                </Nav.Link>
                                <Nav.Link
                                    className="pe-0 ps-2"
                                    onClick={Logout}
                                >
                                    <img src="images/signetImage/logout.png" alt='' className="pe-3" />
                                    Logout
                                </Nav.Link>
                            </div>)}
                    </Nav>
                </div>
            </Col>
        </div>
    );
}

export default Mobsidebar;