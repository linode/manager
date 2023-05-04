import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import Placeholder from 'src/components/Placeholder';
import PointerIcon from 'src/assets/icons/pointer.svg';
import Typography from 'src/components/core/Typography';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { ResourcesLinkIcon } from 'src/components/EmptyLandingPageResources/ResourcesLinkIcon';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { sendEvent } from 'src/utilities/ga';
import { useHistory } from 'react-router-dom';
import {
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';
import type {
  ResourcesHeaders,
  LinkGAEvent,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

interface ButtonProps {
  onClick: () => void;
  children: string;
}

interface ResourcesSectionProps {
  /**
   * The button's handlers and text
   */
  buttonProps: ButtonProps[];
  /**
   * The custom resource to be rendered between docs and youtube links
   * @example <AppsSection /> on linodes empty state landing
   */
  customResource?: JSX.Element;
  /**
   * The data for the docs links section
   */
  gettingStartedGuidesData: ResourcesLinkSection;
  /**
   * The headers for the section (title, subtitle, description)
   */
  headers: ResourcesHeaders;
  /**
   * The icon for the section
   */
  icon: React.ComponentType<any>;
  /**
   * The event data to be sent when the call to action is clicked
   */
  linkGAEvent: LinkGAEvent;
  /**
   * The data for the youtube links section
   */
  youtubeLinkData: ResourcesLinkSection;
}

const GuideLinks = (data: any) => (
  <ResourceLinks links={data.links} linkGAEvent={data.linkGAEvent} />
);

const YoutubeLinks = (data: any) => (
  <ResourceLinks links={data.links} linkGAEvent={data} />
);

export const ResourcesSection = (props: ResourcesSectionProps) => {
  const {
    gettingStartedGuidesData,
    headers,
    icon,
    linkGAEvent,
    youtubeLinkData,
  } = props;
  const { title, subtitle, description } = headers;
  const { push } = useHistory();

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
            push('/volumes/create');
          },
          children: 'Create Volume',
        },
      ]}
      icon={icon}
      isEntity
      linksSection={
        <ResourcesLinksSection wide={false}>
          <ResourcesLinksSubSection
            icon={<DocsIcon />}
            MoreLink={(props) => (
              <ResourcesMoreLink
                onClick={getLinkOnClick(
                  linkGAEvent,
                  gettingStartedGuidesData.moreInfo.text
                )}
                to={gettingStartedGuidesData.moreInfo.to}
                {...props}
              >
                {gettingStartedGuidesData.moreInfo.text}
                <PointerIcon className="pointerIcon" />
              </ResourcesMoreLink>
            )}
            title={gettingStartedGuidesData.title}
          >
            {GuideLinks(gettingStartedGuidesData)}
          </ResourcesLinksSubSection>
          <ResourcesLinksSubSection
            icon={<YoutubeIcon />}
            MoreLink={(props) => (
              <ResourcesMoreLink
                external
                onClick={getLinkOnClick(linkGAEvent, youtubeMoreLinkLabel)}
                to={youtubeChannelLink}
                {...props}
              >
                {youtubeMoreLinkText}
                <ResourcesLinkIcon icon={<ExternalLinkIcon />} />
              </ResourcesMoreLink>
            )}
            title={youtubeLinkData.title}
          >
            {YoutubeLinks(youtubeLinkData)}
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
