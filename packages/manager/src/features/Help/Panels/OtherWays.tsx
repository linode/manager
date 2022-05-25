import * as React from 'react';
import Community from 'src/assets/icons/community.svg';
import Documentation from 'src/assets/icons/document.svg';
import Status from 'src/assets/icons/status.svg';
import Support from 'src/assets/icons/support.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Tile from 'src/components/Tile';

type ClassNames = 'root' | 'wrapper' | 'heading';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    wrapper: {
      marginTop: theme.spacing(2),
    },
    heading: {
      textAlign: 'center',
      marginBottom: theme.spacing(4),
    },
  });

interface State {
  error?: string;
}

type CombinedProps = WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="h2" className={classes.heading}>
          Other Ways to Get Help
        </Typography>
        <Grid container className={classes.wrapper}>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Guides and Tutorials"
              description="View Linode and Linux guides and tutorials for all experience levels."
              icon={<Documentation />}
              link="https://linode.com/docs/"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Community Q&A"
              description={`Ask questions, find answers, and connect with other members
              of the Linode Community.`}
              icon={<Community />}
              link="https://linode.com/community/questions"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Linode Status Page"
              description="Get updates on Linode incidents and maintenance"
              icon={<Status />}
              link="https://status.linode.com"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tile
              title="Customer Support"
              description="View or open Linode Support tickets."
              icon={<Support />}
              link="/support/tickets"
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(OtherWays);
