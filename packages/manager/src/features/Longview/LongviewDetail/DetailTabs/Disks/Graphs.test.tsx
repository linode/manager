import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import Graphs, { formatINodes, formatSpace, Props } from './Graphs';

afterEach(cleanup);

afterAll(async done => {
  done();
});

const baseProps: Props = {
  isSwap: false,
  childOf: false,
  timezone: 'GMT',
  sysInfoType: 'helloworld',
  iFree: [],
  iTotal: [],
  total: [],
  free: [],
  diskLabel: 'helloworld',
  startTime: 0,
  endTime: 0
};

describe('Utility Functions', () => {
  it('formats INodes correctly', () => {
    const result = formatINodes([{ x: 2, y: 3 }], [{ x: 2, y: 5 }]);
    expect(result).toEqual([[2000, 2]]);
  });

  it('formats Space correctly', () => {
    const result = formatSpace([{ x: 2, y: 1000 }], [{ x: 2, y: 68719477736 }]);
    expect(result).toEqual([[2000, 64]]);
  });
});

describe('UI', () => {
  it('should render graphs normally', () => {
    const { queryByText } = renderWithTheme(<Graphs {...baseProps} />);

    expect(queryByText('Inodes')).toBeInTheDocument();
    expect(queryByText('Space')).toBeInTheDocument();
    expect(queryByText('Disk I/O')).toBeInTheDocument();
  });

  it('should render warning text for swap disks', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} isSwap />
    );

    expect(queryByText('Inodes')).not.toBeInTheDocument();
    expect(queryByText('Space')).not.toBeInTheDocument();
    expect(queryByText('Disk I/O')).not.toBeInTheDocument();

    expect(getByText(/doesn't gather data on swap/)).toBeInTheDocument();
  });

  it('should render warning text for OpenVZ Linodes', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} sysInfoType="openvz" />
    );

    expect(queryByText('Inodes')).not.toBeInTheDocument();
    expect(queryByText('Space')).not.toBeInTheDocument();
    expect(queryByText('Disk I/O')).not.toBeInTheDocument();

    expect(getByText(/not available for OpenVZ systems/)).toBeInTheDocument();
  });

  it('should render warning text for ChildOf Disks', () => {
    const { getByText, queryByText } = renderWithTheme(
      <Graphs {...baseProps} childOf />
    );

    expect(queryByText('Inodes')).not.toBeInTheDocument();
    expect(queryByText('Space')).not.toBeInTheDocument();
    expect(queryByText('Disk I/O')).not.toBeInTheDocument();

    expect(
      getByText(/not applicable for this type of device/)
    ).toBeInTheDocument();
  });
});
