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
    width: '20%'
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

  const cmrTextColors = [
    {
      color: theme.cmrTextColors.textAction,
      alias: 'theme.cmrTextColors.textAction'
    },
    {
      color: theme.cmrTextColors.textBillingSummary,
      alias: 'theme.cmrTextColors.textBillingSummary'
    },
    {
      color: theme.cmrTextColors.textTab,
      alias: 'theme.cmrTextColors.textTab'
    },
    {
      color: theme.cmrTextColors.textTabActive,
      alias: 'theme.cmrTextColors.textTabActive'
    },
    {
      color: theme.cmrTextColors.textStatusChip,
      alias: 'theme.cmrTextColors.textStatusChip'
    },
    {
      color: theme.cmrTextColors.linkActiveMedium,
      alias: 'theme.cmrTextColors.linkActiveMedium'
    },
    {
      color: theme.cmrTextColors.linkActiveLight,
      alias: 'theme.cmrTextColors.linkActiveLight'
    },
    {
      color: theme.cmrTextColors.headlineStatic,
      alias: 'theme.cmrTextColors.headlineStatic'
    },
    {
      color: theme.cmrTextColors.headlineActive,
      alias: 'theme.cmrTextColors.headlineActive'
    },
    {
      color: theme.cmrTextColors.tableStatic,
      alias: 'theme.cmrTextColors.tableStatic'
    },
    {
      color: theme.cmrTextColors.textTagButton,
      alias: 'theme.cmrTextColors.textTagButton'
    },
    {
      color: theme.cmrTextColors.textAccessTable,
      alias: 'theme.cmrTextColors.textAccessTable'
    },
    {
      color: theme.cmrTextColors.textAccessCode,
      alias: 'theme.cmrTextColors.textAccessCode'
    },
    {
      color: theme.cmrTextColors.textBreadcrumbParent,
      alias: 'theme.cmrTextColors.textBreadcrumbParent'
    }
  ];

  const cmrBorderColors = [
    {
      color: theme.cmrBorderColors.borderNotificationCenter,
      alias: 'theme.cmrBorderColors.borderNotificationCenter'
    },
    {
      color: theme.cmrBorderColors.borderTypography,
      alias: 'theme.cmrBorderColors.borderTypography'
    },
    {
      color: theme.cmrBorderColors.borderTabs,
      alias: 'theme.cmrBorderColors.borderTabs'
    },
    {
      color: theme.cmrBorderColors.borderTabActive,
      alias: 'theme.cmrBorderColors.borderTabActive'
    },
    {
      color: theme.cmrBorderColors.borderBillingSummary,
      alias: 'theme.cmrBorderColors.borderBillingSummary'
    },
    {
      color: theme.cmrBorderColors.borderBillingSummary,
      alias: 'theme.cmrBorderColors.borderBillingSummary'
    },
    {
      color: theme.cmrBorderColors.borderBalance,
      alias: 'theme.cmrBorderColors.borderBalance'
    },
    {
      color: theme.cmrBorderColors.borderTable,
      alias: 'theme.cmrBorderColors.borderTable'
    }
  ];

  const cmrIconColors = [
    {
      color: theme.cmrIconColors.iStatic,
      alias: 'theme.cmrIconColors.iStatic'
    },
    {
      color: theme.cmrIconColors.iActiveMedium,
      alias: 'theme.cmrIconColors.iActiveMedium'
    },
    {
      color: theme.cmrIconColors.iActiveLight,
      alias: 'theme.cmrIconColors.iActiveLight'
    },
    { color: theme.cmrIconColors.iGreen, alias: 'theme.cmrIconColors.iGreen' },
    {
      color: theme.cmrIconColors.iOrange,
      alias: 'theme.cmrIconColors.iOrange'
    },
    { color: theme.cmrIconColors.iRed, alias: 'theme.cmrIconColors.iRed' },
    { color: theme.cmrIconColors.iGrey, alias: 'theme.cmrIconColors.iGrey' },
    {
      color: theme.cmrIconColors.iCheckmark,
      alias: 'theme.cmrIconColors.iCheckmark'
    }
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
        {cmrBGColors.map((color, idx: number) =>
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

  const renderIconColors = () => {
    return (
      <>
        <Grid item xs={12}>
          <Typography variant="h2">Icon Colors</Typography>
        </Grid>
        {cmrIconColors.map((color, idx: number) =>
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
      {renderIconColors()}
    </Grid>
  );
};

export default ColorPalette;
