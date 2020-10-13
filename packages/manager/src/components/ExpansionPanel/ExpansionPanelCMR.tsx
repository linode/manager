import * as React from 'react';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import ExpansionPanel, {
  ExpansionPanelProps
} from 'src/components/core/ExpansionPanel';
import ExpansionPanelDetails, {
  ExpansionPanelDetailsProps
} from 'src/components/core/ExpansionPanelDetails';
import ExpansionPanelSummary, {
  ExpansionPanelSummaryProps
} from 'src/components/core/ExpansionPanelSummary';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import Notice from '../Notice';

type ClassNames = 'root' | 'success' | 'warning' | 'error' | 'itemCount';

const styles = (theme: Theme) => {
  return createStyles({
    // @todo: Post-CMR these overrides should live in the theme file.
    root: {
      flexBasis: '100%',
      width: '100%',
      '&:before': {
        backgroundColor: 'transparent'
      },
      '&.Mui-expanded': {
        margin: 0,
        '& .caret': {
          transform: 'rotate(180deg)'
        }
      },
      '& .MuiExpansionPanelDetails-root': {
        padding: '0 18px 15px'
      },
      '& .MuiExpansionPanelSummary-root': {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        padding: '0 9px 0 18px',
        borderTop: '1px solid #f4f5f6',
        '& h3': {
          color: theme.palette.text.primary
        },
        '&:hover': {
          '& h3': {
            color: theme.palette.text.primary
          },
          '& svg': {
            fill: '#2575d0',
            stroke: '#2575d0'
          }
        }
      },
      '& .MuiExpansionPanelSummary-content': {
        order: 1,
        alignItems: 'center'
      },
      '& .MuiExpansionPanelSummary-expandIcon': {
        order: 2,
        '& svg': {
          fill: '#2575d0',
          stroke: '#2575d0'
        }
      }
    },
    itemCount: {
      position: 'absolute',
      right: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: '50%',
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: 0,
      color: 'white',
      backgroundColor: '#2575d0'
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
  headingNumberCount?: number;
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
      headingNumberCount,
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
          expandIcon={<KeyboardArrowDown className="caret" />}
          {...summaryProps}
          data-qa-panel-summary={this.props.heading}
        >
          <Typography {...headingProps} variant="h3" data-qa-panel-subheading>
            {this.props.heading}
          </Typography>
          {this.props.headingNumberCount &&
            this.props.headingNumberCount > 0 && (
              <span className={classes.itemCount}>
                {this.props.headingNumberCount}
              </span>
            )}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails {...detailProps} data-qa-panel-details>
          <Grid container>
            {notice && (
              <Grid item xs={12}>
                <Notice
                  data-qa-notice
                  text={notice}
                  {...(success && { success: true })}
                  {...(warning && { warning: true })}
                  {...(error && { error: true })}
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
