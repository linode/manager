import * as React from 'react';
import { Link } from 'react-router-dom';
import ActivityIcon from 'src/assets/icons/line-chart.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection, { NotificationItem } from './NotificationSection';

export const AccountActivity: React.FC<{}> = _ => {
  const recentEvents: NotificationItem[] = [
    {
      id: 'activity-feed-12345',
      body: <Typography>Profile has been updated by blaboon.</Typography>,
      timeStamp: '2020-07-20T11:03:37'
    },
    {
      id: 'activity-feed-22345',
      body: (
        <Typography>
          Linode{` `}
          <Link to="/linode/instances/1">my-linode</Link> has been updated by
          demo-user.
        </Typography>
      ),
      timeStamp: '2020-07-20T10:03:37'
    },
    {
      id: 'activity-feed-32345',
      body: (
        <Typography>
          NodeBalancer prod-balancer has been deleted by intern-001.
        </Typography>
      ),
      timeStamp: '2020-07-20T08:03:37'
    },
    {
      id: 'activity-feed-42345',
      body: (
        <Typography>
          Linode {` `}
          <Link to="/linode/instances/2">webserver</Link> has been resized by
          mcintosh.
        </Typography>
      ),
      timeStamp: '2020-07-20T05:03:37'
    },
    {
      id: 'activity-feed-52345',
      body: (
        <Typography>Volume k8s-storage has been deleted by asauber.</Typography>
      ),
      timeStamp: '2020-06-20T05:03:37'
    }
  ];
  return (
    <NotificationSection
      content={recentEvents}
      header="Account Activity"
      icon={<ActivityIcon />}
      showMore={<Link to="/events">Event History</Link>}
    />
  );
};

export default React.memo(AccountActivity);
