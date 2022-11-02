import React, { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import APIUrlConstants from "../../Config/APIUrlConstants";
import { apiMethods, httpStatusCode, gaEvents } from "../../Constants/TextConstants";
import { fetchCall } from "../../Services/APIService";
import Loading from "../../Pages/Widgets/Loading";
import Alerts from "../../Pages/Widgets/Alerts";
import useAnalyticsEventTracker from "../../Hooks/useAnalyticsEventTracker";
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { authentication } from "../../Config/FirebaseConfig";

import './Mobprofile.css';

function Mobprofile() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const [isEditable, setIsEditable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [toogle, setToogle] = useState(false);
    const [validOtp, setValidOtp] = useState(false);
    const [wrongOtp, setWrongOtp] = useState(false);
    const [appVerifier, setAppVerifier] = useState(null);
    const [variant, setVarient] = useState('');
    const [otpalertshow, setOtpAlertshow] = useState(false);
    const [validPhone, setPhoneValid] = useState(false);
    const [phoneui, setPhoneUi] = useState('');
    const [otp, setOtp] = useState('');
    const [phone, setPhone] = useState('');
    const phoneNumber = '+91' + phone;

    const closeAlert = () => setShowAlert(false);

    const { buttonTracker } = useAnalyticsEventTracker();

    function formatPhoneNumber(x) {
        const formated = x.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        return formated;
    }

    const setPhoneFormat = (value) => {
        const formattedPhoneNumber = formatPhoneNumber(value);
        setPhoneUi(formattedPhoneNumber);
        setPhone(value);
    };

    const phoneChange = (event) => {
        setPhoneValid(event.target.value.length !== 10);
        setPhoneFormat(event.target.value);
        setUser({ ...user, mobileNumber: event.target.value });
    };

    const updateUser = async () => {
        setIsLoading(true);
        const userDetails = {
            userId: user?.userId,
            firstName: user?.firstName,
            lastName: user?.lastName,
            primaryPhone: user?.mobileNumber,
            orgName: user?.orgName,
            emailId: user?.emailId
        };
        const { 0: status, 1: data, 2: message } = await fetchCall(APIUrlConstants.UPDATE_PROFILE, apiMethods.POST, userDetails);
        const statusCode = status;
        if (statusCode === httpStatusCode) {
            setUser({
                ...user,
                firstName: data?.firstName,
                lastName: data?.lastName,
                mobileNumber: data?.mobileNumber,
                emailId: data?.orgEmail,
                orgName: data?.organization,
            });
            localStorage.setItem('user',
                JSON.stringify({
                    ...user,
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    mobileNumber: data?.mobileNumber,
                    emailId: data?.orgEmail,
                    orgName: data?.organization,

                }));
            localStorage.setItem('firstName', data?.firstName);
            localStorage.setItem('lastName', data?.lastName);
            localStorage.setItem('email', data?.orgEmail);
            localStorage.setItem('mobile', data?.mobileNumber);
            localStorage.setItem('orgName', data?.organization);
            setIsLoading(false);
            setShowAlert(true);
            setAlertMessage('Updated successfully');
            setError(true);
            setTimeout(() => {
                setShowAlert(false);
                setIsEditable(false);
            }, 5000);
        }
        else {
            setIsLoading(false);
            setShowAlert(true);
            setAlertMessage('Something went wrong');
            setError(false);
            setTimeout(() => {
                setShowAlert(false);
                setIsEditable(false);
            }, 5000);
        }
    }

    const generateRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            'mobile-number-button',
            {
                size: 'invisible',
                callback: () => { },
            },
            authentication,
        );
    };


    const requestotp = () => {
        if (phone.length === 10) {
            setToogle(true);
            !appVerifier && generateRecaptcha();
            const appRecaptchaVerifier = window.recaptchaVerifier;
            setAppVerifier(appRecaptchaVerifier);
            signInWithPhoneNumber(authentication, phoneNumber, appRecaptchaVerifier)
                .then((confirmationResult) => {
                    window.confirmationResult = confirmationResult;
                    setVarient('success');
                    setOtpAlertshow(true);
                    setTimeout(() => {
                        setOtpAlertshow(false);
                    }, 5000);
                })
                .catch(() => {
                    setVarient('danger');
                    setOtpAlertshow(true);
                    setTimeout(() => {
                        setOtpAlertshow(false);
                    }, 5000);
                });
        } else {
            setPhoneValid(true);
        }
    };

    const handleAlertClose = () => {
        setOtpAlertshow(false);
    };

    const verifyotp = (e) => {
        const userOtp = e.target.value;
        setOtp(userOtp);
        if (userOtp.length === 6) {
            setValidOtp(false);
            const { confirmationResult } = window;
            confirmationResult
                .confirm(userOtp)
                .then(() => {
                    setWrongOtp(false);
                    setShowAlert(true);
                    setError(true);
                    setAlertMessage('OTP verified');
                    setTimeout(() => {
                        setShowAlert(false);
                    }, 5000);
                    setOtpAlertshow(false);
                })
                .catch(() => {
                    setWrongOtp(true);
                    setError(false);
                    setShowAlert(true);
                    setAlertMessage('Invalid OTP');
                    setTimeout(() => {
                        setShowAlert(false);
                    }, 5000);
                });
        } else {
            setValidOtp(true);
        }
    };

    return (
        <div>
            {isLoading && <Loading />}
            {
                showAlert && (
                    <Alerts
                        variant={error ? 'success' : 'danger'}
                        onClose={closeAlert}
                        alertshow={alertMessage}
                    />
                )
            }
            <Alert variant={variant} show={otpalertshow} dismissible className="alertWrapper" onClick={handleAlertClose}>
                <p>{variant === 'success' ? 'OTP sent to your mobile number' : 'something went worng '}</p>
            </Alert>
            <div>
                {!isEditable ?
                    (<div className="imageBody">
                        <img className="profileImage" src='images/signetImage/assign.png' alt='' />
                        <h6><span>{user?.firstName}</span><span>{user?.lastName}</span></h6>
                    </div>) :
                    (<div className="imageBody">
                        <img className="profileImage" src='images/signetImage/assign.png' alt='' />
                        <h6><span>{user?.firstName}</span><span>{user?.lastName}</span></h6>
                        <i className="fa-solid fa-pen-to-square editIcon" />
                    </div>)}
            </div>
            {!isEditable ?
                (<div className="wrapperProfile">
                    <div>
                        <p>First Name</p>
                        <h6>{user?.firstName}</h6>
                    </div>
                    <div>
                        <p>Last Name</p>
                        <h6>{user?.lastName}</h6>
                    </div>
                    <div>
                        <p>Organization Name</p>
                        <h6>{user?.orgName}</h6>
                    </div>
                    <div>
                        <p>Organization Email</p>
                        <h6>{user?.emailId}</h6>
                    </div>
                    <div>
                        <p>Phone Number</p>
                        <h6>{user?.mobileNumber}</h6>
                    </div>
                </div>) :
                (<div className="formBody">
                    <Form>
                        <Form.Group controlId="formFirstName">
                            <div className="mb-3 input-container  bit-1">
                                <Form.Label>First Name </Form.Label>
                                <Form.Control
                                    required
                                    className="fieldAlign"
                                    pattern="^[a-zA-Z0-9]+$"
                                    type="text"
                                    placeholder="First Name"
                                    autoComplete="off"
                                    value={user?.firstName}
                                    onChange={(e) => {
                                        setUser({ ...user, firstName: e.target.value });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">Enter a valid First Name</Form.Control.Feedback>
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formLastName" className="inputHolder mb-3">
                            <div>
                                <Form.Label>Last Name </Form.Label>
                                <Form.Control
                                    required
                                    className="fieldAlign"
                                    pattern="^[a-zA-Z0-9]+$"
                                    type="text"
                                    placeholder="Last Name"
                                    autoComplete="off"
                                    value={user?.lastName}
                                    onChange={(e) => {
                                        setUser({ ...user, lastName: e.target.value });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">Enter a valid Last Name</Form.Control.Feedback>
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formOrganization" className="inputHolder mb-3">
                            <div>
                                <Form.Label>Organization Name</Form.Label>
                                <Form.Control
                                    className="fieldAlign"
                                    placeholder="Organization Name"
                                    type="text"
                                    value={user?.orgName}
                                    onChange={(e) => {
                                        setUser({ ...user, orgName: e.target.value });
                                    }} />

                                <Form.Control.Feedback type="invalid">Enter a valid Organization Name</Form.Control.Feedback>
                            </div>
                        </Form.Group>
                        <Form.Group controlId="formSecondaryEmail" className="inputHolder mb-3">
                            <div>
                                <Form.Label>Organization Email</Form.Label>
                                <Form.Control
                                    className="fieldAlign"
                                    placeholder="Organization Email"
                                    type="text"
                                    value={user?.emailId}
                                    onChange={(e) => {
                                        setUser({ ...user, emailId: e.target.value });
                                    }} />
                                <Form.Control.Feedback type="invalid">Enter a valid Organization Email</Form.Control.Feedback>
                            </div>
                        </Form.Group>
                        <div className="numberField">
                            <Form.Group controlId="formMobileNumber" className="inputHolder">
                                <Form.Label>Phone Number</Form.Label>
                                <div className="d-flex  align-items-start w-100 customVerifyBox">
                                    <Form.Control
                                        className="phoneNum"
                                        required
                                        pattern="^\(\d{3}\)\s\d{3}-\d{4}"
                                        type="text"
                                        placeholder="Phone Number"
                                        autoComplete="off"
                                        value={user?.mobileNumber}
                                        onChange={phoneChange}
                                    />
                                </div>
                            </Form.Group>
                            {!toogle && isEditable && (
                                <Button
                                    className="verBtn"
                                    variant="primary"
                                    onClick={() => {
                                        requestotp();
                                        buttonTracker(gaEvents.SEND_OTP);
                                    }}
                                    data-testid="verifybtn"
                                >
                                    <img src={process.env.REACT_APP_PUBLIC_URL + 'images/login/verify.svg'} alt="" /> Verify
                                </Button>
                            )}
                            {toogle && isEditable && (
                                <Form.Group controlId="formOtp" className="inputHolder otpGap">
                                    <Form.Control
                                        required
                                        className='otpField'
                                        type="text"
                                        placeholder="OTP Number"
                                        autoComplete="off"
                                        value={otp}
                                        onChange={verifyotp}
                                        isInvalid={validOtp || wrongOtp}
                                    />
                                    <div className="d-flex flex-row-reverse align-items-center widthFull">
                                        <Button
                                            className="resendText d-flex justify-content-end resendField"
                                            onClick={() => {
                                                requestotp();
                                                buttonTracker(gaEvents.RESEND_OTP);
                                            }}
                                        >
                                            Resend OTP
                                        </Button>
                                        {validOtp === true ? <p className="otpError">Enter a valid OTP</p> : null}
                                    </div>
                                </Form.Group>
                            )}
                        </div>
                        <div id="mobile-number-button" />
                    </Form>
                </div>)}
            <div className="btnBody">
                {!isEditable ?
                    (<Button
                        className="eBtn"
                        onClick={() => {
                            setIsEditable(true);
                        }}
                    >
                        Edit
                    </Button>) :
                    (<div>
                        <Button
                            className="cBtn"
                            onClick={() => {
                                setIsEditable(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="sBtn"
                            onClick={updateUser}
                        >
                            Save
                        </Button>
                    </div>)}
            </div>
        </div>);
}

export default Mobprofile;