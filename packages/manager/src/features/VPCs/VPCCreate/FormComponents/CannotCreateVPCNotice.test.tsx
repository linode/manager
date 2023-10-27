import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CANNOT_CREATE_VPC_MESSAGE } from '../../constants';
import { CannotCreateVPCNotice } from './CannotCreateVPCNotice';

describe('Cannot create VPC notice', () => {
  it('renders the cannot create vpc notice', () => {
    const { getByText } = renderWithTheme(<CannotCreateVPCNotice />);

    const notice = getByText(`${CANNOT_CREATE_VPC_MESSAGE}`);
    expect(notice).toBeInTheDocument();
  });
});
