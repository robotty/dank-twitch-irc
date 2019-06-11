import { expect } from 'chai';
import 'mocha';

import { findAndPushToEnd, removeInPlace, splitIntoChunks } from './utils';

describe('findAndPushToEnd', () => {
    it('empty array', () => {
        expect(findAndPushToEnd([], e => e === 1)).to.be.undefined;
    });

    it('no filter match', () => {
        expect(findAndPushToEnd([1, 2, 3], e => e === 4)).to.be.undefined;
    });

    it('mutated correctly 1', () => {
        let inArr = [1, 2, 3];
        expect(findAndPushToEnd(inArr, e => e === 1)).to.eql(1);

        expect(inArr).to.eql([2, 3, 1]);
    });

    it('mutated correctly 2', () => {
        let inArr = [1, 2, 3];
        expect(findAndPushToEnd(inArr, e => e === 2)).to.eql(2);

        expect(inArr).to.eql([1, 3, 2]);
    });
});

describe('removeInPlace', () => {
    it('empty array', () => {
        let arr = [];
        removeInPlace(arr, 1);
        expect(arr).to.eql([]);
    });

    it('correct on one', () => {
        let arr = [1, 2, 3];
        removeInPlace(arr, 2);
        expect(arr).to.eql([1, 3]);
    });

    it('correct on multiple', () => {
        let arr = [1, 2, 3, 2];
        removeInPlace(arr, 2);
        expect(arr).to.eql([1, 3]);
    });

    it('at the start', () => {
        let arr = [1, 2, 3];
        removeInPlace(arr, 1);
        expect(arr).to.eql([2, 3]);
    });

    it('at the end', () => {
        let arr = [1, 2, 3];
        removeInPlace(arr, 2);
        expect(arr).to.eql([1, 3]);
    });
});

describe('splitIntoChunks', () => {
    it('should return an empty array when an empty array is passed', () => {
        expect(splitIntoChunks([])).to.eql([]);
    });

    it('should return a single-element array as is', () => {
        expect(splitIntoChunks(['test'])).to.eql([['test']]);
    });

    it('should return a two-element array that does not need to be split as is', () => {
        expect(splitIntoChunks(['test', 'abc'])).to.eql([['test', 'abc']]);
    });

    it('should handle custom-length separators correctly', () => {
        // test123KKona
        expect(splitIntoChunks(['test', 'KKona', 'abc'], '123', 13)).to.eql([['test', 'KKona'], ['abc']]);
    });

    // for when the resulting chunk of bits is of the exact same length that was requested
    it('should handle exact-requested-length output chunks', () => {
        let s = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ' +
            'sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. ' +
            'At vero eos et accusam et justo duo dolores';

        expect(splitIntoChunks(s.split(' '), ' ', 72)).to.eql(
            [
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy'.split(' '),
                'eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam'.split(' '),
                'voluptua. At vero eos et accusam et justo duo dolores'.split(' ')
            ]);
    });

    it('should throw an error when the split is impossible', () => {
        expect(() => splitIntoChunks(['superlongmessage', 'NaM'], ' ', 15))
            .to.throw(Error, 'Found a piece that can never fit the target length limit');
    });
});
