import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

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
  isLinodePoweredOff?: boolean;
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
  | 'formFocus' // Focus is used for Form Start
  | 'formInput'
  | 'formStepInteraction'
  | 'formSubmit';

export type FormPayload =
  | BasicFormEvent
  | FormErrorEvent
  | FormInputEvent
  | FormStepEvent;

export type LinodeCreateFlowVersion = 'v1' | 'v2';

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

// To be used with form step events for consistent event formatting.
export interface FormStepOptions {
  action: string;
  category: string;
  formStepName?: string;
  label: string;
}

export interface LinodeCreateFormStepOptions extends FormStepOptions {
  createType: LinodeCreateType;
  // Used to distinguish between the Linode Create pre and post-refactor.
  version: LinodeCreateFlowVersion;
}

export interface AnalyticsPayload extends Omit<AnalyticsEvent, 'data'> {
  data?: string;
}
