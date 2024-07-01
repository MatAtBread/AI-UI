import { AssertEqual } from "./basic";
import { Base } from "./decl";

const Over0 = Base.extended({
  declare:{
    arr: [] as { n: number, s?: string }[],
    fm(a: number): string | number { return "x"}
  },
  constructed() {
    (<AssertEqual<typeof this.fn, () => void>>{}).true;
  }
});

const Over1 = Over0.extended({
  override: {
    // Works, as narrowed to accept an optional parameter
    fn(a?:number){
      Over0.fn.call(this);
      Over1.super.fn.call(this);
      return "X"
    },
    fm(a:number | string, b?: boolean){ return 'y'}
  },
  constructed() {
    this.fm;
    this.fn;
    (<AssertEqual<typeof this.fn, (a?:number) => "X">>{}).true;
  },
});
Over1().fn();
Over1().fn(1);

const Over2 = Over1.extended({
  override: {
    // Fails: Not sufficiently co/contravariant
    fm(){
      Over1.fm.call(this,10);
      // @ts-expect-error: Requires paraneter
      Over1.fm.call(this);
    }
  }
});
// @ts-expect-error: Fails as N has been narrowed to 0|1
Over2();
Over2['`override` has properties not in the base tag or of the wrong type, and should match'].fm


const Over3 = Over0.extended({
  override: {
    N: 0 as const // Works as it's narrower, prevents further overrides
  },
  constructed() {
    (<AssertEqual<typeof this.N, 0>>{}).true;
  },
});
(<AssertEqual<ReturnType<typeof Over3>['N'], 0>>{}).true;

const Over4 = Over3.extended({
  override: {
    N: 1 as const // Works as it's narrower, prevents further overrides
  },
  constructed() {
    // @ts-expect-error
    (<AssertEqual<typeof this.N, never>>{}).true;
  },
});
Over4['`override` has properties not in the base tag or of the wrong type, and should match'].N



