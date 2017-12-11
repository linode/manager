import apiActionReducerGenerator from './external';
import * as generic from './generic';


function actionExporter(module) {
  return apiActionReducerGenerator(module.config, module.actions);
}

export default generic.exportWith(actionExporter);
