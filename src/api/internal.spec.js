import { genActions } from './internal';

import { testConfigOne, testConfigMany, testConfigDelete } from '~/data/reduxGen';
import { resource, page } from '~/data/reduxGen';

describe('internal', () => {
  it('generates an action to update one resource', function () {
    const config = testConfigOne;

    const actions = genActions(config);
    const actionOne = actions.one(resource, '23');

    expect(actionOne.resource.label).toBe('nodebalancer-1');
    expect(actionOne.type).toBe('GEN@nodebalancers/ONE');
    expect(actionOne.ids[0]).toBe(23);
  });

  it('generates an action to update many resources', function () {
    const config = testConfigMany;

    const actions = genActions(config);
    const actionMany = actions.many(page);

    expect(actionMany.page.nodebalancers[0].label)
      .toBe('nodebalancer-1');
    expect(actionMany.page.nodebalancers[1].label)
      .toBe('nodebalancer-2');
    expect(actionMany.type).toBe('GEN@nodebalancers/MANY');
  });

  it('generates an action to delete a resource', function () {
    const config = testConfigDelete;

    const actions = genActions(config);
    const deleteAction = actions.delete('23');

    expect(deleteAction.ids[0]).toBe(23);
    expect(deleteAction.type).toBe('GEN@nodebalancers/DELETE');
  });
});
