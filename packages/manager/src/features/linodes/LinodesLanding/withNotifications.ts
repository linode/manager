import { Notification } from 'linode-js-sdk/lib/account';
import { connect } from 'react-redux';
import { MapState } from 'src/store/types';

export interface WithNotifications {
  linodeNotifications: Notification[];
}

const notificationsForLinode = (id: number) => (
  notifications: Notification[]
): Notification[] => {
  return notifications.filter(
    ({ entity }) => entity && entity.type === 'linode' && entity.id === id
  );
};

const mapStateToProps: MapState<WithNotifications, { linodeId: number }> = (
  state,
  props
) => ({
  linodeNotifications: notificationsForLinode(props.linodeId)(
    state.__resources.notifications.data || []
  )
});

export default connect(mapStateToProps);
