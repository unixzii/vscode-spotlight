export function mergeRanges(newRange: [number, number], ranges: [number, number][]) {
  let inserted = false;

  for (const i in ranges) {
    const range = ranges[i];

    // first, find the insertion point for the new range
    if (newRange[0] < range[0]) {
      ranges.splice(+i, 0, newRange);
      inserted = true;
      break;
    } else if (newRange[0] > range[0] && newRange[0] <= range[1]) {
      /**
       * the new range is completely covered by the existed range, as the below
       * figure shows:
       *
       * [<........>] (existed)
       *     ^...^    (new)
       *
       * We have nothing to do then.
       */
      if (newRange[1] <= range[1]) {
        return;
      }

      /**
       * the new range extends an existed range, as the below figure shows:
       * 
       * [<........>]     (existed)
       *     ^..........^ (new)
       * 
       * We need to modify the end position of the existed range, and then
       * discard the new range.
       */
      range[1] = newRange[1];
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    ranges.push(newRange);
    return;
  }

  // merge the overlapped ranges.
  for (let i = 0; i < ranges.length - 1; ++i) {
    const range = ranges[i];
    const nextRange = ranges[i + 1];

    if (range[1] < nextRange[0]) {
      continue;
    }

    if (range[1] < nextRange[1]) {
      range[1] = nextRange[1];
      ranges.splice(i + 1, 1);
    } else {
      ranges.splice(i + 1, 1);
      --i;
    }
  }
}
