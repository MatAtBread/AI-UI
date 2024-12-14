import { tag } from '../module/src/ai-ui';
import { AssertEqual } from "./basic";

const { div } = tag(['div']);

const Base = div.extended({
  declare:{
    field: undefined as unknown
  },
  constructed() {
    this.field = 1;
    this.field = 'a';
  }
});

const Num = Base.extended({
  override: {
    field: undefined as unknown as number
  },
  constructed() {
    this.field = 1;
    // @ts-expect-error
    this.field = 'a';
  }
});

const Str = Base.extended({
  override: {
    field: undefined as unknown as string
  },
  constructed() {
    // @ts-expect-error
    this.field = 1;
    this.field = 'a';
  }
});

type OK = AssertEqual<ReturnType<typeof Base>['field'],unknown>['true']
  & AssertEqual<ReturnType<typeof Num>['field'],number>['true']
  & AssertEqual<ReturnType<typeof Str>['field'],string>['true']
