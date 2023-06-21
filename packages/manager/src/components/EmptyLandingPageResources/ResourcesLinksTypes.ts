interface ResourcesLink {
  to: string;
  text: string;
  external?: boolean;
}

export interface linkAnalyticsEvent {
  category: string;
  action: string;
}

export interface ResourcesHeaders {
  title: string;
  subtitle: string;
  description: string;
}

export interface ResourcesLinks {
  links: ResourcesLink[];
  linkAnalyticsEvent: linkAnalyticsEvent;
}

export interface ResourcesLinkSection {
  title: string;
  links: ResourcesLinks['links'];
  moreInfo: ResourcesLink;
}
