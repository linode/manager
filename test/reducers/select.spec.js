import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { expectObjectDeepEquals } from '@/common';

import select from '~/reducers/select';
import { TOGGLE_SELECTED } from '~/actions/select';
import toggleSelected from '~/actions/select';



describe('reducers/select reducer', () => {
  it('should handle initial state', () => {
    expect(select(undefined, {}))
      .to.deep.equal({ selected: { } });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { selected: { } };
    deepFreeze(state);

    expect(select(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should add to the selection on TOGGLE_SELECTED', () => {
    const state = {selected: {example: {}}};
    deepFreeze(state);

    const newState = select(state, toggleSelected('example', '1234'));
    expectObjectDeepEquals(newState, {
      selected: {
        example: {
          '1234': true
        }
      }
    });


    const newState = select(state, {
      type: TOGGLE_SELECTED,
      objectType: 'example',
      selectedIds: ['1234', '1235'],
    });
    expectObjectDeepEquals(newState, {
      selected: {
        example: {
          1234: true,
          1235: true,
        }
      }
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
    expectObjectDeepEquals(newState, {
      selected: {
        example: {
          1234: true
        }
      }
    });

    const newState = select(state, toggleSelected('example', '1234'));
    expectObjectDeepEquals(newState, {
      selected: {
        example: {
          1234: true
        }
      }
    });
  });
});
