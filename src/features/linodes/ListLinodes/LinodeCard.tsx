import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { pathOr } from 'ramda';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';

import MoreHoriz from 'material-ui-icons/MoreHoriz';

import Tag from 'src/components/Tag';
import { typeLabelLong } from './presentation';

import Arch from 'src/assets/distros/Arch.png';
import CentOS from 'src/assets/distros/CentOS.png';
import ContainerLinux from 'src/assets/distros/ContainerLinux.png';
import Debian from 'src/assets/distros/Debian.png';
import Fedora from 'src/assets/distros/Fedora.png';
import Gentoo from 'src/assets/distros/Gentoo.png';
import OpenSUSE from 'src/assets/distros/OpenSUSE.png';
import Slackware from 'src/assets/distros/Slackware.png';
import Ubuntu from 'src/assets/distros/Ubuntu.png';

const distroIcons = {
  Arch,
  CentOS,
  CoreOS: ContainerLinux,
  Debian,
  Fedora,
  Gentoo,
  openSUSE: OpenSUSE,
  Slackware,
  Ubuntu,
};

type CSSClasses = 'cardSection' | 'distroIcon' | 'cardActions' | 'button';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  cardSection: {
    marginTop: theme.spacing.unit * 2,
  },
  distroIcon: {
    marginTop: theme.spacing.unit,
    width: theme.spacing.unit * 3,
  },
  cardActions: {
    padding: 0,
  },
  button: {
    height: '100%',
    margin: 0,
  },
});

interface Props {
  linode: Linode.Linode;
  image: Linode.Image;
  type: Linode.LinodeType;
}

class LinodeCard extends React.Component<Props & WithStyles<CSSClasses> > {
  render() {
    const { classes, linode, image, type } = this.props;

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     * */
    const tags = [linode.group].filter(Boolean);

    return (
      <Grid item xs={12} sm={6} lg={4} xl={3}>
        <Card>
          <CardHeader
            title={linode.label}
            action={
              <IconButton>
                <MoreHoriz color="primary"/>
              </IconButton>
            }
          />
          {<Divider />}
          <CardContent>
            <div>
              {tags.map((tag: string, idx) => <Tag key={idx} label={tag} />)}
            </div>
            <div className={classes.cardSection}>
              <Grid container>
                <Grid item className="tac" xs={2}>
                  <img src={distroIcons[image.vendor]} className={classes.distroIcon}/>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="subheading">
                    {image.label}
                  </Typography>
                  <Typography>
                    {typeLabelLong(type.memory, type.disk, type.vcpus)}
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <div className={classes.cardSection}>
              IP Addresses
            </div>
            <div className={classes.cardSection}>
              Region Indicator
            </div>
          </CardContent>
          <CardActions className={classes.cardActions}>
            <Button className={classes.button}>
              Launch Console
            </Button>
            <Button className={classes.button}>
              Reboot
            </Button>
          </CardActions>
        </Card>
      </Grid>
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
)(LinodeCard);
