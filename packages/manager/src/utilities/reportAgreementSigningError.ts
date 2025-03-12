import { reportException } from 'src/exceptionReporting';

export const reportAgreementSigningError = (err: unknown) => {
  let customErrorMessage =
    'Expected to sign the EU agreement, but the request resulted in an error';
  const apiErrorMessage = Array.isArray(err) && err?.[0]?.reason;

  if (apiErrorMessage) {
    customErrorMessage += `: ${apiErrorMessage}`;
  }

  reportException(customErrorMessage);
};
