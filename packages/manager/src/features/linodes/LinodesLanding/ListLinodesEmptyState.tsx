import * as React from 'react';
import { useHistory } from 'react-router-dom';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';
import Grid from 'src/components/Grid';
import DocsIcon from 'src/assets/icons/docs.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';

export const ListLinodesEmptyState: React.FC<{}> = (_) => {
  const { push } = useHistory();

  const emptyLinodeLandingGAEventTemplate = {
    category: 'Linodes landing page empty',
    action: 'Click:link',
  };

  return (
    <Placeholder
      title={'Linodes'}
      subtitle="Cloud-based virtual machines"
      icon={LinodeSvg}
      isEntity
      buttonProps={[
        {
          onClick: () => {
            push('/linodes/create');
          },
          children: 'Create Linode',
        },
      ]}
      linksSection={
        <>
          <Grid item xs={12} md={4}>
            <DocsIcon />{' '}
            <Typography display="inline" variant="h2">
              Getting Started Guides
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <MarketplaceIcon />{' '}
            <Typography display="inline" variant="h2">
              Deploy an App
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <YoutubeIcon />{' '}
            <Typography display="inline" variant="h2">
              Getting Started Playlist
            </Typography>
          </Grid>
        </>
      }
    >
      <Typography
        style={{ fontSize: '1.125rem', lineHeight: '1.75rem', maxWidth: 541 }}
      >
        Host your websites, applications, or any other Cloud-based workloads on
        a scalable and reliable platform.
      </Typography>
    </Placeholder>
  );
};

export default React.memo(ListLinodesEmptyState);
