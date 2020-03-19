import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import NodePoolDisplayTable from './NodePoolDisplayTable';

const props = {
  types: extendedTypes,
  pools: nodePoolFactory.buildList(5),
  editable: true,
  loading: false,
  handleDelete: jest.fn(),
  handleChange: jest.fn(),
  updatePool: jest.fn()
};

const emptyProps = {
  ...props,
  pools: []
};

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
});

afterEach(cleanup);

describe('NodePoolDisplayTable', () => {
  it('should display one row for each pool', () => {
    const { getAllByTestId } = render(
      wrapWithTheme(<NodePoolDisplayTable {...props} />)
    );
    expect(getAllByTestId('node-pool-table-row')).toHaveLength(
      props.pools.length
    );
  });

  it('should render an empty state if there are no pools', () => {
    const { getByTestId } = render(
      wrapWithTheme(<NodePoolDisplayTable {...emptyProps} />)
    );
    expect(getByTestId('table-row-empty')).toBeInTheDocument();
  });

  it('should call the delete handler when the X is clicked', () => {
    const { getByTestId } = render(
      wrapWithTheme(<NodePoolDisplayTable {...props} />)
    );
    const button = getByTestId('delete-node-row-0');
    fireEvent.click(button);
    expect(props.handleDelete).toHaveBeenCalledWith(0);
  });
});
