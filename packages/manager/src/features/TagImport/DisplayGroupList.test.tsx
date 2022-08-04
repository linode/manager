import * as React from 'react';
import { DisplayGroupList, Props } from './DisplayGroupList';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props: Props = {
  groups: ['group1', 'group2'],
  entity: 'Linode' as 'Linode' | 'Domain',
};

describe('Component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<DisplayGroupList {...props} />);
    expect(getByText('Linode Groups to Import')).toBeInTheDocument();
  });
  it('should render each group', () => {
    const { getAllByTestId } = renderWithTheme(<DisplayGroupList {...props} />);
    expect(getAllByTestId('display-group-item')).toHaveLength(2);
  });
  it('should not render if no groups are provided', () => {
    const { container } = renderWithTheme(
      <DisplayGroupList {...props} groups={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
