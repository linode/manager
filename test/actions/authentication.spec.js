import sinon from 'sinon';
import { expect } from 'chai';
import {
  SET_TOKEN,
  setToken,
} from '../../src/actions/authentication';

describe('actions/authentication', sinon.test(() => {
  it('should return authentication', () => {
    const f = setToken('token', 'scopes', 'username', 'email@domain.com');

    expect(f.type).to.equal(SET_TOKEN);
  });
}));
