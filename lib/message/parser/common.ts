import { ParseError } from './parse-error';

export function parseIntThrowing(str: string | undefined): number {
    if (str == null) {
        throw new ParseError('String source for integer is null/undefined');
    }

    let number = parseInt(str);
    if (isNaN(number)) {
        throw new ParseError('Invalid number', str);
    }

    return number;
}
