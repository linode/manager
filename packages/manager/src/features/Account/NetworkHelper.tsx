import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root' | 'footnote' | 'link' | 'icon';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    footnote: {
      fontSize: 14,
      cursor: 'pointer'
    },
    link: {
      textDecoration: 'underline'
    },
    icon: {
      display: 'inline-block',
      fontSize: '0.8em',
      marginLeft: theme.spacing(1) / 3
    }
  });

interface Props {
  onChange: () => void;
  networkHelperEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NetworkHelper: React.StatelessComponent<CombinedProps> = props => {
  const { classes, onChange, networkHelperEnabled } = props;

  return (
    <React.Fragment>
      <ExpansionPanel heading="Network Helper" defaultExpanded={true}>
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
                // className="toggleLabel"
                control={
                  <Toggle
                    onChange={onChange}
                    checked={networkHelperEnabled}
                    data-qa-toggle-network-helper
                  />
                }
                label={
                  networkHelperEnabled
                    ? 'Enabled (default behavior)'
                    : 'Disabled'
                }
              />
            </Grid>
          </Grid>
        </Grid>
      </ExpansionPanel>
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(NetworkHelper);
