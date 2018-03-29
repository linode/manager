import * as React from 'react';
import * as classNames from 'classnames';

import { withStyles, StyleRulesCallback, WithStyles } from 'material-ui';

import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelProps,
  ExpansionPanelSummaryProps,
  ExpansionPanelDetailsProps,
} from 'material-ui/ExpansionPanel';
import Typography, { TypographyProps } from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

import OpenIcon from '../../assets/icons/plus-square.svg';
import CloseIcon from '../../assets/icons/minus-square.svg';

import Notice from '../Notice';

type ClassNames = 'heading'
  | 'success'
  | 'warning'
  | 'error';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;
  return {
    root: {
      flexGrow: 1,
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    success: { backgroundColor: status.success },
    warning: { backgroundColor: status.warning },
    error: { backgroundColor: status.error },
  };
};

interface Props extends ExpansionPanelProps {
  heading: string;
  error?: string;
  warning?: string;
  success?: string;
  actions?: (props: ExpansionPanelProps) => JSX.Element;
  summaryProps?: ExpansionPanelSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: ExpansionPanelDetailsProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EExpansionPanel extends React.Component<CombinedProps> {
  state = { open: true };

  handleClick = (e: React.MouseEvent<any>) => {
    this.setState({ open: !this.state.open });
  }

  render() {
    const {
      classes,
      summaryProps,
      detailProps,
      headingProps,
      actions,
      success, warning, error,
      ...expansionPanelProps,
    } = this.props;

    const notice = success || warning || error || null;

    return (
      <ExpansionPanel {...expansionPanelProps}>
        <ExpansionPanelSummary
          onClick={this.handleClick}
          expandIcon={this.state.open ? <OpenIcon /> : <CloseIcon />}
          {...summaryProps}
          className={classNames({
            [classes.success]: Boolean(this.props.success),
            [classes.warning]: Boolean(this.props.warning),
            [classes.error]: Boolean(this.props.error),
          })}
        >
          <Typography className={classes.heading} {...headingProps}>
            {this.props.heading}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps}>
          <Grid container>
            {
              notice &&
              <Grid item xs={12}>
                <Notice
                  text={notice}
                  {...(success && { success: true })}
                  {...(warning && { warning: true })}
                  {...(error && { error: true })}
                />
              </Grid>
            }
            <Grid item xs={12}>{this.props.children}</Grid>
          </Grid>
        </ExpansionPanelDetails>
        {actions && actions(expansionPanelProps)}
      </ExpansionPanel>
    );
  }
}
const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(EExpansionPanel);
