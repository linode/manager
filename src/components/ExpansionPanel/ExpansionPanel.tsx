import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Minus from 'src/assets/icons/minus-square.svg';
import Plus from 'src/assets/icons/plus-square.svg';
import ExpansionPanel, {
  ExpansionPanelProps
} from 'src/components/core/ExpansionPanel';
import ExpansionPanelDetails, {
  ExpansionPanelDetailsProps
} from 'src/components/core/ExpansionPanelDetails';
import ExpansionPanelSummary, {
  ExpansionPanelSummaryProps
} from 'src/components/core/ExpansionPanelSummary';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import Notice from '../Notice';

type ClassNames = 'root' | 'success' | 'warning' | 'error';

const styles = (theme: Theme) => {
  const {
    palette: { status }
  } = theme;
  return createStyles({
    root: {},
    success: {
      backgroundColor: status.success,
      '&:hover, &:focus': {
        backgroundColor: status.successDark,
        '& h3, & svg': {
          color: theme.color.white
        }
      },
      '& svg': {
        color: theme.palette.text.primary
      }
    },
    warning: {
      backgroundColor: status.warning,
      '&:hover, &:focus': {
        backgroundColor: status.warningDark,
        '& h3': {
          color: theme.color.headline
        }
      },
      '& svg': {
        color: theme.palette.text.primary
      }
    },
    error: {
      backgroundColor: status.error,
      '&:hover, &:focus': {
        backgroundColor: status.errorDark,
        '& h3, & svg': {
          color: 'white'
        }
      },
      '& svg': {
        color: theme.palette.text.primary
      }
    }
  });
};

export interface Props extends ExpansionPanelProps {
  heading: string | React.ReactNode;
  error?: string;
  warning?: string;
  success?: string;
  loading?: boolean;
  actions?: (props: ExpansionPanelProps) => null | JSX.Element;
  summaryProps?: ExpansionPanelSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: ExpansionPanelDetailsProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class EExpansionPanel extends React.Component<CombinedProps> {
  state = { open: this.props.defaultExpanded };

  handleClick = (e: React.MouseEvent<any>) => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const {
      classes,
      summaryProps,
      detailProps,
      headingProps,
      actions,
      success,
      warning,
      error,
      loading,
      ...expansionPanelProps
    } = this.props;

    const notice = success || warning || error || null;

    return (
      <ExpansionPanel
        {...expansionPanelProps}
        className={classes.root}
        data-qa-panel
      >
        <ExpansionPanelSummary
          onClick={this.handleClick}
          expandIcon={this.state.open ? <Minus /> : <Plus />}
          {...summaryProps}
          data-qa-panel-summary={this.props.heading}
        >
          <Typography {...headingProps} variant="h3" data-qa-panel-subheading>
            {this.props.heading}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps} data-qa-panel-details>
          <Grid container>
            {notice && (
              <Grid item xs={12} data-qa-notice>
                <Notice
                  text={notice}
                  {...success && { success: true }}
                  {...warning && { warning: true }}
                  {...error && { error: true }}
                  spacingBottom={0}
                />
              </Grid>
            )}
            <Grid item xs={12} data-qa-grid-item>
              {this.props.children}
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
        {actions && actions(expansionPanelProps)}
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<Props>(EExpansionPanel));
