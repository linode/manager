/**
 * @file Integration tests for account security questions.
 */

import { profileFactory, securityQuestionsFactory } from '@linode/utilities';
import {
  mockGetProfile,
  mockGetSecurityQuestions,
  mockUpdateSecurityQuestions,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';

/**
 * Finds the "Security Questions" section on the profile auth page.
 *
 * @returns Cypress chainable.
 */
const getSecurityQuestionsSection = (): Cypress.Chainable => {
  return cy.contains('h3', 'Security Questions').parent();
};

/**
 * Finds the element containing the given security question's question field.
 *
 * @param questionNumber - Security question number (1-3) for which to retrieve question element.
 *
 * @returns Cypress chainable.
 */
const getSecurityQuestion = (questionNumber: number): Cypress.Chainable => {
  return cy.contains('label', `Question ${questionNumber}`).parent().parent();
};

/**
 * Finds the element containing the given security question's answer field.
 *
 * @param questionNumber - Security question number (1-3) for which to retrieve answer element.
 *
 * @returns Cypress chainable.
 */
const getSecurityQuestionAnswer = (
  questionNumber: number
): Cypress.Chainable => {
  return cy.contains('label', `Answer ${questionNumber}`).parent().parent();
};

/**
 * Clicks the "Edit" button next to a security question.
 *
 * @param questionNumber - Security question number (1-3) to edit.
 */
const editQuestion = (questionNumber: number) => {
  getSecurityQuestion(questionNumber).within(() => {
    ui.button
      .findByTitle('Edit')
      .as('editbtn')
      .should('be.visible')
      .should('be.enabled');

    cy.get('@editbtn').click({ scrollBehavior: 'center' });
  });
};

/**
 * Asserts that a security question answer matches the given value.
 *
 * This assumes that the security question is already in its 'Edit' state.
 *
 * @param questionNumber - Security question number (1-3) with value to assert.
 * @param answer - Security question answer value to assert.
 */
const assertSecurityQuestionAnswer = (
  questionNumber: number,
  answer: string
) => {
  getSecurityQuestionAnswer(questionNumber).within(() => {
    cy.get('[data-testid="textfield-input"]').should('have.value', answer);
  });
};

/**
 * Sets the question and answer for the given security question.
 *
 * This assumes that the security question is already in its 'Edit' state.
 *
 * @param questionNumber - Security question number (1-3) to set.
 * @param question - String containing contents of question to set.
 * @param answer - Answer to assign for question.
 */
const setSecurityQuestionAnswer = (
  questionNumber: number,
  question: string,
  answer: string
) => {
  getSecurityQuestion(questionNumber).within(() => {
    cy.findByLabelText(`Question ${questionNumber}`)
      .should('be.visible')
      .click();
    cy.focused().type(`${question}{enter}`);
  });

  getSecurityQuestionAnswer(questionNumber).within(() => {
    cy.findByLabelText(`Answer ${questionNumber}`)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.focused().type(answer);
  });
};

describe('Account security questions', () => {
  /*
   * - Validates first-time security question answer flow using mocked data.
   * - Confirms that user cannot enable TFA before answering security questions.
   * - Confirms that user cannot submit answers before answering all 3 questions.
   * - Confirms UI flow when user submits security questions and answers.
   */
  it('can set account security questions for the first time', () => {
    const securityQuestions = securityQuestionsFactory.build();
    const securityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];

    const mockProfile = profileFactory.build({
      two_factor_auth: false,
    });

    const securityQuestionsPayload = {
      security_questions: [
        { question_id: 1, response: securityQuestionAnswers[0] },
        { question_id: 2, response: securityQuestionAnswers[1] },
        { question_id: 3, response: securityQuestionAnswers[2] },
      ],
    };

    const tfaSecurityQuestionsWarning =
      'To use two-factor authentication you must set up your security questions listed below.';

    mockGetProfile(mockProfile);
    mockGetSecurityQuestions(securityQuestions).as('getSecurityQuestions');
    mockUpdateSecurityQuestions(securityQuestionsPayload).as(
      'setSecurityQuestions'
    );

    cy.visitWithLogin('/profile/auth');
    cy.wait('@getSecurityQuestions');

    // Confirm that user is informed that they must answer security questions to enable TFA.
    cy.findByText(tfaSecurityQuestionsWarning).should('be.visible');

    // Confirm that "Add Security Questions" button is initially disabled.
    ui.button
      .findByTitle('Add Security Questions')
      .should('be.visible')
      .should('be.disabled');

    setSecurityQuestionAnswer(
      1,
      securityQuestions.security_questions[0].question,
      securityQuestionAnswers[0]
    );

    // Confirm that submission button is now enabled, but clicking it shows an error.
    ui.button
      .findByTitle('Add Security Questions')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.toast.assertMessage('You must answer all 3 security questions.');

    setSecurityQuestionAnswer(
      2,
      securityQuestions.security_questions[1].question,
      securityQuestionAnswers[1]
    );

    setSecurityQuestionAnswer(
      3,
      securityQuestions.security_questions[2].question,
      securityQuestionAnswers[2]
    );

    ui.button
      .findByTitle('Add Security Questions')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@setSecurityQuestions');
    ui.toast.assertMessage('Successfully added your security questions');

    // Confirm that TFA security questions warning goes away after answering security questions.
    cy.contains(tfaSecurityQuestionsWarning).should('not.exist');

    // Confirm that security questions submit button changes to "Update Security Questions".
    ui.button
      .findByTitle('Update Security Questions')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that chosen security questions are displayed.
    getSecurityQuestionsSection().within(() => {
      securityQuestions.security_questions
        .map((securityQuestion) => securityQuestion.question)
        .slice(0, 3)
        .forEach((securityQuestion: string) => {
          cy.findByText(securityQuestion).should('be.visible');
        });
    });
  });

  /**
   * - Validates security questinos update flow using mocked data.
   * - Confirms UI flow when user updates their security questions and answers.
   * - Confirms UI flow when user cancels while updating their security questions and answers.
   */
  it('can update account security questions', () => {
    const securityQuestions = securityQuestionsFactory.build();

    // Pre-set answers for security questions.
    const securityQuestionAnswers = [
      'Original Answer 1',
      'Original Answer 2',
      'Original Answer 3',
    ];

    securityQuestions.security_questions[0].response =
      securityQuestionAnswers[0];
    securityQuestions.security_questions[1].response =
      securityQuestionAnswers[1];
    securityQuestions.security_questions[2].response =
      securityQuestionAnswers[2];

    // Newly-chosen questions for security questions.
    const newSecurityQuestions = [
      securityQuestions.security_questions[3].question,
      securityQuestions.security_questions[4].question,
      securityQuestions.security_questions[5].question,
    ];

    // New answers for newly-chosen security questions.
    const newSecurityQuestionAnswers = [
      'New Answer 1',
      'New Answer 2',
      'New Answer 3',
    ];

    // Payload containing updated security question data.
    const securityQuestionsPayload = {
      security_questions: [
        { question_id: 4, response: newSecurityQuestionAnswers[0] },
        { question_id: 5, response: newSecurityQuestionAnswers[1] },
        { question_id: 6, response: newSecurityQuestionAnswers[2] },
      ],
    };

    mockGetSecurityQuestions(securityQuestions).as('getSecurityQuestions');
    mockUpdateSecurityQuestions(securityQuestionsPayload).as(
      'setSecurityQuestions'
    );

    cy.visitWithLogin('/profile/auth');
    cy.wait('@getSecurityQuestions');

    ui.button
      .findByTitle('Update Security Questions')
      .should('be.visible')
      .should('be.disabled');

    // Begin editing question 1, but cancel before saving changes.
    editQuestion(1);
    assertSecurityQuestionAnswer(1, securityQuestionAnswers[0]);
    setSecurityQuestionAnswer(
      1,
      newSecurityQuestions[0],
      newSecurityQuestionAnswers[0]
    );

    ui.button
      .findByTitle('Cancel')
      .should('be.visible')
      .should('be.enabled')
      .click();

    editQuestion(1);
    assertSecurityQuestionAnswer(1, securityQuestionAnswers[0]);
    setSecurityQuestionAnswer(
      1,
      newSecurityQuestions[0],
      newSecurityQuestionAnswers[0]
    );

    editQuestion(2);
    assertSecurityQuestionAnswer(2, securityQuestionAnswers[1]);
    setSecurityQuestionAnswer(
      2,
      newSecurityQuestions[1],
      newSecurityQuestionAnswers[1]
    );

    editQuestion(3);
    assertSecurityQuestionAnswer(3, securityQuestionAnswers[2]);
    setSecurityQuestionAnswer(
      3,
      newSecurityQuestions[2],
      newSecurityQuestionAnswers[2]
    );

    ui.button
      .findByTitle('Update Security Questions')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@setSecurityQuestions');

    ui.toast.assertMessage('Successfully updated your security questions');

    // Confirm that 'Update Security Questions' button is disabled again.
    ui.button
      .findByTitle('Update Security Questions')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that new security questions are displayed.
    getSecurityQuestionsSection().within(() => {
      newSecurityQuestions.forEach((securityQuestion: string) => {
        cy.findByText(securityQuestion).should('be.visible');
      });
    });
  });
});
