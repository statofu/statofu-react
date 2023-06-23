import type { StatofuOperate } from 'statofu';
import { expectType } from 'tsd';

import { useOperate } from './Operate';

const someStr: string = '';
const someNum: number = 0;

interface A {
  a: string;
}

const $a: A = { a: someStr };

interface B {
  b: string;
}

const $b: B = { b: someStr };

(function _test_useOperate() {
  const operate = useOperate();
  expectType<StatofuOperate>(operate);

  const operateA = useOperate($a);
  expectType<A>(operateA({ a: someStr }));
  expectType<A>(operateA(() => ({ a: someStr })));
  expectType<A>(
    operateA((a) => {
      expectType<A>(a);
      return a;
    })
  );
  expectType<A>(
    operateA(
      (a, p1: string, p2: number) => {
        expectType<A>(a);
        return a;
      },
      someStr,
      someNum
    )
  );
  expectType<A>(
    operateA(
      (a, p1: string, p2: number) => {
        expectType<A>(a);
        return a;
      },
      // @ts-expect-error
      null,
      someNum
    )
  );
  expectType<A>(
    operateA(
      (a, p: number) => {
        expectType<A>(a);
        return a;
      },
      someStr,
      // @ts-expect-error
      null
    )
  );
  expectType<A>(
    operateA(
      (a, p1: string, p2: number) => {
        expectType<A>(a);
        return a;
      },
      someStr,
      someNum,
      // @ts-expect-error
      null
    )
  );

  const operateSetA = useOperate($a, () => ({ a: someStr }));
  expectType<A>(operateSetA());

  const operateReduceA = useOperate($a, (a) => {
    expectType<A>(a);
    return a;
  });
  expectType<A>(operateReduceA());

  const operateReduceAWithPayloads = useOperate($a, (a, p1: string, p2: number) => {
    expectType<A>(a);
    return a;
  });
  expectType<A>(operateReduceAWithPayloads(someStr, someNum));
  expectType<A>(
    operateReduceAWithPayloads(
      // @ts-expect-error
      null,
      someNum
    )
  );
  expectType<A>(
    operateReduceAWithPayloads(
      someStr,
      // @ts-expect-error
      null
    )
  );
  expectType<A>(
    operateReduceAWithPayloads(
      someStr,
      someNum,
      // @ts-expect-error
      null
    )
  );

  const operateAandB = useOperate([$a, $b]);
  expectType<[A, B]>(operateAandB([{ a: someStr }, { b: someStr }]));
  expectType<[A, B]>(operateAandB(() => [{ a: someStr }, { b: someStr }]));
  expectType<[A, B]>(
    operateAandB(
      ([a, b], p1: string, p2: number) => {
        expectType<A>(a);
        expectType<B>(b);
        return [a, b];
      },
      someStr,
      someNum
    )
  );
  expectType<[A, B]>(
    operateAandB(
      ([a, b], p1: string, p2: number) => {
        expectType<A>(a);
        expectType<B>(b);
        return [a, b];
      },
      // @ts-expect-error
      null,
      someNum
    )
  );
  expectType<[A, B]>(
    operateAandB(
      ([a, b], p1: string, p2: number) => {
        expectType<A>(a);
        expectType<B>(b);
        return [a, b];
      },
      someStr,
      // @ts-expect-error
      null
    )
  );
  expectType<[A, B]>(
    operateAandB(
      ([a, b], p1: string, p2: number) => {
        expectType<A>(a);
        expectType<B>(b);
        return [a, b];
      },
      someStr,
      someNum,
      // @ts-expect-error
      null
    )
  );

  const operateSetAandB = useOperate([$a, $b], () => [{ a: someStr }, { b: someStr }]);
  expectType<[A, B]>(operateSetAandB());

  const operateReduceAandB = useOperate([$a, $b], ([a, b]) => {
    expectType<A>(a);
    expectType<B>(b);
    return [a, b];
  });
  expectType<[A, B]>(operateReduceAandB());

  const operateReduceAandBWithPayloads = useOperate([$a, $b], ([a, b], p1: string, p2: number) => {
    expectType<A>(a);
    expectType<B>(b);
    return [a, b];
  });
  expectType<[A, B]>(operateReduceAandBWithPayloads(someStr, someNum));
  expectType<[A, B]>(
    operateReduceAandBWithPayloads(
      // @ts-expect-error
      null,
      someNum
    )
  );
  expectType<[A, B]>(
    operateReduceAandBWithPayloads(
      someStr,
      // @ts-expect-error
      null
    )
  );
  expectType<[A, B]>(
    operateReduceAandBWithPayloads(
      someStr,
      someNum,
      // @ts-expect-error
      null
    )
  );
})();
