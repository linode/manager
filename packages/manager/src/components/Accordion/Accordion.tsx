import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as React from 'react';
import Accordion, { AccordionProps } from 'src/components/core/Accordion';
import AccordionDetails, {
  AccordionDetailsProps
} from 'src/components/core/AccordionDetails';
import AccordionSummary, {
  AccordionSummaryProps
} from 'src/components/core/AccordionSummary';
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

type ClassNames = 'root' | 'success' | 'warning' | 'error';

const styles = (theme: Theme) => {
  const {
    palette: { status }
  } = theme;
  return createStyles({
    root: {
      backgroundColor: theme.cmrBGColors.bgPaper,
      '& .MuiAccordionSummary-root': {
        backgroundColor: theme.cmrBGColors.bgPaper
      },
      '& .MuiAccordionDetails-root': {
        backgroundColor: theme.cmrBGColors.bgPaper
      },
      '& .MuiButton-root': {
        marginLeft: 0
      }
    },
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

export interface Props extends AccordionProps {
  heading: string | React.ReactNode;
  error?: string;
  warning?: string;
  success?: string;
  loading?: boolean;
  actions?: (props: AccordionProps) => null | JSX.Element;
  summaryProps?: AccordionSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: AccordionDetailsProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class AAccordion extends React.Component<CombinedProps> {
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
      ...accordionProps
    } = this.props;

    const notice = success || warning || error || null;

    return (
      <Accordion {...accordionProps} className={classes.root} data-qa-panel>
        <AccordionSummary
          onClick={this.handleClick}
          expandIcon={<KeyboardArrowDown />}
          {...summaryProps}
          data-qa-panel-summary={this.props.heading}
        >
          <Typography {...headingProps} variant="h3" data-qa-panel-subheading>
            {this.props.heading}
          </Typography>
        </AccordionSummary>
        <AccordionDetails {...detailProps} data-qa-panel-details>
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
        </AccordionDetails>
        {actions && actions(accordionProps)}
      </Accordion>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<Props>(AAccordion));
