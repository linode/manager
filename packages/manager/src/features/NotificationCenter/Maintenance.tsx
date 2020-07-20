import * as React from 'react';
import { Link } from 'react-router-dom';
import AlertIcon from 'src/assets/icons/flag.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection, { NotificationItem } from './NotificationSection';

export const Maintenance: React.FC<{}> = _ => {
  const maintenanceItems: NotificationItem[] = [
    {
      id: 'maintenance-12345',
      body: (
        <Typography>
          Scheduled maintenance is in progress. View{' '}
          <Link to="/support/tickets/1">Support ticket 1</Link> for details.
        </Typography>
      ),
      timeStamp: '2020-07-20T05:03:37'
    }
  ];
  return (
    <NotificationSection
      content={maintenanceItems}
      header="Maintenance"
      icon={<AlertIcon />}
    />
  );
};

export default React.memo(Maintenance);
