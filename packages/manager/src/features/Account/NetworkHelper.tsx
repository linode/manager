import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {},
  footnote: {
    fontSize: 14,
    cursor: 'pointer',
  },
  link: {
    textDecoration: 'underline',
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    marginLeft: `calc(${theme.spacing(1)} / 3)`,
  },
}));

interface Props {
  onChange: () => void;
  networkHelperEnabled: boolean;
}

const NetworkHelper = (props: Props) => {
  const { classes } = useStyles();
  const { onChange, networkHelperEnabled } = props;

  return (
    <Accordion heading="Network Helper" defaultExpanded={true}>
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography variant="body1">
            Network Helper automatically deposits a static networking
            configuration into your Linode at boot.
          </Typography>
        </Grid>
        <Grid item container direction="row" alignItems="center">
          <Grid item>
            <FormControlLabel
              control={
                <Toggle
                  onChange={onChange}
                  checked={networkHelperEnabled}
                  data-qa-toggle-network-helper
                />
              }
              label={
                networkHelperEnabled ? 'Enabled (default behavior)' : 'Disabled'
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Accordion>
  );
};

export default NetworkHelper;
