import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import moment from 'moment';

import TicketReply, {
  stringToParagraphs,
  getLineBreakCharacter,
} from '~/support/components/TicketReply';
import { testTicket } from '@/data/tickets';

describe('support/components/TicketReply', () => {
  it('renders all data correctly', () => {
    const page = mount(<TicketReply createdField="opened" reply={testTicket} />);

    const header = page.find('CardImageHeader');
    expect(header.props().title).to.equal(testTicket.opened_by);
    expect(header.props().subtitle).to.equal(moment.utc(testTicket.opened).fromNow());

    expect(page.find('.Card-body').text()).to.equal(
      stringToParagraphs(testTicket.description));
  });

  it('gets the right line break character', () => {
    expect(getLineBreakCharacter('')).to.equal(null);
    expect(getLineBreakCharacter('foo\r\nfoo')).to.equal('\r\n');
    expect(getLineBreakCharacter('foo\nfoo')).to.equal('\n');
  });

  it('doesn\'t format text without newlines', () => {
    const sentence = 'This sentence has no newlines.';
    expect(stringToParagraphs(sentence)).to.equal(sentence);
  });

  it('puts string containing four spaces in a pre tag', () => {
    const sentence = 'This sentence\nhas four    spaces.';
    const formatted = shallow(stringToParagraphs(sentence));
    expect(formatted.find('pre').length).to.equal(1);
    expect(formatted.find('pre').text()).to.equal(sentence);

    expect(formatted.find('br').length).to.equal(0);
  });

  it('puts string containing two new lines into a paragraph', () => {
    const firstSentence = 'This sentence is the first paragraph.';
    const secondSentence = 'This sentence is the second.';
    const paragraphs = `${firstSentence}\n\n${secondSentence}`;
    const formatted = shallow(stringToParagraphs(paragraphs));
    expect(formatted.find('p').length).to.equal(2);
    expect(formatted.find('p').at(0).text()).to.equal(firstSentence);
    expect(formatted.find('p').at(1).text()).to.equal(secondSentence);

    expect(formatted.find('br').length).to.equal(0);
    expect(formatted.text().indexOf('\n')).to.equal(-1);
  });

  it('puts string containing one new line into a paragraph with line breaks', () => {
    const firstSentence = 'This is the first sentence.';
    const secondSentence = 'This sentence is the second.';
    const paragraphs = `${firstSentence}\n${secondSentence}`;
    const formatted = shallow(stringToParagraphs(paragraphs));
    expect(formatted.find('p').length).to.equal(1);
    // <br /> replaces the one new line above
    expect(formatted.find('br').length).to.equal(1);
    expect(formatted.find('span').at(1).text()).to.equal(firstSentence);
    expect(formatted.find('span').at(2).text()).to.equal(secondSentence);

    expect(formatted.text().indexOf('\n')).to.equal(-1);
  });
});
