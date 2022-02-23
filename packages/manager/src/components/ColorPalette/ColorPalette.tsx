import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
// eslint-disable-next-line no-restricted-imports
import { useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& h2': {
      color: '#32363c',
    },
  },
  swatchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '15%',
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

export const ColorPalette: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  const primaryColors = [
    { color: theme.palette.primary.main, alias: 'theme.palette.primary.main' },
    {
      color: theme.palette.primary.light,
      alias: 'theme.palette.primary.light',
    },
    { color: theme.palette.text.primary, alias: 'theme.palette.text.primary' },
    { color: theme.color.headline, alias: 'theme.color.headline' },
    { color: theme.palette.divider, alias: 'theme.palette.divider' },
    { color: theme.color.offBlack, alias: 'theme.color.offBlack' },
    { color: theme.color.white, alias: 'theme.color.white' },
  ];

  const etc = [
    { color: theme.color.red, alias: 'theme.color.red' },
    { color: theme.color.green, alias: 'theme.color.green' },
    { color: theme.color.yellow, alias: 'theme.color.yellow' },
    { color: theme.color.border2, alias: 'theme.color.border2' },
    { color: theme.color.border3, alias: 'theme.color.border3' },
    { color: theme.color.grey1, alias: 'theme.color.grey1' },
    { color: theme.color.grey2, alias: 'theme.color.grey2' },
    { color: theme.color.grey3, alias: 'theme.color.grey3' },
    { color: theme.color.grey4, alias: 'theme.color.grey4' },
    { color: theme.color.grey5, alias: 'theme.color.grey5' },
    { color: theme.color.grey6, alias: 'theme.color.grey6' },
  ];

  const bgColors = [
    {
      color: theme.bg.app,
      alias: 'theme.bg.app',
    },
    { color: theme.bg.main, alias: 'theme.bg.main' },
    { color: theme.bg.offWhite, alias: 'theme.bg.offWhite' },
    { color: theme.bg.lightBlue1, alias: 'theme.bg.lightBlue1' },
    { color: theme.bg.lightBlue2, alias: 'theme.bg.lightBlue2' },
    { color: theme.bg.white, alias: 'theme.bg.white' },
    { color: theme.bg.tableHeader, alias: 'theme.bg.tableHeader' },
    { color: theme.bg.primaryNavPaper, alias: 'theme.bg.primaryNavPaper' },
    { color: theme.bg.mainContentBanner, alias: 'theme.bg.mainContentBanner' },
    {
      color: theme.bg.bgPaper,
      alias: 'theme.bg.bgPaper',
    },
    {
      color: theme.bg.bgAccessRow,
      alias: 'theme.bg.bgAccessRow',
    },
    {
      color: theme.bg.bgAccessRowTransparentGradient,
      alias: 'theme.bg.bgAccessRowTransparentGradient',
    },
  ];

  const textColors = [
    {
      color: theme.textColors.linkActiveLight,
      alias: 'theme.textColors.linkActiveLight',
    },
    {
      color: theme.textColors.headlineStatic,
      alias: 'theme.textColors.headlineStatic',
    },
    {
      color: theme.textColors.tableStatic,
      alias: 'theme.textColors.tableStatic',
    },
    {
      color: theme.textColors.textAccessTable,
      alias: 'theme.textColors.textAccessTable',
    },
  ];

  const borderColors = [
    {
      color: theme.borderColors.borderTypography,
      alias: 'theme.borderColors.borderTypography',
    },
    {
      color: theme.borderColors.borderTabActive,
      alias: 'theme.borderColors.borderTabActive',
    },
    {
      color: theme.borderColors.borderTable,
      alias: 'theme.borderColors.borderTable',
    },
    {
      color: theme.borderColors.divider,
      alias: 'theme.borderColors.divider',
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
        {bgColors.map((color, idx: number) =>
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
        {textColors.map((color, idx: number) =>
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
        {borderColors.map((color, idx: number) =>
          createSwatch(idx, color.color, color.alias)
        )}
      </>
    );
  };

  return (
    <Grid container className={classes.root}>
      {renderColors()}
      {renderBackgrounds()}
      {renderTextColors()}
      {renderBorderColors()}
    </Grid>
  );
};

export default ColorPalette;
