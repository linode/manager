import React from 'react';
import { mount, shallow } from 'enzyme';

import TicketReply, {
  stringToParagraphs,
  getLineBreakCharacter,
} from '~/support/components/TicketReply';
import { testTicket } from '~/data/tickets';

describe('support/components/TicketReply', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <TicketReply createdField="opened" reply={testTicket} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all data correctly', () => {
    const page = mount(<TicketReply createdField="opened" reply={testTicket} />);
    const header = page.find('CardImageHeader');
    const time = header.find('TimeDisplay');

    expect(header.props().title).toBe(testTicket.opened_by);
    expect(time.props().time).toBe(testTicket.opened);

    expect(page.find('.Card-body').text()).toBe(
      stringToParagraphs(testTicket.description));
  });

  it('gets the right line break character', () => {
    expect(getLineBreakCharacter('')).toBe(null);
    expect(getLineBreakCharacter('foo\r\nfoo')).toBe('\r\n');
    expect(getLineBreakCharacter('foo\nfoo')).toBe('\n');
  });

  it('doesn\'t format text without newlines', () => {
    const sentence = 'This sentence has no newlines.';
    expect(stringToParagraphs(sentence)).toBe(sentence);
  });

  it('puts string containing four spaces in a pre tag', () => {
    const sentence = 'This sentence\nhas four    spaces.';
    const formatted = shallow(stringToParagraphs(sentence));
    expect(formatted.find('pre').length).toBe(1);
    expect(formatted.find('pre').text()).toBe(sentence);

    expect(formatted.find('br').length).toBe(0);
  });

  it('puts string containing two new lines into a paragraph', () => {
    const firstSentence = 'This sentence is the first paragraph.';
    const secondSentence = 'This sentence is the second.';
    const paragraphs = `${firstSentence}\n\n${secondSentence}`;
    const formatted = shallow(stringToParagraphs(paragraphs));
    expect(formatted.find('p').length).toBe(2);
    expect(formatted.find('p').at(0).text()).toBe(firstSentence);
    expect(formatted.find('p').at(1).text()).toBe(secondSentence);

    expect(formatted.find('br').length).toBe(0);
    expect(formatted.text().indexOf('\n')).toBe(-1);
  });

  it('puts string containing one new line into a paragraph with line breaks', () => {
    const firstSentence = 'This is the first sentence.';
    const secondSentence = 'This sentence is the second.';
    const paragraphs = `${firstSentence}\n${secondSentence}`;
    const formatted = shallow(stringToParagraphs(paragraphs));
    expect(formatted.find('p').length).toBe(1);
    // <br /> replaces the one new line above
    expect(formatted.find('br').length).toBe(1);
    expect(formatted.find('span').at(1).text()).toBe(firstSentence);
    expect(formatted.find('span').at(2).text()).toBe(secondSentence);

    expect(formatted.text().indexOf('\n')).toBe(-1);
  });
});
