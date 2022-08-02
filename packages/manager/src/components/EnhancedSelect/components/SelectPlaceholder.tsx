import * as React from 'react';
import { PlaceholderProps } from 'react-select';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    left: '10px',
    wordWrap: 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '0.9rem',
  },
});

type Props = PlaceholderProps<any, any>;

const SelectPlaceholder = (props: Props) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.root}
      {...props.innerProps}
      data-qa-select-placeholder
      data-qa-multi-select={
        props.isMulti ? props.selectProps.placeholder : false
      }
    >
      {props.children}
    </Typography>
  );
};

export default SelectPlaceholder;
