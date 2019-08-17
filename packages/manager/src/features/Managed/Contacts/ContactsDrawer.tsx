import * as React from 'react';
import Drawer from 'src/components/Drawer';

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  contact?: Linode.ManagedContact;
}

type CombinedProps = Props;

const ContactsDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, closeDrawer, contact } = props;

  const title = contact ? `Edit ${contact.name}` : 'Edit Contact';

  return (
    <Drawer title={title} open={isOpen} onClose={closeDrawer}>
      {/* FORM GOES HERE */}
      <pre>{JSON.stringify(contact, null, 2)}</pre>
    </Drawer>
  );
};

export default ContactsDrawer;
