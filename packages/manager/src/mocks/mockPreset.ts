import type { HttpHandler } from 'msw';
import type { MockContext } from './mockContext';

export type MockHandlerGenerator = (mockContext: MockContext) => HttpHandler[];

/** Describes a collection of HTTP handlers that collectively form a MSW preset. */
export type MockPreset = {
  /** Unique ID of mock preset, used to keep track of user preset selections. */
  id: string;

  /** Human-readable label for mock preset. */
  label: string;

  /** Group to which preset belongs. Used to sort presets in dev tool UI. */
  group?: string;

  /** Array of MSW handler generator functions. */
  handlers: MockHandlerGenerator[];
};

/**
 * Executes a preset's handler generators and returns the resulting handlers.
 *
 * @param preset - Mock preset to resolve.
 *
 * @returns Array of HTTP handlers generated for the mock preset.
 */
export const resolveMockPreset = (
  preset: MockPreset,
  context: MockContext
): HttpHandler[] => {
  return preset.handlers.reduce(
    (acc: HttpHandler[], cur: MockHandlerGenerator) => {
      return [
        //...acc,
        ...cur(context),
        ...acc,
      ];
    },
    []
  );
};

export const getMockPresetGroups = (
  presets: MockPreset[]
): Array<string | undefined> => {
  return presets.reduce((acc: Array<string | undefined>, cur) => {
    if (!acc.includes(cur.group)) {
      acc.push(cur.group);
    }
    return acc;
  }, []);
};
