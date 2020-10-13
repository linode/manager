import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from '../../../src/utilities/testHelpers';

import Skeleton from './Skeleton';

const renderComponent = (props?: any) => {
  return render(wrapWithTheme(<Skeleton {...props} />));
};

describe('Skeleton component', () => {
  it('renders a skeleton component if columns and table props are set', () => {
    const { queryByTestId } = renderComponent({ table: true, numColumns: 4 });
    expect(queryByTestId('tableSkeleton')).toBeInTheDocument();
  });
  it('renders the right column count', () => {
    const { getAllByTestId } = renderComponent({ table: true, numColumns: 5 });
    expect(getAllByTestId('skeletonCol')).toHaveLength(5);
  });
});
