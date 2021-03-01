import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { linodeConfigs } from 'src/__data__/linodeConfigs';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { Configs, Props } from './Configs';

const mockHandleSelect = jest.fn();

const props: Props = {
  configs: linodeConfigs,
  configSelection: { 9859511: { isSelected: false, associatedDiskIds: [] } },
  handleSelect: (id: number) => mockHandleSelect(id),
};

describe('Configs', () => {
  it('renders a row for each config', () => {
    const { getByText } = render(wrapWithTheme(<Configs {...props} />));
    linodeConfigs.forEach((eachConfig) => {
      expect(getByText(eachConfig.label)).toBeDefined();
    });
  });

  it('fires the handle event when clicked', () => {
    const { getByTestId } = render(wrapWithTheme(<Configs {...props} />));
    linodeConfigs.forEach((eachConfig) => {
      const checkbox = getByTestId(`checkbox-${eachConfig.id}`).parentNode;
      fireEvent.click(checkbox as any);
      expect(mockHandleSelect).toHaveBeenCalledWith(eachConfig.id);
    });
  });

  it('renders an empty state when no configs', () => {
    const { getByText, getByTestId } = render(
      wrapWithTheme(<Configs {...props} configs={[]} />)
    );

    expect(getByTestId('table-row-empty')).toBeDefined();
    expect(getByText('No items to display.')).toBeDefined();
  });
});
