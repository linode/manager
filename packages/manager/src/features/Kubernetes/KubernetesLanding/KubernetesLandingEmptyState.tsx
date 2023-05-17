import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DocsIcon from 'src/assets/icons/docs.svg';
import KubernetesSvg from 'src/assets/icons/entityIcons/kubernetes.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import LinksSection from 'src/features/linodes/LinodesLanding/LinksSection';
import LinkSubSection from 'src/features/linodes/LinodesLanding/LinksSubSection';
import {
  getLinkOnClick,
  guidesMoreLinkText,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import { sendEvent } from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => ({
  placeholderAdjustment: {
    padding: `${theme.spacing(2)} 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0 ${theme.spacing(4)}`,
    },
  },
}));

const guidesLinkData = [
  {
    to: 'https://www.linode.com/docs/products/compute/kubernetes/get-started/',
    text: 'Get Started with the Linode Kubernetes Engine (LKE)',
  },
  {
    to:
      'https://www.linode.com/docs/products/compute/kubernetes/guides/create-lke-cluster',
    text: 'Create and Administer a Kubernetes Cluster on LKE',
  },
  {
    to:
      'https://www.linode.com/docs/guides/using-the-kubernetes-dashboard-on-lke/',
    text: 'Using the Kubernetes Dashboard',
  },
  {
    to: 'https://www.linode.com/docs/guides/beginners-guide-to-kubernetes/',
    text: 'A Beginner\u{2019}s Guide to Kubernetes',
  },
];

const youtubeLinkData = [
  {
    to: 'https://www.youtube.com/watch?v=erthAqqdD_c',
    text: 'Easily Deploy a Kubernetes Cluster on LKE',
  },
  {
    to: 'https://www.youtube.com/watch?v=VYUr_WvXCsY',
    text: 'Enable High Availability on an LKE Cluster',
  },
  {
    to: 'https://www.youtube.com/watch?v=odPmyT5DONg',
    text: 'Use a Load Balancer with an LKE Cluster',
  },
  {
    to: 'https://www.youtube.com/watch?v=1564_DrFRSE',
    text: 'Use TOBS (The Observability Stack) with LKE',
  },
];

const gaCategory = 'Kubernetes landing page empty';
const linkGAEventTemplate = {
  category: gaCategory,
  action: 'Click:link',
};

const guideLinks = (
  <List>
    {guidesLinkData.map((linkData) => (
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

const youtubeLinks = (
  <List>
    {youtubeLinkData.map((linkData) => (
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

const KubernetesEmptyState = () => {
  const { push } = useHistory();
  const classes = useStyles();

  return (
    <Placeholder
      title="Kubernetes"
      subtitle="Fully managed Kubernetes infrastructure"
      className={classes.placeholderAdjustment}
      icon={KubernetesSvg}
      isEntity
      showTransferDisplay
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: gaCategory,
              action: 'Click:button',
              label: 'Create Cluster',
            });
            push('/kubernetes/create');
          },
          children: 'Create Cluster',
        },
      ]}
      linksSection={
        <LinksSection>
          <LinkSubSection
            title="Getting Started Guides"
            icon={<DocsIcon />}
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(
                  linkGAEventTemplate,
                  guidesMoreLinkText
                )}
                to="https://www.linode.com/docs/"
                {...props}
              >
                {guidesMoreLinkText}
              </Link>
            )}
          >
            {guideLinks}
          </LinkSubSection>
          <LinkSubSection
            title="Video Playlist"
            icon={<YoutubeIcon />}
            external
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(
                  linkGAEventTemplate,
                  youtubeMoreLinkLabel
                )}
                to="https://www.youtube.com/playlist?list=PLTnRtjQN5ieb4XyvC9OUhp7nxzBENgCxJ"
                {...props}
              >
                {youtubeMoreLinkText}
                <ExternalLinkIcon style={{ marginLeft: 8 }} />
              </Link>
            )}
          >
            {youtubeLinks}
          </LinkSubSection>
        </LinksSection>
      }
    >
      {' '}
      <Typography variant="subtitle1">
        Deploy and scale your applications with the Linode Kubernetes Engine
        (LKE), a Kubernetes service equipped with a fully managed control plane.
      </Typography>
    </Placeholder>
  );
};

export default React.memo(KubernetesEmptyState);
