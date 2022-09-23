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
import ListItem from 'src/components/core/ListItem';
import Grid from 'src/components/Grid';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import ExternalLink from 'src/components/ExternalLink';
import Chip from 'src/components/core/Chip';
import LinksSection from './LinksSection';

const chipStyle = {
  backgroundColor: '#FBFBFB',
  border: '1px solid #EEEEEE',
  height: '34px',
  width: 137,
};

const chipDeleteButton = (
  <button
    style={{
      backgroundColor: '#FBFBFB',
      borderRadius: 0,
      border: 'none',
      width: '30px',
      height: '30px',
      borderLeft: '1px solid #EEEEEE',
    }}
  >
    <PointerIcon />
  </button>
);

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
      <Divider
        style={{
          marginLeft: '16px',
          marginRight: '16px',
          marginBottom: '32px',
        }}
      />
      <Grid
        container
        spacing={2}
        style={{ justifyContent: 'space-between', margin: 8 }}
      >
        <LinksSection
          title="Getting Started Guides"
          icon={DocsIcon}
          moreLink={
            <Link to="https://www.linode.com/docs/">
              Check out all our Docs <PointerIcon />
            </Link>
          }
        >
          <List>
            <ListItem disableGutters>
              <Link to="https://www.linode.com/docs/guides/creating-a-compute-instance/">
                Create a Compute Instance
              </Link>
            </ListItem>
            <ListItem disableGutters>
              <Link to="https://www.linode.com/docs/guides/getting-started">
                Getting Started with Linode Compute Instances
              </Link>
            </ListItem>
            <ListItem disableGutters>
              <Link to="https://www.linode.com/docs/guides/understanding-billing-and-payments/">
                Understanding Billing and Payment
              </Link>
            </ListItem>
            <ListItem disableGutters>
              <Link to="https://www.linode.com/docs/guides/set-up-web-server-host-website/">
                Hosting a Website or Application on Linode
              </Link>
            </ListItem>
          </List>
        </LinksSection>
        <LinksSection
          title="Deploy an App"
          icon={MarketplaceIcon}
          moreLink={
            <Link to="https://cloud.linode.com/linodes/create?type=One-Click">
              See all Marketplace apps <PointerIcon />
            </Link>
          }
        >
          <Grid item container xs={12} spacing={1}>
            <Chip
              label="Wordpress"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
            <Chip
              label="aaPanel"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
          </Grid>
          <Grid item container xs={12} spacing={1}>
            <Chip
              label="cPanel"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
            <Chip
              label="Cloudtron"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
          </Grid>
          <Grid item container xs={12} spacing={1}>
            <Chip
              label="Plesk"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
            <Chip
              label="Joomla"
              deleteIcon={chipDeleteButton}
              onDelete={() => undefined}
              style={chipStyle}
            />
          </Grid>
        </LinksSection>
        <LinksSection
          title="Getting Started Playlist"
          icon={YoutubeIcon}
          moreLink={
            <ExternalLink
              link="https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ"
              text="View the complete playlist "
              fixedIcon
            />
          }
        >
          <List>
            <ListItem disableGutters>
              <ExternalLink
                link="https://www.youtube.com/watch?v=KEK-ZxrGxMA"
                text="Linode Getting Started Guide "
                fixedIcon
              />
            </ListItem>
            <ListItem disableGutters>
              <ExternalLink
                link="https://www.youtube.com/watch?v=AVXYq8aL47Q"
                text="Common Linux Commands "
                fixedIcon
              />
            </ListItem>
            <ListItem disableGutters>
              <ExternalLink
                link="https://www.youtube.com/watch?v=lMC5VNoZFhg"
                text="Copying Files to a Compute Instance "
                fixedIcon
              />
            </ListItem>
            <ListItem disableGutters>
              <ExternalLink
                link="https://www.youtube.com/watch?v=ZVMckBHd7WA&list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ&index=2"
                text="How to use SSH "
                fixedIcon
              />
            </ListItem>
          </List>
        </LinksSection>
      </Grid>
    </>
  );
};

export default React.memo(ListLinodesEmptyState);
