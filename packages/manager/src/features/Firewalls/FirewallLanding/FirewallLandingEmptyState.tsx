import * as React from 'react';
import Placeholder from 'src/components/Placeholder';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import DocsIcon from 'src/assets/icons/docs.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { sendEvent } from 'src/utilities/ga';
import {
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import {
  gettingStartedGuides,
  youtubeLinkData,
  linkGAEvent,
} from './FirewallLandingEmptyResourcesData';

interface Props {
  openAddFirewallDrawer: () => void;
}

const GuideLinks = (
  <ResourceLinks links={gettingStartedGuides.links} linkGAEvent={linkGAEvent} />
);

const YoutubeLinks = (
  <ResourceLinks links={youtubeLinkData.links} linkGAEvent={linkGAEvent} />
);

export const FirewallLandingEmptyState = React.memo((props: Props) => {
  const { openAddFirewallDrawer } = props;

  return (
    <Placeholder
      title="Firewalls"
      subtitle="Secure cloud-based firewall"
      icon={FirewallIcon}
      isEntity
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkGAEvent.category,
              action: 'Click:button',
              label: 'Create Volume',
            });
            openAddFirewallDrawer();
          },
          children: 'Create Firewall',
        },
      ]}
      linksSection={
        <div style={{ maxWidth: '762px' }}>
          <ResourcesLinksSection>
            <ResourcesLinksSubSection
              title={gettingStartedGuides.title}
              icon={DocsIcon}
              MoreLink={(props) => (
                <Link
                  onClick={getLinkOnClick(
                    linkGAEvent,
                    gettingStartedGuides.moreInfo.text
                  )}
                  to={gettingStartedGuides.moreInfo.to}
                  {...props}
                >
                  {gettingStartedGuides.moreInfo.text}
                  <PointerIcon />
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
                  onClick={getLinkOnClick(linkGAEvent, youtubeMoreLinkLabel)}
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
        </div>
      }
    >
      <Typography variant="subtitle1">
        Control network traffic to and from Linode Compute Instances with a
        simple management interface
      </Typography>
    </Placeholder>
  );
});
