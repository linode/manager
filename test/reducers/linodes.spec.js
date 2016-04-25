import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import linodes from '../../src/reducers/linodes';
import * as actions from '../../src/actions/linodes';

describe("linodes reducer", () => {
  it('should handle initial state', () => {
    expect(
      linodes(undefined, {})
    ).to.be.eql({ pagesFetched: [], totalPages: -1, linodes: {} });
  });

  it('should handle UPDATE_LINODES', () => {
    const state = linodes(undefined, {});
    const linode = { id: 'linode_1', label: "hello_world" };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODES,
        response: {
          page: 1,
          total_pages: 1,
          linodes: [ linode ]
        }
      })
    ).to.have.property('linodes').which.has.keys("linode_1");
  });

  it('should handle UPDATE_LINODE', () => {
    const state = { 
      pagesFetched: [ ],
      totalPages: 1,
      linodes: {
        "linode_1": { id: "linode_1", label: "hello_world" }
      }
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODE,
        linode: {
          id: "linode_1",
          label: "hello_world_2"
        }
      })
    ).to.have.property("linodes")
    .which.has.property("linode_1")
    .which.has.property("label").which.equals("hello_world_2");
  });

  it('should only update the relevant linode', () => {
    const state = { 
      pagesFetched: [ ],
      totalPages: 1,
      linodes: {
        "lnde_1": { id: "lnde_1", label: "hello_world" },
        "lnde_2": { id: "lnde_2", label: "goodbye_world" }
      }
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODE,
        linode: {
          id: "lnde_1",
          label: "hello_world_2"
        }
      }).linodes
    ).to.have.property("lnde_2")
    .to.have.property("label").which.equals("goodbye_world");
  });

  it('should handle DELETE_LINODE', () => {
    const state = {
      pagesFetched: [ ],
      totalPages: 1,
      linodes: {
        "lnde_1": { id: "lnde_1", label: "hello_world" },
        "lnde_2": { id: "lnde_2", label: "goodbye_world" }
      }
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.DELETE_LINODE,
        id: "lnde_2"
      }).linodes
    ).not.to.have.property("lnde_2");
  });
});
