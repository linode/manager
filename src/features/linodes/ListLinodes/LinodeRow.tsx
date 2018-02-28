import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as copy from 'copy-to-clipboard';
import { pathOr } from 'ramda';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';

import ActionMenu, { Action } from 'src/components/ActionMenu';
import Tag from 'src/components/Tag';
import { displayLabel, flagImg, formatRegion } from './presentation';

type CSSClasses = 'inlineItems';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  inlineItems: {
    lineHeight: '30px',
    verticalAlign: 'middle',
    display: 'inline-flex',
    margin: '0 3px',
  },
});

function clip(value: string): void {
  copy(value);
}

interface Props {
  linode: Linode.Linode;
  type: Linode.LinodeType;
  image: Linode.Image;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class LinodeRow extends React.Component<PropsWithStyles> {
  actions: Action[] = [
    { title: 'Launch Console', onClick: (e) => { e.preventDefault(); } },
    { title: 'Reboot', onClick: (e) => { e.preventDefault(); } },
    { title: 'View Graphs', onClick: (e) => { e.preventDefault(); } },
    { title: 'Resize', onClick: (e) => { e.preventDefault(); } },
    { title: 'View Backups', onClick: (e) => { e.preventDefault(); } },
    { title: 'Power On', onClick: (e) => { e.preventDefault(); } },
    { title: 'Settings', onClick: (e) => { e.preventDefault(); } },
  ];

  render() {
    const { classes, linode, type, image } = this.props;
    const label = displayLabel(type.memory, image.label);

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
            {label && <div>{label}</div>}
          </div>
        </TableCell>
        <TableCell>
          {tags.map((v: string, idx) => <Tag key={idx} label={v} />)}
        </TableCell>
        <TableCell>
          <div>
            <div className={classes.inlineItems}>
              <ContentCopyIcon
                className="copyIcon"
                onClick={() => clip(linode.ipv4[0])}
              />
            </div>
            <div className={classes.inlineItems}>
              {linode.ipv4}
            </div>
          </div>
          <div>
            <div className={classes.inlineItems}>
              <ContentCopyIcon
                className="copyIcon"
                onClick={() => clip(linode.ipv6)}
              />
            </div>
            <div className={classes.inlineItems}>
              {linode.ipv6}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <img
            className={classes.inlineItems}
            src={flagImg(linode.region)} height="15" width="20" role="presentation"
          />
          <Typography
            className={classes.inlineItems}
            variant="body2"
          >
            {formatRegion(linode.region)}
          </Typography>
        </TableCell>
        <TableCell>
          <ActionMenu actions={this.actions} />
        </TableCell>
      </TableRow >
    );
  }
}

const mapStateToProps = (state: Linode.AppState, ownProps: Props) => {
  const typesCollection = pathOr([], ['api', 'linodeTypes', 'data'], state);
  const imagesCollection = pathOr([], ['api', 'images', 'data'], state);
  const { type, image } = ownProps.linode as Linode.Linode;

  return {
    image: imagesCollection.find((i: Linode.Image) => i.id === image),
    type: typesCollection.find((t: Linode.LinodeType) => t.id === type),
  };
};

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect(mapStateToProps),
  withStyles(styles, { withTheme: true }),
)(LinodeRow);
