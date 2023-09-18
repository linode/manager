import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/Linodes/LinodesCreate/utilities';
import { useFlags } from 'src/hooks/useFlags';
import { useAllTypes, useTypeQuery } from 'src/queries/types';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';
import { priceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
import { isLinodeTypeDifferentPriceInSelectedRegion } from 'src/utilities/pricing/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { Box } from '../Box';
import { DynamicPriceNotice } from '../DynamicPriceNotice';
// import { DocsLink } from '../DocsLink/DocsLink'; //TODO: DC Pricing - M3-7086: Uncomment this once pricing info notice is removed
import { Link } from '../Link';

interface SelectRegionPanelProps {
  disabled?: boolean;
  error?: string;
  handleSelection: (id: string) => void;
  helperText?: string;
  regions: Region[];
  selectedID?: string;
  /**
   * Include a `selectedLinodeTypeId` so we can tell if the region selection will have an affect on price
   */
  selectedLinodeTypeId?: string;
}

export const SelectRegionPanel = (props: SelectRegionPanelProps) => {
  const {
    disabled,
    error,
    handleSelection,
    helperText,
    regions,
    selectedID,
    selectedLinodeTypeId,
  } = props;

  const location = useLocation();
  const flags = useFlags();
  const params = getQueryParamsFromQueryString(location.search);

  const { data: types } = useAllTypes();
  const { data: type } = useTypeQuery(
    selectedLinodeTypeId ?? '',
    Boolean(selectedLinodeTypeId)
  );

  const currentLinodeRegion = params.regionID;

  const isCloning = /clone/i.test(params.type);
  const isLinode = location.pathname.startsWith('/linodes');

  const showCrossDataCenterCloneWarning =
    isCloning && selectedID && currentLinodeRegion !== selectedID;

  const showClonePriceWarning =
    flags.dcSpecificPricing &&
    isCloning &&
    isLinodeTypeDifferentPriceInSelectedRegion({
      regionA: currentLinodeRegion,
      regionB: selectedID,
      type,
    });

  const selectedRegionHasUniquePricing =
    !showClonePriceWarning &&
    selectedID &&
    types?.some((type) =>
      type.region_prices.find((regionPrice) => regionPrice.id === selectedID)
    );

  const showRegionPriceNotice = isLinode
    ? selectedRegionHasUniquePricing
    : selectedID && priceIncreaseMap[selectedID];

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
        {/* {flags.dcSpecificPricing && (
          <DocsLink
            href="https://www.linode.com/pricing"
            label="How Data Center Pricing Works"
          />
        )} */}
      </Box>
      <RegionHelperText
        onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
      />
      {showCrossDataCenterCloneWarning ? (
        <Notice
          data-testid="region-select-warning"
          spacingBottom={0}
          spacingTop={8}
          variant="warning"
        >
          <Typography fontWeight="bold">
            {CROSS_DATA_CENTER_CLONE_WARNING}
          </Typography>
        </Notice>
      ) : null}
      <RegionSelect
        disabled={disabled}
        errorText={error}
        handleSelection={handleSelection}
        helperText={helperText}
        regions={regions}
        selectedID={selectedID || null}
      />
      {showClonePriceWarning && (
        <Notice spacingBottom={0} spacingTop={12} variant="warning">
          <Typography fontWeight="bold">
            The selected region has a different price structure.{' '}
            <Link to="https://www.linode.com/pricing">Learn more.</Link>
          </Typography>
        </Notice>
      )}
      {selectedID && showRegionPriceNotice && (
        <DynamicPriceNotice region={selectedID} />
      )}
    </Paper>
  );
};
