interface ResourcesLinkProps {
  to: string;
  text: string;
  external?: boolean;
}

interface LinkGAEventTemplateProps {
  category: string;
  action: string;
}

export interface ResourcesHeaders {
  title: string;
  subtitle: string;
  description: string;
}

export interface ResourcesLinksProps {
  links: ResourcesLinkProps[];
  linkGAEvent: LinkGAEventTemplateProps;
}

export interface ResourcesLinkSectionProps {
  title: string;
  links: ResourcesLinksProps['links'];
  moreInfo: ResourcesLinkProps;
}
