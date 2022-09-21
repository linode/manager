import * as React from 'react';
import { useHistory } from 'react-router-dom';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import { sendEvent } from 'src/utilities/ga';
import Divider from 'src/components/core/Divider';
import DocsIcon from 'src/assets/icons/docs.svg';
import List from 'src/components/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from 'src/components/core/ListItem';
import Grid from 'src/components/Grid';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import ExternalLink from 'src/components/ExternalLink';

export const ListLinodesEmptyState: React.FC<{}> = (_) => {
  const { push } = useHistory();

  /* const emptyLinodeLandingGAEventTemplate = {
   *   category: 'Linodes landing page empty',
   *   action: 'Click:link',
   * }; */

  return (
    <>
      <Placeholder
        title={'Linodes'}
        subtitle="Cloud-based virtual machines"
        icon={LinodeSvg}
        isEntity
        buttonProps={[
          {
            onClick: () => {
              sendEvent({
                category: 'Linodes landing page empty',
                action: 'Click:button',
                label: 'Create Linode',
              });
              push('/linodes/create');
            },
            children: 'Create Linode',
          },
        ]}
      >
        <Typography
          style={{
            fontSize: '1.125rem',
            lineHeight: '1.556',
            marginTop: '8px',
          }}
        >
          Host your websites, applications, or any other Cloud-based workloads
          on a scalable and reliable platform.
        </Typography>
      </Placeholder>
      <Divider />
      <List
        subheader={
          <ListSubheader
            component={Grid}
            style={{ display: 'flex' }}
            disableSticky
          >
            <DocsIcon style={{ color: '#3683DC', marginRight: 8 }} />
            <Typography variant="h2">Getting Started Guides</Typography>
          </ListSubheader>
        }
      >
        <ListItem>
          <Link to="https://www.linode.com/docs/guides/creating-a-compute-instance/">
            Create a Compute Instance
          </Link>
        </ListItem>
        <ListItem>
          <Link to="https://www.linode.com/docs/guides/getting-started">
            Getting Started with Linode Compute Instances
          </Link>
        </ListItem>
        <ListItem>
          <Link to="https://www.linode.com/docs/guides/understanding-billing-and-payments/">
            Understanding Billing and Payment
          </Link>
        </ListItem>
        <ListItem>
          <Link to="https://www.linode.com/docs/guides/set-up-web-server-host-website/">
            Hosting a Website or Application on Linode
          </Link>
        </ListItem>
        <ListItem>
          <Link to="https://www.linode.com/docs/">Check out all our Docs</Link>
        </ListItem>
      </List>
      <List
        subheader={
          <ListSubheader
            component={Grid}
            style={{ display: 'flex' }}
            disableSticky
          >
            <MarketplaceIcon style={{ marginRight: 8 }} />
            <Typography variant="h2">Deploy an App</Typography>
          </ListSubheader>
        }
      ></List>
      <List
        subheader={
          <ListSubheader
            component={Grid}
            style={{ display: 'flex' }}
            disableSticky
          >
            <YoutubeIcon style={{ marginRight: 8 }} />
            <Typography variant="h2">Getting Started Playlist</Typography>
          </ListSubheader>
        }
      >
        <ListItem>
          <ExternalLink
            link="https://www.youtube.com/watch?v=KEK-ZxrGxMA"
            text="Linode Getting Started Guide"
            fixedIcon
          />
        </ListItem>
        <ListItem>
          <ExternalLink
            link="https://www.youtube.com/watch?v=AVXYq8aL47Q"
            text="Common Linux Commands"
            fixedIcon
          />
        </ListItem>
        <ListItem>
          <ExternalLink
            link="https://www.youtube.com/watch?v=lMC5VNoZFhg"
            text="Copying Files to a Compute Instance"
            fixedIcon
          />
        </ListItem>
        <ListItem>
          <ExternalLink
            link="https://www.youtube.com/watch?v=ZVMckBHd7WA&list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ&index=2"
            text="How to use SSH"
            fixedIcon
          />
        </ListItem>
        <ListItem>
          <ExternalLink
            link="https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ"
            text="View the complete playlist"
            fixedIcon
          />
        </ListItem>
      </List>
    </>
  );
};

export default React.memo(ListLinodesEmptyState);
