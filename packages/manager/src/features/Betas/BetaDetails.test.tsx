import { DateTime } from 'luxon';
import * as React from 'react';

import { formatDate } from 'src/utilities/formatDate';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import BetaDetails from './BetaDetails';

describe('BetaDetails', () => {
  it('should be able to display all fields for an AccountBeta type', async () => {
    const dates = {
      ended: '2024-10-28T09:44:08.593-04:00',
      started: '2024-09-28T09:44:08.593-04:00',
    };
    const beta = {
      description: 'A cool beta program',
      ended: dates.ended,
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: dates.started,
    };

    const { getByText } = await renderWithThemeAndRouter(
      <BetaDetails beta={beta} dataQA="beta-details" />
    );
    getByText(RegExp(beta.label));
    getByText(formatDate(dates.started, { format: 'yyyy-MM-dd' }));
    getByText(formatDate(dates.ended, { format: 'yyyy-MM-dd' }));
    getByText(RegExp(beta.description));
  });

  it('should not display the end date field if the beta does not have an ended property', async () => {
    const beta = {
      description: 'A cool beta program',
      enrolled: DateTime.now().minus({ days: 60 }).toISO(),
      id: 'beta',
      label: 'Beta',
      more_info: 'https://linode.com',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = await renderWithThemeAndRouter(
      <BetaDetails beta={beta} dataQA="beta-details" />
    );
    expect(queryByText(/End Date:/i)).toBeNull();
  });

  it('should not display the more info field if the beta does not have an more_info property', async () => {
    const beta = {
      description: 'A cool beta program',
      id: 'beta',
      label: 'Beta',
      started: DateTime.now().minus({ days: 60 }).toISO(),
    };
    const { queryByText } = await renderWithThemeAndRouter(
      <BetaDetails beta={beta} dataQA="beta-details" />
    );
    expect(queryByText(/More Info:/i)).toBeNull();
  });

  it('should not display the Sign Up button if the beta has already been enrolled in', async () => {
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

    const {
      queryByText: queryAccountBetaByText,
    } = await renderWithThemeAndRouter(
      <BetaDetails beta={accountBeta} dataQA="beta-details" />
    );
    const accountBetaSignUpButton = queryAccountBetaByText('Sign Up');
    expect(accountBetaSignUpButton).toBeNull();

    const { queryByText: queryBetaByText } = await renderWithThemeAndRouter(
      <BetaDetails beta={beta} dataQA="beta-details" />
    );
    const betaSignUpButton = queryBetaByText('Sign Up');
    expect(betaSignUpButton).not.toBeNull();
  });

  it('should not display the started date if the beta has been enrolled in', async () => {
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

    const {
      queryByText: queryAccountBetaByText,
    } = await renderWithThemeAndRouter(
      <BetaDetails beta={accountBeta} dataQA="beta-details" />
    );
    const accountBetaStartDate = queryAccountBetaByText('Start Date:');
    expect(accountBetaStartDate).toBeNull();

    const { queryByText: queryBetaByText } = await renderWithThemeAndRouter(
      <BetaDetails beta={beta} dataQA="beta-details" />
    );
    const betaStartDate = queryBetaByText('Start Date:');
    expect(betaStartDate).not.toBeNull();
  });
});
