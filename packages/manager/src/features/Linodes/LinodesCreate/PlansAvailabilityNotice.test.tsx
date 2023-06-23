import type { LinodeTypeClass, Region } from '@linode/api-v4';
import React from 'react';
import { regionFactory } from 'src/factories/regions';
import { formatPlanTypes } from 'src/utilities/planNotices';
import { renderWithTheme } from 'src/utilities/testHelpers';
import type { PlansAvailabilityNoticeProps } from './PlansAvailabilityNotice';
import { PlansAvailabilityNotice } from './PlansAvailabilityNotice';

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
        isSelectedRegionEligibleForPlan: false,
        hasSelectedRegion: true,
        regionsData: mockedRegionData,
        planType,
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
        isSelectedRegionEligibleForPlan: false,
        hasSelectedRegion: false,
        regionsData: mockedRegionData,
        planType,
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
        isSelectedRegionEligibleForPlan: true,
        hasSelectedRegion: true,
        regionsData: mockedRegionData,
        planType,
      };

      const { queryByTestId } = renderWithTheme(
        <PlansAvailabilityNotice {...props} />
      );

      expect(queryByTestId(/premium-notice/)).not.toBeInTheDocument();
    }
  );
});
