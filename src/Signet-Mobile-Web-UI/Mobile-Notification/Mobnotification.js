import React, { useState, useEffect } from "react";
import Loading from "../../Pages/Widgets/Loading";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { fetchCall } from "../../Services/APIService";
import { apiMethods, httpStatusCode } from "../../Constants/TextConstants";
import Alerts from "../../Pages/Widgets/Alerts";
import { Button } from "react-bootstrap";

import './Mobnotification.css';

function Mobnotification() {
    const [notifications, setNotifications] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [firstPage, setFirstPage] = useState(false);
    const [lastPage, setLastPage] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [variant, setVariant] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const closeAlert = () => setShowAlert(false);

    const fetchNotifications = async (pageNo) => {
        setIsLoading(true);
        const [statusCode, response] = await fetchCall(APIUrlConstants.VIEW_ALL_NOTIFICATIONS, apiMethods.POST, {
            userId: localStorage.getItem('id'),
            orgName: localStorage.getItem('orgName'),
            page: pageNo,
            pageSize: 10,
            status: 'All',
        });
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
            setPageNumber(pageNo);
            setNotifications(response?.data?.content);
            setFirstPage(response?.data?.first);
            setLastPage(response?.data?.last);
        } else {
            setIsLoading(false);
            setShowAlert(true);
            setVariant('danger');
            setAlertMessage('Something went wrong');
        }
    }

    useEffect(() => {
        fetchNotifications(pageNumber);
    }, []);

    const next = () => {
        const nextPageNumber = pageNumber + 1;
        fetchNotifications(nextPageNumber);
    };

    const previous = () => {
        const previousPageNumber = pageNumber - 1;
        fetchNotifications(previousPageNumber);
    };

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
                {notifications &&
                    (<div className="wrapperNotify">
                        {notifications.map((i) => (
                            <div className="notifyBody" key={i.id}>
                                <span />
                                <div className="notifyBodyInfo">
                                    <div dangerouslySetInnerHTML={{ __html: i.notificationMessage }} />
                                </div>
                            </div>
                        ))}
                    </div>)
                }
            </div>
            <div className="pagination">
                <Button className="saveBtn paginationButton" disabled={firstPage} onClick={() => previous()}>
                    {'<'}
                </Button>
                <Button className="saveBtn paginationButton" disabled={lastPage} onClick={() => next()}>
                    {'>'}
                </Button>
            </div>
        </div>
    );
}

export default Mobnotification;