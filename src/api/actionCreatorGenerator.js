import '~/typedefs';

import { DELETE, MANY, ONE, PUT, POST } from './internal';
import {
  genThunkOne,
  genThunkPage,
  genThunkAll,
  genThunkDelete,
  genThunkPut,
  genThunkPost,
} from './external';

/**
 * Generates thunks for the provided config.
 *
 * @param { { supports: Array<string>} } config
 * @param { Object } actions
 * @returns {ActionCreator}
 */
export default function actionCreatorGenerator(config, actions) {
  const thunks = {};
  const supports = a => config.supports.indexOf(a) !== -1;
  if (supports(ONE)) {
    thunks.one = genThunkOne(config, actions);
  }
  if (supports(MANY)) {
    thunks.page = genThunkPage(config, actions);
    thunks.all = genThunkAll(config, actions, thunks.page);
  }
  if (supports(DELETE)) {
    thunks.delete = genThunkDelete(config, actions);
  }
  if (supports(PUT)) {
    thunks.put = genThunkPut(config, actions);
  }
  if (supports(POST)) {
    thunks.post = genThunkPost(config, actions);
  }
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      const subresource = config.subresources[key];
      thunks[subresource.name] = actionCreatorGenerator(subresource, actions[subresource.name]);
    });
  }
  thunks.type = config.name;
  return thunks;
}
