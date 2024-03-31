/* Types for tag creation, implemented by `tag()` in ai-ui.ts */
export const UniqueID = Symbol("Unique ID");
// declare var Base: TagCreator<HTMLElement>;
// var b = Base();
// b.outerText;
// b.oninput = function(e) {
//   this === e.target
// };
// const Same = Base.extended({
//   iterable:{
//     mat: 0
//   }
// });
// Same().tagName
// const Ex = Same.extended({
//   override:{
//     onclick(e: MouseEvent) { this === e.target }
//   },
//   declare:{
//     attr: 0,
//   },
//   iterable:{
//     it: 0,
//     foo: { a: 1 }
//   }
// });
// b.oninput = function(e) {
//   this === e.target
// };
// var y = Ex();
// y.oninput = function(e) {
//   this === e.target
// };
// y.textContent;
// y.attr;
// y.it!.consume!(n=>{});
// Ex.onclick
// Ex.attr
// const F = Ex.extended({
//   iterable:{
//     foo:{
//       b: true
//     },
//     bar: ''
//   },
//   constructed(){
//     this.bar.consume!(b => {});
//     this.it.consume!(b => {});
//     this.foo.consume!(b => {});
//     this.foo.b.consume!(b => {});
//     this.foo.a.consume!(b => {});
//       }
// });
// F().foo.consume!(b => {});
// F().foo.b.consume!(b => {});
// F().foo.a.consume!(b => {});
// F().it
// F().bar
