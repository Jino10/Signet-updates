import React, { useState, useEffect } from "react";
import { makeRequest } from '../../Services/APIService';
import { httpStatusCode } from '../../Constants/TextConstants';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { Alert, Button } from "react-bootstrap";
import Loading from "../../Pages/Widgets/Loading";
import { useNavigate } from "react-router-dom";

import './Mobtickets.css';

function Mobtickets() {
    const [userTicket, setUserTicket] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();
    const [firstIndex, setFirstIndex] = useState(0);
    const [lastIndex, setLastIndex] = useState(7);
    const [pageNo, setPageNo] = useState(1);
    const [sliceData, setSliceData] = useState([]);


    const closeAlert = () => setShowAlert(false);

    const fetchAllUserTickets = async () => {
        setIsLoading(true);
        const { 0: statusCode, 1: data } = await makeRequest(
            APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
        );
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
            setUserTicket(data?.data);
        } else {
            setShowAlert(true);
            setError(true);
            setAlertMessage(data?.message || 'Failed to fetch tickets');
            setIsLoading(false);
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        }
    };

    const ticketLength = userTicket.length;
    const totalPage = Math.ceil(ticketLength / 10);

    useEffect(() => {
        fetchAllUserTickets();
    }, []);

    const ticketView = (ticketNo) => {
        navigate(`/mobviewticket/${ticketNo}`);
    }

    const ticketData = userTicket.slice(firstIndex, lastIndex);

    const next = () => {
        setFirstIndex(firstIndex + 7);
        setLastIndex(lastIndex + 7);
    }

    const previous = () => {
        setFirstIndex(firstIndex - 7);
        setLastIndex(lastIndex - 7);
    }

    // For scrolling the data

    // const nextPage = () => {
    //     setTimeout(() => {
    //         if (pageNo <= totalPage) {
    //             setPageNo(pageNo + 1);
    //             setFirstIndex(firstIndex + 10);
    //             setLastIndex(lastIndex + 10);
    //             setIsLoading(false);
    //         }
    //     }, 2000);
    // }

    // window.addEventListener('scroll', () => {
    //     if (Math.ceil(document.documentElement.scrollHeight - window.innerHeight) === Math.ceil(window.scrollY)) {
    //         if (pageNo <= totalPage) {
    //             setIsLoading(true);
    //             nextPage();
    //         }
    //     }
    // });

    // useEffect(() => {
    //     if (userTicket.length > 10) {
    //         const ticketData = userTicket.slice(firstIndex, lastIndex);
    //         const temp = [...sliceData, ...ticketData];
    //         const setData = [...new Set(temp)];
    //         setSliceData(setData);
    //     } else {
    //         setSliceData(userTicket);
    //     }
    // }, [userTicket, firstIndex, lastIndex]);

    return (
        <div className="wrapperContents">
            {isLoading && <Loading />}
            {userTicket && (
                <div className="ticketsBody">
                    {
                        ticketData.map((tickets) =>
                            <div className="ticketContainer" key={tickets?.ticketNo} value={tickets?.ticketNo} onClick={() => ticketView(tickets?.ticketNo)}>
                                <p className="description px-3">{tickets?.description}</p>
                                <p className="px-3"><img className='tokenImage' src="/images/signetImage/ticket.png" alt="" class="pe-2 activeImg" /><span>{tickets?.ticketNo}</span></p>
                            </div>
                        )
                    }
                </div>
            )}
            {!isLoading &&
                (<div>
                    <Button className="plusButton"
                        onClick={() => {
                            navigate("/mobaddticket")
                        }}
                    >
                        <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/plus.svg'} alt="" />
                    </Button>
                </div>)}
            {!isLoading &&
                (<div className="arrowBtn">
                    <Button className="saveBtn paginationButton" onClick={() => previous()}>
                        {'<'}
                    </Button>
                    <Button className="saveBtn paginationButton" onClick={() => next()}>
                        {'>'}
                    </Button>
                </div>)}
            {
                showAlert && (
                    <Alert variant={!error ? 'success' : 'danger'} className="alertWrapper" onClick={closeAlert} dismissible>
                        <p>{alertMessage}</p>
                    </Alert>
                )
            }
        </div>
    );
}

export default Mobtickets;