import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import DialogTitle from 'src/components/core/DialogTitle';

const TheApplicationIsOnFire: React.StatelessComponent<{}> = props => {
  return (
    <Dialog open>
      <DialogTitle>Oh snap!</DialogTitle>
      <DialogContent>
        Something went terribly wrong. Did you try {<ReloadLink />}?
      </DialogContent>
    </Dialog>
  );
};

const ReloadLink = () => (
  <a
    onClick={() => {
      location.reload();
    }}
  >
    restarting it
  </a>
);

export default TheApplicationIsOnFire;
