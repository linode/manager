import * as copy from 'copy-to-clipboard';
import { update } from 'ramda';
import * as React from 'react';
import Button from 'src/components/Button';
import CopyableTextField from 'src/components/CopyableTextField';
import { makeStyles, Theme } from 'src/components/core/styles';
import ToolTip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import InformationDialog from 'src/components/InformationDialog';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(2),
  },
  urlDisplay: {
    maxWidth: '100%',
    marginTop: theme.spacing(2),
  },
  curl: {
    overflow: 'wrap',
    wordBreak: 'break-all',
  },
  curlDisplay: {
    maxWidth: '100%',
    wordBreak: 'break-all',
    '& .MuiInput-inputMultiline': {
      padding: theme.spacing(),
      lineHeight: 1.4,
    },
    '& .MuiInputBase-multiline': {
      padding: 0,
    },
  },
  actions: {
    marginTop: theme.spacing(),
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  text: {
    marginBottom: theme.spacing(2),
  },
}));
interface Props {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export type CombinedProps = Props;

export const ImageUploadSuccessDialog: React.FC<Props> = (props) => {
  const { isOpen, onClose, url } = props;
  const classes = useStyles();
  const [tooltipOpen, setTooltipOpen] = React.useState([false, false]);

  const handleCopy = (idx: number, text: string) => {
    copy(text);
    setTooltipOpen((state) => update(idx, true, state));
    setTimeout(
      () => setTooltipOpen((state) => update(idx, false, state)),
      1000
    );
  };

  const curlExample = `curl -v -X PUT \\\n-H "Content-Type: application/octet-stream" \\\n--data-binary path/to/image \\\n"${url}"`;

  return (
    /** Disabling the normal ESC/click away to close, because once the modal goes away the URL is lost */
    <InformationDialog
      title="Image Upload URL"
      open={isOpen}
      onClose={onClose}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <div className={classes.root}>
        <div className={classes.text}>
          <Typography>
            The generated URL is created specifically for uploading this image.
          </Typography>
          <Typography>
            <strong>
              Once this modal is closed the URL will not be shown again.
            </strong>
          </Typography>
        </div>
        <Typography className={classes.text}>
          See{' '}
          <Link to="https://linode.com/docs">Deploy an Image to a Linode</Link>{' '}
          for more information on uploading an image to Linode.
        </Typography>
        <Typography>
          <strong>Sample curl request</strong>
        </Typography>
        <CopyableTextField
          className={classes.curlDisplay}
          value={curlExample}
          label=""
          hideIcon
          fullWidth
          multiline
          aria-disabled
        />
        <div className={classes.actions}>
          <ToolTip open={tooltipOpen[0]} title="Copied!" placement="bottom-end">
            <div>
              <Button
                buttonType="secondary"
                onClick={() => {
                  handleCopy(0, curlExample);
                }}
                outline
              >
                Copy Curl Request
              </Button>
            </div>
          </ToolTip>
        </div>

        <CopyableTextField
          className={classes.urlDisplay}
          value={url}
          label=""
          hideIcon
          fullWidth
          aria-disabled
        />
        <div className={classes.actions}>
          {/** <div /> wrapper is needed here to match the style of the tooltip-ed button */}
          <div>
            <Button buttonType="secondary" onClick={() => onClose()}>
              Close
            </Button>
          </div>
          <ToolTip open={tooltipOpen[1]} title="Copied!" placement="bottom-end">
            <div>
              <Button
                buttonType="primary"
                onClick={() => {
                  handleCopy(1, url);
                }}
                outline
              >
                Copy URL
              </Button>
            </div>
          </ToolTip>
        </div>
      </div>
    </InformationDialog>
  );
};

export default React.memo(ImageUploadSuccessDialog);
