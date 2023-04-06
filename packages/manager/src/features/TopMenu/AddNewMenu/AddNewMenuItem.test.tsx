import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import { AddNewMenuItem } from './AddNewMenuItem';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    renderWithTheme(
      <AddNewMenuItem
        title="shenanigans"
        body="These be the stories of shennanigans."
        ItemIcon={LinodeIcon}
      />
    );
  });

  it('should not render a divider if not the last item', () => {
    const result = renderWithTheme(
      <AddNewMenuItem
        title="shenanigans"
        body="These be the stories of shennanigans."
        ItemIcon={LinodeIcon}
      />
    );

    expect(result.queryAllByRole('Divider')).toHaveLength(0);
  });
});
