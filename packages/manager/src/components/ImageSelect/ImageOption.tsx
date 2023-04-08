import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';

import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `2px !important`, // Revist use of important when we refactor the Select component
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  icon: {
    fontSize: '1.8em',
    margin: `0 ${theme.spacing()}`,
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
    },
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <span className={`${props.data.className} ${classes.icon}`} />
        <Box>{label}</Box>
      </Box>
    </Option>
  );
};

export default ImageOption;
