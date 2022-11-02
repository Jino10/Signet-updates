import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { fetchCall } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { aboutSignet, apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authentication } from '../../Config/FirebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import Alerts from '../Widgets/Alerts';
import Loading from '../Widgets/Loading';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';

export default function OTPVerification() {
  const [fnameData, setFnameData] = useState('');
  const [lnameData, setLnameData] = useState('');
  const [orgNameData, setOrgNameData] = useState('');
  const [emData, setEmailData] = useState('');
  const [userIdData, setUserIdData] = useState('');
  const [alertSucShow, setAlertSucShow] = useState(false);
  const navigate = useNavigate();
  const dataFromLogin = useLocation();
  const [otpAlertShow, setOtpAlertShow] = useState(false);
  const [sucShow, setSucShow] = useState(false);
  const [variant, setVarient] = useState('');
  const [otpVariant, setOtpVariant] = useState('');
  const [btnDisable, setBtnDisable] = useState(true);
  const [wrongOtp, setWrongOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { buttonTracker } = useAnalyticsEventTracker('Button');
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const firstNameData = localStorage.getItem('firstName');
    const lastNameData = localStorage.getItem('lastName');
    const organizationNameData = localStorage.getItem('orgName');
    const emailData = localStorage.getItem('email');
    const usersIdData = localStorage.getItem('id');
    setFnameData(firstNameData);
    setLnameData(lastNameData);
    setOrgNameData(organizationNameData);
    setEmailData(emailData);
    setUserIdData(usersIdData);
  }, [
    localStorage.getItem('firstName'),
    localStorage.getItem('lastName'),
    localStorage.getItem('orgName'),
    localStorage.getItem('email'),
    localStorage.getItem('id'),
  ]);

  const [stateData] = useState({
    email: '',
    validated: false,
    emailLength: '',
    validEmail: false,
    emailInput: false,
    alerMessage: '',
    alertVarient: '',
    showAlert: false,
    emailRegex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
  });

  const [toogle, setToogle] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneUi, setPhoneUi] = useState('');
  const [validPhone, setPhoneValid] = useState(false);
  const [validOTP, setValidOTP] = useState(false);
  const [otpNumber, setOtpNumber] = useState('');
  const [appVerifier, setAppVerifier] = useState(null);

  const phoneNumber = '+91' + phone;

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'sign-in-button',
      {
        size: 'invisible',
        callback: () => { },
      },
      authentication,
    );
  };

  const requestOtp = () => {
    if (phone.length === 10 && agree === true) {
      setToogle(true);
      !appVerifier && generateRecaptcha();
      const appRecaptchaVerifier = window.recaptchaVerifier;
      setAppVerifier(appRecaptchaVerifier);
      signInWithPhoneNumber(authentication, phoneNumber, appRecaptchaVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setVarient('success');
          setOtpAlertShow(true);
          setTimeout(() => {
            setOtpAlertShow(false);
          }, 5000);
        })
        .catch(() => {
          setVarient('danger');
          setOtpAlertShow(true);
          setTimeout(() => {
            setOtpAlertShow(false);
          }, 5000);
        });
    } else {
      setPhoneValid(true);
    }
  };
  const Logout = () => {
    localStorage.clear();
    localStorage.clear();
    window.location.reload(false);
  };

  const updatePhonenumber = async () => {
    if (agree === true) {
      setIsLoading(true);
      const sendingdata = {
        firstName: fnameData,
        lastName: lnameData,
        orgName: orgNameData,
        orgEmail: emData,
        primaryPhone: phone,
        userId: userIdData,
      };
      const response = await fetchCall(APIUrlConstants.UPDATE_PROFILE, apiMethods.POST, sendingdata);
      const statusCode = response[0];
      if (httpStatusCode.SUCCESS === statusCode) {
        buttonTracker(gaEvents.UPDATE_MOBILE_NUMBER);
        setAlertSucShow(true);
        navigate('/', { replace: true });
        Logout();
      } else {
        setIsLoading(false);
        setSucShow(true);
        setOtpVariant('success');
        setTimeout(() => {
          setSucShow(false);
        }, 5000);
      }
    }
  };
  const verifyotp = (e) => {
    const otp = e.target.value;
    setOtpNumber(otp);
    if (otp.length === 6) {
      setValidOTP(false);
      const { confirmationResult } = window;
      confirmationResult
        .confirm(otp)
        .then(() => {
          setWrongOtp(false);
          setSucShow(true);
          setOtpVariant('success');
          setBtnDisable(false);
          setTimeout(() => {
            setSucShow(false);
          }, 5000);
        })
        .catch(() => {
          setWrongOtp(true);
          setSucShow(true);
          setOtpVariant('danger');
          setTimeout(() => {
            setSucShow(false);
          }, 5000);
        });
    } else {
      setValidOTP(true);
      setBtnDisable(true);
    }
  };
  function formatPhoneNumber(x) {
    const formated = x.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return formated;
  }

  const phoneChange = (event) => {
    setPhoneValid(event.target.value.length !== 10);
    const formattedPhoneNumber = formatPhoneNumber(event.target.value);
    setPhoneUi(formattedPhoneNumber);
    setPhone(event.target.value);
  };

  const onAgreeTermsChanage = (event) => {
    setAgree(event.target.checked);
  }

  return (
    <Container fluid className="lognWrapper">
      {alertSucShow === true ? (
        <Alert variant="success" show={alertSucShow} dismissible className="alertWrapper">
          <p>updated successfully</p>
        </Alert>
      ) : null}
      {sucShow && (
        <Alerts
          variant={otpVariant}
          onClose={() => {
            setSucShow(false);
          }}
          alertshow={otpVariant === 'success' ? 'OTP Verified' : 'Invalid OTP'}
        />
      )}
      {otpAlertShow && (
        <Alerts
          variant={variant}
          onClose={() => {
            setOtpAlertShow(false);
          }}
          alertshow={variant === 'success' ? 'OTP sent to your phone number' : 'something went worng '}
        />
      )}
      {isLoading && <Loading />}
      <Row>
        <Col lg={6} md={12} sm={12} className="d-none d-lg-block p-0">
          <div className="boxLeft d-flex align-items-center justify-content-center">
            <div className="boxWrap d-flex align-items-center justify-content-center flex-column text-center">
              <img src={process.env.REACT_APP_PUBLIC_URL + 'images/login/rafiki.png'} alt="" />
              <p>{aboutSignet}</p>
            </div>
          </div>
        </Col>
        <Col lg={6} md={12} sm={12} xs={12}>
          <div className="boxRight d-flex align-items-center">
            <div className="mainWrap d-flex align-items-flex-start flex-column justify-content-center">
              <div className="regTxt d-flex align-items-start flex-column">
                <h2>Phone Number Verification</h2>
              </div>
              <Form noValidate validated={stateData.validated} className="fromWrap">
                <Form.Group controlId="formBasicEmail" className="inputWrapper">
                  <Form.Control
                    required
                    className="email-input"
                    type="text"
                    isInvalid={validPhone}
                    isValid={!phone && phone.length > 0}
                    placeholder="Phone Number"
                    autoComplete="off"
                    value={phoneUi}
                    onChange={phoneChange}
                  />
                  <img className="inputIcon" src={process.env.REACT_APP_PUBLIC_URL + 'images/login/key.svg'} alt="" />
                  {validPhone === true ? (
                    <Form.Control.Feedback type="invalid">Enter a valid Phone Number</Form.Control.Feedback>
                  ) : null}
                </Form.Group>
                <div id="sign-in-button" />
                {toogle &&

                  (
                    <div className="formFooter d-flex align-items-center justify-content-center flex-column">
                      <Form.Control
                        required
                        className="email-input mTop20"
                        type="text"
                        isInvalid={validOTP || wrongOtp}
                        placeholder="OTP"
                        autoComplete="off"
                        onChange={verifyotp}
                        value={otpNumber}
                      />
                      <div className="d-flex flex-row-reverse align-items-center widthFull">
                        <Button
                          className="resendOtp"
                          onClick={() => {
                            requestOtp();
                            buttonTracker(gaEvents.RESEND_OTP);
                          }}
                        >
                          Resend OTP
                        </Button>
                        {validOTP === true ? <p className="otpVerifyError">Enter a valid OTP</p> : null}
                      </div>
                    </div>
                  )}
                <Form.Group controlId="formBasicCheckbox" className="customCheck mb-2 mt-2">
                  <Form.Check.Input
                    data-testid="termsCheckbox"
                    required
                    onChange={onAgreeTermsChanage}
                  />
                  <Form.Check.Label className="p-2">Agree to <Link to='/termsandconditions' target='_blank'> terms and conditions </Link></Form.Check.Label>
                  <Form.Control.Feedback type="invalid">Please agree to terms and conditions</Form.Control.Feedback>
                </Form.Group>
                <div className="formFooter d-flex align-items-center justify-content-center flex-column">
                  {toogle ? (<Button
                    variant="primary"
                    id="verifytest"
                    className="d-flex align-items-center justify-content-center emailBtn"
                    onClick={updatePhonenumber}
                    disabled={btnDisable}
                  >
                    Update
                  </Button>) :
                    (<Button
                      variant="primary"
                      id="verifytest"
                      type="submit"
                      className="d-flex align-items-center justify-content-center emailBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        requestOtp();
                        buttonTracker(gaEvents.SEND_OTP);
                      }}
                    >
                      Verify
                    </Button>)}
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
