import reducer, { defaultState, handleClose, handleOpen } from './domainDrawer';

describe('domainDrawer reducer', () => {

  it('should handle OPEN', () => {
    const newState = reducer(defaultState, handleOpen());
    expect(newState).toHaveProperty('open', true);
  });

  it('should handle CLOSE', () => {
    const newState = reducer(defaultState, handleClose());
    expect(newState).toHaveProperty('open', false);
  });
});
