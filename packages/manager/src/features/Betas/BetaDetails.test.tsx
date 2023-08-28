import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import BetaDetails from './BetaDetails';

describe('BetaDetails', () => {
  it('should be able to display all fields for an AccountBeta type', () => {
    const dates = {
      ended: DateTime.now().minus({ days: 30 }),
      started: DateTime.now().minus({ days: 60 }),
    };
    const beta = {
      description: 'A cool beta program',
      ended: dates.ended.toISO(),
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: dates.started.toISO(),
    };

    const { getByText } = renderWithTheme(<BetaDetails beta={beta} />);
    getByText(RegExp(beta.label));
    getByText(RegExp(dates.started.toISODate()));
    getByText(RegExp(dates.ended.toISODate()));
    getByText(RegExp(beta.description));
  });

  it('should not display the end date field if the beta does not have an ended property', () => {
    const beta = {
      description: 'A cool beta program',
      enrolled: DateTime.now().minus({ days: 60 }).toISO(),
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/End Date:/i)).toBeNull();
  });

  it('should not display the more info field if the beta does not have an more_info property', () => {
    const beta = {
      description: 'A cool beta program',
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = renderWithTheme(<BetaDetails beta={beta} />);
    expect(queryByText(/More Info:/i)).toBeNull();
  });

  it('should not display the Sign Up button if the beta has already been enrolled in', () => {
    const accountBeta = {
      description: 'A cool beta program',
      enrolled: DateTime.now().minus({ days: 60 }).toISO(),
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const beta = {
      description: 'A cool beta program',
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };

    const { queryByText: queryAccountBetaByText } = renderWithTheme(
      <BetaDetails beta={accountBeta} />
    );
    const accountBetaSignUpButton = queryAccountBetaByText('Sign Up');
    expect(accountBetaSignUpButton).toBeNull();

    const { queryByText: queryBetaByText } = renderWithTheme(
      <BetaDetails beta={beta} />
    );
    const betaSignUpButton = queryBetaByText('Sign Up');
    expect(betaSignUpButton).not.toBeNull();
  });

  it('should not display the started date if the beta has been enrolled in', () => {
    const accountBeta = {
      description: 'A cool beta program',
      enrolled: DateTime.now().minus({ days: 60 }).toISO(),
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const beta = {
      description: 'A cool beta program',
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };

    const { queryByText: queryAccountBetaByText } = renderWithTheme(
      <BetaDetails beta={accountBeta} />
    );
    const accountBetaStartDate = queryAccountBetaByText('Start Date:');
    expect(accountBetaStartDate).toBeNull();

    const { queryByText: queryBetaByText } = renderWithTheme(
      <BetaDetails beta={beta} />
    );
    const betaStartDate = queryBetaByText('Start Date:');
    expect(betaStartDate).not.toBeNull();
  });
});
