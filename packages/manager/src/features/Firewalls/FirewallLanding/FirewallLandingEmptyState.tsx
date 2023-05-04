import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import PointerIcon from 'src/assets/icons/pointer.svg';
import Typography from 'src/components/core/Typography';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { ResourcesLinkIcon } from 'src/components/EmptyLandingPageResources/ResourcesLinkIcon';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { sendEvent } from 'src/utilities/ga';
import {
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import {
  gettingStartedGuides,
  headers,
  linkGAEvent,
  youtubeLinkData,
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

const { title, subtitle, description } = headers;

export const FirewallLandingEmptyState = (props: Props) => {
  const { openAddFirewallDrawer } = props;

  return (
    <Placeholder
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
      icon={FirewallIcon}
      isEntity
      linksSection={
        <ResourcesLinksSection wide={false}>
          <ResourcesLinksSubSection
            title={gettingStartedGuides.title}
            icon={<DocsIcon />}
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
            title={youtubeLinkData.title}
            icon={<YoutubeIcon />}
            external
            MoreLink={(props) => (
              <Link
                onClick={getLinkOnClick(linkGAEvent, youtubeMoreLinkLabel)}
                to={youtubeChannelLink}
                {...props}
              >
                {youtubeMoreLinkText}
                <ResourcesLinkIcon icon={<ExternalLinkIcon />} />
              </Link>
            )}
          >
            {YoutubeLinks}
          </ResourcesLinksSubSection>
        </ResourcesLinksSection>
      }
      subtitle={subtitle}
      title={title}
    >
      <Typography variant="subtitle1">{description}</Typography>
    </Placeholder>
  );
};
