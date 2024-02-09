import { AssertEqual, ai } from "./basic";
import { Base } from "./decl";

const Over0 = Base.extended({
  declare: {
    obj: {
      n: 0,
      s: '',
      u: undefined as unknown
    }
  }
});

// Can override partially
const Over1 = Over0.extended({
  override: {
    obj: {
      s: 'hello'
    }
  },
  constructed() {
    (<AssertEqual<{
      n: number;
      s: string;
      u: unknown;
    }, typeof this.obj>>{}).true;
  },
});

(<AssertEqual<{
  n: number;
  s: string;
  u: unknown;
}, ReturnType<typeof Over1>['obj']>>{}).true;

// Can't introduce new members via override
const Over2 = Over0.extended({
  override: {
    obj: {
      d: true
    }
  }
});

// @ts-expect-error: cannot override by extension of an object
Over2();

(<AssertEqual<{
  n: number;
  s: string;
  u: unknown;
}, (typeof Over2)['`override` has properties not in the base tag or of the wrong type, and should match']['obj']>>{}).true;

// Can specialise (narrow) a member, eg unknown -> object
const Over3 = Over1.extended({
  override: {
    obj: {
      u: { details: '' }
    }
  }
});

(<AssertEqual<{
  n: number;
  s: string;
  u: { details: string };
}, ReturnType<typeof Over3>['obj']>>{}).true;

Over3({
  obj: { u: { details: 'str' as const } }
}).obj.u.details
