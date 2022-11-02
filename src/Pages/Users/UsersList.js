/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import { Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { fetchCall, makeRequest } from '../../Services/APIService';
import UserModal from './UserModal';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import Loading from '../Widgets/Loading';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import ReactGA from 'react-ga4';

function UsersList({ userId }) {
  const { SearchBar } = Search;
  const { buttonTracker } = useAnalyticsEventTracker();
  const history = useNavigate();
  const [users, setUser] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(false);
  const closeAlert = () => setShowAlert(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [firstIndex, setFirstIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(7);
  const [updateData, setUpdateData] = useState({});
  const [searchData, setSearchData] = useState('');
  const [count, setCount] = useState(1);

  const handleClose = () => setShow(false);
  const handleShow = (e) => {
    buttonTracker(gaEvents.OPEN_DELETE_USER);
    ReactGA.send({ hitType: 'pageview', page: `/deleteuser/${e.userId}` });
    sessionStorage.setItem('deleteUserActive', e.status);
    sessionStorage.setItem('deleteUserId', e.userId);
    setShow(true);
  };

  const fetchAllUserDetails = async () => {
    setIsLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(APIUrlConstants.FETCH_USER_DETAILS);
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
    }
    setUser(data.data);
  };
  const handleClick = async (id) => {
    setEditId(id);
    setShowEdit(true);
    const {
      0: statusCode,
      1: { data },
    } = await makeRequest(`${APIUrlConstants.GET_USER_DETAILS}/${id}`);
    if (statusCode === httpStatusCode.SUCCESS) {
      const res = data;
      const userValues = {
        firstName: res?.firstName ?? '',
        lastName: res?.lastName ?? '',
        orgEmail: res?.orgEmail ?? '',
        orgName: res?.organization ?? '',
        roleId: res?.roleId ?? '',
        status: res?.status ?? '',
        userId: id,
      };
      setUpdateData(userValues);
    }
  }

  const deleteUser = async () => {
    buttonTracker(gaEvents.DELETE_USER);
    setIsLoading(true);
    const id = sessionStorage.getItem('deleteUserId');
    const deleteUserStatus = sessionStorage.getItem('deleteUserActive');

    const dUser = {
      status: deleteUserStatus,
    };

    const { 0: statusCode, 1: responseData } = await fetchCall(`${APIUrlConstants.DELETE_USER}/${id}`, apiMethods.DELETE, dUser);
    if (statusCode === httpStatusCode.SUCCESS) {
      setShowAlert(true);
      setAlertMessage('Deleted successfully');
      setError(false);
      handleClose();
      sessionStorage.removeItem('deleteUserActive');
      sessionStorage.removeItem('deleteUserId');
      setTimeout(() => {
        fetchAllUserDetails();
        setTimeout(() => {
          closeAlert();
        }, 3000);
      }, 2000);
    } else {
      setShowAlert(true);
      setError(true);
      setAlertMessage(responseData.message);
      handleClose();
      setIsLoading(false);
      sessionStorage.removeItem('deleteUserActive');
      sessionStorage.removeItem('deleteUserId');
      setTimeout(() => {
        closeAlert();
      }, 5000);
    }
    handleClose();
  };

  const updateUser = async () => {
    buttonTracker(gaEvents.UPDATE_USER_DETAILS);
    setIsLoading(true);
    const { 0: status, 1: data } = await fetchCall(APIUrlConstants.UPDATE_USER_DETAILS, apiMethods.PUT, updateData);
    const statusCode = status;
    const responseData = data;

    if (statusCode === httpStatusCode.SUCCESS) {
      setShowAlert(true);
      setAlertMessage('Updated successfully');
      setError(false);
      setShowEdit(false);
      setTimeout(() => {
        fetchAllUserDetails();
        setTimeout(() => {
          closeAlert();
        }, 3000);
      }, 2000);
    } else {
      setShowAlert(true);
      setError(true);
      setAlertMessage(responseData.message);
      setIsLoading(false);
      setTimeout(() => {
        closeAlert();
      }, 5000);
    }
  };

  useEffect(() => {
    fetchAllUserDetails();
  }, []);

  const emptyDataMessage = () =>
    !isLoading ? (
      <h6 className="text-center text-bold m-0 p-0">No records found</h6>
    ) : (
      <h6 className="text-center text-bold m-0 p-0">Fetching users ...</h6>
    );

  const handleFirstName = (e) => {
    setUpdateData({ ...updateData, firstName: e });
  }

  const handleLastName = (e) => {
    setUpdateData({ ...updateData, lastName: e });
  }

  const handleStatus = (e) => {
    setUpdateData({ ...updateData, status: e });
  }

  const userData = users.slice(firstIndex, lastIndex);

  const nextCall = () => {
    setCount(count + 1);
    setFirstIndex(firstIndex + 7);
    setLastIndex(lastIndex + 7);
  }

  const previousCall = () => {
    setCount(count - 1);
    setFirstIndex(firstIndex - 7);
    setLastIndex(lastIndex - 7);
  }

  return (
    <div className="tabelBase" data-test-id="usertable">
      {isLoading && <Loading />}
      <div className="titleHeader d-flex align-items-center justify-content-between">
        <div className="info">
          <h6>Users</h6>
        </div>
        <div className="headerAction d-flex align-items-center">
          <div className="searchWIC">
            <input type="text" className='form-control' value={searchData} onChange={(e) => setSearchData(e.target.value)} />
            <img className="inputIcon" src={process.env.REACT_APP_PUBLIC_URL + 'images/users/search.svg'} alt="inputIcon" />
          </div>
          <UserModal successCallback={fetchAllUserDetails} userId={userId} />
        </div>
      </div>
      <table className='table table-striped bordered'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Organization</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            userData.filter((datas) => {
              if (searchData === '') {
                return datas;
              }
              if (datas.firstName.toLowerCase().includes(searchData.toLowerCase())) {
                return datas;
              }
              return false;
            })
              .map((val) =>
                <tr key={val.userId}>
                  {showEdit && editId === val.userId ?
                    <td>
                      <div className='inputBox'>
                        <input type="text" className='firstName' defaultValue={val.firstName} onChange={(e) => handleFirstName(e.target.value)} />
                        <input type="text" defaultValue={val.lastName} onChange={(e) => handleLastName(e.target.value)} />
                      </div>
                    </td>
                    :
                    <td>{val.firstName}{val.lastName}</td>}
                  <td>{val.orgEmail}</td>
                  <td>{val.organization}</td>
                  {showEdit && editId === val.userId ?
                    <td>
                      <select onChange={(e) => handleStatus(e.target.value)}>
                        {val.status === "Pending" ? <option>Pending</option> : null}
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    :
                    <td>{val.status}</td>}
                  <td>
                    {showEdit && editId === val.userId ?
                      (<span>
                        <Button className='cancelBtn' onClick={() => setShowEdit(false)}>Cancel</Button>
                        <Button className='saveBtn' onClick={updateUser}>Save</Button>
                      </span>) :
                      (<Button variant="link" id={val.userId} onClick={() => handleClick(val.userId)}>
                        <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/edit.svg'} alt="Edit" />
                      </Button>)
                    }
                    <Button
                      variant="link"
                      onClick={() => handleShow(val)}
                      disabled={val.userId === localStorage.getItem('id') ? 'disabled' : ''}
                    >
                      <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/bin.svg'} alt="Bin" />
                    </Button>
                  </td>
                </tr>
              )}
        </tbody>
        <div className='pageBtn'>
          <span><i class="fa fa-angle-double-left" aria-hidden="true" /></span>
          <Button className='previousBtn' onClick={previousCall}>01</Button>
          <Button className='nextBtn' onClick={nextCall}>{count}</Button>
          <span><i class="fa fa-angle-double-right" aria-hidden="true" /></span>
        </div>
      </table>

      {showAlert && (
        <Alert variant={!error ? 'success' : 'danger'} className="alertWrapper" onClose={closeAlert} dismissible>
          <Alert.Heading>{alertMessage}</Alert.Heading>
        </Alert>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Body className="p-5">Are you sure you want to delete this user ?</Modal.Body>
        <Modal.Footer className="p-3">
          <Button
            variant="secondary"
            onClick={() => {
              handleClose();
              buttonTracker(gaEvents.CANCEL_DELETE_USER);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default UsersList;