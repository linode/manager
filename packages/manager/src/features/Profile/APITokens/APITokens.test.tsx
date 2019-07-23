import { shallow } from 'enzyme';
import * as moment from 'moment';
import * as React from 'react';

import { pageyProps } from 'src/__data__/pageyProps';

import { APITokenTable } from './APITokenTable';

describe('APITokens', () => {
  describe('create and edit tokens', () => {
    const pats = [
      {
        created: '2018-04-09T20:00:00',
        expiry: moment
          .utc()
          .subtract(1, 'day')
          .format(),
        id: 1,
        token: 'aa588915b6368b80',
        scopes: 'account:read_write',
        label: 'test-1'
      }
    ];

    const component = shallow<APITokenTable>(
      <APITokenTable
        {...pageyProps}
        count={4}
        classes={{
          headline: '',
          paper: '',
          labelCell: '',
          createdCell: ''
        }}
        title="Personal Access Tokens"
        type="Personal Access Token"
        data={pats}
      />
    );

    /* Skipping until we can figure out how to call instance methods on nested component */
    it.skip('create token submit form should return false if label is blank', () => {
      (component.instance() as APITokenTable).createToken('*');
      const errorsExist = !!component.state().form.errors;
      expect(errorsExist).toBeTruthy();
    });

    /* Skipping until we can figure out how to call instance methods on nested component */
    it.skip('edit token submit form should return false if label is blank', () => {
      (component.instance() as APITokenTable).editToken();
      const errorsExist = !!component.state().form.errors;
      expect(errorsExist).toBeTruthy();
    });

    /* Skipping until we can figure out how to call instance methods on nested component */
    it.skip('create token submit form should return no error state if label exists', () => {
      component.setState({
        form: {
          ...component.state().form,
          errors: undefined, // important that we reset the errors here after the previous tests
          values: {
            ...component.state().form.values,
            label: 'test label'
          }
        }
      });
      (component.instance() as APITokenTable).createToken('*');
      const errorsExist = !!component.state().form.errors;
      expect(errorsExist).toBeFalsy();
    });

    /* Skipping until we can figure out how to call instance methods on nested component */
    it.skip('edit token submit form should return no error state if label exists', () => {
      (component.instance() as APITokenTable).editToken();
      const errorsExist = !!component.state().form.errors;
      expect(errorsExist).toBeFalsy();
    });
  });
});
