import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from '../../../src/utilities/testHelpers';

import Skeleton from './Skeleton';

const renderComponent = (props?: any) => {
  return render(wrapWithTheme(<Skeleton {...props} />));
};

afterEach(cleanup);

describe('Skeleton component', () => {
  it('renders a skeleton component if columns and table props are set', () => {
    const { queryByTestId } = renderComponent({ table: true, columns: 4 });
    expect(queryByTestId('tableSkeleton')).toBeInTheDocument();
  });
  it('renders the right column count', () => {
    const { getAllByTestId } = renderComponent({ table: true, columns: 5 });
    expect(getAllByTestId('skeletonCol')).toHaveLength(5);
  });
});
