import sinon from 'sinon';

describe('linodes/settings/layouts/ConfigEdit', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders all fields');

  it('renders cancel link');

  it('commits changes to the state as edits are made');

  it('calls saveChanges when save is pressed');

  describe('saveChanges', () => {
    it('commits changes to the API');

    it('handles API errors');
  });
});
