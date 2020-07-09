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

  const primaryColors = [
    { color: theme.palette.primary.main, alias: 'theme.palette.primary.main' },
    {
      color: theme.palette.primary.light,
      alias: 'theme.palette.primary.light'
    },
    { color: theme.palette.primary.dark, alias: 'theme.palette.primary.dark' },
    { color: theme.palette.text.primary, alias: 'theme.palette.text.primary' },
    { color: theme.color.headline, alias: 'theme.color.headline' },
    { color: theme.palette.divider, alias: 'theme.palette.divider' },
    { color: theme.color.offBlack, alias: 'theme.color.offBlack' },
    { color: theme.color.white, alias: 'theme.color.white' }
  ];

  const etc = [
    { color: theme.color.red, alias: 'theme.color.red' },
    { color: theme.color.green, alias: 'theme.color.green' },
    { color: theme.color.yellow, alias: 'theme.color.yellow' },
    { color: theme.color.border1, alias: 'theme.color.border1' },
    { color: theme.color.border2, alias: 'theme.color.border2' },
    { color: theme.color.border3, alias: 'theme.color.border3' },
    { color: theme.color.grey1, alias: 'theme.color.grey1' },
    { color: theme.color.grey2, alias: 'theme.color.grey2' },
    { color: theme.color.grey3, alias: 'theme.color.grey3' },
    { color: theme.color.grey4, alias: 'theme.color.grey4' },
    { color: theme.color.grey5, alias: 'theme.color.grey5' },
    { color: theme.color.grey6, alias: 'theme.color.grey6' },
    { color: theme.color.grey7, alias: 'theme.color.grey7' },
    { color: theme.color.grey8, alias: 'theme.color.grey8' }
  ];

  const bgColors = [
    { color: theme.bg.main, alias: 'theme.bg.main' },
    { color: theme.bg.offWhite, alias: 'theme.bg.offWhite' },
    { color: theme.bg.offWhiteDT, alias: 'theme.bg.offWhiteDT' },
    { color: theme.bg.navy, alias: 'theme.bg.navy' },
    { color: theme.bg.lightBlue, alias: 'theme.bg.lightBlue' },
    { color: theme.bg.white, alias: 'theme.bg.white' },
    { color: theme.bg.pureWhite, alias: 'theme.bg.pureWhite' },
    { color: theme.bg.tableHeader, alias: 'theme.bg.tableHeader' },
    { color: theme.bg.primaryNavActive, alias: 'theme.bg.primaryNavActive' },
    {
      color: theme.bg.primaryNavActiveBG,
      alias: 'theme.bg.primaryNavActiveBG'
    },
    { color: theme.bg.primaryNavBorder, alias: 'theme.bg.primaryNavBorder' },
    { color: theme.bg.primaryNavPaper, alias: 'theme.bg.primaryNavPaper' },
    { color: theme.bg.topMenu, alias: 'theme.bg.topMenu' },
    { color: theme.bg.billingHeader, alias: 'theme.bg.billingHeader' }
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

  return (
    <Grid container className={classes.root}>
      {props.displayBackgrounds ? renderBackgrounds() : renderColors()}
    </Grid>
  );
};

export default ColorPalette;
