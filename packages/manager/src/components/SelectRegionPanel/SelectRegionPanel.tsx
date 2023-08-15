import { Region } from '@linode/api-v4/lib/regions';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Notice } from 'src/components/Notice/Notice';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/Linodes/LinodesCreate/utilities';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

interface SelectRegionPanelProps {
  disabled?: boolean;
  error?: string;
  handleSelection: (id: string) => void;
  helperText?: string;
  regions: Region[];
  selectedID?: string;
}

export const SelectRegionPanel = (props: SelectRegionPanelProps) => {
  const {
    disabled,
    error,
    handleSelection,
    helperText,
    regions,
    selectedID,
  } = props;
  const theme = useTheme();
  const location = useLocation();
  const params = getQueryParamsFromQueryString(location.search);
  const showCrossDataCenterCloneWarning =
    /clone/i.test(params.type) && selectedID && params.regionID !== selectedID;

  if (props.regions.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        '& svg': {
          '& g': {
            // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
            clipPath: 'none !important' as 'none',
          },
        },
        marginTop: theme.spacing(3),
      }}
    >
      <Typography data-qa-tp="Region" variant="h2">
        Region
      </Typography>
      <RegionHelperText
        onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
      />
      {showCrossDataCenterCloneWarning ? (
        <Box data-testid="region-select-warning" marginTop="16px">
          <Notice variant="warning" text={CROSS_DATA_CENTER_CLONE_WARNING} />
        </Box>
      ) : null}
      <RegionSelect
        disabled={disabled}
        errorText={error}
        handleSelection={handleSelection}
        helperText={helperText}
        regions={regions}
        selectedID={selectedID || null}
      />
    </Paper>
  );
};
