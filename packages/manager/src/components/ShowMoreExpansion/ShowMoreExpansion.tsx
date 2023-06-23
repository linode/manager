import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Button from 'src/components/Button';
import Collapse from 'src/components/core/Collapse';

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
      fontFamily: theme.font.bold,
      paddingLeft: 0,
      paddingRight: 0,
      transition: theme.transitions.create('color'),
      width: 'auto',
    },
  })
);

interface ShowMoreExpansionProps {
  name: string;
  defaultExpanded?: boolean;
  children?: JSX.Element;
}

const ShowMoreExpansion = (props: ShowMoreExpansionProps) => {
  const { children, defaultExpanded, name } = props;

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
