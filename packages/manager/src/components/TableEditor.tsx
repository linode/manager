import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import '@reach/menu-button/styles.css';
import Settings from '@material-ui/icons/Settings';
import Draggable from 'src/assets/icons/draggable-icon.svg';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from 'src/components/core/SvgIcon';
import { convertForAria } from 'src/components/TabLink/TabLink';

const useStyles = makeStyles(() => ({
  popover: {
    minWidth: 200,
    width: 200,
    border: '1px solid #a8c9f0',
    borderRadius: 3,
    overflowX: 'unset',
    overflowY: 'unset',
    '&:before': {
      content: "''",
      top: -15,
      right: 8,
      position: 'absolute',
      borderLeft: '15px solid transparent',
      borderRight: '15px solid transparent',
      borderBottom: '15px solid #a8c9f0',
    },
    '&:after': {
      content: "''",
      top: -13,
      right: 10,
      position: 'absolute',
      borderLeft: '13px solid transparent',
      borderRight: '13px solid transparent',
      borderBottom: '13px solid #fff',
    },
  },
  form: {
    padding: 14,
  },
  fieldset: {
    border: 'none',
    margin: 0,
    padding: 0,
  },
  legendTitle: {
    marginBottom: 14,
    fontSize: 14,
    color: '#32363c',
  },
  optionOuter: {
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:last-of-type': {
      marginBottom: 0,
    },
  },
  draggableIcon: {
    marginRight: 10,
  },
  optionCheckbox: {
    appearance: 'none',
    position: 'relative',
    margin: 0,
    width: 15,
    height: 15,
    border: '1px solid #1f61ad',
    borderRadius: 3,
    cursor: 'pointer',
    '&:checked:after': {
      content: "''",
      position: 'absolute',
      top: 1,
      left: 1,
      width: 11,
      height: 11,
      background: '#75aef0',
      borderRadius: 2,
    },
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 1,
    color: '#1f61ad',
    cursor: 'pointer',
  },
}));

interface Option {
  label: string;
  selected?: boolean;
}

interface Props {
  options: Option[];
  ariaLabel: string;
  optionsTitle: string;
  buttonIcon?: typeof SvgIcon | React.ComponentClass;
}

export type CombinedProps = Props;

const TableEditor: React.FC<CombinedProps> = props => {
  const { options, ariaLabel, optionsTitle, buttonIcon } = props;
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
        EXAMPLES ONLY Element 1 grabbed. Current position 1 of 4, Element 1
        moved, new position 2 of 4, and Element 1 dropped, final position 2 of
        4.
      </span>
      <span id="operation" className="visually-hidden">
        To reorder and customize table display, press Enter key to toggle drag
        drop mode, use arrow keys to move selected elements.
      </span>

      <IconButton
        aria-label={ariaLabel}
        onClick={handleClick}
        disableRipple
        aria-haspopup={true}
        aria-controls={id}
        aria-expanded={open}
        aria-describedby="operation"
      >
        {buttonIcon ? buttonIcon : <Settings />}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ className: classes.popover }}
        aria-labelledby={`legend-${convertForAria(optionsTitle)}`}
        aria-activedescendant={`legend-${convertForAria(optionsTitle)}`}
      >
        <form className={classes.form}>
          <fieldset className={classes.fieldset}>
            <legend
              id={`legend-${convertForAria(optionsTitle)}`}
              className={classes.legendTitle}
            >
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
                    id={`option-${convertForAria(option.label)}`}
                    // Allow for checks by default in addition to check changes:
                    // checked={option.selected}
                    className={classes.optionCheckbox}
                  />
                  <label
                    className={classes.optionLabel}
                    htmlFor={`option-${convertForAria(option.label)}`}
                  >
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
