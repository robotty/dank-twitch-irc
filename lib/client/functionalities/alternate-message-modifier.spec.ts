import { expect } from 'chai';
import 'mocha';
import { invisibleSuffix } from './alternate-message-modifier';

describe('AlternateMessageModifier', () => {
    it('escape for invisible character correct', () => {
        // 1 (space) + 2 (invisible character)
        expect(invisibleSuffix.length).to.equal(3);
    });
});
