/* Types for tag creation, implemented by `tag()` in ai-ui.ts */
export const UniqueID = Symbol("Unique ID");
;
// declare var Base: TagCreator<HTMLElement>;
// var b = Base();
// b.outerText;
// b.oninput = function(e) {
//   this === e.target
// };
// const Same = Base.extended({});
// Same().tagName
// const Ex = Base.extended({
//   override:{
//     onclick(e: MouseEvent) { this === e.target }
//   },
//   declare:{
//     attr: 0,
//   },
//   iterable:{
//     it: 0
//   }
// });b.oninput = function(e) {
//   this === e.target
// };
// var y = Ex();
// y.oninput = function(e) {
//   this === e.target
// };
// y.textContent;
// y.attr;
// y.it!.consume!(n=>{});
