import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { httpStatusCode, apiMethods } from "../../Constants/TextConstants";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { makeRequest, fetchCall } from "../../Services/APIService";
import Loading from "../../Pages/Widgets/Loading";
import { Form, Button } from "react-bootstrap";
import Alerts from "../../Pages/Widgets/Alerts";
import AsyncSelect from "react-select/async";
import Select from "react-select";

import './Mobedituser.css';

function Mobedituser() {
    const { userId } = useParams();

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        orgEmail: '',
        orgName: '',
        roleId: '',
        status: '',
        userId: '',
        orgNo: '',
    });

    const [role, setRole] = useState('');
    const [optionRole, setOptionRole] = useState('');
    const [org, setOrg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [variant, setVariant] = useState('');
    const [roleLoad, setRoleLoad] = useState('');

    const [loadStatus, setLoadStatus] = useState([
        {
            value: 'Active',
            label: 'Active'
        },
        {
            value: 'Inactive',
            label: 'Inactive'
        },
        {
            value: 'Pending',
            label: 'Pending'
        }
    ]);

    const navigate = useNavigate();

    const closeAlert = () => setShowAlert(false);

    const loadOptions = async (searchtext) => {
        if (searchtext.length >= 3) {
            const response = await makeRequest(`${APIUrlConstants.SEARCH_ORG}?company=${searchtext}`);
            const statusCode = response[0];
            const responseData = response[1];
            if (httpStatusCode.SUCCESS === statusCode) {
                return responseData.data;
            }
            return responseData.data;
        }
        return null;
    };

    const handleChange = (value) => {
        setOrg(value);
        setUser({ ...user, orgName: value.companyName, orgNo: value.customerNo });
    }

    const fetchRoles = async () => {
        const roles = [];
        const { 0: status, 1: res } = await makeRequest(APIUrlConstants.GET_USER_ROLES);
        setRole(res?.data.forEach((i) => {
            roles.push({ value: i.roleId, label: i.name });
        }));
        setOptionRole(roles);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleRole = (value) => {
        setRoleLoad(value);
        setUser({ ...user, roleId: value.value });
    }

    const fetchUser = async () => {
        setIsLoading(true);
        const {
            0: statusCode,
            1: { data },
        } = await makeRequest(`${APIUrlConstants.GET_USER_DETAILS}/${userId}`);
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
            setUser({
                ...user,
                firstName: data?.firstName,
                lastName: data?.lastName,
                orgEmail: data?.orgEmail,
                orgName: data?.organization,
                roleId: data?.roleId,
                status: data?.status,
                userId: data?.userId
            });
        } else {
            setIsLoading(false);
            setShowAlert(true);
            setVariant('danger');
            setAlertMessage('Something went wrong');
            setTimeout(() => {
                setShowAlert(false);
                navigate('/mobusers');
            }, 5000);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const handleStatus = (value) => {
        setUser({ ...user, status: value.value });
    }

    const updateUser = async () => {
        setIsLoading(true);
        const { 0: status, 1: data } = await fetchCall(APIUrlConstants.UPDATE_USER_DETAILS, apiMethods.PUT, user);
        const statusCode = status;
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
            setShowAlert(true);
            setVariant('success');
            setAlertMessage('User updated successfully');
            setTimeout(() => {
                setShowAlert(false);
                navigate('/mobusers');
            }, 5000);
        } else {
            setIsLoading(false);
            setShowAlert(true);
            setVariant('danger');
            setAlertMessage('Something went wrong');
            setTimeout(() => {
                setShowAlert(false);
                navigate('/mobusers');
            }, 5000);
        }
    }

    return (
        <div>
            {isLoading && <Loading />}
            {showAlert && (
                <Alerts
                    variant={variant}
                    onClose={closeAlert}
                    alertshow={alertMessage}
                />
            )}
            <div className="editFields">
                <Form>
                    <Form.Group>
                        <div className="input-container mb-3">
                            <Form.Label>
                                First Name <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={user?.firstName}
                                data-testid="FName"
                                autoFocus
                                value={user?.firstName}
                                required
                                name="firstName"
                                onChange={(e) => {
                                    setUser({ ...user, firstName: e.target.value });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">First Name is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="input-container mb-3">
                            <Form.Label>
                                Last Name <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Form.Control
                                data-testid="LName"
                                type="text"
                                placeholder={user?.lastName}
                                autoFocus
                                value={user?.lastName}
                                required
                                onChange={(e) => {
                                    setUser({ ...user, lastName: e.target.value });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">Last Name is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="mb-3">
                            <Form.Label>
                                Organization <span className="requiredTxt">*</span>
                            </Form.Label>
                            <AsyncSelect
                                value={org}
                                getOptionLabel={(e) => e.companyName}
                                getOptionValue={(e) => e.customerNo}
                                loadOptions={loadOptions}
                                onChange={handleChange}
                                placeholder="Search for Organization Name"
                                components={{
                                    IndicatorSeparator: () => null,
                                }}
                            />
                            <Form.Control.Feedback type="invalid">Organization Name is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="mb-3">
                            <Form.Label>
                                Organization Email <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder={user?.orgEmail}
                                autoFocus
                                value={user?.orgEmail}
                                required
                                onChange={(e) => {
                                    setUser({ ...user, orgEmail: e.target.value });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">Organization Email is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="mb-3">
                            <Form.Label>
                                Role <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Select
                                value={roleLoad}
                                options={optionRole}
                                onChange={handleRole}
                            />
                            <Form.Control.Feedback type="invalid">Role is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <div className="mb-3">
                            <Form.Label>
                                Status <span className="requiredTxt">*</span>
                            </Form.Label>
                            <Select
                                options={loadStatus}
                                placeholder={user?.status}
                                value={user?.status}
                                onChange={handleStatus}
                            />
                            <Form.Control.Feedback type="invalid">Status is required</Form.Control.Feedback>
                        </div>
                    </Form.Group>
                </Form>
            </div>
            <div className="btnGroup">
                <Button
                    className="cancelBtn"
                    onClick={() => {
                        navigate("/mobusers");
                    }}
                >
                    Cancel
                </Button>
                <Button
                    className="createBtn"
                    onClick={updateUser}
                >
                    Edit
                </Button>
            </div>
        </div>
    );
}

export default Mobedituser;