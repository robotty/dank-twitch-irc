import { expect } from 'chai';

import { findAndPushToEnd } from './utils';

describe('findAndPushToEnd', () => {
    it('empty array', () => {
        expect(findAndPushToEnd([], e => e === 1)).to.be.undefined;
    });

    it('no filter match', () => {
        expect(findAndPushToEnd([ 1, 2, 3 ], e => e === 4)).to.be.undefined;
    });

    it('mutated correctly 1', () => {
        let inArr = [ 1, 2, 3 ];
        expect(findAndPushToEnd(inArr, e => e === 1)).to.eql(1);

        expect(inArr).to.eql([ 2, 3, 1 ]);
    });

    it('mutated correctly 2', () => {
        let inArr = [ 1, 2, 3 ];
        expect(findAndPushToEnd(inArr, e => e === 2)).to.eql(2);

        expect(inArr).to.eql([ 1, 3, 2 ]);
    });
});
