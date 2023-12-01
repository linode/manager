import { Capabilities, Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/Linodes/LinodesCreate/constants';
import { useAllTypes, useTypeQuery } from 'src/queries/types';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';
import { DIFFERENT_PRICE_STRUCTURE_WARNING } from 'src/utilities/pricing/constants';
import { priceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
import {
  doesRegionHaveUniquePricing,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from 'src/utilities/pricing/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { Box } from '../Box';
import { DynamicPriceNotice } from '../DynamicPriceNotice';
// import { DocsLink } from '../DocsLink/DocsLink'; //TODO: DC Pricing - M3-7086: Uncomment this once pricing info notice is removed
import { Link } from '../Link';

interface SelectRegionPanelProps {
  currentCapability?: Capabilities | undefined;
  disabled?: boolean;
  error?: string;
  handleSelection: (id: string) => void;
  helperText?: string;
  regions: Region[];
  selectedId?: string;
  /**
   * Include a `selectedLinodeTypeId` so we can tell if the region selection will have an affect on price
   */
  selectedLinodeTypeId?: string;
}

export const SelectRegionPanel = (props: SelectRegionPanelProps) => {
  const {
    currentCapability,
    disabled,
    error,
    handleSelection,
    helperText,
    regions,
    selectedId,
    selectedLinodeTypeId,
  } = props;

  const location = useLocation();
  const theme = useTheme();
  const params = getQueryParamsFromQueryString(location.search);

  const isCloning = /clone/i.test(params.type);
  const isLinode = location.pathname.startsWith('/linodes');

  const { data: types } = useAllTypes(isLinode);
  const { data: type } = useTypeQuery(
    selectedLinodeTypeId ?? '',
    Boolean(selectedLinodeTypeId)
  );

  const currentLinodeRegion = params.regionID;

  const showCrossDataCenterCloneWarning =
    isCloning && selectedId && currentLinodeRegion !== selectedId;

  const showClonePriceWarning =
    isCloning &&
    isLinodeTypeDifferentPriceInSelectedRegion({
      regionA: currentLinodeRegion,
      regionB: selectedId,
      type,
    });

  const selectedRegionHasUniquePricing = doesRegionHaveUniquePricing(
    selectedId,
    types
  );

  const showUniquePricingNotice =
    !showClonePriceWarning && // Don't show both notices at the same time.
    selectedRegionHasUniquePricing;

  // If this component is used in the context of Linodes,
  // use Linode types from the API to determine if the region
  // has specific pricing. Otherwise, check against our local pricing map.
  const showRegionPriceNotice = isLinode
    ? showUniquePricingNotice
    : selectedId && priceIncreaseMap[selectedId];

  if (props.regions.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={(theme) => ({
        '& svg': {
          '& g': {
            // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
            clipPath: 'none !important',
          },
        },
        marginTop: theme.spacing(3),
      })}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography data-qa-tp="Region" variant="h2">
          Region
        </Typography>
        {/* TODO: DC Pricing - M3-7086: Uncomment this once pricing info notice is removed */}
        {/*
          <DocsLink
            href="https://www.linode.com/pricing"
            label="How Data Center Pricing Works"
          />
        */}
      </Box>
      <RegionHelperText
        onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
      />
      {showCrossDataCenterCloneWarning ? (
        <Notice
          dataTestId="cross-data-center-notice"
          spacingBottom={0}
          spacingTop={8}
          variant="warning"
        >
          <Typography fontFamily={theme.font.bold}>
            {CROSS_DATA_CENTER_CLONE_WARNING}
          </Typography>
        </Notice>
      ) : null}
      <RegionSelect
        currentCapability={currentCapability}
        disabled={disabled}
        errorText={error}
        handleSelection={handleSelection}
        helperText={helperText}
        regions={regions}
        selectedId={selectedId || null}
      />
      {showClonePriceWarning && (
        <Notice
          dataTestId="different-price-structure-notice"
          spacingBottom={0}
          spacingTop={12}
          variant="warning"
        >
          <Typography fontFamily={theme.font.bold}>
            {DIFFERENT_PRICE_STRUCTURE_WARNING}{' '}
            <Link to="https://www.linode.com/pricing">Learn more.</Link>
          </Typography>
        </Notice>
      )}
      {selectedId && showRegionPriceNotice && (
        <DynamicPriceNotice region={selectedId} />
      )}
    </Paper>
  );
};
