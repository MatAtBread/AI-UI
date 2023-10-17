/* Types for tag creation, implemented by `tag()` in ai-ui.ts */
;
export {};
/* Some random tests/examples
declare var div: TagCreator<HTMLDivElement, never>;

const ee = div.extended({
  constructed() {
    this.foo;
  },
  ids:{
    kid1: div
  },
  prototype: {
    EE: 'EE' as const,
    foo: 0
  }
});
const ff = ee.extended({
  constructed() {
    this.foo = 123;
    this.FF;
    this.EE;
  },
  ids:{
    kid2: ee
  },
  prototype:{
    FF: 'BB' as const,
    f() { return this.FF },
    onclick(e) { this.FF; this.ids.kid2!.foo ; this.EE ; e.currentTarget!.FF },
  }
});

ee().constructor({
  EE: 'EE',
})

ff.super.super()
ff.super.super.super

ff().FF
ff.super().EE
ff.super.super().tagName
ff.super.super.super

const f2 = ff()
f2.onclick = function(e) { this.FF === e.currentTarget.FF }

const I = ff;

I().onclick = function(e) { this.FF === e.currentTarget.FF }
I({
  onabort(e) { this; e.currentTarget.FF }
})
//*/ 
