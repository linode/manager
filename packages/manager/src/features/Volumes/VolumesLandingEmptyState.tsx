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
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import { sendEvent } from 'src/utilities/ga';
import { StyledVolumeIcon } from './VolumesLandingEmptyState.styles';
import {
  headers,
  gettingStartedGuides,
  youtubeLinkData,
  linkGAEvent,
} from './VolumesLandingEmptyStateData';

const GuideLinks = (
  <ResourceLinks links={gettingStartedGuides.links} linkGAEvent={linkGAEvent} />
);

const YoutubeLinks = (
  <ResourceLinks links={youtubeLinkData.links} linkGAEvent={linkGAEvent} />
);

const { title, subtitle, description } = headers;

const VolumesLandingEmptyState = () => {
  const { push } = useHistory();

  return (
    <Placeholder
      title={title}
      subtitle={subtitle}
      icon={StyledVolumeIcon}
      isEntity
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: linkGAEvent.category,
              action: 'Click:button',
              label: 'Create Volume',
            });
            push('/volumes/create');
          },
          children: 'Create Volume',
        },
      ]}
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
                <PointerIcon className="pointerIcon" />
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
                <ExternalLinkIcon style={{ marginLeft: 8 }} />
              </Link>
            )}
          >
            {YoutubeLinks}
          </ResourcesLinksSubSection>
        </ResourcesLinksSection>
      }
    >
      <Typography variant="subtitle1">{description}</Typography>
    </Placeholder>
  );
};

export { VolumesLandingEmptyState };
