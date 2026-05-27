import type {
  AnalyticsPayload,
  FormPayload,
} from '@akamai/compute-ui-core/analytics';

// Define a custom type for the _satellite object
declare global {
  interface Window {
    _satellite: DTMSatellite;
  }
}

type DTMSatellite = {
  track: (
    eventName: string,
    eventPayload: AnalyticsPayload | FormPayload | PageViewPayload
  ) => void;
};

interface PageViewPayload {
  euuid?: string;
  url: string;
}
