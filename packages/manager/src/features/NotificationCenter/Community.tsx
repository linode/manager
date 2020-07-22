import * as React from 'react';
import { Link } from 'react-router-dom';
import CommunityIcon from 'src/assets/community.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection, { NotificationItem } from './NotificationSection';

export const Community: React.FC<{}> = _ => {
  const communityUpdates: NotificationItem[] = [
    {
      id: 'community-12345',
      body: (
        <Typography>
          <Link to="/">mlogan</Link> replied to{' '}
          <Link to="/">&quot;NGINX as Node.js front end?&quot;</Link>
        </Typography>
      ),
      timeStamp: '2020-07-20T19:03:37'
    },
    {
      id: 'community-12346',
      body: (
        <Typography>
          <Link to="/">mlogan</Link> replied to{' '}
          <Link to="/">&quot;PostgreSQL performance tuning&quot;</Link>
        </Typography>
      ),
      timeStamp: '2020-07-20T19:03:37'
    },
    {
      id: 'community-18347',
      body: (
        <Typography>
          <Link to="/">dsweeney</Link> replied to{' '}
          <Link to="/">&quot;Lost my ssh key...help!&quot;</Link>
        </Typography>
      ),
      timeStamp: '2020-07-20T16:03:37'
    },
    {
      id: 'community-12347',
      body: (
        <Typography>
          <Link to="/">mcintosh</Link> replied to{' '}
          <Link to="/">&quot;N+1 query problem&quot;</Link>
        </Typography>
      ),
      timeStamp: '2020-07-20T14:03:37'
    },
    {
      id: 'community-12445',
      body: (
        <Typography>
          <Link to="/">jschaeffer</Link> replied to{' '}
          <Link to="/">&quot;Golang is a useless vanity project&quot;</Link>
        </Typography>
      ),
      timeStamp: '2020-07-20T12:03:37'
    }
  ];
  return (
    <NotificationSection
      content={communityUpdates}
      header="Community Updates"
      icon={<CommunityIcon />}
    />
  );
};

export default React.memo(Community);
