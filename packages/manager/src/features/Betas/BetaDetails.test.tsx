import * as React from 'react';
import { DateTime } from 'luxon';

import { renderWithTheme } from 'src/utilities/testHelpers';

import BetaDetails from './BetaDetails';

describe('BetaDetails', () => {
  it('should be able to display all fields for an AccountBeta type', () => {
    const beta = {
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
      ended: DateTime.now().minus({ days: 30 }).toISO(),
      description: 'A cool beta program',
      more_info: 'https://linode.com',
      enrolled: DateTime.now().minus({ days: 50 }).toISO(),
    };
    const { getByText } = renderWithTheme(<BetaDetails beta={beta} />);
    getByText(RegExp(beta.label));
    getByText(RegExp(beta.started));
    getByText(RegExp(beta.ended));
    getByText(RegExp(beta.more_info));
    getByText(RegExp(beta.enrolled));
  });

  it('should not display the end date field if the beta does not have an ended property', () => {
    const beta = {
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
      description: 'A cool beta program',
      more_info: 'https://linode.com',
      enrolled: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/End Date:/i)).toBeNull();
  });

  it('should not display the enrolled date field if the beta does not have an enrolled property', () => {
    const beta = {
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
      description: 'A cool beta program',
      more_info: 'https://linode.com',
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/Enrolled:/i)).toBeNull();
  });

  it('should not display the more info field if the beta does not have an more_info property', () => {
    const beta = {
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
      description: 'A cool beta program',
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/More Info:/i)).toBeNull();
  });

  it('should display the description field if the beta does not have a description property', () => {
    const beta = {
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/Description:/i)).not.toBeNull();
  });
});
