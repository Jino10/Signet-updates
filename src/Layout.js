import React, { useEffect } from 'react';
import LayoutWithHeader from './Common/LayoutWithHeader';
import Login from './Pages/Authentication/Login';
import ForgetPassword from './Pages/Authentication/ForgetPassword';
import OTPVerification from './Pages/Authentication/OTPVerification';
import ResetPassword from './Pages/Authentication/ResetPassword';
import SignUp from './Pages/Authentication/SignUp';
import Dashboard from './Pages/Dashboard/Dashboard';
import Success from './Pages/Success/Success';
import Home from './Pages/Home/Home';
import NetworkHealth from './Pages/NetworkHealth/NetworkHealth';
import Tickets from './Pages/Tickets/Tickets';
import AddTicket from './Pages/Tickets/AddTicket';
import ViewTicket from './Pages/Tickets/ViewTicket';
import Chats from './Pages/Chats/Chats';
import Announcement from './Pages/Announcement/Announcement';
import EditUser from './Pages/EditUser/EditUser';
import GetSSOUserdetails from './Pages/Authentication/GetSSOUserdetails';
import TwoFactorSignIn from './Pages/Authentication/TwoFactorSignIn';
import Notification from './Pages/Notification/Notification';
import HealthCharts from './Pages/HealthCharts/HealthCharts';
import Profile from './Pages/Profile/Profile';
import Statistics from './Pages/Statistics/Statistics';
import TermsCondition from './Pages/Terms&Condition/TermsCondition';
import Privacypolicy from './Pages/PrivacyPolicy/Privacypolicy';
import { components } from './Constants/TextConstants';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Mobtickets from './Signet-Mobile-Web-UI/Mobile-Tickets/Mobtickets';
import Mobviewticket from './Signet-Mobile-Web-UI/Mobile-Tickets/Mobviewticket';
import Mobaddticket from './Signet-Mobile-Web-UI/Mobile-Tickets/Mobaddticket';
import Mobeditticket from './Signet-Mobile-Web-UI/Mobile-Tickets/Mobeditticket';
import Mobprofile from './Signet-Mobile-Web-UI/Mobile-Profile/Mobprofile';
import Mobdashboard from './Signet-Mobile-Web-UI/Mobile-Dashboard/Mobdashboard';
import Mobusers from './Signet-Mobile-Web-UI/Mobile-User/Mobusers';
import Mobedituser from './Signet-Mobile-Web-UI/Mobile-User/Mobedituser';
import Mobadduser from './Signet-Mobile-Web-UI/Mobile-User/Mobadduser';
import Mobnotification from './Signet-Mobile-Web-UI/Mobile-Notification/Mobnotification';
import Layoutwithmobile from './Signet-Mobile-Web-UI/LayoutwithMobile/Layoutwithmobile';

function Layout(props) {
  const { component } = props;
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname });
  }, [location.pathname]);

  switch (component) {
    case components.LOGIN:
      return <Login />;
    case components.SIGNUP:
      return <SignUp />;
    case components.SUCCESS:
      return <Success />;
    case components.HOME:
      return <Home />;
    case components.FORGET:
      return <ForgetPassword />;
    case components.GET_SSO_USER_DETAILS:
      return <GetSSOUserdetails />;
    case components.OTP_VERIFY:
      return <OTPVerification />;
    case components.RESET:
      return <ResetPassword />;
    case components.TERMS_AND_CONDITIONS:
      return <TermsCondition />;
    case components.PRIVACY_AND_POLICY:
      return <Privacypolicy />;
    case components.DASHBOARD:
      return LayoutWithHeader(<Dashboard />);
    case components.ANNOUNCEMENT:
      return LayoutWithHeader(<Announcement />);
    case components.NETWORK_HEALTH:
      return LayoutWithHeader(<NetworkHealth />);
    case components.HEALTH_CHARTS:
      return LayoutWithHeader(<HealthCharts />);
    case components.TICKETS:
      return LayoutWithHeader(<Tickets />);
    case components.ADD_TICKET:
      return LayoutWithHeader(<AddTicket />);
    case components.EDIT_TICKET:
      return LayoutWithHeader(<AddTicket />);
    case components.VIEW_TICKET:
      return LayoutWithHeader(<ViewTicket />);
    case components.CHATS:
      return LayoutWithHeader(<Chats />);
    case components.EDIT_USER:
      return LayoutWithHeader(<EditUser />);
    case components.TWO_FACTOR:
      return <TwoFactorSignIn />;
    case components.NOTIFICATION:
      return LayoutWithHeader(<Notification />);
    case components.PROFILE:
      return LayoutWithHeader(<Profile />);
    case components.STATISTICS:
      return LayoutWithHeader(<Statistics />);

    case components.MOB_TICKETS:
      return Layoutwithmobile(<Mobtickets />);
    case components.MOB_VIEW_TICKET:
      return Layoutwithmobile(<Mobviewticket />);
    case components.MOB_ADD_TICKET:
      return Layoutwithmobile(<Mobaddticket />);
    case components.MOB_EDIT_TICKET:
      return Layoutwithmobile(<Mobeditticket />);
    case components.MOB_PROFILE:
      return Layoutwithmobile(<Mobprofile />);
    case components.MOB_DASHBOARD:
      return Layoutwithmobile(<Mobdashboard />);
    case components.MOB_USERS:
      return Layoutwithmobile(<Mobusers />);
    case components.MOB_EDIT_USER:
      return Layoutwithmobile(<Mobedituser />);
    case components.MOB_ADD_USER:
      return Layoutwithmobile(<Mobadduser />);
    case components.MOB_NOTIFICATION:
      return Layoutwithmobile(<Mobnotification />);

    default:
      return <div>Component not found</div>;
  }
}

export default Layout;
