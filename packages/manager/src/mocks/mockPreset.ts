import type { MockContext, MockHandlerGenerator, MockPreset } from './types';
import type { HttpHandler } from 'msw';

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
      return [...cur(context), ...acc];
    },
    []
  );
};

/**
 * Describes a collection of HTTP handlers that collectively form a MSW preset.
 * */
export const getMockPresetGroups = (presets: MockPreset[]): string[] => {
  return presets.reduce((acc: string[], cur) => {
    if (!acc.includes(cur.group)) {
      acc.push(cur.group);
    }
    return acc;
  }, []);
};
