import { AssertEqual } from "./basic";
import { Base } from "./decl";

const Over1 = Base.extended({
  override: {
    N: 0 as 0 | 1 // Works as it's narrower
  },
  constructed() {
    (<AssertEqual<typeof this.N, 0 | 1>>{}).true;
  },
});
Over1();

const Over2 = Over1.extended({
  override: {
    N: 2 as const // Fails as Over1.N is 0|1
  },
  constructed() {
    (<AssertEqual<typeof this.N, never>>{}).true;
    (<AssertEqual<typeof this.N, 2>>{}).false;
    (<AssertEqual<typeof this.N, 0 | 1>>{}).false;
  },
});
// @ts-expect-error: Fails as N has been narrowed to 0|1
Over2();
Over2['`override` has properties not in the base tag or of the wrong type, and should match'].N


const Over3 = Base.extended({
  override: {
    N: 0 as const // Works as it's narrower, prevents further overrides
  },
  constructed() {
    (<AssertEqual<typeof this.N, 0>>{}).true;
  },
});
const o3 = Over3();
(<AssertEqual<typeof o3.N, 0>>{}).true;

const Over4 = Over3.extended({
  override: {
    N: 1 as const // Works as it's narrower, prevents further overrides
  },
  constructed() {
    (<AssertEqual<typeof this.N, never>>{}).true;
  },
});
Over4['`override` has properties not in the base tag or of the wrong type, and should match'].N
