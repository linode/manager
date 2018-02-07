import actionCreatorGenerator from './actionCreatorGenerator';
import * as generic from './generic';


function actionExporter(module) {
  return actionCreatorGenerator(module.config, module.actions);
}

export default generic.exportWith(actionExporter);
