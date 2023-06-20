import React from 'react';
import { formatPlanTypes } from 'src/utilities/planNotices';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { PlansAvailabilityNotice } from './PlansAvailabilityNotice';
import { regionFactory } from 'src/factories/regions';
import type { PlansAvailabilityNoticeProps } from './PlansAvailabilityNotice';
import type { LinodeTypeClass, Region } from '@linode/api-v4';

const mockedRegionData: Region[] = [
  ...regionFactory.buildList(2, {}),
  ...regionFactory.buildList(1, { capabilities: ['Premium Plans'] }),
];

const planTypes: LinodeTypeClass[] = ['premium', 'gpu'];

describe('PlansAvailabilityNotice', () => {
  planTypes.forEach((planType) => {
    const formattedPlanType = formatPlanTypes(planType);

    it(`renders a ${planType} error notice when isSelectedRegionEligible is false and hasSelectedRegion is true`, async () => {
      const props: PlansAvailabilityNoticeProps = {
        isSelectedRegionEligible: false,
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
    });
  });

  planTypes.forEach((planType) => {
    const formattedPlanType = formatPlanTypes(planType);

    it(`renders a ${planType} warning notice when isSelectedRegionPremium is false and hasSelectedRegion is false`, () => {
      const props: PlansAvailabilityNoticeProps = {
        isSelectedRegionEligible: false,
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
    });
  });

  planTypes.forEach((planType) => {
    it(`renders no ${planType} notice when isSelectedRegionPremium is true`, () => {
      const props: PlansAvailabilityNoticeProps = {
        isSelectedRegionEligible: true,
        hasSelectedRegion: true,
        regionsData: mockedRegionData,
        planType,
      };

      const { queryByTestId } = renderWithTheme(
        <PlansAvailabilityNotice {...props} />
      );

      expect(queryByTestId(/premium-notice/)).not.toBeInTheDocument();
    });
  });
});
