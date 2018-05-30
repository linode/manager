import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames =
  'root'
  | 'inner'
  | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white,
    marginBottom: theme.spacing.unit * 3,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 2}px 0 0`,
  },
});

interface Props {
  linodes: ExtendedLinode[];
  selectedLinodeID?: number;
  handleSelection: (linode: Linode.Linode) => void;
  error?: string;
  header?: string;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectLinodePanel extends React.Component<CombinedProps> {


  renderCard(linode: ExtendedLinode) {
    const { selectedLinodeID, handleSelection } = this.props;
    return (
      <SelectionCard
        key={linode.id}
        onClick={(e) => { handleSelection(linode); }}
        checked={linode.id === Number(selectedLinodeID)}
        heading={linode.heading}
        subheadings={linode.subHeadings}
      />
    );
  }

  render() {
    const { error, classes, linodes, header } = this.props;

    return (
      <Paper className={`${classes.root}`} data-qa-select-linode-panel>
        <div className={classes.inner}>
          {error && <Notice text={error} error />}
          <Typography variant="title" data-qa-select-linode-header>
            {(!!header) ? header : 'Select Linode'}
          </Typography>
          <Typography component="div" className={classes.panelBody}>
            <Grid container>
              {linodes.map((linode) => {
                return (
                  this.renderCard(linode)
                );
              })}
            </Grid>
          </Typography>
        </div>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectLinodePanel);
