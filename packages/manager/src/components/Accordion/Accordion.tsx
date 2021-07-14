import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as React from 'react';
import _Accordion, { AccordionProps } from 'src/components/core/Accordion';
import AccordionDetails, {
  AccordionDetailsProps,
} from 'src/components/core/AccordionDetails';
import AccordionSummary, {
  AccordionSummaryProps,
} from 'src/components/core/AccordionSummary';
import { makeStyles } from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import Notice from '../Notice';

const useStyles = makeStyles(() => ({
  itemCount: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2575d0',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    height: 30,
    width: 30,
    lineHeight: 0,
    position: 'absolute',
    right: 50,
  },
}));

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
  headingNumberCount?: number;
}

type CombinedProps = Props;

export const Accordion: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState<boolean | undefined>(
    props.defaultExpanded
  );

  const handleClick = () => {
    setOpen(!open);
  };

  const {
    summaryProps,
    detailProps,
    headingProps,
    actions,
    success,
    warning,
    error,
    headingNumberCount,
    ...accordionProps
  } = props;

  const notice = success || warning || error || null;

  return (
    <_Accordion {...accordionProps} data-qa-panel>
      <AccordionSummary
        onClick={handleClick}
        expandIcon={<KeyboardArrowDown className="caret" />}
        {...summaryProps}
        data-qa-panel-summary={props.heading}
      >
        <Typography {...headingProps} variant="h3" data-qa-panel-subheading>
          {props.heading}
        </Typography>
        {headingNumberCount && headingNumberCount > 0 && (
          <span className={classes.itemCount}>{headingNumberCount}</span>
        )}
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
            {props.children}
          </Grid>
        </Grid>
      </AccordionDetails>
      {actions && actions(accordionProps)}
    </_Accordion>
  );
};

export default RenderGuard<Props>(Accordion);
