export const securityQuestions = [
  'What were the last four digits of your childhood phone number?',
  "What are the last five digits of your driver's license number?",
  'What time of the day were you born?(hh:mm)',
  'What primary school did you attend?',
  'In what town did your parents meet?',
] as const;

export type SecurityQuestion = typeof securityQuestions[number];

export type QuestionIndex = 1 | 2 | 3;

export type QuestionStatus = 'edit' | 'display';

export interface Editable {
  status: QuestionStatus;
  onClickEdit: () => void;
}

export interface Answerable {
  currentQuestion?: SecurityQuestion | '';
  answer?: string;
}

export interface Question extends Answerable, Editable {
  questionIndex: QuestionIndex;
}

export type AnsweredQuestion = Required<Answerable>;
