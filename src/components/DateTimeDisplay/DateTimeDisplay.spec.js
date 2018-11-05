const { navigateToStory } = require('../../../e2e/utils/storybook');
const { constants } = require('../../../e2e/constants');

describe('Date Time Display Suite', () => {
    const component = 'DateTimeDisplay';
    const childStory = 'Example';
    const elvisBirthday = '[data-qa-elvis-birthday]';
    const whenIWasYoung = '[data-qa-when-i-was-young]';
    const threeWednesdaysAgo = '[data-qa-3-wednesdays-ago]';
    const lastThursday = '[data-qa-last-thursday]';
    const radioAttribute = 'data-qa-radio';
    const radioButtons = `[${radioAttribute}] input`;

    const getDisplayDate = (displayText) => {
        const text = displayText.getText();
        const textArray = text.split(':');
        const date = !!textArray[2] ? textArray[1].trim()+':'+textArray[2]+':'+textArray[3] : textArray[1].trim();
        return date;
    }

    const getRadioButton = (humanizeCutoffProp) => {
        const radioButton = $$(radioButtons).find( radioButton =>
            radioButton.getAttribute('value') === humanizeCutoffProp
        );
        return radioButton.$('..').$('..');
    }

    const validateDatesDisplayed = (formatedDatesArray) => {
        const displayedDateFormat = formatedDatesArray.map( formatedDate =>
            getDisplayDate($(formatedDate))
        );
        displayedDateFormat.forEach( date =>
            expect(date).toMatch(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/)
        );
    }

    beforeAll(() => {
        navigateToStory(component, childStory, () => {
            browser.waitForVisible(rabioButtons, constants.wait.normal);
        });
    });

    it('there should be four humanize cuttoff options, day, week, month, year and never', () => {
        const expectedOptions = ['day', 'week', 'month', 'year', 'never'];
        const displayedOptions = $$(radioButtons).map( humanizedCuttoffOpts =>
            humanizedCuttoffOpts.getAttribute('value')
        );
        expect(displayedOptions).toEqual(expectedOptions);
    });

    it('the day option should be selected as the humanize cutoff prop by default', () => {
        expect(getRadioButton('day').getAttribute(radioAttribute)).toBe('true');
    });

    it('the default display date should display the expected value', () => {
        const defaultDisplay = '[data-qa-default-display]';
        const dateDisplay = getDisplayDate($(defaultDisplay));
        expect(dateDisplay).toEqual('2018-07-20 00:23:17');
    });

    it('each humanize cuttoff radio button is interactable', () => {
        const expectedOptions = ['week', 'month', 'year', 'never', 'day'];
        expectedOptions.forEach( (humanizedCuttoffOpt) => {
            getRadioButton(humanizedCuttoffOpt).click();
            expect(getRadioButton(humanizedCuttoffOpt).getAttribute(radioAttribute)).toBe('true');
        });
    });

    it('when day is selected last thurday and below should be yyyy-MM-dd hh:mm:ss format', () => {
        getRadioButton('day').click();
        const formatedDates = [lastThursday, threeWednesdaysAgo, whenIWasYoung, elvisBirthday];
        validateDatesDisplayed(formatedDates);
    });

    it('when week is selected 3 wednesdays and below should be yyyy-MM-dd hh:mm:ss format, last thurdsay is not', () => {
        getRadioButton('week').click();
        const formatedDates = [threeWednesdaysAgo, whenIWasYoung, elvisBirthday];
        validateDatesDisplayed(formatedDates);
        expect(getDisplayDate($(lastThursday))).toEqual('5 days ago');
    });

    it('when month is selected you were so young and below should be yyyy-MM-dd hh:mm:ss format, last thurdsay and 3 wednesdays ago are not', () => {
        getRadioButton('month').click();
        const formatedDates = [whenIWasYoung, elvisBirthday];
        validateDatesDisplayed(formatedDates);
        expect(getDisplayDate($(lastThursday))).toEqual('5 days ago');
        expect(getDisplayDate($(threeWednesdaysAgo))).toEqual('a month ago');
    });

    it('when year is selected only Elvis was born should be yyyy-MM-dd hh:mm:ss format, last thurdsay up to Elvis was born are not', () => {
        getRadioButton('year').click();
        const formatedDates = [elvisBirthday];
        validateDatesDisplayed(formatedDates);
        expect(getDisplayDate($(lastThursday))).toEqual('5 days ago');
        expect(getDisplayDate($(threeWednesdaysAgo))).toEqual('a month ago');
        expect(getDisplayDate($(whenIWasYoung))).toEqual('a year ago');
    });

    it('when never is selected none of the dynamic dates should display in yyyy-MM-dd hh:mm:ss format', () => {
        getRadioButton('never').click();
        expect(getDisplayDate($(lastThursday))).toEqual('5 days ago');
        expect(getDisplayDate($(threeWednesdaysAgo))).toEqual('a month ago');
        expect(getDisplayDate($(whenIWasYoung))).toEqual('a year ago');
        expect(getDisplayDate($(elvisBirthday))).toEqual('84 years ago');
    });

});
