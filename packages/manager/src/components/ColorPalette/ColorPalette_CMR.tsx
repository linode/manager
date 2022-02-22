import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
// eslint-disable-next-line no-restricted-imports
import { useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.bgPaper,
    '& h2': {
      color: '#32363c',
    },
  },
  swatchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  swatch: {
    content: '',
    height: 64,
    width: 64,
    margin: theme.spacing(2),
  },
  label: {
    color: '#606469',
    textAlign: 'center',
  },
}));

interface Props {
  displayBackgrounds?: boolean;
}

export type CombinedProps = Props;

export const ColorPalette: React.FC<CombinedProps> = () => {
  const classes = useStyles();
  const theme = useTheme();

  const bg = [
    {
      color: theme.bg.bgApp,
      alias: 'theme.bg.bgApp',
    },
    {
      color: theme.bg.bgPaper,
      alias: 'theme.bg.bgPaper',
    },
    {
      color: theme.bg.bgTableHeader,
      alias: 'theme.bg.bgTableHeader',
    },
    {
      color: theme.bg.bgBillingSummary,
      alias: 'theme.bg.bgBillingSummary',
    },
    {
      color: theme.bg.bgAccessRow,
      alias: 'theme.bg.bgAccessRow',
    },
  ];

  const cmrTextColors = [
    {
      color: theme.cmrTextColors.linkActiveLight,
      alias: 'theme.cmrTextColors.linkActiveLight',
    },
    {
      color: theme.cmrTextColors.headlineStatic,
      alias: 'theme.cmrTextColors.headlineStatic',
    },
    {
      color: theme.cmrTextColors.tableStatic,
      alias: 'theme.cmrTextColors.tableStatic',
    },
    {
      color: theme.cmrTextColors.textAccessTable,
      alias: 'theme.cmrTextColors.textAccessTable',
    },
  ];

  const cmrBorderColors = [
    {
      color: theme.cmrBorderColors.borderTypography,
      alias: 'theme.cmrBorderColors.borderTypography',
    },
    {
      color: theme.cmrBorderColors.borderTabActive,
      alias: 'theme.cmrBorderColors.borderTabActive',
    },
    {
      color: theme.cmrBorderColors.borderBillingSummary,
      alias: 'theme.cmrBorderColors.borderBillingSummary',
    },
    {
      color: theme.cmrBorderColors.borderBalance,
      alias: 'theme.cmrBorderColors.borderBalance',
    },
    {
      color: theme.cmrBorderColors.borderTable,
      alias: 'theme.cmrBorderColors.borderTable',
    },
    {
      color: theme.cmrBorderColors.divider,
      alias: 'theme.cmrBorderColors.divider',
    },
    {
      color: theme.cmrBorderColors.dividerLight,
      alias: 'theme.cmrBorderColors.dividerLight',
    },
  ];

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

  const renderBackgrounds = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Background Colors</Typography>
        </Grid>
        {bg.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  const renderTextColors = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Typography Colors</Typography>
        </Grid>
        {cmrTextColors.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  const renderBorderColors = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Border Colors</Typography>
        </Grid>
        {cmrBorderColors.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  return (
    <Grid container className={classes.root}>
      {renderBackgrounds()}
      {renderTextColors()}
      {renderBorderColors()}
    </Grid>
  );
};

export default ColorPalette;
