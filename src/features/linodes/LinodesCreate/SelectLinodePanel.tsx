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
  selectedCloneTargetLinodeID?: number | null;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: any) => void;
  error?: string;
  header?: string;
  isCloneTarget?: boolean;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectLinodePanel extends React.Component<CombinedProps> {
  handleTypeSelect = this.props.handleSelection('selectedTypeID');
  handleSmallestType = this.props.handleSelection('smallestType');
  handleSelection = (!this.props.isCloneTarget)
    ? this.props.handleSelection('selectedLinodeID')
    : this.props.handleSelection('selectedCloneTargetLinodeID');

  renderCard(linode: ExtendedLinode) {
    const { selectedLinodeID, selectedCloneTargetLinodeID, isCloneTarget } = this.props;
    return (
      <SelectionCard
        key={linode.id}
        onClick={(e) => {
          this.handleSelection(e, `${linode.id}`);
          this.handleTypeSelect(e, undefined);
          this.handleSmallestType(e, `${linode.type}`);
        }}
        disabled={(!!isCloneTarget)
          ? linode.id === Number(selectedLinodeID)
          : linode.id === Number(selectedCloneTargetLinodeID)}
        checked={(!!isCloneTarget)
          ? linode.id === Number(selectedCloneTargetLinodeID)
          : linode.id === Number(selectedLinodeID)}
        heading={linode.heading}
        subheadings={linode.subHeadings}
      />
    );
  }

  render() {
    const { error, classes, linodes, header,
      isCloneTarget, selectedCloneTargetLinodeID } = this.props;

    return (
      <Paper className={`${classes.root}`}>
        <div className={classes.inner}>
          {error && <Notice text={error} error />}
          <Typography variant="title">
            {(!!header) ? header : 'Select Linode'}
          </Typography>
          <Typography component="div" className={classes.panelBody}>
            <Grid container>
              {isCloneTarget &&
                <SelectionCard
                  checked={selectedCloneTargetLinodeID === null}
                  onClick={e => this.handleSelection(e, null)}
                  heading={'New Linode'}
                  subheadings={[]}
                />
              }
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
