import deepFreeze from 'deep-freeze';

import select from '~/reducers/select';
import { TOGGLE_SELECTED } from '~/actions/select';
import toggleSelected from '~/actions/select';


describe('reducers/select reducer', () => {
  it('should handle initial state', () => {
    expect(select(undefined, { })).toEqual({ selected: { } });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { selected: { } };
    deepFreeze(state);

    const newState = select(state, { type: 'foobar' });
    expect(newState).toEqual(state);
  });

  it('should add to the selection on TOGGLE_SELECTED', () => {
    const state = { selected: { example: { } } };
    deepFreeze(state);

    const newState = select(state, toggleSelected('example', '1234'));
    expect(newState).toEqual({
      selected: {
        example: {
          1234: true,
        },
      },
    });


    const multiNewState = select(state, {
      type: TOGGLE_SELECTED,
      objectType: 'example',
      selectedIds: ['1234', '1235'],
    });
    expect(multiNewState).toEqual({
      selected: {
        example: {
          1234: true,
          1235: true,
        },
      },
    });
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

    const newState = select(state, toggleSelected('example', '1234'));
    expect(newState).toEqual({
      selected: {
        example: {
          1235: true,
        },
      },
    });

    const altNewState = select(newState, toggleSelected('example', '1234'));
    expect(altNewState).toEqual({
      selected: {
        example: {
          1234: true,
          1235: true,
        },
      },
    });
  });
});
