import React, { useState, useEffect } from "react";
import Loading from '../Widgets/Loading';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { makeRequest } from '../../Services/APIService';
import { Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import './Statistics.css';

import { Pie } from 'react-chartjs-2';
import { useNavigate, Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

function Statistics() {
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState('');
    const [active, setActive] = useState('');
    const [inActive, setInActive] = useState('');
    const [pending, setPending] = useState('');
    const [orgs, setOrgs] = useState('');
    const [filter, setFilter] = useState('');
    const { buttonTracker } = useAnalyticsEventTracker();
    const navigate = useNavigate();

    const fetchAllUserDetails = async () => {
        setIsLoading(true);
        const { 0: statusCode, 1: data } = await makeRequest(APIUrlConstants.FETCH_USER_DETAILS);
        if (statusCode === httpStatusCode.SUCCESS) {
            setIsLoading(false);
        }
        setUserData(data?.data);
    };

    const totalUsers = userData.length;

    useEffect(() => {
        fetchAllUserDetails();
    }, []);

    useEffect(() => {
        if (userData) {
            const activeUser = [];
            const inActiveUser = [];
            const pendingUser = [];
            userData.map((value) => {
                if (value?.status === 'Active') {
                    activeUser.push(value);
                } else if (value?.status === 'Inactive') {
                    inActiveUser.push(value);
                } else if (value?.status === 'Pending') {
                    pendingUser.push(value);
                }
                return false;
            })
            setActive(activeUser);
            setInActive(inActiveUser);
            setPending(pendingUser);
        }
    }, [userData]);

    const data = {
        labels: ['Active users', 'In-active users', 'Pending users'],
        datasets: [
            {
                label: 'Classification of users',
                data: [active.length, inActive.length, pending.length],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    useEffect(() => {
        if (userData) {
            const organization = [];
            userData.map((values) => {
                if (values?.organization !== '' && values?.organization !== null) {
                    organization.push(values.organization);
                }
                return false;
            })
            const org = [...new Set(organization)];
            setOrgs(org);
        }
    }, [userData]);

    const getUserData = (value) => {
        setIsLoading(true);
        const filterData = userData.filter((values) => values.organization === value);
        setFilter(filterData);
        setIsLoading(false);
    }

    const handleClick = (id) => {
        buttonTracker(gaEvents.NAVIGATE_EDIT_USER);
        navigate(`/edituser/${id}`);
    };

    return (
        <div>
            {isLoading && <Loading />}
            {orgs &&
                <div className="container">
                    <Row>
                        <Col lg={4} md={6} sm={12}>
                            <div className="block">
                                <img className="userImage mt-4" src="images/signetImage/user.png" alt="" />
                                <h6 className="mt-5">Number of users:{totalUsers}</h6>
                            </div>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <div className="block">
                                <img className="organizationImage mt-4" src="images/signetImage/org.png" alt="" />
                                <h6 className="mt-5">Number of organizations:{orgs.length}</h6>

                            </div>
                        </Col>
                        <Col lg={4} md={6} sm={12} >
                            <div className="block">
                                <Pie className="pie-chart" data={data} />
                                <h6 className="mt-5">User Records</h6>
                            </div>
                        </Col>
                    </Row>
                    <div className="table-data">
                        <Row>
                            <Col lg={4} md={6} sm={12}>
                                <div>
                                    <table className=" organization-table table table-striped">
                                        <thead>
                                            <tr>
                                                <th className="org-head">
                                                    Name of the organization
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                orgs?.map((val) =>
                                                    <tr>
                                                        <td value={val} onClick={() => getUserData(val)}>{val}</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                            {filter &&
                                <Col lg={8} md={6} sm={12}>
                                    <div>
                                        <table className="user-table table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Organization</th>
                                                    <th>E-Mail</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    filter.map((val) =>
                                                        <tr>
                                                            <td value={val.userId} onClick={() => handleClick(val.userId)}><Link to='/edituser'>{val.firstName}</Link></td>
                                                            <td>{val.organization}</td>
                                                            <td>{val.orgEmail}</td>
                                                            <td>{val.status}</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </Col>
                            }
                        </Row>
                    </div>
                </div>
            }
        </div>
    );
}

export default Statistics;