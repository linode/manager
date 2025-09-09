import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
import { describe } from 'vitest';

import { destinationFactory } from 'src/factories/datastream';
import { DestinationEdit } from 'src/features/DataStream/Destinations/DestinationForm/DestinationEdit';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const destinationId = 123;
const mockDestination = destinationFactory.build({
  id: destinationId,
  label: `Destination ${destinationId}`,
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ destinationId: 123 }),
  };
});

describe('DestinationEdit', () => {
  const assertInputHasValue = (inputLabel: string, inputValue: string) => {
    expect(screen.getByLabelText(inputLabel)).toHaveValue(inputValue);
  };

  it('should render edited destination when destination fetched properly', async () => {
    server.use(
      http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
        return HttpResponse.json(mockDestination);
      })
    );

    renderWithThemeAndHookFormContext({
      component: <DestinationEdit />,
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    assertInputHasValue('Destination Type', 'Linode Object Storage');
    await waitFor(() => {
      assertInputHasValue('Destination Name', 'Destination 123');
    });
    assertInputHasValue('Host', '3000');
    assertInputHasValue('Bucket', 'Bucket Name');
    await waitFor(() => {
      assertInputHasValue('Region', 'US, Chicago, IL (us-ord)');
    });
    assertInputHasValue('Access Key ID', 'Access Id');
    assertInputHasValue('Secret Access Key', 'Access Secret');
    assertInputHasValue('Log Path Prefix', 'file');
  });
});
