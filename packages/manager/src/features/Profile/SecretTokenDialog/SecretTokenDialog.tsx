import * as React from 'react';
import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { makeStyles } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import Dialog from 'src/components/Dialog';
import CopyableAndDownloadableTextField from 'src/components/CopyableAndDownloadableTextField';
import Box from 'src/components/core/Box';

interface Props {
  title: string;
  value?: string | undefined;
  objectStorageKey?: ObjectStorageKey | null;
  open: boolean;
  onClose: () => void;
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

export const SecretTokenDialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { title, value, objectStorageKey, open, onClose } = props;

  return (
    <Dialog
      title={title}
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      disableEscapeKeyDown
      maxWidth="sm"
    >
      <Notice
        spacingTop={8}
        warning
        className={classes.noticeText}
        text={`${
          objectStorageKey ? '' : 'Your keys have been generated.'
        } For security purposes, we can only display your ${
          objectStorageKey ? 'secret key' : title.toLowerCase()
        } once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
      />
      {objectStorageKey ? (
        <>
          <Box marginBottom="16px">
            <CopyableAndDownloadableTextField
              expand
              label={'Access Key'}
              value={objectStorageKey.access_key || ''}
              spellCheck={false}
            />
          </Box>
          <Box marginBottom="16px">
            <CopyableAndDownloadableTextField
              expand
              label={'Secret Key'}
              value={objectStorageKey.secret_key || ''}
              spellCheck={false}
            />
          </Box>
        </>
      ) : value ? (
        <Box marginBottom="16px">
          <CopyableAndDownloadableTextField
            expand
            label={title}
            value={value || ''}
            spellCheck={false}
          />
        </Box>
      ) : null}
    </Dialog>
  );
};

export default SecretTokenDialog;
