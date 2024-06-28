import { ADOBE_ANALYTICS_URL } from 'src/constants';

import type { AnalyticsEvent, FormEventType, FormPayload } from './types';
import type { FormAnalyticsContextProps } from 'src/context/useFormAnalyticsContext';

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
  const formEventPayload = {
    formName: eventPayload.formName.replace(/\|/g, ''),
  };
  if (!ADOBE_ANALYTICS_URL) {
    return;
  }

  // Send a Direct Call Rule if our environment is configured with an Adobe Launch script.
  if (window._satellite) {
    // Depending on the type of form event, send the correct payload for a form focus, input, step, or error.
    if (eventType === 'formInput' && 'inputValue' in eventPayload) {
      formEventPayload['inputValue'] = eventPayload.inputValue.replace(
        /\|/g,
        ''
      );
    } else if (
      eventType === 'formStepInteraction' &&
      'stepName' in eventPayload
    ) {
      formEventPayload['stepName'] = eventPayload.stepName.replace(/\|/g, '');
    } else if (eventType === 'formError' && 'formError' in eventPayload) {
      formEventPayload['formError'] = eventPayload;
    }
    window._satellite.track(eventType, formEventPayload);
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
 * Sends a formFocus event to indicate the user's first point of contact with the form (e.g. the start).
 * This must only be fired *once* per form, so we use context to keep track of the first touched form input.
 * For analytics purposes, "form input" might mean a form field, docs link, tab, button, etc.
 * @param formName
 * @param firstTouchedInputName
 * @param context
 */
export const handleFormFocusEvent = (
  formName: string,
  firstTouchedInputName: string,
  context: FormAnalyticsContextProps
) => {
  // Update the first touched input once per form.
  // It will be undefined at context initialization, indicating that a user has not yet interacted with the form.
  if (!context.firstTouchedInputName) {
    context.updateState({
      firstTouchedInputName,
      formName,
    });
    // eslint-disable-next-line no-console
    console.log(`Fire a formFocus event on ${firstTouchedInputName}!`);
    // TODO: call the actual formFocus event here.
  }
};
