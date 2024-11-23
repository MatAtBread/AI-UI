import { tag } from '../../../module/esm/ai-ui.js';

/* Specify what base tags you reference in your UI */
const { select,option } = tag();

const NumberSelect = select.extended({
  constructed() {
    return option({ value: "1" },"one")
  }
});
