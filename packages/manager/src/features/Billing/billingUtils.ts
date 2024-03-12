import { DateTime } from 'luxon';

import {
  AKAMAI_DATE,
  PAYMENT_HARD_MAX,
  PAYMENT_MIN,
  PAYMENT_SOFT_MAX,
} from 'src/constants';
import { TaxDetail } from 'src/featureFlags';
import { parseAPIDate } from 'src/utilities/date';

export const cleanCVV = (input: string): string => {
  // All characters except numbers
  const regex = /(([\D]))/g;

  // Prevents more than 4 characters from being submitted
  const cvv = input.slice(0, 4);
  return cvv.replace(regex, '');
};

export const getTaxID = (
  invoiceItemDate: string,
  taxDate?: string,
  country_tax?: TaxDetail
) => {
  if (!country_tax?.tax_id || !taxDate) {
    return undefined;
  }
  const taxStartedBeforeThisInvoiceItem =
    Date.parse(invoiceItemDate) > Date.parse(taxDate);
  return taxStartedBeforeThisInvoiceItem ? country_tax : undefined;
};

export const renderUnitPrice = (v: null | string) => {
  const parsedValue = parseFloat(`${v}`);
  return Number.isNaN(parsedValue) ? null : `$${parsedValue}`;
};

export const getShouldUseAkamaiBilling = (date: string) => {
  const invoiceDate = parseAPIDate(date);
  const akamaiDate = DateTime.fromSQL(AKAMAI_DATE);
  return invoiceDate > akamaiDate;
};

export function getPaymentLimits(
  balance: number | undefined
): { max: number; min: number } {
  if (balance === undefined) {
    return { max: PAYMENT_HARD_MAX, min: PAYMENT_MIN };
  }

  return {
    max: balance <= PAYMENT_SOFT_MAX ? PAYMENT_SOFT_MAX : PAYMENT_HARD_MAX,
    min: balance < PAYMENT_MIN && balance > 0 ? balance : PAYMENT_MIN,
  };
}
