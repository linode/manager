import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DocsIcon from 'src/assets/icons/docs.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import LinksSection from 'src/features/linodes/LinodesLanding/LinksSection';
import LinkSubSection from 'src/features/linodes/LinodesLanding/LinksSubSection';
import {
  getLinkOnClick,
  guidesMoreLinkText,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import { sendEvent } from 'src/utilities/ga';
import { StyledPlaceholder } from './VolumesLandingEmptyState.styles';

const guidesLinkData = [
  {
    to: 'https://www.linode.com/docs/products/storage/block-storage/',
    text: 'Overview of Block Storage',
  },
  {
    to: 'https://www.linode.com/docs/products/storage/block-storage/guides/',
    text: 'Create and Manage Block Storage Volumes',
  },
  {
    to:
      'https://www.linode.com/docs/products/storage/block-storage/guides/configure-volume/',
    text: 'Configure a Volume on a Compute Instance',
  },
];

const youtubeLinkData = [
  {
    to: 'https://www.youtube.com/watch?v=7ti25oK7UMA',
    text: 'How to Use Block Storage with Your Linode',
  },
  {
    to: 'https://www.youtube.com/watch?v=8G0cNZZIxNc',
    text: 'Block Storage Vs Object Storage',
  },
  {
    to: 'https://www.youtube.com/watch?v=Z9jZv_IHO2s',
    text:
      'How to use Block Storage to Increase Space on Your Nextcloud Instance',
  },
];

const gaCategory = 'Volumes landing page empty';
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

const VolumesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <StyledPlaceholder
      title="Volumes"
      subtitle="NVM block storage service"
      icon={VolumeIcon}
      isEntity
      showTransferDisplay
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: gaCategory,
              action: 'Click:button',
              label: 'Create Volume',
            });
            push('/volumes/create');
          },
          children: 'Create Volume',
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
        Attach scalable, fault-tolerant, and performant block storage volumes to
        your Linode Compute Instances or Kubernetes Clusters.
      </Typography>
    </StyledPlaceholder>
  );
};

export { VolumesLandingEmptyState };
