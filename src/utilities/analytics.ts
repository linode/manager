import { event } from 'react-ga';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  data?: any;
}

/*
 * Will throw error unless analytics is initialized
 */
export const sendEvent = (eventPayload: AnalyticsEvent) => {
  event(eventPayload);
};
