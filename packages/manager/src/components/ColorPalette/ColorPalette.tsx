// eslint-disable-next-line no-restricted-imports
import { useTheme } from '@material-ui/core';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Color {
  color: string;
  alias: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& h2': {
      color: '#32363c',
    },
  },
  swatchWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(),
  },
  swatch: {
    border: '1px solid #888f91',
    borderRadius: 3,
    height: theme.spacing(4.5),
    width: theme.spacing(4.5),
    margin: '0px 16px',
  },
  alias: {
    color: '#32363c',
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    fontSize: '0.875rem',
  },
  color: {
    color: '#888f91',
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    fontSize: '0.875rem',
  },
}));

export const ColorPalette: React.FC<{}> = () => {
  const classes = useStyles();
  const theme = useTheme();

  const primaryColors = [
    { color: theme.palette.primary.main, alias: 'theme.palette.primary.main' },
    {
      color: theme.palette.primary.light,
      alias: 'theme.palette.primary.light',
    },
    {
      color: theme.palette.primary.dark,
      alias: 'theme.palette.primary.dark',
    },
    { color: theme.palette.text.primary, alias: 'theme.palette.text.primary' },
    { color: theme.color.headline, alias: 'theme.color.headline' },
    { color: theme.palette.divider, alias: 'theme.palette.divider' },
    { color: theme.color.white, alias: 'theme.color.white' },
  ];

  const etc = [
    { color: theme.color.red, alias: 'theme.color.red' },
    { color: theme.color.orange, alias: 'theme.color.orange' },
    { color: theme.color.yellow, alias: 'theme.color.yellow' },
    { color: theme.color.green, alias: 'theme.color.green' },
    { color: theme.color.teal, alias: 'theme.color.teal' },
    { color: theme.color.border2, alias: 'theme.color.border2' },
    { color: theme.color.border3, alias: 'theme.color.border3' },
    { color: theme.color.grey1, alias: 'theme.color.grey1' },
    { color: theme.color.grey2, alias: 'theme.color.grey2' },
    { color: theme.color.grey3, alias: 'theme.color.grey3' },
    { color: theme.color.grey4, alias: 'theme.color.grey4' },
    { color: theme.color.grey5, alias: 'theme.color.grey5' },
    { color: theme.color.grey6, alias: 'theme.color.grey6' },
    { color: theme.color.grey7, alias: 'theme.color.grey7' },
    { color: theme.color.grey8, alias: 'theme.color.grey8' },
    { color: theme.color.grey9, alias: 'theme.color.grey9' },
    { color: theme.color.white, alias: 'theme.color.white' },
    { color: theme.color.black, alias: 'theme.color.black' },
    { color: theme.color.offBlack, alias: 'theme.color.offBlack' },
    { color: theme.color.boxShadow, alias: 'theme.color.boxShadow' },
    { color: theme.color.boxShadowDark, alias: 'theme.color.boxShadowDark' },
    { color: theme.color.blueDTwhite, alias: 'theme.color.blueDTwhite' },
    {
      color: theme.color.tableHeaderText,
      alias: 'theme.color.tableHeaderText',
    },
    { color: theme.color.drawerBackdrop, alias: 'theme.color.drawerBackdrop' },
    { color: theme.color.label, alias: 'theme.color.label' },
    { color: theme.color.disabledText, alias: 'theme.color.disabledText' },
    { color: theme.color.tagButton, alias: 'theme.color.tagButton' },
    { color: theme.color.tagIcon, alias: 'theme.color.tagIcon' },
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
      color: theme.textColors.tableHeader,
      alias: 'theme.textColors.tableHeader',
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
      color: theme.borderColors.borderTable,
      alias: 'theme.borderColors.borderTable',
    },
    {
      color: theme.borderColors.divider,
      alias: 'theme.borderColors.divider',
    },
  ];

  const createSwatch = (color: string, alias: string) => {
    return (
      <Grid
        item
        className={classes.swatchWrapper}
        key={alias}
        xs={12}
        sm={6}
        md={4}
      >
        <div
          className={classes.swatch}
          style={{ backgroundColor: color }}
        ></div>
        <Typography variant="body1">
          <span className={classes.alias}>{alias}</span>
          <br />
          <span className={classes.color}>{color}</span>
        </Typography>
      </Grid>
    );
  };

  const renderColor = (heading: string, colors: Color[]) => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">{heading}</Typography>
        </Grid>
        {colors.map((color) => createSwatch(color.color, color.alias))}
      </>
    );
  };

  return (
    <Grid container className={classes.root}>
      {renderColor('Primary Colors', primaryColors)}
      {renderColor('Etc.', etc)}
      {renderColor('Background Colors', bgColors)}
      {renderColor('Typography Colors', textColors)}
      {renderColor('Border Colors', borderColors)}
    </Grid>
  );
};

export default ColorPalette;
