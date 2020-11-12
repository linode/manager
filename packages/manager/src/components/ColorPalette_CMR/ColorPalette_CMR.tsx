import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
// eslint-disable-next-line no-restricted-imports
import { useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& h2': {
      color: '#32363c'
    }
  },
  swatchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '15%'
  },
  swatch: {
    content: '',
    height: 64,
    width: 64,
    margin: theme.spacing(2)
  },
  label: {
    color: '#606469',
    textAlign: 'center'
  }
}));

interface Props {
  displayBackgrounds?: boolean;
}

export type CombinedProps = Props;

export const ColorPalette: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme();

  const cmrBGColors = [
    { color: theme.cmrBGColors.bgApp, alias: 'theme.cmrBGColors.bgApp' },
    {
      color: theme.cmrBGColors.bgPrimaryNav,
      alias: 'theme.cmrBGColors.bgPrimaryNav'
    },
    {
      color: theme.cmrBGColors.bgPrimaryNavActive,
      alias: 'theme.cmrBGColors.bgPrimaryNavActive'
    },
    {
      color: theme.cmrBGColors.bgSecondaryActions,
      alias: 'theme.cmrBGColors.bgSecondaryActions'
    },
    {
      color: theme.cmrBGColors.bgSearchBar,
      alias: 'theme.cmrBGColors.bgSearchBar'
    },
    { color: theme.cmrBGColors.bgPaper, alias: 'theme.cmrBGColors.bgPaper' },
    {
      color: theme.cmrBGColors.bgPrimaryButton,
      alias: 'theme.cmrBGColors.bgPrimaryButton'
    },
    {
      color: theme.cmrBGColors.bgSecondaryButton,
      alias: 'theme.cmrBGColors.bgSecondaryButton'
    },
    {
      color: theme.cmrBGColors.bgTableHeader,
      alias: 'theme.cmrBGColors.bgTableHeader'
    },
    {
      color: theme.cmrBGColors.bgTableBody,
      alias: 'theme.cmrBGColors.bgTableBody'
    },
    {
      color: theme.cmrBGColors.bgStatusChip,
      alias: 'theme.cmrBGColors.bgStatusChip'
    },
    {
      color: theme.cmrBGColors.bgBillingSummary,
      alias: 'theme.cmrBGColors.bgBillingSummary'
    },
    {
      color: theme.cmrBGColors.bgBreadcrumbParent,
      alias: 'theme.cmrBGColors.bgBreadcrumbParent'
    },
    {
      color: theme.cmrBGColors.bgAccessRow,
      alias: 'theme.cmrBGColors.bgAccessRow'
    },
    {
      color: theme.cmrBGColors.bgAccessHeader,
      alias: 'theme.cmrBGColors.bgAccessHeader'
    }
  ];

  const cmrTextColors = {
    textAction: '#3683dc',
    textBillingSummary: '#32363c',
    textTab: '#3683dc',
    textTabActive: '#32363c',
    textStatusChip: '#5d646f',
    linkActiveMedium: '#2575d0',
    linkActiveLight: '#2575d0',
    headlineStatic: '#32363c',
    headlineActive: '#32363c',
    tableStatic: '#55595d',
    textTagButton: '#3683dc',
    textAccessTable: '#606469',
    textAccessCode: '#606469',
    textBreadcrumbParent: '#3683dc'
  };

  const cmrBorderColors = {
    borderNotificationCenter: '#cce4ff',
    borderTypography: '#e3e5e8',
    borderTabs: '#e3e5e8',
    borderTabActive: '#3683dc',
    borderBillingSummary: '#cce2ff',
    borderBalance: '#c2daff',
    borderTable: '#f4f5f6'
  };

  const cmrIconColors = {
    iStatic: '#5d646f',
    iActiveMedium: '#2575d0',
    iActiveLight: '#3683dc',
    iGreen: '#17cf73',
    iOrange: '#ffb31a',
    iRed: '#cf1e1e',
    // Offline status
    iGrey: '#dbdde1',
    iCheckmark: '#444'
  };

  const createSwatch = (idx: number, color: string, alias: string) => {
    return (
      <Grid item className={classes.swatchWrapper} key={idx}>
        <div
          className={classes.swatch}
          style={{ backgroundColor: color }}
        ></div>
        <Typography className={classes.label}>
          {color}
          <br />
          {alias}
        </Typography>
      </Grid>
    );
  };

  const renderColors = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Primary Colors</Typography>
        </Grid>
        {primaryColors.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}

        <Grid item xs={12}>
          <Typography variant="h2">Etc.</Typography>
        </Grid>
        {etc.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  const renderBackgrounds = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Background Colors</Typography>
        </Grid>
        {cmrBGColors.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  return (
    <Grid container className={classes.root}>
      {props.displayBackgrounds ? renderBackgrounds() : renderColors()}
    </Grid>
  );
};

export default ColorPalette;
