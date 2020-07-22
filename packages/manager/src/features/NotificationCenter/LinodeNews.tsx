import * as React from 'react';
import { Link } from 'react-router-dom';
import LinodeIcon from 'src/assets/logo/logo.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection from './NotificationSection';

export const LinodeNews: React.FC<{}> = _ => {
  const news = [
    {
      id: 'news-item-1',
      body: (
        <Typography>
          Cloud Manager v1.15.0 has been released.{' '}
          <Link to="">Read the release notes.</Link>
        </Typography>
      )
    }
  ];
  return (
    <NotificationSection
      content={news}
      header="Linode News"
      icon={<LinodeIcon width={29} height={29} />}
    />
  );
};

export default React.memo(LinodeNews);
