import * as React from 'react';
import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { makeStyles } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import Dialog from 'src/components/Dialog';
import CopyableTextField from 'src/components/CopyableTextField';
import Box from 'src/components/core/Box';

interface Props {
  objectStorageKey: ObjectStorageKey | null;
  isOpen: boolean;
  close: () => void;
}

const useStyles = makeStyles(() => ({
  noticeText: {
    '& .noticeText': {
      color: 'inherit',
      lineHeight: 'inherit',
      fontFamily: 'inherit',
      fontSize: '0.875rem',
    },
  },
}));

type CombinedProps = Props;

export const AccessKeyDisplayDialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { objectStorageKey, isOpen, close } = props;

  // This should never happen, but just in case.
  if (!objectStorageKey) {
    return null;
  }

  return (
    <Dialog
      title="Access Keys"
      open={isOpen}
      onClose={close}
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
    >
      <Notice
        spacingTop={16}
        warning
        className={classes.noticeText}
        text={`For security purposes, we can only display your Secret Key once, after which it can't be recovered. Be sure to keep it in a safe place.`}
      />
      <Box marginBottom="16px">
        <CopyableTextField
          expand
          label="Access Key"
          value={objectStorageKey.access_key || ''}
        />
      </Box>
      <Box marginBottom="16px">
        <CopyableTextField
          expand
          label="Secret Key"
          value={objectStorageKey.secret_key || ''}
        />
      </Box>
    </Dialog>
  );
};

export default AccessKeyDisplayDialog;
