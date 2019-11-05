// import { NodeBalancerConfig } from 'linode-js-sdk/lib/nodebalancers'
import * as React from 'react';

import _ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

interface Props {
  isSubmitting: boolean;
  onSubmit: () => Promise<any>;
  userCannotCreateConfig: boolean;
  onDelete: () => void;
}

type CombinedProps = Props;

const ActionsPanel: React.FC<CombinedProps> = props => {
  return (
    <_ActionsPanel style={{ paddingLeft: 0 }}>
      <Button
        buttonType="primary"
        onClick={props.onSubmit}
        loading={props.isSubmitting}
        data-qa-save-config
        disabled={props.userCannotCreateConfig}
      >
        Save
      </Button>
      <Button
        onClick={props.onDelete}
        buttonType="secondary"
        destructive
        data-qa-delete-config
        disabled={props.userCannotCreateConfig}
      >
        Delete
      </Button>
    </_ActionsPanel>
  );
};

export default React.memo(ActionsPanel);
