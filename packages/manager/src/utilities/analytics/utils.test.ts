import { generateTimeOfDay } from './customEventAnalytics';
import {
  getFormattedStringFromFormEventOptions,
  waitForAdobeAnalyticsToBeLoaded,
} from './utils';

import type { FormEventOptions } from './types';

describe('generateTimeOfDay', () => {
  it('should generate human-readable time of day', () => {
    expect(generateTimeOfDay(0)).toBe('Early Morning');
    expect(generateTimeOfDay(1)).toBe('Early Morning');
    expect(generateTimeOfDay(2)).toBe('Early Morning');
    expect(generateTimeOfDay(3)).toBe('Early Morning');
    expect(generateTimeOfDay(4)).toBe('Early Morning');
    expect(generateTimeOfDay(5)).toBe('Morning');
    expect(generateTimeOfDay(6)).toBe('Morning');
    expect(generateTimeOfDay(7)).toBe('Morning');
    expect(generateTimeOfDay(8)).toBe('Morning');
    expect(generateTimeOfDay(9)).toBe('Morning');
    expect(generateTimeOfDay(10)).toBe('Morning');
    expect(generateTimeOfDay(11)).toBe('Morning');
    expect(generateTimeOfDay(12)).toBe('Midday');
    expect(generateTimeOfDay(13)).toBe('Midday');
    expect(generateTimeOfDay(14)).toBe('Midday');
    expect(generateTimeOfDay(15)).toBe('Midday');
    expect(generateTimeOfDay(16)).toBe('Midday');
    expect(generateTimeOfDay(17)).toBe('Evening');
    expect(generateTimeOfDay(18)).toBe('Evening');
    expect(generateTimeOfDay(19)).toBe('Evening');
    expect(generateTimeOfDay(20)).toBe('Night');
    expect(generateTimeOfDay(21)).toBe('Night');
    expect(generateTimeOfDay(22)).toBe('Night');
    expect(generateTimeOfDay(23)).toBe('Night');
    expect(generateTimeOfDay(24)).toBe('Night');
    expect(generateTimeOfDay(-1)).toBe('Other');
    expect(generateTimeOfDay(25)).toBe('Other');
  });
});

describe('waitForAdobeAnalyticsToBeLoaded', () => {
  it('should resolve if adobe is defined ', () => {
    vi.stubGlobal('_satellite', {});
    expect(waitForAdobeAnalyticsToBeLoaded()).resolves.toBe(undefined);
  });

  it(
    'should reject if adobe is not defined after 5 seconds',
    () => {
      vi.stubGlobal('_satellite', undefined);
      expect(waitForAdobeAnalyticsToBeLoaded()).rejects.toThrow(
        'Adobe Analytics did not load after 5 seconds'
      );
    },
    { timeout: 7000 }
  );
});

describe('getFormattedStringFromFormEventOptions', () => {
  const formEventOptionsWithHeaders: FormEventOptions = {
    headerName: 'Header',
    interaction: 'click',
    label: 'Component label',
    subheaderName: 'Subheader',
  };

  it('should return a string in format "Header:Subheader|Interaction:Component label"', () => {
    expect(
      getFormattedStringFromFormEventOptions(formEventOptionsWithHeaders)
    ).toEqual('Header:Subheader|click:Component label');
  });

  it('should return defaults if no header or subheader are provided', () => {
    const formEventOptionsWithoutHeaders: FormEventOptions = {
      interaction: 'click',
      label: 'Component label',
    };

    expect(
      getFormattedStringFromFormEventOptions(formEventOptionsWithoutHeaders)
    ).toEqual('No header|click:Component label');
  });

  it("should append ':once' to the label's end to identify events to track once per page view", () => {
    const formEventOptionsTrackOnce = {
      ...formEventOptionsWithHeaders,
      trackOnce: true,
    };
    expect(
      getFormattedStringFromFormEventOptions(formEventOptionsTrackOnce)
    ).toEqual('Header:Subheader|click:Component label:once');
  });
});
