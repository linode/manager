import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import DialogTitle from 'src/components/core/DialogTitle';

interface Props {
  title?: string;
  message?: string;
}

const TheApplicationIsOnFire: React.StatelessComponent<Props> = (props) => {
const { title, message } = props;
  return (
    <Dialog open>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        { message ? message : <>Something went terribly wrong. Did you try {<ReloadLink />}?</> }
      </DialogContent>
    </Dialog>
  );
};
TheApplicationIsOnFire.defaultProps = {
  title: `Oh no!`
}

const ReloadLink = () => <a onClick={() => { location.reload(); }}>restarting it</a>;

export default TheApplicationIsOnFire;
