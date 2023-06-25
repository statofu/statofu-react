import { renderHook } from '@testing-library/react';

import { shouldStablize, useStablized } from './utils';

describe('shouldStablize', () => {
  test('returns false if a and b are referentially identical', () => {
    const a = {};
    const b = a;
    expect(shouldStablize(a, b)).toBeFalse();
  });

  test('returns true if a and be are referentially different and one of them is not an array', () => {
    const a = [{ x: 'x' }, { y: 'y' }];
    const b = {};
    expect(shouldStablize(a, b)).toBeTrue();
  });

  test(
    'returns false if a and b are referentially different arrays but ' +
      'their elements are referentially identical at each index',
    () => {
      const a = [{ x: 'x' }, { y: 'y' }];
      const b = [...a];
      expect(shouldStablize(a, b)).toBeFalse();
    }
  );

  test(
    'returns true if a and be are referentially different arrays and ' +
      'their elements are referentially different at some index',
    () => {
      const a = [{ x: 'x' }, { y: 'y' }];
      const b = [a[0], { y: 'y' }];
      expect(shouldStablize(a, b)).toBeTrue();
    }
  );
});

describe('useStablized', () => {
  test(
    'returns the old array on rerenders if the given array goes referentially different but ' +
      'its elements remain referentially identical at each index',
    () => {
      const input1 = [{ x: 'x' }, { y: 'y' }];
      const { result, rerender } = renderHook(({ value }) => useStablized(value), {
        initialProps: { value: input1 },
      });
      expect(result.current).toBe(input1);

      const input2 = [...input1];
      rerender({ value: input2 });

      expect(result.current).toBe(input1);
    }
  );

  test(
    'returns the new array on rerenders ' +
      'if the elements of the given array go referentially different at some index',
    () => {
      const input1 = [{ x: 'x' }, { y: 'y' }];
      const { result, rerender } = renderHook(({ value }) => useStablized(value), {
        initialProps: { value: input1 },
      });
      expect(result.current).toBe(input1);

      const input2 = [input1[0], { y: 'y' }];
      rerender({ value: input2 });
      expect(result.current).toBe(input2);
    }
  );
});
