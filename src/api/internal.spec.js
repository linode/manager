import { genActions } from './internal';

import sinon from 'sinon';

import { testConfigOne, testConfigMany, testConfigDelete } from '~/data/reduxGen';
import { resource, page } from '~/data/reduxGen';

describe('internal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('generates an action to update one resource', function () {
    const dispatch = sandbox.spy();

    const config = testConfigOne;

    const actions = genActions(config);
    const oneThunk = actions.one(resource, '23');
    oneThunk(dispatch);
    expect(dispatch.firstCall.args[0].resource.label).toBe('nodebalancer-1');
    expect(dispatch.firstCall.args[0].type).toBe('GEN@nodebalancers/ONE');
    expect(dispatch.firstCall.args[0].ids[0]).toBe(23);
  });

  it('generates an action to update many resources', function () {
    const dispatch = sandbox.spy();

    const config = testConfigMany;

    const actions = genActions(config);
    const manyThunk = actions.many(page);
    manyThunk(dispatch);
    expect(dispatch.firstCall.args[0].page.nodebalancers[0].label)
      .toBe('nodebalancer-1');
    expect(dispatch.firstCall.args[0].page.nodebalancers[1].label)
      .toBe('nodebalancer-2');
    expect(dispatch.firstCall.args[0].type).toBe('GEN@nodebalancers/MANY');
  });

  it('generates an action to delete a resource', function () {
    const config = testConfigDelete;

    const actions = genActions(config);
    const deleteAction = actions.delete('23');
    expect(deleteAction.ids[0]).toBe(23);
    expect(deleteAction.type).toBe('GEN@nodebalancers/DELETE');
  });
});
