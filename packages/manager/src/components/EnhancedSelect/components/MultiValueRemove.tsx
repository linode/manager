import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueProps } from 'react-select';

type Props = MultiValueProps<any>;

type CombinedProps = Props;

const MultiValueRemove: React.FC<CombinedProps> = (props) => {
  return (
    <reactSelectComponents.MultiValueRemove {...props}>
      <Close data-qa-select-remove />
    </reactSelectComponents.MultiValueRemove>
  );
};

export default MultiValueRemove;
