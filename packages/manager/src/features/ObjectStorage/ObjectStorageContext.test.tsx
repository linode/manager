import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { objectStorageEndpointsFactory } from 'src/factories';

import {
  ObjectStorageSelectionProvider,
  useObjectStorageSelection,
} from './ObjectStorageContext';

const CountConsumer = () => {
  const { selectedSummaryEndpoints } = useObjectStorageSelection();
  return <div data-testid="count">{selectedSummaryEndpoints.length}</div>;
};

const Setter = () => {
  const { setSelectedSummaryEndpoints } = useObjectStorageSelection();
  const endpoint = objectStorageEndpointsFactory.build({
    s3_endpoint: 'us-east-1.linodeobjects.com',
  });

  return (
    <button
      onClick={() =>
        setSelectedSummaryEndpoints([
          { endpoint, label: endpoint.s3_endpoint! },
        ])
      }
    >
      set
    </button>
  );
};

test('provider supplies default empty selection and updates on setSelectedEndpoints', () => {
  render(
    <ObjectStorageSelectionProvider>
      <CountConsumer />
      <Setter />
    </ObjectStorageSelectionProvider>
  );

  expect(screen.getByTestId('count').textContent).toBe('0');
  fireEvent.click(screen.getByText('set'));
  expect(screen.getByTestId('count').textContent).toBe('1');
});

test('state is shared between multiple consumers', () => {
  const A = () => {
    const { selectedSummaryEndpoints } = useObjectStorageSelection();
    // map to the s3_endpoint string for assertions
    return (
      <div data-testid="a">
        {selectedSummaryEndpoints.map((e) => e.endpoint.s3_endpoint).join(',')}
      </div>
    );
  };
  const B = () => {
    const { setSelectedSummaryEndpoints } = useObjectStorageSelection();
    const endpoint = objectStorageEndpointsFactory.build({
      s3_endpoint: 'us-west-1.linodeobjects.com',
    });
    return (
      <button
        onClick={() =>
          setSelectedSummaryEndpoints([
            { endpoint, label: endpoint.s3_endpoint! },
          ])
        }
      >
        b
      </button>
    );
  };

  render(
    <ObjectStorageSelectionProvider>
      <A />
      <B />
    </ObjectStorageSelectionProvider>
  );

  expect(screen.getByTestId('a').textContent).toBe('');
  fireEvent.click(screen.getByText('b'));
  expect(screen.getByTestId('a').textContent).toBe(
    'us-west-1.linodeobjects.com'
  );
});
