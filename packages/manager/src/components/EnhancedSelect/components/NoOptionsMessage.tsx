import { Typography } from '@linode/ui';
import * as React from 'react';

import type { NoticeProps } from 'react-select/src/components/Menu';

type Props = NoticeProps<any, any>;

type CombinedProps = Props;

const NoOptionsMessage: React.FC<CombinedProps> = (props) => {
  const { children, innerProps, selectProps } = props;

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
