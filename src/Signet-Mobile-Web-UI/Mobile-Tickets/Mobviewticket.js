import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import Loading from '../../Pages/Widgets/Loading';
import { httpStatusCode } from '../../Constants/TextConstants';
import { Button, Form } from 'react-bootstrap';

import './Mobviewticket.css';

function Mobviewticket() {
    const { ticketId } = useParams();

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [ticket, setTicket] = useState('');

    const fetchTicketDetails = async () => {
        setIsLoading(true);
        const { 0: statusCode, 1: resp } = await makeRequest(`${APIUrlConstants.VIEW_TICKET}/${ticketId}`);
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
            setTicket(resp?.data[0]);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, []);

    return (
        <div className='wrapperTicket'>
            {isLoading && <Loading />}
            {!isLoading && (
                <div>
                    <Form>
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Description :</Form.Label>
                                <div
                                    className='textAlign'
                                    dangerouslySetInnerHTML={{ __html: ticket?.description }}
                                />
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Site Name :</Form.Label>
                                <div className="textAlign"> {ticket?.site} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Priority :</Form.Label>
                                <div className="textAlign"> {ticket?.priority} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Mobile Number :</Form.Label>
                                <div className="textAlign"> {ticket?.phoneNumber} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Assigned To :</Form.Label>
                                <div className="textAlign"> {ticket?.assignedTo} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Solution Provided :</Form.Label>
                                <div className="textAlign"> {ticket?.solutionProvided} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Client Email :</Form.Label>
                                <div className="textAlign"> {ticket?.callerEmail} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Created By :</Form.Label>
                                <div className="textAlign"> {ticket?.createdBy} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Created Date :</Form.Label>
                                <div className="textAlign"> {ticket?.createdDate} </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <div>
                                <Form.Label className="view-heading mx-3">Problem Code :</Form.Label>
                                <div className="textAlign"> {ticket?.problem} </div>
                            </div>
                        </Form.Group>
                        <hr />
                    </Form>
                    <div className='buttonAlign mb-2'>
                        <Button
                            className='backButton'
                            onClick={() => {
                                navigate("/mobtickets")
                            }}
                        >
                            Back
                        </Button>
                    </div>
                    <div className='editBtnBody'>
                        {(ticket?.callerEmail === localStorage.getItem('email')) &&
                            <Button
                                className='editButton'
                                onClick={() => {
                                    navigate(`/mobeditticket/${ticketId}`)
                                }}
                            >
                                Edit
                            </Button>
                        }
                    </div>
                </div>)}
        </div>
    );
}

export default Mobviewticket;