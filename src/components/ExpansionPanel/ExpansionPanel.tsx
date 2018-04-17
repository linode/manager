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
import Grid from 'src/components/Grid';

import OpenIcon from '../../assets/icons/plus-square.svg';
import CloseIcon from '../../assets/icons/minus-square.svg';

import Notice from '../Notice';

type ClassNames = 'root'
  | 'heading'
  | 'success'
  | 'warning'
  | 'error';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;
  return {
    root: {
      '& .notice': {
        marginTop: 0,
      },
    },
    heading: {
      transition: theme.transitions.create(['color']),
    },
    success: {
      backgroundColor: status.success,
      '&:hover, &:focus': {
        backgroundColor: status.successDark,
        '& h3, & svg': {
          color: 'white',
        },
      },
      '& svg': {
        color: theme.palette.text.primary,
      },
    },
    warning: {
      backgroundColor: status.warning,
      '&:hover, &:focus': {
        backgroundColor: status.warningDark,
        '& h3': {
          color: theme.color.headline,
        },
      },
      '& svg': {
        color: theme.palette.text.primary,
      },
    },
    error: {
      backgroundColor: status.error,
      '&:hover, &:focus': {
        backgroundColor: status.errorDark,
        '& h3, & svg': {
          color: 'white',
        },
      },
      '& svg': {
        color: theme.palette.text.primary,
      },
    },
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
      <ExpansionPanel {...expansionPanelProps} className={classes.root} data-qa-panel>
        <ExpansionPanelSummary
          onClick={this.handleClick}
          expandIcon={this.state.open ? <OpenIcon /> : <CloseIcon />}
          {...summaryProps}
          className={classNames({
            [classes.success]: Boolean(this.props.success),
            [classes.warning]: Boolean(this.props.warning),
            [classes.error]: Boolean(this.props.error),
          })}
          data-qa-panel-summary
        >
          <Typography
            className={classes.heading} {...headingProps}
            variant="subheading"
            data-qa-panel-subheading
          >
            {this.props.heading}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps} data-qa-panel-details>
          <Grid container>
            {
              notice &&
              <Grid item xs={12} data-qa-notice>
                <Notice
                  text={notice}
                  {...(success && { success: true })}
                  {...(warning && { warning: true })}
                  {...(error && { error: true })}
                />
              </Grid>
            }
            <Grid item xs={12} data-qa-grid-item>{this.props.children}</Grid>
          </Grid>
        </ExpansionPanelDetails>
        {actions && actions(expansionPanelProps)}
      </ExpansionPanel>
    );
  }
}
const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(EExpansionPanel);
