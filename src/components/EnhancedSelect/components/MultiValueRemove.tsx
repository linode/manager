import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

interface Props extends MultiValueGenericProps<any> {}

type CombinedProps = Props;

const MultiValueRemove: React.StatelessComponent<CombinedProps> = props => {
  return (
    <reactSelectComponents.MultiValueRemove {...props}>
      <Close />
    </reactSelectComponents.MultiValueRemove>
  );
};

export default MultiValueRemove;
