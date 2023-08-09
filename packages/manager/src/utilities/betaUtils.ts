import { DateTime } from 'luxon';

import { Beta } from '@linode/api-v4/lib/betas';
import { AccountBeta } from '@linode/api-v4/lib/account';

type BetaStatus = 'active' | 'historical' | 'available' | 'no_status';
type GenericBeta = AccountBeta | Beta;
type GenericBetaByStatus = {
  [status in BetaStatus]: GenericBeta[];
};

export const hasStarted = (beta: GenericBeta) =>
  DateTime.fromISO(beta.started) <= DateTime.now();

export const canEnd = (beta: GenericBeta) =>
  DateTime.fromISO(beta.ended ?? '').isValid;

export const willEnd = (beta: GenericBeta) => {
  return canEnd(beta) && DateTime.fromISO(beta.ended ?? '') >= DateTime.now();
};

export const willStart = (beta: GenericBeta) => !hasStarted(beta);

export const hasEnded = (beta: GenericBeta) =>
  canEnd(beta) && DateTime.fromISO(beta.ended ?? '') < DateTime.now();

export function isCustomerEnrolled(beta: Beta): boolean;
export function isCustomerEnrolled(beta: AccountBeta) {
  const enrollmentDate = DateTime.fromISO(beta.enrolled ?? '');
  return enrollmentDate.isValid && !hasEnded(beta);
}

export function wasCustomerEnrolled(beta: Beta): boolean;
export function wasCustomerEnrolled(beta: AccountBeta) {
  const enrollmentDate = DateTime.fromISO(beta.enrolled ?? '');
  return enrollmentDate.isValid && hasEnded(beta);
}

export function getBetaStatus(beta: Beta): BetaStatus;
export function getBetaStatus(beta: AccountBeta): BetaStatus {
  if (wasCustomerEnrolled(beta) && hasEnded(beta)) {
    return 'historical';
  }
  if (isCustomerEnrolled(beta) && hasStarted(beta) && !hasEnded(beta)) {
    return 'active';
  }
  if (!isCustomerEnrolled(beta) && hasStarted(beta) && !hasEnded(beta)) {
    return 'available';
  }
  return 'no_status';
}

export const categorizeBetasByStatus = (betas: GenericBeta[]) => {
  const sortedBetas: GenericBetaByStatus = {
    active: [],
    historical: [],
    available: [],
    no_status: [],
  };
  return betas.reduce((acc: GenericBetaByStatus, beta: GenericBeta) => {
    const category = getBetaStatus(beta);
    acc[category].push(beta);
    return acc;
  }, sortedBetas);
};
