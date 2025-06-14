import { Typography } from '@linode/ui';
import * as React from 'react';
import type { JSX } from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import PointerIcon from 'src/assets/icons/pointer.svg';
import YoutubeIcon from 'src/assets/icons/youtube.svg';
import { ResourceLinks } from 'src/components/EmptyLandingPageResources/ResourcesLinks';
import { ResourcesLinksSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSection';
import { ResourcesLinksSubSection } from 'src/components/EmptyLandingPageResources/ResourcesLinksSubSection';
import { ResourcesMoreLink } from 'src/components/EmptyLandingPageResources/ResourcesMoreLink';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import {
  getLinkOnClick,
  youtubeChannelLink,
  youtubeMoreLinkLabel,
  youtubeMoreLinkText,
} from 'src/utilities/emptyStateLandingUtils';

import type {
  LinkAnalyticsEvent,
  ResourcesHeaders,
  ResourcesLinkSection,
} from 'src/components/EmptyLandingPageResources/ResourcesLinksTypes';

interface ButtonProps {
  children: string;
  disabled?: boolean;
  onClick: () => void;
  tooltipText?: string;
}

interface ResourcesSectionProps {
  /**
   * The additional copy to be rendered between primary button and resource links.
   */
  additionalCopy?: JSX.Element | string;
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
  linkAnalyticsEvent: LinkAnalyticsEvent;
  /**
   * If true, the transfer display will be shown at the bottom
   * */
  showTransferDisplay?: boolean;
  /**
   * If true, the section will be 100% width (more than 2 columns)
   *
   * @example true on linodes empty state landing
   * @default true
   * */
  wide?: boolean;
  /**
   * The data for the youtube links section
   */
  youtubeLinkData?: ResourcesLinkSection;
}

const GuideLinks = (
  guides: ResourcesLinkSection,
  linkAnalyticsEvent: LinkAnalyticsEvent
) => (
  <ResourceLinks linkAnalyticsEvent={linkAnalyticsEvent} links={guides.links} />
);

const YoutubeLinks = (
  youtube: ResourcesLinkSection,
  linkAnalyticsEvent: LinkAnalyticsEvent
) => (
  <ResourceLinks
    linkAnalyticsEvent={linkAnalyticsEvent}
    links={youtube.links}
  />
);

export const ResourcesSection = (props: ResourcesSectionProps) => {
  const {
    CustomResource = () => null,
    additionalCopy,
    buttonProps,
    descriptionMaxWidth,
    gettingStartedGuidesData,
    headers,
    icon,
    linkAnalyticsEvent,
    showTransferDisplay,
    wide = false,
    youtubeLinkData,
  } = props;
  const { description, logo, subtitle, title } = headers;

  return (
    <Placeholder
      additionalCopy={additionalCopy}
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
                <span style={{ left: 2, position: 'relative', top: 4 }}>
                  <PointerIcon />
                </span>
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
              </ResourcesMoreLink>
            )}
            title={youtubeLinkData?.title || ''}
          >
            {youtubeLinkData &&
              YoutubeLinks(youtubeLinkData, linkAnalyticsEvent)}
          </ResourcesLinksSubSection>
        </ResourcesLinksSection>
      }
      showTransferDisplay={showTransferDisplay}
      subtitle={subtitle}
      title={title}
    >
      {logo}
      <Typography variant="subtitle1">{description}</Typography>
    </Placeholder>
  );
};
