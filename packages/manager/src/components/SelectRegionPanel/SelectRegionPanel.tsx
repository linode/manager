import { Region } from '@linode/api-v4/lib/regions';
import { Theme } from '@mui/material/styles';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { sendLinodeCreateDocsEvent } from 'src/utilities/ga';

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
  warningNoticeText?: string;
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
    warningNoticeText,
  } = props;

  if (props.regions.length === 0) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <Typography variant="h2" data-qa-tp="Region">
        Region
      </Typography>
      {regionHelperText(() => sendLinodeCreateDocsEvent('Speedtest Link'))}
      {warningNoticeText ? (
        <Box marginTop="16px">
          <Notice warning text={warningNoticeText} />
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
