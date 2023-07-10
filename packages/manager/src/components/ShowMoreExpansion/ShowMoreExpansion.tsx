import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Button } from 'src/components/Button/Button';
import Collapse from 'src/components/core/Collapse';

const useStyles = makeStyles<void, 'caret'>()(
  (theme: Theme, _params, classes) => ({
    root: {
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: 'transparent !important',
      display: 'flex',
      alignItems: 'center',
      fontFamily: theme.font.bold,
      width: 'auto',
      color: theme.color.headline,
      transition: theme.transitions.create('color'),
      '&:hover': {
        color: theme.palette.primary.main,
        [`& .${classes.caret}`]: {
          color: theme.palette.primary.light,
        },
      },
    },
    caret: {
      color: theme.palette.primary.main,
      marginRight: theme.spacing(0.5),
      fontSize: 28,
      transition: 'transform .1s ease-in-out',
      '&.rotate': {
        transition: 'transform .3s ease-in-out',
        transform: 'rotate(90deg)',
      },
    },
  })
);

interface ShowMoreExpansionProps {
  name: string;
  defaultExpanded?: boolean;
  children?: JSX.Element;
}

const ShowMoreExpansion = (props: ShowMoreExpansionProps) => {
  const { name, defaultExpanded, children } = props;

  const { classes } = useStyles();

  const [open, setOpen] = React.useState<boolean>(defaultExpanded || false);

  const handleNameClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      <Button
        className={classes.root}
        aria-haspopup="true"
        role="button"
        aria-expanded={open ? 'true' : 'false'}
        data-qa-show-more-expanded={open ? 'true' : 'false'}
        onClick={handleNameClick}
        data-qa-show-more-toggle
      >
        {open ? (
          <KeyboardArrowRight className={classes.caret + ' rotate'} />
        ) : (
          <KeyboardArrowRight className={classes.caret} />
        )}
        <div>{name}</div>
      </Button>
      <Collapse in={open} className={open ? 'pOpen' : ''}>
        {open ? <div>{children}</div> : null}
      </Collapse>
    </React.Fragment>
  );
};

export default ShowMoreExpansion;
