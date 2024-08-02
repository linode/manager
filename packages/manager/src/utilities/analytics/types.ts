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
  headerName?: string; // Paper, modal, or drawer name.
  interaction: string;
  label: string;
  subheaderName?: string;
}
export interface LinodeCreateFormEventOptions extends FormEventOptions {
  createType: LinodeCreateType;
  interaction: 'change' | 'clear' | 'click';
}

export interface AnalyticsPayload extends Omit<AnalyticsEvent, 'data'> {
  data?: string;
}
