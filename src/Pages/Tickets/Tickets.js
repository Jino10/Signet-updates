/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { makeRequest } from '../../Services/APIService';
import { gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import Loading from '../Widgets/Loading';
import './Tickets.css';
import { userRoleId } from '../../Utilities/AppUtilities';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import ViewTicket from './ViewTicket';

function Tickets() {
  const navigate = useNavigate();
  const [users, setUser] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(false);
  const closeAlert = () => setShowAlert(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { buttonTracker, linkTracker } = useAnalyticsEventTracker();
  const [search, setSearch] = useState('');
  const [initialData, setInitialData] = useState('');
  const [arrow, setArrow] = useState(false);
  const [firstData, setFirstData] = useState('');
  const [datas, setDatas] = useState(false);
  const [firstIndex, setFirstIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(5);
  const { ticketNo, problem, description, status, priority, assignedTo, createdBy, createdDate, callerEmail } = firstData;

  const fetchAllUserDetails = async () => {
    setIsLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(
      APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
    );
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
      setUser(data?.data);
      setFirstData(data?.data[0]);
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

  const totalTickets = users.length;

  const pages = Math.ceil(totalTickets / 5);

  const sliceData = users.slice(firstIndex, lastIndex);

  const handleClick = (ticketId) => {
    buttonTracker(gaEvents.NAVIGATE_EDIT_TICKET);
    navigate(`/ticket/edit/${ticketId}`);
  };

  const actionBtn = (_row, cell, _rowIndex) => (
    <div className="actionBox d-flex align-items-center">
      {cell.callerEmail === localStorage.getItem('email') && (
        <Button variant="link" id={cell.ticketNo} onClick={() => handleClick(cell.ticketNo)}>
          <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/edit.svg'} id={cell.ticketNo} alt="Edit" />
        </Button>
      )}
    </div>
  );

  const ticketView = async (ticketno) => {
    setIsLoading(true);
    setDatas(true);
    const { 0: statusCode, 1: resp } = await makeRequest(`${APIUrlConstants.VIEW_TICKET}/${ticketno}`);
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
      setInitialData(resp.data[0]);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('roleId') === userRoleId.signetAdmin) {
      navigate('/');
    } else {
      fetchAllUserDetails();
    }
  }, []);

  useEffect(() => {
    if (initialData?.priority > 3 || priority > 3) {
      setArrow(true);
    } else if (initialData?.priority <= 3 || priority <= 3) {
      setArrow(false);
    }
  }, [priority, initialData?.priority]);

  const emptyDataMessage = () =>
    !isLoading ? (
      <h6 className="text-center text-bold m-0 p-0">No records found</h6>
    ) : (
      <h6 className="text-center text-bold m-0 p-0">Loading ...</h6>
    );

  const nextData = () => {
    setFirstIndex(firstIndex + 5)
    setLastIndex(lastIndex + 5);
  }
  const previousData = () => {
    setFirstIndex(firstIndex - 5)
    setLastIndex(lastIndex - 5);
  }

  return (
    <div className="wrapperBase">
      <div className="tabelBase" data-test-id="usertable">
        {isLoading && <Loading />}
        <div>
          <div className="titleHeader d-flex align-items-center justify-content-between">
            <div className="info">
              <h6>Tickets</h6>
            </div>
            <div className="headerAction d-flex align-items-center">
              <Button
                className="buttonPrimary"
                onClick={() => {
                  buttonTracker(gaEvents.NAVIGATE_ADD_TICKET);
                  navigate(`/ticket/add`);
                }}
              >
                <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/plus.svg'} alt="" /> Create Ticket
              </Button>
            </div>
          </div>
          <Row>
            <Col lg={4} md={12} sm={12}>
              <div className='tableData'>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Search this blog" onChange={(e) => setSearch(e.target.value)} />
                  <div className="input-group-append">
                    <button className="btnPrimary" type="button">
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
                <table className='table table-striped'>
                  <tbody>
                    {
                      sliceData.filter((user) => {
                        if (search === '') {
                          return user;
                        }
                        if (user?.problem.toLowerCase().includes(search.toLowerCase())) {
                          return user;
                        }
                        return false;
                      })
                        .map((val) =>
                          <tr onClick={() => ticketView(val.ticketNo)}>
                            <td className='truncate' value={val?.ticketNo}><img className='tokenImage' src="/images/signetImage/ticket.png" alt="" class="pe-2 activeImg" />{val?.ticketNo}<br />
                              <br />
                              {val?.problem}</td>
                          </tr>
                        )
                    }
                    <div className='buttonAlign'>
                      <Button className='pageButtons' onClick={previousData}>Previous</Button>
                      <Button className='pageButtons' onClick={nextData}>Next</Button>
                    </div>
                  </tbody>
                </table>
              </div>
            </Col>
            <Col lg={5} md={6} sm={12}>
              <div className='descriptionBox'>
                <div className='tokenBox'>
                  <img className='tokenImage' src="/images/signetImage/ticket.png" alt="" /><span className='ticketNo'>{datas ? initialData?.ticketNo : ticketNo}</span>
                </div>
                <h5 className='problemHeading'>{datas ? initialData?.problem : problem}</h5>
                <h6 className='description'>Description</h6>
                <div
                  dangerouslySetInnerHTML={{ __html: datas ? initialData?.description : description }}
                />
              </div>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <div className='scrollData'>
                <p className='status'>Status</p>
                <div className='statusData'>
                  <span className='statusAdjacent'>{datas ? initialData?.status : status}</span>
                </div>
                <p className='status'>Priority</p>
                <div className='statusData'>
                  <span className='arrowSet'><i className={`fa-solid ${arrow ? "fa-arrow-up text-danger" : "fa-arrow-down text-success"}`} /></span>
                  <span className='priorityAdjacent'>{arrow ? <p>High</p> : <p>Low</p>}</span>
                </div>
                <p className='status'>Assignee</p>
                <div className='statusData'>
                  <span className=''><img className='assigneImage' src='/images/signetImage/assign.png' alt='' />{datas ? initialData?.assignedTo : assignedTo}</span>
                </div>
                <p className='status'>Created date</p>
                <h6>{datas ? initialData?.createdDate : createdDate}</h6>
                <p className='status'>Created By</p>
                <h6>{datas ? initialData?.createdBy : createdBy}</h6>
                <div>
                  {callerEmail === localStorage.getItem('email') && (
                    <Button
                      className="buttonPrimary text-center"
                      onClick={() => {
                        buttonTracker(gaEvents.NAVIGATE_EDIT_TICKET);
                        navigate(`/ticket/edit/${ticketNo}`);
                      }}
                    >
                      <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/edit.svg'} alt="" className="pRight6" /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
        {
          showAlert && (
            <Alert variant={!error ? 'success' : 'danger'} className="alertWrapper" onClose={closeAlert} dismissible>
              <Alert.Heading>{alertMessage}</Alert.Heading>
            </Alert>
          )
        }
      </div >
    </div >
  );
}

export default Tickets;
