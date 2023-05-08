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
  linkGAEvent: LinkGAEvent;
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

const GuideLinks = (guides: ResourcesLinkSection, linkGAEvent: LinkGAEvent) => (
  <ResourceLinks links={guides.links} linkGAEvent={linkGAEvent} />
);

const YoutubeLinks = (
  youtube: ResourcesLinkSection,
  linkGAEvent: LinkGAEvent
) => <ResourceLinks links={youtube.links} linkGAEvent={linkGAEvent} />;

export const ResourcesSection = (props: ResourcesSectionProps) => {
  const {
    buttonProps,
    CustomResource = () => null,
    descriptionMaxWidth,
    gettingStartedGuidesData,
    headers,
    icon,
    linkGAEvent,
    showTransferDisplay,
    youtubeLinkData,
    wide = false,
  } = props;
  const { title, subtitle, description } = headers;

  return (
    <Placeholder
      buttonProps={buttonProps}
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
                  linkGAEvent,
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
            {GuideLinks(gettingStartedGuidesData, linkGAEvent)}
          </ResourcesLinksSubSection>
          {CustomResource && <CustomResource />}
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
                <ResourcesLinkIcon
                  icon={<ExternalLinkIcon />}
                  iconType="external"
                />
              </ResourcesMoreLink>
            )}
            title={youtubeLinkData.title}
          >
            {YoutubeLinks(youtubeLinkData, linkGAEvent)}
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
