import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import * as React from 'react';
import _Accordion, { AccordionProps } from 'src/components/core/Accordion';
import AccordionDetails, {
  AccordionDetailsProps,
} from 'src/components/core/AccordionDetails';
import AccordionSummary, {
  AccordionSummaryProps,
} from 'src/components/core/AccordionSummary';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';
import { makeStyles } from 'tss-react/mui';
import Notice from '../Notice';

const useStyles = makeStyles()(() => ({
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
  expandIconClassNames?: string;
  summaryProps?: AccordionSummaryProps;
  headingProps?: TypographyProps;
  detailProps?: AccordionDetailsProps;
  headingNumberCount?: number;
}

export const Accordion = (props: Props) => {
  const { classes } = useStyles();

  const {
    summaryProps,
    detailProps,
    headingProps,
    heading,
    actions,
    success,
    warning,
    error,
    defaultExpanded,
    headingNumberCount,
    expandIconClassNames,
    ...accordionProps
  } = props;

  const [open, setOpen] = React.useState<boolean | undefined>(defaultExpanded);

  const handleClick = () => {
    setOpen(!open);
  };

  const notice = success || warning || error || null;

  return (
    <_Accordion
      defaultExpanded={defaultExpanded}
      {...accordionProps}
      data-qa-panel={heading}
    >
      <AccordionSummary
        onClick={handleClick}
        expandIcon={
          <KeyboardArrowDown className={`caret ${expandIconClassNames}`} />
        }
        {...summaryProps}
        data-qa-panel-summary={heading}
      >
        <Typography {...headingProps} variant="h3" data-qa-panel-subheading>
          {heading}
        </Typography>
        {headingNumberCount && headingNumberCount > 0 ? (
          <span className={classes.itemCount}>{headingNumberCount}</span>
        ) : null}
      </AccordionSummary>
      <AccordionDetails {...detailProps} data-qa-panel-details>
        <Grid container>
          {notice ? (
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
          ) : null}
          <Grid item xs={12} data-qa-grid-item>
            {props.children}
          </Grid>
        </Grid>
      </AccordionDetails>
      {actions ? actions(accordionProps) : null}
    </_Accordion>
  );
};

export default RenderGuard<Props>(Accordion);
