/* Types for tag creation, implemented by `tag()` in ai-ui.ts.
  No code/data is declared in this file (except the re-exported symbols from iterators.ts).
*/
export const UniqueID = Symbol("Unique ID");
// declare var Base: TagCreator<HTMLElement>;
// var b = Base();
// b.outerText;
// b.oninput = function(e) {
//   this === e.target
// };
// const Same = Base.extended({
//   iterable:{
//     foo: {},
//     mat: 0
//   }
// });
// type Q1 = BaseIterables<typeof Base>;
// type Q2 = BaseIterables<typeof Same>;
// type Q3 = BaseIterables<typeof Ex>;
// type Q4 = BaseIterables<typeof F>;
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
//     this.oncanplay = ()=> this.foo.map!(m => m)
//   }
// });
// F().foo.consume!(b => {});
// F().foo.b.consume!(b => {});
// F().foo.a.consume!(b => {});
// F().it
// F().bar
// declare var tr: TagCreator<HTMLTableRowElement>;
// declare var td: TagCreator<HTMLTableCellElement>;
// export const BaseDevice = tr.extended({
//   iterable: {
//     payload: {}
//   },
//   declare: {
//     details(): ChildTags {
//       return undefined;
//     }
//   }
// });
// export const ZigbeeDevice = BaseDevice.extended({
//   styles: `#friendly_name {
//     white-space: break-spaces;
//     max-height: 3em;
//     overflow-y: hidden;
//   }
//   @keyframes flash {
//     0% { opacity: 0.2; }
//     40% { opacity: 0.2; }
//     50% { opacity: 0.8; }
//     60% { opacity: 0.2; }
//     100% { opacity: 0.2; }
//   }
//   .flash {
//     animation: flash 4s;
//     animation-iteration-count: infinite;
//   }`,
//   iterable: {
//     payload: {} as {
//       battery_low?: boolean
//       linkquality?: number
//     }
//   },
//   constructed() {
//     const maxLQ = 100;
//     return [
//       td({
//         onclick: () => this.nextElementSibling?.className == 'details'
//           ? this.nextElementSibling.remove()
//           : this.after(td({ colSpan: 6, className: 'details' }, this.details())),
//         style: {
//           opacity: this.payload.map!(p => !maxLQ || p.battery_low ? "1" : String((p.linkquality || 0) / maxLQ))
//         },
//         className: this.payload.battery_low!.map!(p => p ? 'flash' : '')
//       },
//         this.payload.battery_low!.map!(p => p ? '\uD83D\uDD0B' : '\uD83D\uDCF6')
//       ),
//       td({
//         onclick: () => this.nextElementSibling?.className == 'details'
//           ? this.nextElementSibling.remove()
//           : this.after(td({ colSpan: 6, className: 'details' }, this.details())),
//         id: 'friendly_name'
//       }, 'friendly_name')
//     ]
//   }
// });
