import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  hasStarted,
  canEnd,
  willEnd,
  willStart,
  hasEnded,
  isCustomerEnrolled,
  wasCustomerEnrolled,
  getBetaStatus,
} from './betaUtils';

import { accountBetaFactory, betaFactory } from '../factories';

const generateTestBetas = () => ({
  activeNeverEndingBeta: betaFactory.build({
    started: DateTime.now().minus({ days: 30 }).toISO(),
  }),
  activeWithEndedBeta: betaFactory.build({
    started: DateTime.now().minus({ days: 30 }).toISO(),
    ended: DateTime.now().plus({ days: 30 }).toISO(),
  }),
  activeBeta: betaFactory.build({
    started: DateTime.now().minus({ days: 30 }).toISO(),
  }),
  activeAccountBeta: accountBetaFactory.build({
    started: DateTime.now().minus({ days: 30 }).toISO(),
    ended: DateTime.now().plus({ days: 30 }).toISO(),
  }),
  expiredBeta: betaFactory.build({
    started: DateTime.now().minus({ days: 60 }).toISO(),
    ended: DateTime.now().minus({ days: 30 }).toISO(),
  }),
  futureBeta: betaFactory.build({
    started: DateTime.now().plus({ days: 30 }).toISO(),
    ended: DateTime.now().plus({ days: 60 }).toISO(),
  }),
  futureAccountBeta: accountBetaFactory.build({
    started: DateTime.now().plus({ days: 30 }).toISO(),
    ended: DateTime.now().plus({ days: 60 }).toISO(),
  }),
  expiredAccountBeta: accountBetaFactory.build({
    started: DateTime.now().minus({ days: 60 }).toISO(),
    ended: DateTime.now().minus({ days: 30 }).toISO(),
  }),
  activeNeverEndingAccountBeta: accountBetaFactory.build(),
});

let betas: ReturnType<typeof generateTestBetas>;

beforeEach(() => {
  betas = generateTestBetas();
});

describe('hasStarted', () => {
  it('should return true if the beta start date is in the past or today', () => {
    const { activeNeverEndingBeta, expiredBeta } = betas;
    expect(hasStarted(activeNeverEndingBeta)).toBe(true);
    expect(hasStarted(expiredBeta)).toBe(true);
  });

  it('should return false if the beta start date is in the future', () => {
    const { futureBeta } = betas;
    expect(hasStarted(futureBeta)).toBe(false);
  });
});

describe('canEnd', () => {
  it('should return true if the beta has an end date defined', () => {
    const { activeWithEndedBeta } = betas;
    expect(canEnd(activeWithEndedBeta)).toBe(true);
  });

  it('should return false if the beta does not have an end date defined', () => {
    const { activeNeverEndingBeta } = betas;
    expect(canEnd(activeNeverEndingBeta)).toBe(false);
  });
});

describe('willEnd', () => {
  it('should return true if the beta has not ended and has an end date defined', () => {
    const { futureBeta } = betas;
    expect(willEnd(futureBeta)).toBe(true);
  });

  it('should return false if the beta has ended or does not have an end date defined', () => {
    const { activeNeverEndingBeta, expiredBeta } = betas;
    expect(willEnd(activeNeverEndingBeta)).toBe(false);
    expect(willEnd(expiredBeta)).toBe(false);
  });
});

describe('willStart', () => {
  it('should return true if the beta start date is in the future', () => {
    const { futureBeta } = betas;
    expect(willStart(futureBeta)).toBe(true);
  });

  it('should return false if the beta start date is in the past', () => {
    const { expiredBeta } = betas;
    expect(willStart(expiredBeta)).toBe(false);
  });
});

describe('isCustomerEnrolled', () => {
  it('should return true if the beta has an enrolled field defined and the end date is in the future', () => {
    const { futureAccountBeta } = betas;
    expect(isCustomerEnrolled(futureAccountBeta)).toBe(true);
  });

  it('should return false if the beta does not have an enrolled field defined', () => {
    const { activeBeta } = betas;
    expect(isCustomerEnrolled(activeBeta)).toBe(false);
  });

  it('should return false if the beta is expired', () => {
    const { expiredAccountBeta } = betas;
    expect(isCustomerEnrolled(expiredAccountBeta)).toBe(false);
  });
});

describe('wasCustomerEnrolled', () => {
  it('should return true if the beta is expired', () => {
    const { expiredAccountBeta } = betas;
    expect(wasCustomerEnrolled(expiredAccountBeta)).toBe(true);
  });

  it('should return false if the beta does not have an enrolled field defined', () => {
    const { activeBeta } = betas;
    expect(wasCustomerEnrolled(activeBeta)).toBe(false);
  });
});

describe('hasEnded', () => {
  it('should return true if the beta end date is in the past', () => {
    const { expiredBeta } = betas;
    expect(hasEnded(expiredBeta)).toBe(true);
  });

  it('should return false if the beta end date is in the future, or is undefined', () => {
    const { activeBeta, activeNeverEndingBeta } = betas;
    expect(hasEnded(activeBeta)).toBe(false);
    expect(hasEnded(activeNeverEndingBeta)).toBe(false);
  });
});

describe('getBetaStatus', () => {
  it('should return historical if the user enrolled in the beta and it has an end date in the past', () => {
    const { expiredAccountBeta } = betas;
    expect(getBetaStatus(expiredAccountBeta)).toBe('historical');
  });

  it('should return active if the user enrolled in the beta and it has no end date', () => {
    const { activeNeverEndingAccountBeta } = betas;
    expect(getBetaStatus(activeNeverEndingAccountBeta)).toBe('active');
  });

  it('should return active if the user enrolled in the beta and it has an end date in the future', () => {
    const { activeAccountBeta } = betas;
    expect(getBetaStatus(activeAccountBeta)).toBe('active');
  });

  it('should return available if the user is not enrolled and the beta has no end date', () => {
    const { activeBeta } = betas;
    expect(getBetaStatus(activeBeta)).toBe('available');
  });

  it('should return available if the user is not enrolled and the beta has an end date in the future', () => {
    const { activeBeta } = betas;
    expect(getBetaStatus(activeBeta)).toBe('available');
  });

  it('should return no_status if the beta does not fall in one of the other statuses', () => {
    const { futureBeta } = betas;
    expect(getBetaStatus(futureBeta)).toBe('no_status');
  });
});
