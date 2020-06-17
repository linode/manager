import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import '@reach/menu-button/styles.css';
import Settings from '@material-ui/icons/Settings';
import Draggable from 'src/assets/icons/draggable-icon.svg';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(() => ({
  popover: {
    position: 'relative',
    minWidth: 200,
    width: 200,
    border: '1px solid #a8c9f0',
    borderRadius: 3,
    '&:before': {
      content: "''",
      top: 0,
      right: 0,
      position: 'absolute',
      borderColor: '#f4f4f4 transparent transparent transparent',
      borderStyle: 'solid',
      borderWidth: '0 0 15px 0'
    }
  },
  form: {
    padding: 14
  },
  fieldset: {
    border: 'none',
    margin: 0,
    padding: 0
  },
  legendTitle: {
    marginBottom: 14,
    fontSize: 14,
    color: '#32363c'
  },
  optionOuter: {
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  draggableIcon: {
    marginRight: 10
  },
  optionCheckbox: {
    appearance: 'none',
    position: 'relative',
    margin: 0,
    width: 15,
    height: 15,
    border: '1px solid #1f61ad',
    borderRadius: 3,
    '&:checked:after': {
      content: "''",
      position: 'absolute',
      top: 1,
      left: 1,
      width: 11,
      height: 11,
      background: '#75aef0',
      borderRadius: 2
    }
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1f61ad'
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
        Press Enter key to toggle drag drop mode, use arrow keys to move
        selected elements.
      </span>

      <IconButton
        aria-label={ariaLabel}
        onClick={handleClick}
        disableFocusRipple
        disableRipple
        aria-haspopup={true}
        aria-controls={id}
        aria-expanded={open}
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
        PaperProps={{ className: classes.popover }}
      >
        <form className={classes.form}>
          <fieldset className={classes.fieldset}>
            <legend className={classes.legendTitle}>
              <Typography variant="body1">{optionsTitle}</Typography>
            </legend>
            {options.map(option => {
              return (
                <div
                  draggable={true}
                  key={option.label}
                  className={classes.optionOuter}
                >
                  <Draggable className={classes.draggableIcon} aria-hidden />
                  <input
                    type="checkbox"
                    id={option.label}
                    // Allow for checks by default in addition to check changes: checked={option.selected}
                    className={classes.optionCheckbox}
                  />
                  <label className={classes.optionLabel} htmlFor={option.label}>
                    {option.label}
                  </label>
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
