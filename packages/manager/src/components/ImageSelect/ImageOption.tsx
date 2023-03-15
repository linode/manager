import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';

import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  icon: {
    fontSize: '1.8em',
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
    },
    marginLeft: theme.spacing(),
  },
}));

interface ImageItem extends Item<string> {
  className?: string;
}

interface ImageOptionProps extends OptionProps<any, any> {
  data: ImageItem;
}

type CombinedProps = ImageOptionProps;

export const ImageOption: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { data, label } = props;

  return (
    <Option
      className={classNames({
        [classes.root]: true,
        [classes.focused]: props.isFocused,
      })}
      value={data.value}
      attrs={{ ['data-qa-image-select-item']: data.value }}
      {...props}
    >
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
      >
        <span className={`${props.data.className} ${classes.icon}`} />
        <Grid item>{label}</Grid>
      </Grid>
    </Option>
  );
};

export default ImageOption;
