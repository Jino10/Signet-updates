import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../Pages/Widgets/Loading";
import Alerts from "../../Pages/Widgets/Alerts";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { makeRequest, fetchCall } from "../../Services/APIService";
import { Button, Form } from "react-bootstrap";
import Select from 'react-select';
import { httpStatusCode, apiMethods } from "../../Constants/TextConstants";

import './Mobeditticket.css';

function Mobeditticket() {
    const { ticketId } = useParams();

    const [priority, setPriority] = useState('');
    const [problemCode, setProblemCode] = useState('');
    const [siteList, setSiteList] = useState('');
    const [optionSite, setOptionSite] = useState('');
    const [optionPriority, setOptionPriority] = useState('');
    const [optionProblemCode, setOptionProblemCode] = useState('');
    const [validated, setValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertShow, setAlertShow] = useState(false);
    const [addDescription, setAddDescription] = useState('');
    const [error, setError] = useState(false);
    const [estDate, setEstDate] = useState('');
    const [estTime, setEstTime] = useState('');
    const [desc, setDesc] = useState('');
    const [ticketDetails, setTicketDetails] = useState({
        assignedTo: '',
        customerId: localStorage.getItem('orgNo'),
        site: '',
        createdBy: localStorage.getItem('firstName') + '' + localStorage.getItem('lastName'),
        createdDate: '',
        phoneNumber: localStorage.getItem('mobile'),
        status: '',
        requestType: '',
        problem: '',
        description: '',
        callerEmail: localStorage.getItem('email'),
        priority: '',
        solutionProvided: '',
        ticketNo: '',
    });

    const navigate = useNavigate();

    const closeAlert = () => setAlertShow(false);

    const fetchPromise = async () => {
        setIsLoading(true);
        const Site = [];
        const Priority = [];
        const ProblemCode = [];
        const fetchSitelist = await makeRequest(`${APIUrlConstants.LIST_SITES}?customerNo=${localStorage.getItem('orgNo')}`);
        setSiteList(fetchSitelist[1]?.data.forEach((i) => {
            Site.push({ value: i.siteNo, label: i.siteName });
        }));
        setOptionSite(Site);
        const fetchPriority = await makeRequest(APIUrlConstants.LIST_PRIORITY);
        setPriority(fetchPriority[1]?.data.forEach((i) => {
            Priority.push({ value: i, label: i });
        }));
        setOptionPriority(Priority);
        const fetchProblemcode = await makeRequest(APIUrlConstants.LIST_PROBLEM_CODE);
        setProblemCode(fetchProblemcode[1]?.data.forEach((i) => {
            ProblemCode.push({ value: i, label: i });
        }));
        setOptionProblemCode(ProblemCode);
        const fetchTicketView = await makeRequest(`${APIUrlConstants.VIEW_TICKET}/${ticketId}`);
        setDesc(fetchTicketView[1]?.data[0]?.description);
        setTicketDetails((prev) => {
            const Current = { ...prev };
            Current.requestType = fetchTicketView[1]?.data[0]?.requestType;
            Current.description = fetchTicketView[1]?.data[0]?.description;
            Current.phoneNumber = fetchTicketView[1]?.data[0]?.phoneNumber;
            Current.priority = fetchTicketView[1]?.data[0]?.priority;
            Current.status = fetchTicketView[1]?.data[0]?.status;
            Current.callerEmail = fetchTicketView[1]?.data[0]?.callerEmail;
            Current.solutionProvided = fetchTicketView[1]?.data[0]?.solutionProvided;
            Current.problem = fetchTicketView[1]?.data[0]?.problem;
            Current.ticketNo = fetchTicketView[1]?.data[0]?.ticketNo;
            Current.createdBy = fetchTicketView[1]?.data[0]?.createdBy;
            Current.createdDate = fetchTicketView[1]?.data[0]?.createdDate;
            Current.assignedTo = fetchTicketView[1]?.data[0]?.assignedTo;
            Current.site = fetchTicketView[1]?.data[0]?.site;
            return Current;
        })
        setIsLoading(false);
    }

    useEffect(() => {
        fetchPromise();
    }, []);

    const handleSite = (value) => {
        setTicketDetails({ ...ticketDetails, site: value.value });
    }

    const handlePriority = (value) => {
        setTicketDetails({ ...ticketDetails, priority: value.value });
    }

    const handleProblemCode = (value) => {
        setTicketDetails({ ...ticketDetails, problem: value.value });
    }

    const additionalDesc = (e) => {
        setAddDescription(e.target.value);
    }

    useEffect(() => {
        const date = new Date();
        const dateZone = date.toLocaleDateString('en-US', {
            timeZone: 'America/New_York',
        });
        const timeZone = date.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
        });
        const [month, day, year] = dateZone.split('/');
        const result = `${year}:${month}:${day}`;

        setEstDate(result);
        setEstTime(timeZone);
    }, []);

    const saveTicket = async () => {
        setIsLoading(true);
        setTicketDetails({ ...ticketDetails, ticketNo: ticketId, description: desc + '<br/>' + estDate + '<br/>' + addDescription + '<br/>' + estTime });
        delete ticketDetails.assignedTo;
        delete ticketDetails.solutionProvided;
        delete ticketDetails.createdDate;
        const ticketObject = { ...ticketDetails };
        const { 0: status, 1: data, 2: message } = await fetchCall(APIUrlConstants.CREATE_TICKET, apiMethods.POST, ticketObject);
        const statusCode = status;
        const responseData = data;

        if (statusCode === httpStatusCode.SUCCESS) {
            setAlertShow(true);
            setError(true);
            setAlertMessage(message);
            setIsLoading(false);
            setTimeout(() => {
                setAlertShow(false);
                navigate('/mobtickets');
            }, 5000);
        } else {
            setAlertShow(true);
            setError(false);
            setAlertMessage(responseData.message ?? 'Something went wrong');
            setIsLoading(false);
            setTimeout(() => {
                setAlertShow(false);
                navigate('/mobtickets');
            }, 5000);
        }
    }

    return (
        <div>
            {isLoading && <Loading />}
            {alertShow && (
                <Alerts
                    variant={!error ? 'danger' : 'success'}
                    onClose={closeAlert}
                    alertshow={alertMessage}
                />
            )}
            <div className="editBody">
                <Form noValidate validated={validated}>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Description
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                className='descriptionField'
                                placeholder="Enter description"
                                required
                                name="description"
                                value={ticketDetails?.description}
                                disabled
                            />
                            <Form.Control.Feedback type="invalid">Description is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Additional Details <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                className='descriptionField'
                                placeholder="Enter additional description"
                                required
                                name="additional description"
                                onChange={additionalDesc}
                            />
                            <Form.Control.Feedback type="invalid">Additional description is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group controlId="siteName" className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Site Name <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Select
                                required
                                options={optionSite}
                                className='siteField'
                                data-testid="siteName"
                                onChange={handleSite}
                                placeholder={ticketDetails?.site}
                                value={ticketDetails?.site}
                            />
                            <Form.Control.Feedback type="invalid">Site Name is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group controlId="priority" className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Priority<span className="requiredTxt">*</span>
                            </Form.Label>
                            <Select
                                options={optionPriority}
                                className='priorityField'
                                data-testid="priority"
                                onChange={handlePriority}
                                value={ticketDetails?.priority}
                                placeholder={ticketDetails?.priority}
                            />
                            <Form.Control.Feedback type="invalid">Priority field is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Problem Code<span className="requiredTxt">*</span>
                            </Form.Label>
                            <Select
                                options={optionProblemCode}
                                className='problemField'
                                data-testid="problemCode"
                                onChange={handleProblemCode}
                                value={ticketDetails?.problem}
                                placeholder={ticketDetails?.problem}
                            />
                            <Form.Control.Feedback type="invalid">Problem code field is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="input-container mb-3">
                            <Form.Label>Created Date</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.createdDate}
                                type="text"
                                value={ticketDetails?.createdDate}
                                disabled
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>Mobile Number</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.phoneNumber}
                                type="text"
                                value={ticketDetails?.phoneNumber}
                                disabled
                            />
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="input-container mb-3">
                            <Form.Label>Assigned To</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.assignedTo}
                                type="text"
                                value={ticketDetails?.assignedTo}
                                disabled
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>Solution Provided</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.solutionProvided}
                                type="text"
                                value={ticketDetails?.solutionProvided}
                                disabled
                            />
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="input-container mb-3">
                            <Form.Label>Client Email</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.callerEmail}
                                type="text"
                                value={ticketDetails?.callerEmail}
                                disabled
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="input-container">
                        <div>
                            <Form.Label>Created By</Form.Label>
                            <Form.Control
                                className='Field'
                                placeholder={ticketDetails?.createdBy}
                                type="text"
                                value={ticketDetails?.createdBy}
                                disabled
                            />
                        </div>
                    </Form.Group>
                </Form>
            </div>
            <div className="btnBody">
                <Button
                    className="cancelBtn"
                    onClick={() => {
                        navigate('/mobtickets')
                    }}
                >
                    Cancel
                </Button>
                <Button
                    className="saveBtn"
                    onClick={saveTicket}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}

export default Mobeditticket;