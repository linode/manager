import * as React from 'react';
import Notice from 'src/components/Notice';

export interface Props {
  isDisabled?: boolean;
}

export const CreateLinodeDisabled: React.StatelessComponent<Props> = props => {
  const { isDisabled } = props;
  if (!isDisabled) {
    return null;
  }
  return (
    <Notice
      text={
        "You don't have permissions to create a new Linode. Please contact an account administrator for details."
      }
      error={true}
      important
    />
  );
};

export default CreateLinodeDisabled;
