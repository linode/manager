import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import AddNewMenuItem from './AddNewMenuItem';
import { Provider } from 'react-redux';
import store from 'src/store';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    renderWithTheme(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark">
          <AddNewMenuItem
            title="shenanigans"
            body="These be the stories of shennanigans."
            ItemIcon={LinodeIcon}
          />
        </LinodeThemeWrapper>
      </Provider>
    );
  });

  it('should not render a divider if not the last item', () => {
    const result = renderWithTheme(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark">
          <AddNewMenuItem
            title="shenanigans"
            body="These be the stories of shennanigans."
            ItemIcon={LinodeIcon}
          />
        </LinodeThemeWrapper>
      </Provider>
    );

    expect(result.queryAllByRole('Divider')).toHaveLength(0);
  });
});
