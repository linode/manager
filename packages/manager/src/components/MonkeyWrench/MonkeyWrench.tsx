/**
 * The purpose of the MonkeyWrench is to easily blow up your component for testing purposes.
 * Throw a couple of wrenches in there and see what happens.
 */

interface Props {
  text?: string;
}

const MonekyWrench = ({ text }: Props) => {
  throw Error(text ?? 'Oh no! Someone threw a monkey wrench in the works!');
};

export default MonekyWrench;
