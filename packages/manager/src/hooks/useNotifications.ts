import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useNotifications = () => {
  const notifications = useSelector(
    (state: ApplicationState) => state.__resources.notifications
  );

  return notifications.data ?? [];
};

export default useNotifications;
