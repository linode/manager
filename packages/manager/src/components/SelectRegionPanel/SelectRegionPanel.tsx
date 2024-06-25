import { useTheme } from '@mui/material';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { isDistributedRegionSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/Linodes/LinodesCreate/constants';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import {
  DIFFERENT_PRICE_STRUCTURE_WARNING,
  DOCS_LINK_LABEL_DC_PRICING,
} from 'src/utilities/pricing/constants';
import { isLinodeTypeDifferentPriceInSelectedRegion } from 'src/utilities/pricing/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { Box } from '../Box';
import { DocsLink } from '../DocsLink/DocsLink';
import { Link } from '../Link';

import type { RegionSelectProps } from '../RegionSelect/RegionSelect.types';
import type { Capabilities } from '@linode/api-v4/lib/regions';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

interface SelectRegionPanelProps {
  RegionSelectProps?: Partial<RegionSelectProps<true>>;
  currentCapability: Capabilities;
  disabled?: boolean;
  error?: string;
  handleSelection: (id: string) => void;
  helperText?: string;
  selectedId?: string;
  /**
   * Include a `selectedLinodeTypeId` so we can tell if the region selection will have an affect on price
   */
  selectedLinodeTypeId?: string;
}

export const SelectRegionPanel = (props: SelectRegionPanelProps) => {
  const {
    RegionSelectProps,
    currentCapability,
    disabled,
    error,
    handleSelection,
    helperText,
    selectedId,
    selectedLinodeTypeId,
  } = props;

  const flags = useFlags();
  const location = useLocation();
  const theme = useTheme();
  const params = getQueryParamsFromQueryString(location.search);
  const { data: regions } = useRegionsQuery();

  const isCloning = /clone/i.test(params.type);
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');

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

  const hideDistributedRegions =
    !flags.gecko2?.enabled ||
    flags.gecko2?.ga ||
    !isDistributedRegionSupported(params.type as LinodeCreateType);

  const showDistributedRegionIconHelperText = Boolean(
    !hideDistributedRegions &&
      currentCapability &&
      regions?.find(
        (region) =>
          (region.site_type === 'distributed' || region.site_type === 'edge') &&
          region.capabilities.includes(currentCapability)
      )
  );

  if (regions?.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        '& svg': {
          '& g': {
            // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
            clipPath: 'none !important',
          },
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography data-qa-tp="Region" variant="h2">
          Region
        </Typography>
        <DocsLink
          onClick={() =>
            isFromLinodeCreate &&
            sendLinodeCreateFormStepEvent({
              action: 'click',
              category: 'link',
              createType: (params.type as LinodeCreateType) ?? 'Distributions',
              label: DOCS_LINK_LABEL_DC_PRICING,
              version: 'v1',
            })
          }
          href="https://www.linode.com/pricing"
          label={DOCS_LINK_LABEL_DC_PRICING}
        />
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
        showDistributedRegionIconHelperText={
          showDistributedRegionIconHelperText
        }
        currentCapability={currentCapability}
        disableClearable
        disabled={disabled}
        errorText={error}
        helperText={helperText}
        onChange={(e, region) => handleSelection(region.id)}
        regionFilter={hideDistributedRegions ? 'core' : undefined}
        regions={regions ?? []}
        value={selectedId}
        {...RegionSelectProps}
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
    </Paper>
  );
};
