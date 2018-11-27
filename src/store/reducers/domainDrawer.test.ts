import reducer, {
  CLONING,
  closeDrawer,
  CREATING,
  defaultState,
  openForCloning,
  openForCreating,
} from './domainDrawer';

describe('domainDrawer reducer', () => {
  it('should be OPEN when opening for creating', () => {
    const newState = reducer(defaultState, openForCreating());
    expect(newState).toHaveProperty('open', true);
    expect(newState.mode).toBe(CREATING);
  });

  it('should be OPEN when opening for cloning', () => {
    const newState = reducer(defaultState, openForCloning());
    expect(newState).toHaveProperty('open', true);
    expect(newState.mode).toBe(CLONING);
  });

  it('should accept domain when cloning', () => {
    const newState = reducer(defaultState, openForCloning('my-domain', 1234));
    expect(newState.domain).toBe('my-domain');
  });

  it('should accept cloneId when cloning', () => {
    const newState = reducer(defaultState, openForCloning('my-domain', 1234));
    expect(newState.cloneId).toBe(1234);
  });

  it('should handle CLOSE', () => {
    const newState = reducer(defaultState, closeDrawer());
    expect(newState).toHaveProperty('open', false);
  });
});
