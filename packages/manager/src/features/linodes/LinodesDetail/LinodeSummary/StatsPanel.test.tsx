import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { StatsPanel } from './StatsPanel';
import { shallow } from 'enzyme';

const renderMain = jest.fn();
const title = 'Stats About My Linode';

const component = shallow(
  <StatsPanel
    title={title}
    height={300}
    loading={true}
    error={undefined}
    renderBody={renderMain}
  />
);

describe('StatsPanel component', () => {
  it('should render a loading spinner on loading state', () => {
    expect(
      component.containsMatchingElement(<CircleProgress mini />)
    ).toBeTruthy();
    expect(renderMain).not.toHaveBeenCalled();
  });
  it('should call its renderContent function if neither error or loading', () => {
    component.setProps({ error: undefined });
    expect(renderMain).toHaveBeenCalled();
  });
});
