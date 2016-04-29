import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import datacenters from '../../src/reducers/datacenters';
import * as actions from '../../src/actions/datacenters';

describe("datacenters reducer", () => {
  it('should handle initial state', () => {
    expect(
      datacenters(undefined, {})
    ).to.be.eql({ datacenters: [] });
  });

  it('should handle UPDATE_DATACENTERS', () => {
    const state = datacenters(undefined, {});
    const dc = { id: 'datacenter_6', label: "Newark, NJ" };

    deepFreeze(state);

    expect(
      datacenters(state, {
        type: actions.UPDATE_DATACENTERS,
        response: {
          page: 1,
          total_pages: 1,
          datacenters: [ dc ]
        }
      })
    ).to.have.property('datacenters').which.has.length(1);
  });
});
