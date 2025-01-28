import { ADOBE_ANALYTICS_URL } from 'src/constants';

import type {
  AnalyticsEvent,
  BasicFormEvent,
  FormErrorEvent,
  FormEventOptions,
  FormEventType,
  FormInputEvent,
  FormPayload,
  FormStepEvent,
} from './types';

/**
 * Based on Login's OneTrust cookie list
 */
export const ONE_TRUST_COOKIE_CATEGORIES = {
  'Functional Cookies': 'C0003',
  'Performance Cookies': 'C0002', // Analytics cookies fall into this category
  'Social Media Cookies': 'C0004',
  'Strictly Necessary Cookies': 'C0001',
  'Targeting Cookies': 'C0005',
} as const;

/**
 * Given the name of a cookie, parses the document.cookie string and returns the cookie's value.
 * @param name cookie's name
 * @returns value of cookie if it exists in the document; else, undefined
 */
export const getCookie = (name: string) => {
  const cookies = document.cookie.split(';');

  const selectedCookie = cookies.find(
    (cookie) => cookie.trim().startsWith(name + '=') // Trim whitespace so position in cookie string doesn't matter
  );

  return selectedCookie?.trim().substring(name.length + 1);
};

/**
 * This function parses the categories in the OptanonConsent cookie to check if consent is provided.
 * @param optanonCookie the OptanonConsent cookie from OneTrust
 * @param selectedCategory the category code based on cookie type
 * @returns true if the user has consented to cookie enablement for the category; else, false
 */
export const checkOptanonConsent = (
  optanonCookie: string | undefined,
  selectedCategory: typeof ONE_TRUST_COOKIE_CATEGORIES[keyof typeof ONE_TRUST_COOKIE_CATEGORIES]
): boolean => {
  const optanonGroups = optanonCookie?.match(/groups=([^&]*)/);

  if (!optanonCookie || !optanonGroups) {
    return false;
  }

  // Optanon consent groups will be of the form: "C000[N]:[0/1]".
  const unencodedOptanonGroups = decodeURIComponent(optanonGroups[1]).split(
    ','
  );
  return unencodedOptanonGroups.some((consentGroup) => {
    if (consentGroup.includes(selectedCategory)) {
      return Number(consentGroup.split(':')[1]) === 1; // Cookie enabled
    }
    return false;
  });
};

/**
 * Sends a direct call rule events to Adobe for a Component Click (and optionally, with `data`, Component Details).
 * This should be used for all custom events other than form events, which should use sendFormEvent.
 * @param eventPayload - Custom event payload
 */
export const sendEvent = (eventPayload: AnalyticsEvent): void => {
  if (!ADOBE_ANALYTICS_URL) {
    return;
  }

  // Send a Direct Call Rule if our environment is configured with an Adobe Launch script
  if (window._satellite) {
    // Just don't allow pipes in strings for Adobe Analytics processing.
    window._satellite.track('custom event', {
      action: eventPayload.action.replace(/\|/g, ''),
      category: eventPayload.category.replace(/\|/g, ''),
      data: eventPayload.data ? JSON.stringify(eventPayload.data) : undefined,
      label: eventPayload.label?.replace(/\|/g, ''),
      value: eventPayload.value,
    });
  }
};

/**
 * Sends a direct call rule event to Adobe for form events.
 * @param eventPayload - Form event payload dependent on the form event type
 * @param eventType - Form focus, error, input, step, or submit
 */
export const sendFormEvent = (
  eventPayload: FormPayload,
  eventType: FormEventType
): void => {
  const formEventPayload: Partial<
    BasicFormEvent & FormErrorEvent & FormInputEvent & FormStepEvent
  > = {
    formName: eventPayload.formName.replace(/\|/g, ''),
  };
  if (!ADOBE_ANALYTICS_URL) {
    return;
  }

  // Send a Direct Call Rule if our environment is configured with an Adobe Launch script.
  if (window._satellite) {
    // Depending on the type of form event, send the correct payload for a form start, input, step, submit, or error.
    if (eventType === 'formStepInteraction' && 'stepName' in eventPayload) {
      formEventPayload.stepName = eventPayload.stepName;
    } else if (eventType === 'formError' && 'formError' in eventPayload) {
      formEventPayload.formError = eventPayload.formError;
    } else if ('inputValue' in eventPayload) {
      // Handles form start, input, and submit events.
      formEventPayload.inputValue = eventPayload.inputValue;
    }
    window._satellite.track(eventType, formEventPayload as FormPayload);
  }
};

/**
 * A Promise that will resolve once Adobe Analytics loads.
 *
 * @throws if Adobe does not load after 5 seconds
 */
export const waitForAdobeAnalyticsToBeLoaded = () =>
  new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      if (window._satellite) {
        resolve();
        clearInterval(interval);
        return;
      }

      attempts++;

      if (attempts >= 5) {
        reject('Adobe Analytics did not load after 5 seconds');
        clearInterval(interval);
      }
    }, 1000);
  });

/**
 * A utility function to consistently format the formInput 'inputValue' and formStep 'stepName' string.
 *
 * @returns a string of the format: Header:Subheader|Interaction:Component label
 */
export const getFormattedStringFromFormEventOptions = ({
  headerName,
  interaction,
  label,
  subheaderName,
  trackOnce = false,
}: FormEventOptions) => {
  return `${headerName ?? 'No header'}${
    subheaderName ? `:${subheaderName}` : ''
  }|${interaction}:${label}${trackOnce ? ':once' : ''}`;
};
