import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { linodeConfigs } from 'src/__data__/linodeConfigs';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { Configs } from './Configs';

import type { ConfigsProps } from './Configs';

const mockHandleSelect = vi.fn();

const props: ConfigsProps = {
  configSelection: { 9859511: { associatedDiskIds: [], isSelected: false } },
  configs: linodeConfigs,
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
    const { getByTestId, getByText } = render(
      wrapWithTheme(<Configs {...props} configs={[]} />)
    );

    expect(getByTestId('table-row-empty')).toBeDefined();
    expect(getByText('No items to display.')).toBeDefined();
  });
});
