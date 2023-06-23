import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import ExternalLinkIcon from 'src/assets/icons/external-link.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import Typography from 'src/components/core/Typography';
import { ResourcesLinkIcon } from 'src/components/EmptyLandingPageResources/ResourcesLinkIcon';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import type {
  linkAnalyticsEvent,
  ResourcesHeaders,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import {
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

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
  CustomResource?: () => JSX.Element;
  /**
   * Allow to set a custom max width for the description (better word wrapping)
   * */
  descriptionMaxWidth?: number;
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
  linkAnalyticsEvent: linkAnalyticsEvent;
  /**
   * If true, the transfer display will be shown at the bottom
   * */
  showTransferDisplay?: boolean;
  /**
   * The data for the youtube links section
   */
  youtubeLinkData: ResourcesLinkSection;
  /**
   * If true, the section will be 100% width (more than 2 columns)
   *
   * @example true on linodes empty state landing
   * @default true
   * */
  wide?: boolean;
}

const GuideLinks = (
  guides: ResourcesLinkSection,
  linkAnalyticsEvent: linkAnalyticsEvent
) => (
  <ResourceLinks links={guides.links} linkAnalyticsEvent={linkAnalyticsEvent} />
);

const YoutubeLinks = (
  youtube: ResourcesLinkSection,
  linkAnalyticsEvent: linkAnalyticsEvent
) => (
  <ResourceLinks
    links={youtube.links}
    linkAnalyticsEvent={linkAnalyticsEvent}
  />
);

export const ResourcesSection = (props: ResourcesSectionProps) => {
  const {
    buttonProps,
    CustomResource = () => null,
    descriptionMaxWidth,
    gettingStartedGuidesData,
    headers,
    icon,
    linkAnalyticsEvent,
    showTransferDisplay,
    youtubeLinkData,
    wide = false,
  } = props;
  const { title, subtitle, description } = headers;

  return (
    <Placeholder
      buttonProps={buttonProps}
      dataQAPlaceholder="resources-section"
      descriptionMaxWidth={descriptionMaxWidth}
      icon={icon}
      isEntity
      linksSection={
        <ResourcesLinksSection wide={wide}>
          <ResourcesLinksSubSection
            icon={<DocsIcon />}
            MoreLink={(props) => (
              <ResourcesMoreLink
                onClick={getLinkOnClick(
                  linkAnalyticsEvent,
                  gettingStartedGuidesData.moreInfo.text
                )}
                to={gettingStartedGuidesData.moreInfo.to}
                {...props}
              >
                {gettingStartedGuidesData.moreInfo.text}
                <ResourcesLinkIcon icon={<PointerIcon />} iconType="pointer" />
              </ResourcesMoreLink>
            )}
            title={gettingStartedGuidesData.title}
          >
            {GuideLinks(gettingStartedGuidesData, linkAnalyticsEvent)}
          </ResourcesLinksSubSection>
          {CustomResource && <CustomResource />}
          <ResourcesLinksSubSection
            icon={<YoutubeIcon />}
            MoreLink={(props) => (
              <ResourcesMoreLink
                external
                onClick={getLinkOnClick(
                  linkAnalyticsEvent,
                  youtubeMoreLinkLabel
                )}
                to={youtubeChannelLink}
                {...props}
              >
                {youtubeMoreLinkText}
                <ResourcesLinkIcon
                  icon={<ExternalLinkIcon />}
                  iconType="external"
                />
              </ResourcesMoreLink>
            )}
            title={youtubeLinkData.title}
          >
            {YoutubeLinks(youtubeLinkData, linkAnalyticsEvent)}
          </ResourcesLinksSubSection>
        </ResourcesLinksSection>
      }
      showTransferDisplay={showTransferDisplay}
      subtitle={subtitle}
      title={title}
    >
      <Typography variant="subtitle1">{description}</Typography>
    </Placeholder>
  );
};
