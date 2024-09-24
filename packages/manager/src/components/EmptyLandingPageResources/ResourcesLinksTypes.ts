interface ResourcesLink {
  external?: boolean;
  text: string;
  to: string;
}

export interface linkAnalyticsEvent {
  action: string;
  category: string;
}

export interface ResourcesHeaders {
  description: string;
  logo?: React.ReactNode;
  subtitle: string;
  title: string;
}

export interface ResourcesLinks {
  linkAnalyticsEvent: linkAnalyticsEvent;
  links: ResourcesLink[];
  onClick?: () => void;
}

export interface ResourcesLinkSection {
  links: ResourcesLinks['links'];
  moreInfo: ResourcesLink;
  title: string;
}
