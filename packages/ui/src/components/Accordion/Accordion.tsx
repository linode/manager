import { default as _Accordion } from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ChevronDownIcon } from '../../assets';
import { Notice } from '../Notice';
import { Typography } from '../Typography';

import type { TypographyProps } from '../Typography';
import type { Theme } from '@mui/material';
import type { AccordionProps as _AccordionProps } from '@mui/material/Accordion';
import type { AccordionDetailsProps } from '@mui/material/AccordionDetails';
import type { AccordionSummaryProps } from '@mui/material/AccordionSummary';

const useStyles = makeStyles()((theme: Theme) => ({
  itemCount: {
    alignItems: 'center',
    backgroundColor: theme.tokens.color.Ultramarine[70],
    borderRadius: '50%',
    color: theme.tokens.color.Neutrals.White,
    display: 'flex',
    font: theme.font.bold,
    fontSize: '0.875rem',
    height: 30,
    justifyContent: 'center',
    lineHeight: 0,
    position: 'absolute',
    right: 50,
    width: 30,
  },
}));

export interface AccordionProps extends _AccordionProps {
  /**
   * Renders actions at the bottom of the Accordion's body
   */
  actions?: (props: _AccordionProps) => JSX.Element | null;
  /**
   * Props to pass to the underlying `AccordionDetails` MUI component
   */
  detailProps?: AccordionDetailsProps;
  /**
   * Error text that shows as a `<Notice />` at the top of the Accordion's body
   */
  error?: string;
  /**
   * Optional className to pass to the expand icon
   */
  expandIconClassNames?: string;
  /**
   * A header placed at the top of the Accordion
   */
  heading: React.ReactNode | string;
  /**
   * A chip to render in the heading
   */
  headingChip?: React.JSX.Element;
  /**
   * A number to display in the Accordion's heading
   */
  headingNumberCount?: number;
  /**
   * Props to pass to heading's `<Typography />` component
   */
  headingProps?: TypographyProps;
  /**
   * Success text that shows as a `<Notice />` at the top of the Accordion's body
   */
  success?: string;
  /**
   * Props to pass to the underlying `AccordionSummary` MUI component
   */
  summaryProps?: AccordionSummaryProps;
  /**
   * Warning text that shows as a `<Notice />` at the top of the Accordion's body
   */
  warning?: string;
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
    actions,
    defaultExpanded,
    detailProps,
    error,
    expandIconClassNames,
    heading,
    headingChip,
    headingNumberCount,
    headingProps,
    success,
    summaryProps,
    warning,
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
        expandIcon={
          <ChevronDownIcon className={`caret ${expandIconClassNames}`} />
        }
        onClick={handleClick}
        {...summaryProps}
        data-qa-panel-summary={heading}
      >
        <Typography {...headingProps} data-qa-panel-subheading variant="h3">
          {heading}
          {headingChip}
        </Typography>
        {headingNumberCount && headingNumberCount > 0 ? (
          <span className={classes.itemCount}>{headingNumberCount}</span>
        ) : null}
      </AccordionSummary>
      <AccordionDetails {...detailProps} data-qa-panel-details>
        <Grid container>
          {notice ? (
            <Grid size={12}>
              <Notice
                data-qa-notice
                text={notice}
                {...(success && { variant: 'success' })}
                {...(warning && { variant: 'warning' })}
                {...(error && { variant: 'error' })}
                spacingBottom={8}
              />
            </Grid>
          ) : null}
          <Grid data-qa-grid-item size={12}>
            {props.children}
          </Grid>
        </Grid>
      </AccordionDetails>
      {actions ? actions(accordionProps) : null}
    </_Accordion>
  );
};
