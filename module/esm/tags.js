/* Types for tag creation, implemented by `tag()` in ai-ui.ts */
(function () { }).bind({});
;
export {};
/* Some random tests/examples * /
declare var div: TagCreator<HTMLDivElement, never>;

const e = div.extended({
  constructed() {
    this.foo;
    this.bar()
  },
  prototype: {
    EE: 'EE' as const,
    foo: 0,
    onabort(e) { this.EE; this.ids.kid1 ; this.EE },
    bar() { return this.EE }
  },
  ids:{
    kid1: div
  }
});
const ee = div.extended({
  prototype: {
    EE: 'EE' as const,
    foo: 0,
    onabort(e) { this.EE; this.ids.kid1 ; this.EE },
    bar() { return this.EE }
  },
  constructed() {
    this.foo;
    this.bar()
  },
  ids:{
    kid1: div
  }
});
const ff = ee.extended({
  prototype: {
    FF: 'BB' as const,
    f() { return this.FF },
    onclick(e) { this.FF; this.ids.kid2!.foo ; this.EE },
  },
  constructed() {
    this.foo = 123;
    this.FF;
    this.EE;
    this.bar
  },
  ids:{
    kid2: ee
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
f2.onclick = function(e) { this.FF }

const I = ff;

I().onclick = function(e) { this.FF }
I({
  onabort(e) { this;}
})
//*/ 
