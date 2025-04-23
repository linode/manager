import { writeFileSync } from 'fs';
import { DateTime } from 'luxon';
import { resolve } from 'path';
import { array, number, object, string } from 'yup';

import type { CypressPlugin } from './plugin';
import type { ObjectSchema } from 'yup';

// The name of the environment variable to read to check if generation is enabled.
// The value should be a path to the weights file.
const envVarName = 'CY_TEST_GENWEIGHTS';

/**
 * Describes spec file weights for a test suite.
 */
export interface SpecWeights {
  /**
   * Spec weight metadata.
   */
  meta: {
    /**
     * Date and time that test spec weights were generated.
     */
    datetime: string;

    /**
     * Total test weight.
     */
    totalWeight: number;

    /**
     * Total test run duration in milliseconds.
     */
    totalDuration: number;
  };
  /**
   * Array of spec weights.
   */
  weights: SpecWeight[];
}

/**
 * Describes the weight of an individual spec file.
 */
export interface SpecWeight extends SpecResult {
  /**
   * Spec weight.
   */
  weight: number;
}

/**
 * Spec weights schema for JSON parsing, etc.
 */
export const specWeightsSchema: ObjectSchema<SpecWeights> = object({
  meta: object({
    datetime: string().required(),
    totalWeight: number().required(),
    totalDuration: number().required(),
  }).required(),
  weights: array(
    object({
      filepath: string().required(),
      duration: number().required(),
      weight: number().required(),
    })
  ).required(),
});

/**
 * Describes the duration of an individual spec file.
 *
 * Used in the process of calculating weights for each spec.
 */
interface SpecResult {
  /**
   * Relative path to spec file.
   */
  filepath: string;

  /**
   * Spec run duration in milliseconds.
   */
  duration: number;
}

/**
 * Enables test weight generation when `CY_TEST_GENWEIGHTS` is defined.
 *
 * @returns Cypress configuration object.
 */
export const generateTestWeights: CypressPlugin = (on, config) => {
  const specResults: SpecResult[] = [];

  if (!!config.env[envVarName]) {
    const writeFilepath = config.env[envVarName];

    // Capture duration after each spec runs.
    on('after:spec', (spec, results) => {
      const duration = results.stats.duration;
      if (duration) {
        specResults.push({
          filepath: spec.relative,
          duration,
        });
      } else {
        console.warn(
          `Failed to record test information for '${spec.relative}'`
        );
      }
    });

    // Aggregate spec durations and save as a spec weights JSON file.
    on(
      'after:run',
      (
        results:
          | CypressCommandLine.CypressRunResult
          | CypressCommandLine.CypressFailedRunResult
      ) => {
        // Determine whether this is a failed run. "Failed" in this context means
        // that Cypress itself failed to run, not that the test results contained failures.
        const isFailedResult = (
          results:
            | CypressCommandLine.CypressRunResult
            | CypressCommandLine.CypressFailedRunResult
        ): results is CypressCommandLine.CypressFailedRunResult => {
          return 'failures' in results;
        };

        if (!isFailedResult(results)) {
          const totalWeight = 100;
          const totalDuration = results.totalDuration;
          const weights: SpecWeights = {
            meta: {
              datetime: DateTime.now().toISO(),
              totalWeight,
              totalDuration,
            },
            weights: specResults.map(
              (specResult: SpecResult): SpecWeight => {
                return {
                  filepath: specResult.filepath,
                  duration: specResult.duration,
                  weight: (specResult.duration / totalDuration) * totalWeight,
                };
              }
            ),
          };

          const resolvePath = resolve(writeFilepath);
          writeFileSync(resolvePath, JSON.stringify(weights), 'utf-8');
        }
      }
    );
  }
};
