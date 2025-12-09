import type { LinodeCreateType } from '@linode/utilities';

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
  url: string;
}

export interface CustomAnalyticsData {
  /**
   * Whether the Linode was powered before before being cloned.
   */
  isLinodePoweredOff?: boolean;

  /**
   * Whether a newly created Linode is Secure VM compliant:
   * - Undefined for users the policy doesn't apply
   * - True for compliant Linodes
   * - False when choosing to override the policy
   */
  secureVMCompliant?: boolean;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  data?: CustomAnalyticsData;
  label?: string;
  value?: number;
}

export type FormEventType =
  | 'formError'
  | 'formInput'
  | 'formStart'
  | 'formStepInteraction'
  | 'formSubmit';

export type FormPayload =
  | BasicFormEvent
  | FormErrorEvent
  | FormInputEvent
  | FormStepEvent;

export interface BasicFormEvent {
  formName: string;
}

export interface FormInputEvent extends BasicFormEvent {
  inputValue: string;
}

export interface FormStepEvent extends BasicFormEvent {
  stepName: string;
}

export interface FormErrorEvent extends BasicFormEvent {
  formError: string;
}

// To be used with form input and step events for consistent event formatting.
export interface FormEventOptions {
  /**
   * Paper, modal, or drawer name. If undefined, will be formatted as "No header".
   */
  headerName?: string;
  /**
   * The type of UI interaction (e.g. click) the user takes to trigger the event.
   */
  interaction: string;
  /**
   * The label of the button, form field, or other UI element the interaction is performed on.
   */
  label: string;
  /**
   * Optional; e.g. an input field label visible in UI. If undefined, only the header will be sent.
   */
  subheaderName?: string;
  /**
   * If true, `label` will be modified to include an identifier that tells the Adobe backend
   * to only track this event once per page view.
   * @default false
   */
  trackOnce?: boolean;
}
export interface LinodeCreateFormEventOptions extends FormEventOptions {
  createType: LinodeCreateType;
  interaction: 'change' | 'clear' | 'click';
}

export interface AnalyticsPayload extends Omit<AnalyticsEvent, 'data'> {
  data?: string;
}
