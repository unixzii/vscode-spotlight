import { expect } from 'chai';
import 'mocha';

import { mergeRanges } from '../src/utils/mergeRanges';

describe('mergeRanges test', () => {
  it('should handle the case that the existed range list is empty', () => {
    const rangeList: [number, number][] = [];
    mergeRanges([0, 1], rangeList);
    expect(rangeList).to.deep.equal([[0, 1]]);
  });

  it('should handle the case that the existed range has one range (without overlap)', () => {
    let rangeList: [number, number][] = [[200, 300]];
    mergeRanges([100, 150], rangeList);
    expect(rangeList).to.deep.equal([[100, 150], [200, 300]]);

    rangeList = [[200, 300]];
    mergeRanges([310, 400], rangeList);
    expect(rangeList).to.deep.equal([[200, 300], [310, 400]]);
  });

  it('should handle the case that the existed range has one range (with overlap)', () => {
    let rangeList: [number, number][] = [[200, 300]];
    mergeRanges([300, 400], rangeList);
    expect(rangeList).to.deep.equal([[200, 400]]);

    rangeList = [[200, 300]];
    mergeRanges([100, 200], rangeList);
    expect(rangeList).to.deep.equal([[100, 300]]);

    rangeList = [[200, 300]];
    mergeRanges([100, 250], rangeList);
    expect(rangeList).to.deep.equal([[100, 300]]);
  });

  it('should handle the case that the existed range has many ranges', () => {
    let rangeList: [number, number][] = [[200, 300], [400, 500]];
    mergeRanges([250, 450], rangeList);
    expect(rangeList).to.deep.equal([[200, 500]]);

    rangeList = [[200, 300], [400, 500]];
    mergeRanges([100, 350], rangeList);
    expect(rangeList).to.deep.equal([[100, 350], [400, 500]]);
  });
});
