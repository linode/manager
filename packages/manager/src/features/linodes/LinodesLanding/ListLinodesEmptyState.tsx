import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DocsIcon from 'src/assets/icons/docs.svg';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import MarketplaceIcon from 'src/assets/icons/marketplace.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import {
  docsLink,
  getLinkOnClick,
  guidesMoreLinkText,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import { sendEvent } from 'src/utilities/ga';
import AppsSection from './AppsSection';
import LinksSection from './LinksSection';
import LinksSubSection from './LinksSubSection';

const gaCategory = 'Linodes landing page empty';
const linkGAEventTemplate = {
  category: gaCategory,
  action: 'Click:link',
};

const gettingStartedGuideLinksData = [
  {
    to: 'https://www.linode.com/docs/guides/creating-a-compute-instance/',
    text: 'Create a Compute Instance',
  },
  {
    to: 'https://www.linode.com/docs/guides/getting-started/',
    text: 'Getting Started with Linode Compute Instances',
  },
  {
    to:
      'https://www.linode.com/docs/guides/understanding-billing-and-payments/',
    text: 'Understanding Billing and Payment',
  },
  {
    to: 'https://www.linode.com/docs/guides/set-up-web-server-host-website/',
    text: 'Hosting a Website or Application on Linode',
  },
];

const youtubeLinksData = [
  {
    to: 'https://www.youtube.com/watch?v=KEK-ZxrGxMA',
    text: 'Linode Getting Started Guide',
  },
  {
    to: 'https://www.youtube.com/watch?v=AVXYq8aL47Q',
    text: 'Common Linux Commands',
  },
  {
    to: 'https://www.youtube.com/watch?v=lMC5VNoZFhg',
    text: 'Copying Files to a Compute Instance',
  },
  {
    to:
      'https://www.youtube.com/watch?v=ZVMckBHd7WA&list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ&index=2',
    text: 'How to use SSH',
  },
];

const guideLinks = (
  <List>
    {gettingStartedGuideLinksData.map((linkData) => (
      <ListItem key={linkData.to}>
        <Link
          to={linkData.to}
          onClick={getLinkOnClick(linkGAEventTemplate, linkData.text)}
        >
          {linkData.text}
        </Link>
      </ListItem>
    ))}
  </List>
);

const appsMoreLinkText = 'See all Marketplace apps';

const youtubeLinks = (
  <List>
    {youtubeLinksData.map((linkData) => (
      <ListItem key={linkData.to}>
        <Link
          onClick={getLinkOnClick(linkGAEventTemplate, linkData.text)}
          to={linkData.to}
        >
          {linkData.text}
          <ExternalLinkIcon />
        </Link>
      </ListItem>
    ))}
  </List>
);

const useStyles = makeStyles((theme: Theme) => ({
  placeholderAdjustment: {
    padding: `${theme.spacing(2)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0 ${theme.spacing(4)}`,
    },
  },
}));

export const ListLinodesEmptyState: React.FC<{}> = (_) => {
  const classes = useStyles();

  const { push } = useHistory();

  return (
    <Placeholder
      title={'Linodes'}
      subtitle="Cloud-based virtual machines"
      icon={LinodeSvg}
      isEntity
      className={classes.placeholderAdjustment}
      buttonProps={[
        {
          onClick: () => {
            push('/linodes/create');
            sendEvent({
              category: gaCategory,
              action: 'Click:button',
              label: 'Create Linode',
            });
          },
          children: 'Create Linode',
        },
      ]}
      linksSection={
        <LinksSection>
          <LinksSubSection
            title="Getting Started Guides"
            icon={<DocsIcon />}
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(
                  linkGAEventTemplate,
                  guidesMoreLinkText
                )}
                to={docsLink}
                {...props}
              >
                {guidesMoreLinkText}
                <PointerIcon />
              </Link>
            )}
          >
            {guideLinks}
          </LinksSubSection>
          <LinksSubSection
            title="Deploy an App"
            icon={<MarketplaceIcon />}
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(linkGAEventTemplate, appsMoreLinkText)}
                to="/linodes/create?type=One-Click"
                {...props}
              >
                {appsMoreLinkText}
                <PointerIcon />
              </Link>
            )}
          >
            <AppsSection />
          </LinksSubSection>
          <LinksSubSection
            title="Video Playlist"
            icon={<YoutubeIcon />}
            external
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(
                  linkGAEventTemplate,
                  youtubeMoreLinkLabel
                )}
                to={youtubeChannelLink}
                {...props}
              >
                {youtubeMoreLinkText}
                <ExternalLinkIcon />
              </Link>
            )}
          >
            {youtubeLinks}
          </LinksSubSection>
        </LinksSection>
      }
      showTransferDisplay
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
