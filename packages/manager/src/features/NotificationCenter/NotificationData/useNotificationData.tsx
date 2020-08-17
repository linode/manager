import SupportNotifications from './SupportNotifications';

export const useNotificationData = () => {
  const support = SupportNotifications();

  return {
    support
  };
};

export default useNotificationData;
