import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import DialogTitle from 'src/components/core/DialogTitle';
import Typography from 'src/components/core/Typography';

const TheApplicationIsOnFire: React.StatelessComponent<{}> = props => {
  return (
    <Dialog open>
      <DialogTitle>Oh snap!</DialogTitle>
      <DialogContent>
        <Typography>
          Something went terribly wrong. Did you try {<ReloadLink />}?
        </Typography>
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
