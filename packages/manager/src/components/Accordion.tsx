import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import * as React from 'react';
import {
  default as _Accordion,
  AccordionProps as _AccordionProps,
} from '@mui/material/Accordion';
import AccordionDetails, {
  AccordionDetailsProps,
} from '@mui/material/AccordionDetails';
import AccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { makeStyles } from 'tss-react/mui';
import { Notice } from 'src/components/Notice/Notice';

const useStyles = makeStyles()({
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
});

export interface AccordionProps extends _AccordionProps {
  /**
   * A header places at the top of the Accordion
   */
  heading: string | React.ReactNode;
  /**
   * Error text that shows as a `<Notice />` at the top of the Accordion's body
   */
  error?: string;
  /**
   * Warning text that shows as a `<Notice />` at the top of the Accordion's body
   */
  warning?: string;
  /**
   * Success text that shows as a `<Notice />` at the top of the Accordion's body
   */
  success?: string;
  /**
   * Actually does nothing
   * @default false
   */
  loading?: boolean;
  /**
   * Renders actions at the bottom of the Accordion's body
   */
  actions?: (props: _AccordionProps) => null | JSX.Element;
  /**
   * Optional className to pass to the expand icon
   */
  expandIconClassNames?: string;
  /**
   * Props to pass to the underlying `AccordionSummary` MUI component
   */
  summaryProps?: AccordionSummaryProps;
  /**
   * Props to pass to heading's `<Typography />` component
   */
  headingProps?: TypographyProps;
  /**
   * Props to pass to the underlying `AccordionDetails` MUI component
   */
  detailProps?: AccordionDetailsProps;
  /**
   * A number to display in the Accordion's heading
   */
  headingNumberCount?: number;
}

/**
 * Accordions are better suited for when people need to focus on content that is key for decision making and other supplementary content can be hidden. Accordions should be avoided when users need most if not all of the content on a page. Scrolling isn't as big of an issue as once thought.
 *
 * ### Pros
 * - Puts focus on the content the user is interested in
 * - Can make pages seem less complex
 *
 * ### Cons
 * - Can be cumbersome which adds to cognitive load
 *   - “People treat clicks like currency and they don't spend it frivolously” - NNG [Citation](https://www.nngroup.com/articles/clickable-elements/)
 * - Increases interaction cost
 * - Accordions collapsed by default diminishes people's awareness of content
 */
export const Accordion = (props: AccordionProps) => {
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
            <Grid xs={12}>
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
          <Grid xs={12} data-qa-grid-item>
            {props.children}
          </Grid>
        </Grid>
      </AccordionDetails>
      {actions ? actions(accordionProps) : null}
    </_Accordion>
  );
};
