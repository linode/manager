import { connect, MapStateToProps } from 'react-redux';

export interface WithNotifications {
  linodeNotifications: Linode.Notification[];
}

const notificationsForLinode = (id: number) => (notifications: Linode.Notification[]): Linode.Notification[] => {
  return notifications
    .filter(({ entity }) => entity && entity.type === 'linode' && entity.id === id)
}

const mapStateToProps: MapStateToProps<WithNotifications, { linodeId: number }, ApplicationState>
  = (state, props) => ({
    linodeNotifications: notificationsForLinode(props.linodeId)(state.notifications.data || [])
  });

export default connect(mapStateToProps);
