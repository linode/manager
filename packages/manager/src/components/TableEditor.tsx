import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import '@reach/menu-button/styles.css';
import Settings from '@material-ui/icons/Settings';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(() => ({
  optionOuter: {
    '&:focus': {
      border: '2px solid red'
    }
  }
}));

interface Option {
  label: string;
  selected?: boolean;
}

interface Props {
  options: Option[];
  ariaLabel: string;
  optionsTitle: string;
}

export type CombinedProps = Props;

const TableEditor: React.FC<CombinedProps> = props => {
  const { options, ariaLabel, optionsTitle } = props;
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <span aria-live="assertive" className="visually-hidden">
        EXAMPLES ONLY Element 1 grabbed. Current position 1 of 4", "Element 1
        moved, new positon 2 of 4", and "Element 1 dropped, final position 2 of
        4".
      </span>
      <span id="operation" className="visually-hidden">
        // DON"T use space bar to toggle- this is how the checkboxes are checked
        Press space bar to toggle drag drop mode, use arrow keys to move
        selected elements.
      </span>

      <IconButton
        aria-describedby={'operation'}
        aria-label={ariaLabel}
        onClick={handleClick}
        disableFocusRipple
        disableRipple
      >
        <Settings />
      </IconButton>

      <Popover
        id={id}
        aria-describedby={'operation'}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <form>
          <fieldset>
            <legend>{optionsTitle}</legend>
            {options.map(option => {
              return (
                <div
                  draggable={true}
                  key={option.label}
                  className={classes.optionOuter}
                >
                  <span aria-hidden>*</span>
                  <input
                    type="checkbox"
                    id={option.label}
                    // Allow for checks by default in addition to check changes: checked={option.selected}
                    className={classes.optionOuter}
                  />
                  <label htmlFor={option.label}>{option.label}</label>
                </div>
              );
            })}
          </fieldset>
        </form>
      </Popover>
    </div>
  );
};

export default React.memo(TableEditor);
