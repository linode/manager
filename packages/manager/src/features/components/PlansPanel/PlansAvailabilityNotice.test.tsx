import { formatPlanTypes, regionFactory } from '@linode/utilities';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlansAvailabilityNotice } from './PlansAvailabilityNotice';

import type { PlansAvailabilityNoticeProps } from './PlansAvailabilityNotice';
import type { LinodeTypeClass, Region } from '@linode/api-v4';

const mockedRegionData: Region[] = [
  ...regionFactory.buildList(2, {}),
  ...regionFactory.buildList(1, { capabilities: ['Premium Plans'] }),
];

const planTypes: LinodeTypeClass[] = ['premium', 'gpu'];
const planType = '%p' as LinodeTypeClass;

describe('PlansAvailabilityNotice', () => {
  it.each(planTypes)(
    `renders a ${planType} error notice when isSelectedRegionEligibleForPlan is false and hasSelectedRegion is true`,
    async () => {
      const formattedPlanType = formatPlanTypes(planType);

      const props: PlansAvailabilityNoticeProps = {
        hasSelectedRegion: true,
        isSelectedRegionEligibleForPlan: false,
        planType,
        regionsData: mockedRegionData,
      };

      const { getByTestId } = renderWithTheme(
        <PlansAvailabilityNotice {...props} />
      );

      expect(getByTestId(`${planType}-notice-error`)).toBeInTheDocument();
      expect(getByTestId(`${planType}-notice-error`)).toHaveAttribute(
        'data-testid',
        `${planType}-notice-error`
      );
      expect(getByTestId(`${planType}-notice-error`)).toHaveTextContent(
        `${formattedPlanType} Plans are not currently available in this region.`
      );
    }
  );

  it.each(planTypes)(
    `renders a ${planType} warning notice when isSelectedRegionPremium is false and hasSelectedRegion is false`,
    () => {
      const formattedPlanType = formatPlanTypes(planType);
      const props: PlansAvailabilityNoticeProps = {
        hasSelectedRegion: false,
        isSelectedRegionEligibleForPlan: false,
        planType,
        regionsData: mockedRegionData,
      };

      const { getByTestId } = renderWithTheme(
        <PlansAvailabilityNotice {...props} />
      );

      expect(getByTestId(`${planType}-notice-warning`)).toBeInTheDocument();
      expect(getByTestId(`${planType}-notice-warning`)).toHaveAttribute(
        'data-testid',
        `${planType}-notice-warning`
      );
      expect(getByTestId(`${planType}-notice-warning`)).toHaveTextContent(
        `${formattedPlanType} Plans are currently available in`
      );
    }
  );

  it.each(planTypes)(
    `renders no ${planType} notice when isSelectedRegionPremium is true`,
    () => {
      const props: PlansAvailabilityNoticeProps = {
        hasSelectedRegion: true,
        isSelectedRegionEligibleForPlan: true,
        planType,
        regionsData: mockedRegionData,
      };

      const { queryByTestId } = renderWithTheme(
        <PlansAvailabilityNotice {...props} />
      );

      expect(queryByTestId(/premium-notice/)).not.toBeInTheDocument();
    }
  );

  it('renders additional global availability text in notice when you are in database create flow with a selected region that does not support the plan', () => {
    const props: PlansAvailabilityNoticeProps = {
      hasSelectedRegion: true,
      isSelectedRegionEligibleForPlan: false,
      planType: 'premium',
      regionsData: mockedRegionData,
      flow: 'database',
    };

    const { queryByText } = renderWithTheme(
      <PlansAvailabilityNotice {...props} />
    );
    const expectedText = `See global availability`;
    const availabilityNotice = queryByText(expectedText);
    expect(availabilityNotice).toBeInTheDocument();
  });

  it('does not render additional global availability text in notice when you are in database resize flow for a cluster in a region that does not support the plan', () => {
    const props: PlansAvailabilityNoticeProps = {
      hasSelectedRegion: true,
      isSelectedRegionEligibleForPlan: false,
      planType: 'premium',
      regionsData: mockedRegionData,
      isResize: true,
      flow: 'database',
    };

    const { queryByText } = renderWithTheme(
      <PlansAvailabilityNotice {...props} />
    );
    const formattedPlanType = formatPlanTypes(props.planType);
    const expectedText = `${formattedPlanType} Plans are not currently available in this region.`;
    const availabilityNotice = queryByText(expectedText, { exact: true });
    expect(availabilityNotice).toBeInTheDocument();
  });
});
