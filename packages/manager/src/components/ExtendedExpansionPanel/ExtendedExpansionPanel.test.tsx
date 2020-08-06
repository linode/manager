import { shallow } from 'enzyme';
import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { Provider } from 'react-redux';
import ExtendedExpansionPanel from './ExtendedExpansionPanel';
import store from 'src/store';

const onChange = jest.fn();
const renderMainContent = jest.fn();

const props = {
  heading: 'Header',
  loading: false,
  onChange,
  renderMainContent
};

describe('ExtendedExpansionPanel', () => {
  afterEach(() => jest.resetAllMocks());
  const component = shallow(
    <Provider store={store}>
      <ExtendedExpansionPanel {...props} />
    </Provider>
  );
  it.skip('should load its content when it is neither loading nor in an error state', () => {
    expect(renderMainContent).toHaveBeenCalled();
  });
  it('should render an error state on error', () => {
    const errorText = 'There was an error loading your panel content.';
    component.setProps({ error: errorText });
    expect(renderMainContent).not.toHaveBeenCalled();
    expect(
      component.containsMatchingElement(<ErrorState errorText={errorText} />)
    );
  });
  it('should render a loading state', () => {
    component.setProps({ loading: true, error: false });
    expect(renderMainContent).not.toHaveBeenCalled();
    expect(component.containsMatchingElement(<CircleProgress />));
  });
});
