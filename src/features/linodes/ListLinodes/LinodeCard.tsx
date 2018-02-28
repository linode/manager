import * as React from 'react';

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

import Ubuntu from 'src/assets/distros/Ubuntu.png';

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
}

class LinodeRow extends React.Component<Props & WithStyles<CSSClasses> > {
  render() {
    const { classes, linode } = this.props;

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
                  <img src={Ubuntu} className={classes.distroIcon}/>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="subheading">
                    Ubuntu 14.04 LTS
                  </Typography>
                  <Typography>
                    Linode 1G: 1 CPU, 20G Storage, 1G RAM
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

export default withStyles(styles, { withTheme: true })(LinodeRow);
