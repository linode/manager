import { Region } from '@linode/api-v4/lib/regions';
import { Theme } from '@mui/material/styles';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { CROSS_DATA_CENTER_CLONE_WARNING } from 'src/features/linodes/LinodesCreate/utilities';
import { sendLinodeCreateDocsEvent } from 'src/utilities/ga';
import { getParamsFromUrl } from 'src/utilities/queryParams';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(3),
      '& svg': {
        '& g': {
          // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
          clipPath: 'none !important' as 'none',
        },
      },
    },
  });

interface Props {
  regions: Region[];
  error?: string;
  handleSelection: (id: string) => void;
  selectedID?: string;
  disabled?: boolean;
  helperText?: string;
}

export const regionHelperText = (onClick?: () => void) => (
  <Typography variant="body1">
    You can use
    {` `}
    <a
      onClick={onClick}
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
      href="https://www.linode.com/speed-test/"
    >
      our speedtest page
    </a>
    {` `}
    to find the best region for your current location.
  </Typography>
);

const SelectRegionPanel: React.FC<Props & WithStyles<ClassNames>> = (props) => {
  const {
    classes,
    disabled,
    error,
    handleSelection,
    helperText,
    regions,
    selectedID,
  } = props;

  const location = useLocation();

  if (props.regions.length === 0) {
    return null;
  }

  const params = getParamsFromUrl(location.search);
  const showCrossDataCenterCloneWarning =
    /clone/i.test(params.type) && selectedID && params.regionID !== selectedID;

  return (
    <Paper className={classes.root}>
      <Typography variant="h2" data-qa-tp="Region">
        Region
      </Typography>
      {regionHelperText(() => sendLinodeCreateDocsEvent('Speedtest Link'))}
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

const styled = withStyles(styles);

export default compose<
  Props & WithStyles<ClassNames>,
  Props & RenderGuardProps
>(
  RenderGuard,
  styled
)(SelectRegionPanel);
