import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import linodes from '../../src/reducers/linodes';
import * as actions from '../../src/actions/linodes';

describe("linodes reducer", () => {
  it('should handle initial state', () => {
    expect(
      linodes(undefined, {})
    ).to.be.eql({ localPage: -1, remotePage: 0, linodes: [] });
  });

  it('should handle UPDATE_LINODES', () => {
    const state = linodes(undefined, {});
    const linode = { label: "hello_world" };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODES,
        response: {
          page: 0,
          linodes: [ linode ]
        }
      })
    ).to.have.property('linodes').with.length(1);
  });

  it('should transform linodes passed to it', () => {
    const state = linodes(undefined, {});
    const linode = { id: "lnde_1", label: "hello_world" };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODES,
        response: {
          page: 0,
          linodes: [ linode ]
        }
      }).linodes[0]
    ).to.have.property('_recovering');
  });

  it('should handle UPDATE_LINODE', () => {
    const state = { 
      localPage: 0,
      remotePage: 0,
      linodes: [
        { id: "lnde_1", label: "hello_world" }
      ]
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODE,
        linode: {
          id: "lnde_1",
          label: "hello_world_2"
        }
      }).linodes[0]
    ).to.have.property("label").which.equals("hello_world_2");
  });

  it('should only update the relevant linode', () => {
    const state = { 
      localPage: 0,
      remotePage: 0,
      linodes: [
        { id: "lnde_1", label: "hello_world" },
        { id: "lnde_2", label: "goodbye_world" }
      ]
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.UPDATE_LINODE,
        linode: {
          id: "lnde_1",
          label: "hello_world_2"
        }
      }).linodes[1]
    ).to.have.property("label").which.equals("goodbye_world");
  });

  it('should handle LINODE_RECOVER', () => {
    const state = { 
      localPage: 0,
      remotePage: 0,
      linodes: [
        { id: "lnde_1", _recovering: false }
      ]
    };

    deepFreeze(state);

    expect(
      linodes(state, {
        type: actions.LINODE_RECOVER,
        linode: state.linodes[0],
        recovering: true
      }).linodes[0]
    ).to.have.property('_recovering').which.equals(true);
  });
});
