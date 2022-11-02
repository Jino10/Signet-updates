import React, { useEffect, useState } from 'react';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { makeRequest, fetchCall } from '../../Services/APIService';
import { httpStatusCode, apiMethods } from '../../Constants/TextConstants';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Pages/Widgets/Loading';
import Select from 'react-select';
import Alerts from '../../Pages/Widgets/Alerts';

import './Mobaddticket.css';

function Mobaddticket() {
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
    const [error, setError] = useState(false);
    const [ticketDetails, setTicketDetails] = useState({
        assignedTo: '',
        customerId: localStorage.getItem('orgNo'),
        site: '',
        createdBy: localStorage.getItem('firstName') + '' + localStorage.getItem('lastName'),
        createdDate: '',
        phoneNumber: localStorage.getItem('mobile'),
        status: 'OPEN',
        requestType: 'NOC',
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
        setIsLoading(false);
    }

    useEffect(() => {
        fetchPromise();
    }, []);

    const createTicket = async () => {
        setIsLoading(true);
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

    const handleSite = (value) => {
        setTicketDetails({ ...ticketDetails, site: value.value });
    }

    const handlePriority = (value) => {
        setTicketDetails({ ...ticketDetails, priority: value.value });
    }

    const handleProblemCode = (value) => {
        setTicketDetails({ ...ticketDetails, problem: value.value });
    }

    return (
        <div>
            {isLoading && <Loading />}
            {
                alertShow && (
                    <Alerts
                        variant={!error ? 'danger' : 'success'}
                        onClose={closeAlert}
                        alertshow={alertMessage}
                    />
                )
            }
            <div className='newTicketBody'>
                <Form noValidate validated={validated}>
                    <Form.Group className="mb-3 input-container">
                        <div>
                            <Form.Label>
                                Description <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                className='descriptionField'
                                placeholder="Enter description"
                                required
                                name="description"
                                onChange={(e) => {
                                    setTicketDetails({ ...ticketDetails, description: e.target.value });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">Description is required</Form.Control.Feedback>
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
                                placeholder="Search for Site Name"
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
                            />
                            <Form.Control.Feedback type="invalid">Problem code field is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                </Form>
            </div >
            <div className='buttonBody'>
                <Button
                    className='cancelBtn'
                    onClick={() => {
                        navigate("/mobtickets")
                    }}
                >
                    Cancel
                </Button>
                <Button
                    className='createBtn'
                    onClick={createTicket}
                >
                    Create
                </Button>
            </div>
        </div >
    );
}

export default Mobaddticket;