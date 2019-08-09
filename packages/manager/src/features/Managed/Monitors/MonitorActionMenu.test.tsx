import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  CombinedProps,
  MonitorActionMenu as ActionMenu
} from './MonitorActionMenu';

import { wrapWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');

const props: CombinedProps = {
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  status: 'disabled',
  monitorID: 1,
  requestManagedServices: jest.fn(),
  disableServiceMonitor: jest.fn(),
  ...reactRouterProps
};

afterEach(cleanup);

describe('Volume action menu', () => {
  it('should include Enable if the monitor is disabled', () => {
    const { queryByText } = render(
      wrapWithTheme(<ActionMenu {...props} status={'disabled'} />)
    );
    expect(queryByText('Enable')).toBeInTheDocument();
    expect(queryByText('Disable')).not.toBeInTheDocument();
  });

  it('should include Disable if the monitor is enabled', () => {
    const { queryByText } = render(
      wrapWithTheme(<ActionMenu {...props} status={'ok'} />)
    );
    expect(queryByText('Disable')).toBeInTheDocument();
    expect(queryByText('Enable')).not.toBeInTheDocument();
  });
});
