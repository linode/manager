import * as React from 'react';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/Linodes/LinodesCreate/utilities';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { Notice } from 'src/components/Notice/Notice';
import { Region } from '@linode/api-v4/lib/regions';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { sendLinodeCreateDocsEvent } from 'src/utilities/ga';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

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
        marginTop: theme.spacing(3),
        '& svg': {
          '& g': {
            // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
            clipPath: 'none !important' as 'none',
          },
        },
      }}
    >
      <Typography variant="h2" data-qa-tp="Region">
        Region
      </Typography>
      <RegionHelperText
        onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
      />
      {showCrossDataCenterCloneWarning ? (
        <Box marginTop="16px" data-testid="region-select-warning">
          <Notice warning text={CROSS_DATA_CENTER_CLONE_WARNING} />
        </Box>
      ) : null}
      <RegionSelect
        errorText={error}
        disabled={disabled}
        handleSelection={handleSelection}
        regions={regions}
        selectedID={selectedID || null}
        helperText={helperText}
      />
    </Paper>
  );
};
