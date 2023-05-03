import * as React from 'react';
import { useHistory } from 'react-router-dom';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import {
  docsLink,
  getLinkOnClick,
  guidesMoreLinkText,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import { sendEvent } from 'src/utilities/ga';
import { StyledVolumeIcon } from './VolumesLandingEmptyState.styles';

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

const GuideLinks = (
  <ResourceLinks links={guidesLinkData} linkGAEvent={linkGAEventTemplate} />
);

const YoutubeLinks = (
  <ResourceLinks links={youtubeLinkData} linkGAEvent={linkGAEventTemplate} />
);

const VolumesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <Placeholder
      title="Volumes"
      subtitle="NVM block storage service"
      icon={StyledVolumeIcon}
      isEntity
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
        <ResourcesLinksSection>
          <ResourcesLinksSubSection
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
                <PointerIcon className="pointerIcon" />
              </Link>
            )}
          >
            {GuideLinks}
          </ResourcesLinksSubSection>
          <ResourcesLinksSubSection
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
                <ExternalLinkIcon style={{ marginLeft: 8 }} />
              </Link>
            )}
          >
            {YoutubeLinks}
          </ResourcesLinksSubSection>
        </ResourcesLinksSection>
      }
    >
      <Typography variant="subtitle1">
        Attach scalable, fault-tolerant, and performant block storage volumes to
        your Linode Compute Instances or Kubernetes Clusters.
      </Typography>
    </Placeholder>
  );
};

export { VolumesLandingEmptyState };
