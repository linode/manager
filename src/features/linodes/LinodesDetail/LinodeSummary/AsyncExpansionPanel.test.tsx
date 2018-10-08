import { shallow } from 'enzyme';
import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress'
import ErrorState from 'src/components/ErrorState';

import AsyncExpansionPanel from './AsyncExpansionPanel';

const onChange = jest.fn();
const renderMainContent = jest.fn();

const props = {
  heading: 'Header',
  isLoading: false,
  error: false,
  onChange,
  renderMainContent,
}

describe("AsyncExpansionPanel", () => {
  afterEach(() => jest.resetAllMocks());
  const component = shallow(<AsyncExpansionPanel {...props}/>);
  it("should load its content when it is neither loading nor in an error state", () => {
    expect(renderMainContent).toHaveBeenCalled();
    
  });
  it("should render an error state on error", () => {
    component.setProps({ error: true });
    expect(renderMainContent).not.toHaveBeenCalled();
    expect(component.containsMatchingElement(<ErrorState errorText={"Unable to load data for this Linode."} />));
  });
  it("should render a loading state", () => {
    component.setProps({ isLoading: true, error: false });
    expect(renderMainContent).not.toHaveBeenCalled();
    expect(component.containsMatchingElement(<CircleProgress/>));
  });
});

