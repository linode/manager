import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';

import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelProps,
  ExpansionPanelSummaryProps,
  ExpansionPanelDetailsProps,
} from 'material-ui/ExpansionPanel';

import Typography, { TypographyProps } from 'material-ui/Typography';
import AddIcon from 'material-ui-icons/Add';
import RemoveIcon from 'material-ui-icons/Remove';

const styles: StyleRulesCallback = (theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
});

type ClassNames = 'heading';

interface Props extends ExpansionPanelProps {
  heading: string;
  actions?: (props: ExpansionPanelProps) => JSX.Element;
  summaryProps?: ExpansionPanelSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: ExpansionPanelDetailsProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EExpansionPanel extends React.Component<CombinedProps> {
  state = { open: true };

  handleClick = (e: React.MouseEvent<any>) => {
    console.log(this.state.open);
    this.setState({ open: !open });
  }

  render() {
    const {
      classes,
      summaryProps,
      detailProps,
      headingProps,
      actions,
      ...expansionPanelProps,
    } = this.props;

    return (
      <ExpansionPanel {...expansionPanelProps}>
        <ExpansionPanelSummary
          onClick={this.handleClick}
          expandIcon={this.state.open ? <AddIcon /> : <RemoveIcon />}
          {...summaryProps}
        >
          <Typography className={classes.heading} {...headingProps}>
            {this.props.heading}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps}>
          {this.props.children}
        </ExpansionPanelDetails>
        { actions && actions(expansionPanelProps) }
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)<Props>(EExpansionPanel);
