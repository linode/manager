import {
  getHumanReadableQueryRules,
  getQueryRules,
  validateQuery,
} from '../util/tag';

import type { CypressPlugin } from './plugin';

const envVarName = 'CY_TEST_TAGS';
export const logTestTagInfo: CypressPlugin = (_on, config) => {
  if (config.env[envVarName]) {
    const query = config.env[envVarName];

    if (!validateQuery(query)) {
      throw `Failed to validate tag query '${query}'. Please double check the syntax of your query.`;
    }

    const rules = getQueryRules(query);

    if (rules.length) {
      console.info(
        `Running tests that satisfy all of the following tag rules for query '${query}':`
      );

      console.table(
        getHumanReadableQueryRules(query).reduce(
          (acc: any, cur: string, index: number) => {
            acc[index] = cur;
            return acc;
          },
          {}
        )
      );
    }
  }
};
