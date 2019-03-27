import * as moment from 'moment';

import { ExpandableTicketPanel } from './ExpandableTicketPanel';

const classes = {
  root: '',
  userWrapper: '',
  leftIcon: '',
  userName: '',
  paper: '',
  paperOpen: '',
  avatarCol: '',
  userCol: '',
  descCol: '',
  expCol: '',
  expButton: '',
  toggle: '',
  isCurrentUser: '',
  formattedText: '',
  hivelyLink: '',
  hivelyImage: '',
  hivelyContainer: '',
  hivelyLinkIcon: ''
};

const component = new ExpandableTicketPanel({
  isCurrentUser: false,
  classes
});

const recent = moment()
  .subtract(6, 'days')
  .format();
const old = moment()
  .subtract(3, 'months')
  .format();
const user = 'Linode'

describe('shouldRenderHively function', () => {
  it('should return true if an improperly formatted date is passed', () => {
    expect(component.shouldRenderHively(true, 'blah')).toBeTruthy();
  });
  it('should return true if the date is now', () => {
    expect(component.shouldRenderHively(true, moment().format())).toBeTruthy();
  });
  it('should return true if the date is within the past 7 days', () => {
    expect(component.shouldRenderHively(true, recent)).toBeTruthy();
  });
  it('should return false for dates older than 7 days', () => {
    expect(component.shouldRenderHively(true, old)).toBeFalsy();
  });
  it('should return false if the fromLinode parameter is false', () => {
    expect(component.shouldRenderHively(false, recent)).toBeFalsy();
  });
  it('should return false if the user is Linode', () => {
    expect(component.shouldRenderHively(false, recent, user)).toBeFalsy();
  });
});
