import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import {
  withStyles,
  Theme,
  StyledComponentProps,
  StyleRules,
} from 'material-ui/styles';


import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';

import us from 'flag-icon-css/flags/4x3/us.svg';
import de from 'flag-icon-css/flags/4x3/de.svg';
import gb from 'flag-icon-css/flags/4x3/gb.svg';
import sg from 'flag-icon-css/flags/4x3/sg.svg';
import jp from 'flag-icon-css/flags/4x3/jp.svg';

const flagMapping = { us, de, gb, sg, jp };

const styles = (theme: Theme): StyleRules => ({
  flexText: {},
});

function titlecase(string: string): string {
  return string;
}
function formatRegion(region: string) {
  const [countryCode, area] = region.split('-');
  return `${countryCode.toUpperCase()} ${titlecase(area)}`;
}

type TodoAny = any;

interface LinodeAlerts {
  cpu: number;
  io: number;
  network_in: number;
  network_out: number;
  transfer_quote: number;
}

interface LinodeBackups {
  enabled: boolean;
  schedule: TodoAny;
  last_backup: TodoAny;
  snapshot: TodoAny;
}

type LinodeStatus = 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'provisioning'
  | 'deleting'
  | 'migrating';

type Hypervisor = 'kvm' | 'zen';

interface LinodeSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  transfer: number;
}

interface Linode {
  id: string;
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  created: string;
  region: string;
  image: string;
  group: string;
  ipv4: string[];
  ipv6: string;
  label: string;
  type: string;
  status: LinodeStatus;
  updated: string;
  hypervisor: Hypervisor;
  specs: LinodeSpecs;
}

interface Props extends StyledComponentProps<any> {
  linode?: Linode;
  type?: TodoAny;
  image?: TodoAny;
}

interface DefaultProps {
  linode: {};
  classes: {};
}

type PropsWithDefaults = Props & DefaultProps;

const img = (region: string) => {
  const abb = region.substr(0, 2);
  return flagMapping[abb];
};

// const output = `Linode ${parseInt(plan.memory) / 1024}G`;

function displayLabel(memory?: number, label?: string): string | undefined {
  if (!label || !memory) { return; }

  return `${label}, Linode ${memory / 1024}G`;
}

class LinodeRow extends React.Component<Props> {
  static defaultProps = {
    classes: {},
    linode: {},
  };

  render() {
    const { classes, linode, type, image } = this.props as PropsWithDefaults;
    const label = displayLabel(type.memory, image.label);

    return (
      <TableRow key={linode.id}>
        <TableCell>
          <span className={classes.flexText}>
            <Link to="/">{linode.label}</Link>
          </span>
          {label && <span className={classes.flexText}>{label}</span>}
        </TableCell>
        <TableCell>
          <span className={classes.flexText}>
            <ContentCopyIcon className={classes.copyIcons} />{linode.ipv4}
          </span>
          <span className={classes.flexText}>
            <ContentCopyIcon className={classes.copyIcons} />{linode.ipv6}
          </span>
        </TableCell>
        <TableCell>
          <img src={img(linode.region)} height="15" width="20" role="presentation" />
          <Typography variant="body2">{formatRegion(linode.region)}</Typography>
        </TableCell>
        <TableCell>

        </TableCell>
      </TableRow >
    );
  }
}

/**
 * @todo Fix any.
 */
const mapStateToProps = (state: AppState, ownProps: Props) => {
  const typesCollection = state.api.linodeTypes.data;
  const imagesCollection = state.api.images.data;
  const { type, image } = ownProps.linode as Linode;

  return {
    /**
     * @todo Type Image.
     */
    image: imagesCollection
      .find((i: TodoAny) => i.id === image),

    /**
     * @todo Type Type.
     * @see https://gph.is/1aQI2oY
     */
    type: typesCollection
      .find((t: TodoAny) => t.id === type),
  };
};

export default compose(
  connect(mapStateToProps),
  withStyles(styles, { withTheme: true }),
)(LinodeRow);
