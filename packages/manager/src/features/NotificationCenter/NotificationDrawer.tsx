import * as React from 'react';
import Drawer from 'src/components/Drawer';
import Alerts from './Alerts';
import Community from './Community';
import Maintenance from './Maintenance';
import OpenSupportTickets from './OpenSupportTickets';
import PastDue from './PastDue';
import PendingActions from './PendingActions';
import useAccount from 'src/hooks/useAccount';

interface Props {
  noggin?: any;
}

export const NotificationDrawer: React.FC<Props> = props => {
  const { account } = useAccount();
  const balance = account.data?.balance ?? 0;
  return (
    <Drawer open={true} onClose={() => null} title="Notifications">
      {balance > 0 ? <PastDue balance={balance} /> : null}
      <PendingActions />
      <Maintenance />
      <Alerts />
      <OpenSupportTickets />
      <Community communityEvents={[]} />
    </Drawer>
  );
};

export default React.memo(NotificationDrawer);
