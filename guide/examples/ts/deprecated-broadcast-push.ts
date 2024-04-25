/** This is implemention of pushIterator and broadcastIterator deprecated in favour of 
 * `queueIterableIterator().multi()` as of v0.11.x. It will be removed */

// export interface PushIterator<T> extends AsyncExtraIterable<T> {
//   push(value: T): boolean;
//   close(ex?: Error): void;  // Tell the consumer(s) we're done, with an optional error
// };
// export type BroadcastIterator<T> = PushIterator<T>;

/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  unique values from the queue (ie: the queue is SHARED not duplicated)
*/
// export function pushIterator<T>(stop = () => { }, bufferWhenNoConsumers = false): PushIterator<T> {
//   let consumers = 0;
//   let ai: QueueIteratableIterator<T> = queueIteratableIterator<T>(() => {
//     consumers -= 1;
//     if (consumers === 0 && !bufferWhenNoConsumers) {
//       try { stop() } catch (ex) { }
//       // This should never be referenced again, but if it is, it will throw
//       (ai as any) = null;
//     }
//   });

//   return Object.assign(Object.create(asyncExtras) as AsyncExtraIterable<T>, {
//     [Symbol.asyncIterator]() {
//       consumers += 1;
//       return ai;
//     },
//     push(value: T) {
//       if (!bufferWhenNoConsumers && consumers === 0) {
//         // No one ready to read the results
//         return false;
//       }
//       return ai.push(value);
//     },
//     close(ex?: Error) {
//       ex ? ai.throw?.(ex) : ai.return?.();
//       // This should never be referenced again, but if it is, it will throw
//       (ai as any) = null;
//     }
//   });
// }

/* An AsyncIterable which typed objects can be published to.
  The queue can be read by multiple consumers, who will each receive
  a copy of the values from the queue (ie: the queue is BROADCAST not shared).

  The iterators stops running when the number of consumers decreases to zero
*/
// export function broadcastIterator<T>(stop = () => { }): BroadcastIterator<T> {
//   let ai = new Set<QueueIteratableIterator<T>>();

//   const b = <BroadcastIterator<T>>Object.assign(Object.create(asyncExtras) as AsyncExtraIterable<T>, {
//     [Symbol.asyncIterator](): AsyncIterableIterator<T> {
//       const added = queueIteratableIterator<T>(() => {
//         ai.delete(added);
//         if (ai.size === 0) {
//           try { stop() } catch (ex) { }
//           // This should never be referenced again, but if it is, it will throw
//           (ai as any) = null;
//         }
//       });
//       ai.add(added);
//       return iterableHelpers(added);
//     },
//     push(value: T) {
//       if (!ai?.size)
//         return false;

//       for (const q of ai.values()) {
//         q.push(value);
//       }
//       return true;
//     },
//     close(ex?: Error) {
//       for (const q of ai.values()) {
//         ex ? q.throw?.(ex) : q.return?.();
//       }
//       // This should never be referenced again, but if it is, it will throw
//       (ai as any) = null;
//     }
//   });
//   return b;
// }


// function broadcast<U extends PartialIterable>(this: U) {
//   type T = HelperAsyncIterable<U>;
//   const ai = this[Symbol.asyncIterator]!();
//   const b = broadcastIterator<T>(() => ai.return?.());
//   (function step() {
//     ai.next().then(v => {
//       if (v.done) {
//         // Meh - we throw these away for now.
//         // console.log(".broadcast done");
//       } else {
//         b.push(v.value);
//         step();
//       }
//     }).catch(ex => b.close(ex));
//   })();

//   const bai: AsyncIterable<T> = {
//     [Symbol.asyncIterator]() {
//       return b[Symbol.asyncIterator]();
//     }
//   };
//   return iterableHelpers(bai)
// }
