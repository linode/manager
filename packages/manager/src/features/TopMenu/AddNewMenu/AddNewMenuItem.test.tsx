import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import AddNewMenuItem from './AddNewMenuItem';
import { Provider } from 'react-redux';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { queryClientFactory } from 'src/queries/base';
import { storeFactory } from 'src/store';

const queryClient = queryClientFactory();
const store = storeFactory(queryClient);

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    renderWithTheme(
      <Provider store={store}>
        <LinodeThemeWrapper>
          <AddNewMenuItem
            title="shenanigans"
            body="These be the stories of shennanigans."
            ItemIcon={LinodeIcon}
          />
        </LinodeThemeWrapper>
      </Provider>,
      { customStore: store.getState(), queryClient }
    );
  });

  it('should not render a divider if not the last item', () => {
    const result = renderWithTheme(
      <Provider store={store}>
        <LinodeThemeWrapper>
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
