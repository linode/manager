import * as React from 'react';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';

import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelSummaryProps,
  ExpansionPanelDetailsProps,
} from 'material-ui/ExpansionPanel';

import Typography, { TypographyProps } from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

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

interface Props {
  heading: string;
  summaryProps?: ExpansionPanelSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: ExpansionPanelDetailsProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EExpansionPanel extends React.Component<CombinedProps> {
  state = { open: true };

  handleClick = (e: React.MouseEvent<any>) => {
    this.setState({ open: !open });
  }

  render() {
    const {
      classes,
      summaryProps,
      detailProps,
      headingProps,
      ...expansionPanelProps,
    } = this.props;

    return (
      <ExpansionPanel {...expansionPanelProps}>
        <ExpansionPanelSummary
          onClick={this.handleClick}
          expandIcon={open ? <ExpandMoreIcon /> : <ExpandMoreIcon />}
          {...summaryProps}
        >
          <Typography className={classes.heading} {...headingProps}>
            {this.props.heading}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps}>
          {this.props.children}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)<Props>(EExpansionPanel);
