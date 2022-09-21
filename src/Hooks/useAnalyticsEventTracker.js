import ReactGA from 'react-ga4';
import { analytics } from '../Config/FirebaseConfig';
import { logEvent } from 'firebase/analytics';

const useAnalyticsEventTracker = (category = 'category') => {
  const eventTracker = (action = 'action', label = 'label') => {
    ReactGA.event({ category, action, label });
  };
  const buttonTracker = (event = 'event') => {
    logEvent(analytics, event);
  };
  const linkTracker = (event = 'event') => {
    logEvent(analytics, event);
  };
  return { eventTracker, buttonTracker, linkTracker };
};

export default useAnalyticsEventTracker;
