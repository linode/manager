import * as React from 'react';

import Download from 'src/assets/icons/download.svg';
import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';

import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';
import { downloadFile } from 'src/utilities/downloadFile';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root' | 'icon' | 'tooltip' | 'iconLink';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    icon: {
      color: '#3683dc'
    },
    tooltip: {
      '& svg': {
        color: '#3683dc'
      }
    },
    iconLink: {
      marginRight: theme.spacing(1),
      background: 'none',
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer'
    }
  });

interface Props {
  kubeConfig: string;
  clusterLabel: string;
  open: boolean;
  loading: boolean;
  error: boolean;
  closeDrawer: () => void;
}

export type CombinedProps = Props & WithStyles<ClassNames>;

const splitCode = (code: string): string => {
  const MAX_LENGTH = 75;
  const lines = code.trim().split('\n');
  const shortLines = lines.map(thisLine =>
    thisLine.length > MAX_LENGTH
      ? splitCode(
          thisLine.slice(0, MAX_LENGTH) + '\n' + thisLine.slice(MAX_LENGTH)
        )
      : thisLine
  );
  return shortLines.join('\n');
};

export const KubeConfigDrawer: React.FC<CombinedProps> = props => {
  const {
    classes,
    clusterLabel,
    error,
    loading,
    kubeConfig,
    closeDrawer,
    open
  } = props;
  const html = new Converter({
    extensions: ['highlightjs'],
    simplifiedAutoLink: true,
    openLinksInNewWindow: true
  }).makeHtml(splitCode('```\n' + kubeConfig + '\n```'));

  return (
    <Drawer title={'View Kubeconfig'} open={open} onClose={closeDrawer} wide>
      <DrawerContent title={clusterLabel} error={error} loading={loading}>
        <Grid container spacing={2}>
          <Grid item>
            <Typography variant="h3">{clusterLabel}</Typography>
          </Grid>
          <Grid item>
            <button
              onClick={() => downloadFile('kubeconfig.yaml', kubeConfig)}
              className={classes.iconLink}
              role="button"
              title="Download"
            >
              <Download className={classes.icon} />
            </button>
            <CopyTooltip className={classes.tooltip} text={kubeConfig} />
          </Grid>
        </Grid>
        <div>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const styled = withStyles(styles);
export default styled(KubeConfigDrawer);
