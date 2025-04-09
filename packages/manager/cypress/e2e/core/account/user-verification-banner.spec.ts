import { profileFactory, securityQuestionsFactory } from '@linode/utilities';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import { verificationBannerNotice } from 'support/constants/user';
import {
  mockGetUser,
  mockGetUserGrants,
  mockGetUsers,
} from 'support/intercepts/account';
import { mockGetSecurityQuestions } from 'support/intercepts/profile';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

describe('User verification banner', () => {
  /*
   * - Confirms that a banner is present when child users do not have a phone number or security questions.
   * - Confirms that the "Add Verification Details" button redirects the user to /profile/auth.
   */
  it('can show up when a child user has not associated a phone number or set up security questions for their account', () => {
    const mockChildProfile = profileFactory.build({
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: null,
    });

    const mockChildUser = accountUserFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: null,
    });

    const mockRestrictedProxyUser = accountUserFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
      verified_phone_number: null,
    });

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    mockGetUsers([mockRestrictedProxyUser]);
    mockGetUser(mockChildUser);
    mockGetUserGrants(mockChildUser.username, mockUserGrants);
    mockGetProfile(mockChildProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');

    // A banner is displayed and prompts users to set up phone numbers or security questions.
    cy.findByText(verificationBannerNotice).should('be.visible');

    // The banner should be present across all other pages
    cy.visitWithLogin('/account/billings');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/login-history');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/service-transfers');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/maintenance');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/settings');
    cy.findByText(verificationBannerNotice).should('be.visible');

    // "Add verification details" button should redirect to url '/profile/auth'
    ui.button
      .findByTitle('Add verification details')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.url().should('endWith', `/profile/auth`);
  });

  /*
   * - Confirms that a banner is present when child users set up security questions but not a phone number.
   * - Confirms that the "Add Verification Details" button redirects the user to /profile/auth.
   */
  it('can show up when a child user has set up security questions but not a phone number for their account', () => {
    const mockChildProfile = profileFactory.build({
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: null,
    });

    const mockChildUser = accountUserFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: null,
    });

    const mockRestrictedProxyUser = accountUserFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
      verified_phone_number: null,
    });

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    const mockSecurityQuestions = securityQuestionsFactory.build();
    const mockSecurityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
    mockSecurityQuestions.security_questions[0].response =
      mockSecurityQuestionAnswers[0];
    mockSecurityQuestions.security_questions[1].response =
      mockSecurityQuestionAnswers[1];
    mockSecurityQuestions.security_questions[2].response =
      mockSecurityQuestionAnswers[2];

    mockGetUsers([mockRestrictedProxyUser]).as('getUsers');
    mockGetUser(mockChildUser);
    mockGetUserGrants(mockChildUser.username, mockUserGrants);
    mockGetProfile(mockChildProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);
    mockGetSecurityQuestions(mockSecurityQuestions).as('getSecurityQuestions');

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait(['@getUsers', '@getSecurityQuestions']);

    // A banner is displayed and prompts users to set up phone numbers or security questions.
    cy.findByText(verificationBannerNotice).should('be.visible');

    // The banner should be present across all other pages
    cy.visitWithLogin('/account/billings');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/login-history');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/service-transfers');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/maintenance');
    cy.findByText(verificationBannerNotice).should('be.visible');

    cy.visitWithLogin('/account/settings');
    cy.findByText(verificationBannerNotice).should('be.visible');

    // "Add verification details" button should redirect to url '/profile/auth'
    ui.button
      .findByTitle('Add verification details')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.url().should('endWith', `/profile/auth`);
  });

  /*
   * - Confirms that a banner is not shown when the child user sets up both phone number and security questions.
   */
  it('does not show up when a child user adds a phone number and sets up security questions', () => {
    const mockChildProfile = profileFactory.build({
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: '+15555555555',
    });

    const mockChildUser = accountUserFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'child-user',
      verified_phone_number: '+15555555555',
    });

    const mockRestrictedProxyUser = accountUserFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
      verified_phone_number: '+15555555555',
    });

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    const mockSecurityQuestions = securityQuestionsFactory.build();
    const mockSecurityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
    mockSecurityQuestions.security_questions[0].response =
      mockSecurityQuestionAnswers[0];
    mockSecurityQuestions.security_questions[1].response =
      mockSecurityQuestionAnswers[1];
    mockSecurityQuestions.security_questions[2].response =
      mockSecurityQuestionAnswers[2];

    mockGetUsers([mockRestrictedProxyUser]).as('getUsers');
    mockGetUser(mockChildUser);
    mockGetUserGrants(mockChildUser.username, mockUserGrants);
    mockGetProfile(mockChildProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);
    mockGetSecurityQuestions(mockSecurityQuestions).as('getSecurityQuestions');

    // Navigate to Users & Grants page and confirm "Partner user settings" and "User settings" sections are visible.
    cy.visitWithLogin('/account/users');
    cy.wait(['@getUsers', '@getSecurityQuestions']);

    // The banner should not show up.
    cy.findByText(verificationBannerNotice).should('not.exist');
    cy.get('[data-testid="confirmButton"]').should('not.exist');
  });
});
