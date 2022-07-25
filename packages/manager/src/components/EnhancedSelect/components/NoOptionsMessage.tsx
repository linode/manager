import * as React from 'react';
import { NoticeProps } from 'react-select/src/components/Menu';
import Typography from 'src/components/core/Typography';

const NoOptionsMessage = (props: NoticeProps<any, any>) => {
  const { selectProps, innerProps, children } = props;

  return (
    <Typography
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
      data-qa-no-options
    >
      {children}
    </Typography>
  );
};

export default NoOptionsMessage;
