import * as React from 'react';
import { Link } from 'react-router-dom';

export interface LinkType {
  link: string;
  text_to_replace: string;
  type: 'internal' | 'external';
}

export const generateHTMLFromString = (
  text: string,
  links: Record<string, LinkType>
) => {
  return Object.keys(links).reduce((acc, eachKey) => {
    const { text_to_replace, type, link } = links[eachKey];

    if (acc.length > 0) {
      // nth iteration after the first
      return acc.map(eachValue => {
        if (typeof eachValue === 'string') {
          return wrapStringInLink(eachValue, text_to_replace, type, link);
        } else {
          /** is a react component so no need to wrap anything in a link */
          return eachValue;
        }
      });
    } else {
      return wrapStringInLink(text, text_to_replace, type, link);
    }
  }, []);
};

export const wrapStringInLink = (
  fullString: string,
  textToReplace: string,
  type: 'internal' | 'external',
  link: string
) => {
  /**
   * split the sentence up by phrases, including the matched text in the array
   *
   * For example:
   *
   * While "I am" being the text to match, "hello world I am Marty"
   *
   * becomes
   *
   * ["hello world", "I am", "Marty"]
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#Splitting_with_a_RegExp_to_include_parts_of_the_separator_in_the_result
   * for information about splitting but keeping the matched value in the array
   *
   */
  const sentenceAsArray = fullString.split(
    new RegExp(`(${textToReplace})`, 'gmi')
  );

  /**
   * iterate over the array and if we have a matched word, wrap
   * in an anchor tag or react-router link depending on the link type
   */
  const arrayWithLink = sentenceAsArray.map(eachWord => {
    if (eachWord.match(new RegExp(textToReplace, 'gmi'))) {
      return type === 'external' ? (
        <a
          key={eachWord}
          href={link}
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
        >
          {eachWord}
        </a>
      ) : (
        <Link key={eachWord} to={link}>
          {eachWord}
        </Link>
      );
    }
    return eachWord;
  });

  /**
   * so now we have an array that looks like
   * [
   *  "hello world",
   *  "<a>I am</a>"
   *  "Marty"
   * ]
   */
  return arrayWithLink;
};
