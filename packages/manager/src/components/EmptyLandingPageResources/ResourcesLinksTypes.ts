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
  subtitle: string;
  title: string;
}

export interface ResourcesLinks {
  linkAnalyticsEvent: linkAnalyticsEvent;
  links: ResourcesLink[];
}

export interface ResourcesLinkSection {
  links: ResourcesLinks['links'];
  moreInfo: ResourcesLink;
  title: string;
}
