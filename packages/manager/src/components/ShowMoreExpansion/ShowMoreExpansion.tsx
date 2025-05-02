import { Button } from '@linode/ui';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Collapse from '@mui/material/Collapse';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { ButtonProps } from '@linode/ui';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles<void, 'caret'>()(
  (theme: Theme, _params, classes) => ({
    caret: {
      '&.rotate': {
        transform: 'rotate(90deg)',
        transition: 'transform .3s ease-in-out',
      },
      color: theme.palette.primary.main,
      fontSize: 28,
      marginRight: theme.spacing(0.5),
      transition: 'transform .1s ease-in-out',
    },
    root: {
      '&:hover': {
        [`& .${classes.caret}`]: {
          color: theme.palette.primary.light,
        },
        color: theme.palette.primary.main,
      },
      alignItems: 'center',
      backgroundColor: 'transparent !important',
      color: theme.color.headline,
      display: 'flex',
      font: theme.font.bold,
      paddingLeft: 0,
      paddingRight: 0,
      transition: theme.transitions.create('color'),
      width: 'auto',
    },
  })
);

export interface ShowMoreExpansionProps {
  /**
   * Optional props that will be passed to the underlying button
   */
  ButtonProps?: ButtonProps;
  /**
   * The content that will be shown when the component is expanded.
   */
  children?: JSX.Element;
  /**
   * Whether or not the component should be expanded by default.
   */
  defaultExpanded?: boolean;
  /**
   * The text that appears in the clickabe button to show more content.
   */
  name: string;
}

export const ShowMoreExpansion = (props: ShowMoreExpansionProps) => {
  const { ButtonProps, children, defaultExpanded, name } = props;

  const { classes } = useStyles();

  const [open, setOpen] = React.useState<boolean>(defaultExpanded || false);

  const handleNameClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      <Button
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="true"
        className={classes.root}
        data-qa-show-more-expanded={open ? 'true' : 'false'}
        data-qa-show-more-toggle
        onClick={handleNameClick}
        role="button"
        {...ButtonProps}
      >
        {open ? (
          <KeyboardArrowRight className={classes.caret + ' rotate'} />
        ) : (
          <KeyboardArrowRight className={classes.caret} />
        )}
        <div>{name}</div>
      </Button>
      <Collapse className={open ? 'pOpen' : ''} in={open}>
        {open ? <div>{children}</div> : null}
      </Collapse>
    </React.Fragment>
  );
};
