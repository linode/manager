import { shallow } from 'enzyme';
import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import { StatsPanel } from './StatsPanel';

const renderMain = jest.fn();
const title = "Stats About My Linode";

const component = shallow(
  <StatsPanel
    classes={{
      'root':'',
      'spinner':'',
      'title':'',
    }}
    title={title}
    loading={true}
    error={undefined}
    renderBody={renderMain}
  />
)

describe("StatsPanel component", () => {
  it("should render a loading spinner on loading state", () => {
    expect(component.containsMatchingElement(<CircleProgress mini />)).toBeTruthy();
    expect(renderMain).not.toHaveBeenCalled();
  });
  it("should render an error on error state", () => {
    const error = "This is an error."
    component.setProps({ loading: false, error });
    expect(component.containsMatchingElement(<CircleProgress mini />)).toBeFalsy();
    expect(component.containsMatchingElement(<ErrorState errorText={error} />)).toBeTruthy();
    expect(renderMain).not.toHaveBeenCalled();
  });
  it("should call its renderContent function if neither error or loading", () => {
    component.setProps({ error: undefined });
    expect(renderMain).toHaveBeenCalled();
  });
});
