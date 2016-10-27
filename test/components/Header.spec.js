import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import Header from '../../src/components/Header';

describe('components/Header', () => {
  describe('main', () => {
    it('renders username', () => {
      const navigation = shallow(
        <Header username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
      );

      expect(navigation.find('.nav-user').text()).to.equal('peanut');
    });

    it('renders gravatar', () => {
      const navigation = shallow(
        <Header username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
      );

      expect(navigation.find('.nav-gravatar-img').src).to.be.defined;
    });

    it('renders logo image', () => {
      const navigation = shallow(
        <Header username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
      );

      expect(navigation.find('img').src).to.be.defined;
    });

    it('renders logo image home link', () => {
      const navigation = shallow(
        <Header username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
      );

      expect(navigation.find({ to: '/' }).length).to.equal(1);
    });

    it('renders search', () => {
      const navigation = shallow(
        <Header username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
      );

      expect(navigation.find('input').length).to.equal(1);
    });

    it('opens notifications sidebar on profile click', () => {
      const hideShowNotifications = sinon.spy();
      const navigation = shallow(
        <Header
          username={'peanut'}
          emailHash={'24afd9bad4cf41b3c07d61fa0df03768'}
          hideShowNotifications={hideShowNotifications}
        />
      );

      const profileButton = navigation.find('.navbar-session');
      profileButton.simulate('click');
      expect(hideShowNotifications.calledOnce).to.equal(true);
    });
  });

  describe('infobar', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
      sandbox.restore();
    });

    it('renders nav component', () => {
      const infobar = shallow(<Header title="" link="" />);

      expect(infobar.find('.fa-github').length).to.equal(1);
      expect(infobar.find('.fa-twitter').length).to.equal(1);
    });

    it('renders links', () => {
      const infobar = shallow(<Header title="" link="" />);

      expect(infobar.find({ href: 'https://github.com/linode' }).length).to.equal(1);
      expect(infobar.find({ href: 'https://twitter.com/linode' }).length).to.equal(1);
    });

    it('renders the latest blog post', () => {
      const infobar = shallow(<Header title="hello" link="https://example.org" />);

      const link = infobar.find('a').first();
      expect(link.text()).to.equal('hello');
    });
  });
});
