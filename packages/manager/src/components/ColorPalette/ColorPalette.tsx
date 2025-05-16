import { Typography as FontTypography } from '@linode/design-language-system';
import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

interface Color {
  alias: string;
  color: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  alias: {
    color: theme.tokens.color.Neutrals[90],
    font: FontTypography.Code,
  },
  color: {
    color: theme.tokens.color.Neutrals[60],
    font: FontTypography.Code,
  },
  root: {
    '& h2': {
      color: theme.tokens.color.Neutrals[90],
    },
  },
  swatch: {
    border: `1px solid ${theme.tokens.color.Neutrals[60]}`,
    borderRadius: 3,
    height: theme.spacing(4.5),
    margin: '0px 16px',
    width: theme.spacing(4.5),
  },
  swatchWrapper: {
    alignItems: 'center',
    display: 'flex',
    marginBottom: theme.spacing(),
  },
}));

/**
 * Add a new color to the palette, especially another tint of gray or blue, only after exhausting the option of using an existing color.
 *
 * - Colors used in light mode are located in `foundations/light.ts`
 * - Colors used in dark mode are located in `foundations/dark.ts`
 *
 * If a color does not exist in the current palette and is only used once, consider applying the color conditionally:
 *
 * `theme.name === 'light' ? theme.tokens.color.Neutrals.White : theme.tokens.color.Neutrals.Black`
 */
export const ColorPalette = () => {
  const { classes } = useStyles();
  const theme = useTheme();

  const primaryColors = [
    { alias: 'theme.palette.primary.main', color: theme.palette.primary.main },
    {
      alias: 'theme.palette.primary.light',
      color: theme.palette.primary.light,
    },
    {
      alias: 'theme.palette.primary.dark',
      color: theme.palette.primary.dark,
    },
    { alias: 'theme.palette.text.primary', color: theme.palette.text.primary },
    { alias: 'theme.color.headline', color: theme.color.headline },
    { alias: 'theme.palette.divider', color: theme.palette.divider },
    { alias: 'theme.color.white', color: theme.color.white },
  ];

  const etc = [
    { alias: 'theme.color.red', color: theme.color.red },
    { alias: 'theme.color.orange', color: theme.color.orange },
    { alias: 'theme.color.yellow', color: theme.color.yellow },
    { alias: 'theme.color.green', color: theme.color.green },
    { alias: 'theme.color.teal', color: theme.color.teal },
    { alias: 'theme.color.border2', color: theme.color.border2 },
    { alias: 'theme.color.border3', color: theme.color.border3 },
    { alias: 'theme.color.grey1', color: theme.color.grey1 },
    { alias: 'theme.color.grey2', color: theme.color.grey2 },
    { alias: 'theme.color.grey3', color: theme.color.grey3 },
    { alias: 'theme.color.grey4', color: theme.color.grey4 },
    { alias: 'theme.color.grey5', color: theme.color.grey5 },
    { alias: 'theme.color.grey6', color: theme.color.grey6 },
    { alias: 'theme.color.grey7', color: theme.color.grey7 },
    { alias: 'theme.color.grey8', color: theme.color.grey8 },
    { alias: 'theme.color.grey9', color: theme.color.grey9 },
    { alias: 'theme.color.white', color: theme.color.white },
    { alias: 'theme.color.black', color: theme.color.black },
    { alias: 'theme.color.offBlack', color: theme.color.offBlack },
    { alias: 'theme.color.boxShadow', color: theme.color.boxShadow },
    { alias: 'theme.color.boxShadowDark', color: theme.color.boxShadowDark },
    { alias: 'theme.color.blueDTwhite', color: theme.color.blueDTwhite },
    {
      alias: 'theme.color.tableHeaderText',
      color: theme.color.tableHeaderText,
    },
    { alias: 'theme.color.drawerBackdrop', color: theme.color.drawerBackdrop },
    { alias: 'theme.color.label', color: theme.color.label },
    { alias: 'theme.color.disabledText', color: theme.color.disabledText },
    { alias: 'theme.color.tagButton', color: theme.color.tagButtonBg },
    { alias: 'theme.color.tagIcon', color: theme.color.tagIcon },
  ];

  const bgColors = [
    {
      alias: 'theme.bg.app',
      color: theme.bg.app,
    },
    { alias: 'theme.bg.main', color: theme.bg.main },
    { alias: 'theme.bg.offWhite', color: theme.bg.offWhite },
    { alias: 'theme.bg.lightBlue1', color: theme.bg.lightBlue1 },
    { alias: 'theme.bg.lightBlue2', color: theme.bg.lightBlue2 },
    { alias: 'theme.bg.white', color: theme.bg.white },
    { alias: 'theme.bg.tableHeader', color: theme.bg.tableHeader },
    { alias: 'theme.bg.primaryNavPaper', color: theme.bg.primaryNavPaper },
    { alias: 'theme.bg.mainContentBanner', color: theme.bg.mainContentBanner },
    {
      alias: 'theme.bg.bgPaper',
      color: theme.bg.bgPaper,
    },
    {
      alias: 'theme.bg.bgAccessRowTransparentGradient',
      color: theme.bg.bgAccessRowTransparentGradient,
    },
  ];

  const textColors = [
    {
      alias: 'theme.textColors.linkActiveLight',
      color: theme.textColors.linkActiveLight,
    },
    {
      alias: 'theme.textColors.headlineStatic',
      color: theme.textColors.headlineStatic,
    },
    {
      alias: 'theme.textColors.tableHeader',
      color: theme.textColors.tableHeader,
    },
    {
      alias: 'theme.textColors.tableStatic',
      color: theme.textColors.tableStatic,
    },
    {
      alias: 'theme.textColors.textAccessTable',
      color: theme.textColors.textAccessTable,
    },
  ];

  const borderColors = [
    {
      alias: 'theme.borderColors.borderTypography',
      color: theme.borderColors.borderTypography,
    },
    {
      alias: 'theme.borderColors.borderTable',
      color: theme.borderColors.borderTable,
    },
    {
      alias: 'theme.borderColors.divider',
      color: theme.borderColors.divider,
    },
  ];

  const createSwatch = (color: string, alias: string) => {
    return (
      <Grid
        className={classes.swatchWrapper}
        key={alias}
        size={{
          md: 4,
          sm: 6,
          xs: 12,
        }}
      >
        <div className={classes.swatch} style={{ backgroundColor: color }} />
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
        <Grid size={12}>
          <Typography variant="h2">{heading}</Typography>
        </Grid>
        {colors.map((color) => createSwatch(color.color, color.alias))}
      </>
    );
  };

  return (
    <Grid className={classes.root} container spacing={2}>
      {renderColor('Primary Colors', primaryColors)}
      {renderColor('Etc.', etc)}
      {renderColor('Background Colors', bgColors)}
      {renderColor('Typography Colors', textColors)}
      {renderColor('Border Colors', borderColors)}
    </Grid>
  );
};
