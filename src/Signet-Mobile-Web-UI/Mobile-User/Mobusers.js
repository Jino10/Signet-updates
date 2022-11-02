import React, { useEffect, useState } from "react";
import { httpStatusCode, apiMethods } from "../../Constants/TextConstants";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { makeRequest, fetchCall } from "../../Services/APIService";
import Loading from "../../Pages/Widgets/Loading";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Alerts from "../../Pages/Widgets/Alerts";

import './Mobusers.css';

function Mobusers() {

    const [users, setUsers] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [variant, setVariant] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [firstIndex, setFirstIndex] = useState(0);
    const [lastIndex, setLastIndex] = useState(3);

    const closeAlert = () => setShowAlert(false);

    const navigate = useNavigate();

    const fetchAllUserDetails = async () => {
        setIsLoading(true);
        const { 0: statusCode, 1: data } = await makeRequest(APIUrlConstants.FETCH_USER_DETAILS);
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
        }
        setUsers(data?.data);
    }

    useEffect(() => {
        fetchAllUserDetails();
    }, []);

    const viewUser = (value) => {
        navigate(`/mobedituser/${value}`);
    }

    const deleteUser = async (value) => {
        sessionStorage.setItem('deleteUserActive', value.status);
        sessionStorage.setItem('deleteUserId', value.userId);
        setIsLoading(true);
        const id = sessionStorage.getItem('deleteUserId');
        const deleteUserStatus = sessionStorage.getItem('deleteUserActive');

        const dUser = {
            status: deleteUserStatus,
        };

        const { 0: statusCode, 1: responseData } = await fetchCall(`${APIUrlConstants.DELETE_USER}/${id}`, apiMethods.DELETE, dUser);
        if (statusCode === httpStatusCode.SUCCESS) {
            setShowAlert(true);
            setAlertMessage('Deleted successfully');
            setVariant('success');
            sessionStorage.removeItem('deleteUserActive');
            sessionStorage.removeItem('deleteUserId');
            setIsLoading(false);
            setTimeout(() => {
                setShowAlert(false);
                navigate('/mobusers');
            }, 5000)
        } else {
            setShowAlert(true);
            setVariant('danger');
            setAlertMessage('Something went wrong');
            setIsLoading(false);
            sessionStorage.removeItem('deleteUserActive');
            sessionStorage.removeItem('deleteUserId');
            setTimeout(() => {
                setShowAlert(false);
                navigate('/mobusers');
            }, 5000);
        }
    };

    const tokens = users.slice(firstIndex, lastIndex);

    const next = () => {
        setFirstIndex(firstIndex + 3);
        setLastIndex(lastIndex + 3);
    }

    const previous = () => {
        setFirstIndex(firstIndex - 3);
        setLastIndex(lastIndex - 3);
    }

    return (
        <div>
            {isLoading && <Loading />}
            {
                showAlert && (
                    <Alerts
                        variant={variant}
                        onClose={closeAlert}
                        alertshow={alertMessage}
                    />
                )
            }
            <div>
                {users &&
                    <div className="wrapperUsers">
                        {
                            tokens.map((user) =>
                                <div className="dataBody" key={user?.userId} value={user.userId} onClick={() => viewUser(user.userId)}>
                                    <p><span className="fieldHead">Name:</span><span>{user?.firstName}</span><span>{user?.lastName}</span></p>
                                    <p><span className="fieldHead">Email:</span><span>{user?.orgEmail}</span></p>
                                    <p><span className="fieldHead">Organization:</span><span>{user?.organization}</span></p>
                                    <p><span className="fieldHead">Phone Number:</span><span>{user?.mobileNumber}</span></p>
                                    <p><span className="fieldHead">Status:</span><span>{user?.status}</span></p>
                                    <span className="binBtn">
                                        <Button
                                            variant="link"
                                            onClick={() => deleteUser(user)}
                                            disabled={user.userId === localStorage.getItem('id')}
                                        >
                                            <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/bin.svg'} alt="Bin" />
                                        </Button>
                                    </span>
                                </div>
                            )
                        }
                    </div>
                }
                <div>
                    <Button className="plusButton"
                        onClick={() => {
                            navigate("/mobadduser");
                        }}
                    >
                        <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/plus.svg'} alt="" />
                    </Button>
                </div>
                <div className="arrowsBtn">
                    <Button className="saveBtn paginationButton" onClick={() => previous()}>
                        {'<'}
                    </Button>
                    <Button className="saveBtn paginationButton" onClick={() => next()}>
                        {'>'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Mobusers;