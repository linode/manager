import * as React from 'react';
import { NoticeProps } from 'react-select/src/components/Menu';
import Typography from 'src/components/core/Typography';

interface Props extends NoticeProps<any> {}

type CombinedProps = Props;

const NoOptionsMessage: React.FC<CombinedProps> = props => {
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
