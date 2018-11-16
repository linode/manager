import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as React from 'react';

const TheApplicationIsOnFire: React.StatelessComponent<{}> = (props) => {
  return (
    <Dialog open>
      <DialogTitle>Oh snap!</DialogTitle>
      <DialogContent>
        Something went terribly wrong. Did you try {<ReloadLink />}?
      </DialogContent>
    </Dialog>
  );
};

const ReloadLink = () => <a onClick={() => { location.reload(); }}>restarting it</a>;

export default TheApplicationIsOnFire
