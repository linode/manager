import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import ActionMenu from 'src/components/ActionMenu';
import Tag from 'src/components/Tag';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { displayLabel } from './presentation';
import { actions } from './menuActions';

type CSSClasses = 'inlineItems';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  inlineItems: {
    lineHeight: '30px',
    verticalAlign: 'middle',
    display: 'inline-flex',
    margin: '0 3px',
  },
});

interface Props {
  linode: Linode.Linode;
  type?: Linode.LinodeType;
  image?: Linode.Image;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class LinodeRow extends React.Component<PropsWithStyles> {
  render() {
    const { linode, type, image } = this.props;
    const specsLabel = type && image && displayLabel(type.memory, image.label);

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     * */
    const tags = [linode.group].filter(Boolean);

    return (
      <TableRow key={linode.id}>
        <TableCell>
          <div>
            <div>
              <Link to={`/linodes/${linode.id}`}>
                <Typography variant="title">
                  {linode.label}
                </Typography>
              </Link>
            </div>
            {specsLabel && <div>{specsLabel}</div>}
          </div>
        </TableCell>
        <TableCell>
          {tags.map((v: string, idx) => <Tag key={idx} label={v} />)}
        </TableCell>
        <TableCell>
          <IPAddress ips={linode.ipv4} />
          <IPAddress ips={[linode.ipv6]} />
        </TableCell>
        <TableCell>
          <RegionIndicator region={linode.region} />
        </TableCell>
        <TableCell>
          <ActionMenu actions={actions} />
        </TableCell>
      </TableRow >
    );
  }
}

export default withStyles(styles, { withTheme: true })(LinodeRow);
