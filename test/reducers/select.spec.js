import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import select from '~/reducers/select';
import { TOGGLE_SELECTED } from '~/actions/select';
import toggleSelected from '~/actions/select';


describe('reducers/select reducer', () => {
  it('should handle initial state', () => {
    expect(select(undefined, {}))
      .to.be.eql({ selected: { } });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { selected: { } };
    deepFreeze(state);

    expect(select(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should add to the selection on TOGGLE_SELECTED', () => {
    const state = { selected: { example: {} } };
    deepFreeze(state);

    expect(select(state, toggleSelected('example', '1234')))
      .to.have.property('selected')
      .which.has.property('example')
      .which.has.property('1234');

    expect(select(state, {
      type: TOGGLE_SELECTED,
      objType: 'example',
      selectedIds: ['1234', '1235'],
    }))
      .to.have.property('selected')
      .which.has.property('example')
      .which.has.keys('1234', '1235');
  });

  it('should remove from the selection on TOGGLE_SELECTED', () => {
    const state = {
      selected: {
        example: {
          1234: true,
          1235: true,
        },
      },
    };
    deepFreeze(state);

    expect(select(state, toggleSelected('example', '1234')))
      .to.have.property('selected')
      .which.has.property('example')
      .which./* does*/not.have.property('1234');

    expect(select(state, toggleSelected('example', '1234')))
      .to.have.property('selected')
      .to.have.property('example')
      .which.has.keys('1235');
  });
});
