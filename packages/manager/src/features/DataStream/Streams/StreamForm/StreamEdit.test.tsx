import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { destinationFactory, streamFactory } from 'src/factories/datastream';
import { StreamEdit } from 'src/features/DataStream/Streams/StreamForm/StreamEdit';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const streamId = 123;
const mockDestinations = [destinationFactory.build({ id: 1 })];
const mockStream = streamFactory.build({
  id: streamId,
  label: `Data Stream ${streamId}`,
  destinations: mockDestinations,
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ streamId: 123 }),
  };
});

describe('StreamEdit', () => {
  const assertInputHasValue = (inputLabel: string, inputValue: string) => {
    expect(screen.getByLabelText(inputLabel)).toHaveValue(inputValue);
  };

  it('should render edited stream when stream fetched properly', async () => {
    server.use(
      http.get(`*/monitor/streams/${streamId}`, () => {
        return HttpResponse.json(mockStream);
      }),
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(makeResourcePage(mockDestinations));
      })
    );

    renderWithThemeAndHookFormContext({
      component: <StreamEdit />,
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    expect(loadingElement).toBeInTheDocument();
    await waitForElementToBeRemoved(loadingElement);

    await waitFor(() => {
      assertInputHasValue('Name', 'Data Stream 123');
    });
    assertInputHasValue('Stream Type', 'Audit Logs');
    await waitFor(() => {
      assertInputHasValue('Destination Type', 'Linode Object Storage');
    });
    assertInputHasValue('Destination Name', 'Destination 1');

    // Host:
    expect(screen.getByText('3000')).toBeVisible();
    // Bucket:
    expect(screen.getByText('Bucket Name')).toBeVisible();
    // Region:
    await waitFor(() => {
      expect(screen.getByText('US, Chicago, IL')).toBeVisible();
    });
    // Access Key ID:
    expect(screen.getByTestId('access-key-id')).toHaveTextContent(
      '*****************'
    );
    // Secret Access Key:
    expect(screen.getByTestId('secret-access-key')).toHaveTextContent(
      '*****************'
    );
    // Log Path:
    expect(screen.getByText('file')).toBeVisible();
  });
});
