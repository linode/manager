import classNames from 'classnames';
import * as React from 'react';
import CheckboxIcon from 'src/assets/icons/checkbox.svg';
import CheckboxCheckedIcon from 'src/assets/icons/checkboxChecked.svg';
import Checkbox, { CheckboxProps } from 'src/components/core/Checkbox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: '#ccc',
    transition: theme.transitions.create(['color']),
    '& .defaultFill': {
      transition: theme.transitions.create(['fill']),
    },
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  checked: {
    color: theme.palette.primary.main,
  },
  disabled: {
    color: '#ccc !important',
    fill: `${theme.bg.main} !important`,
    pointerEvents: 'none',
    '& .defaultFill': {
      opacity: 0.5,
      fill: `${theme.bg.main}`,
    },
  },
}));

interface Props extends CheckboxProps {
  text?: string | JSX.Element;
  toolTipText?: string;
}

const LinodeCheckBox: React.FC<Props> = (props) => {
  const { toolTipText, text, ...rest } = props;
  const classes = useStyles();

  const classnames = classNames({
    [classes.root]: true,
    [classes.disabled]: props.disabled === true,
    [classes.checked]: Boolean(props.checked),
  });

  if (props.text) {
    return (
      <React.Fragment>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              className={classnames}
              icon={<CheckboxIcon />}
              checkedIcon={<CheckboxCheckedIcon />}
              data-qa-checked={props.checked}
              {...rest}
            />
          }
          label={props.text}
        />
        {toolTipText && <HelpIcon text={toolTipText} />}
      </React.Fragment>
    );
  }

  return (
    <Checkbox
      color="primary"
      className={classnames}
      icon={<CheckboxIcon />}
      checkedIcon={<CheckboxCheckedIcon />}
      data-qa-checked={props.checked}
      {...rest}
    />
  );
};

export default LinodeCheckBox;
