/**
 * Truncates text to max number of characters, but ensures the text ends on a word
 * rather than mid-word. Also, adds a ' ...' to the end of the string
 * @param text The text you want to truncate
 * @param totalNumOfChars The total number of characters you want to allow before truncation
 */
const truncateText = (text: string, totalNumOfChars: number) => {
  // plus 4 to accomodate for the ' ...'
  if (text.length > totalNumOfChars + 4) {
    const beginningText = text.substring(0, totalNumOfChars + 1);
    const charsAfterMax = text.substring(totalNumOfChars + 1);
    const result = [beginningText];
    /*
     * Now we that we have the inital text, we want to ensure that we're ending
     * at the end of a word rather than at the middle, so we want to find
     * the first occurance of whitespace and end the string there
     */
    for (const letter of charsAfterMax) {
      /*
       * A space means we're at the end of the word
       * so break out of this loop
       */
      if (letter.match(/\W/)) {
        break;
      }
      result.push(letter);
    }
    return `${result.join('')} ...`;
  }
  return text;
};

export default truncateText;
