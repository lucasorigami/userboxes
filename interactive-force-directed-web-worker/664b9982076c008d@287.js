// https://observablehq.com/@mootari/transforming-input-values-on-the-fly@287
import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`# Transforming input values on the fly`
)}

function _letters(transformValue,slider){return(
transformValue(slider({
    title: 'Number of letters',
    value: 5,
    step: 1,
    min: 1,
    max: 26
  }),
  value => Array.from({length: value}, (v, i) => String.fromCharCode(i+65))
)
)}

function _3(letters){return(
letters
)}

function _4(md){return(
md`Another example, using a template string:`
)}

function _spacedOut(transformValue,html){return(
transformValue(
  html`<input type="text" value="Hello! What's going on?">`,
  value => value.toUpperCase().replace(/[AEIOU!?]/g, c => c.repeat(3))
)
)}

function _6(spacedOut){return(
spacedOut
)}

function _transformValue(html){return(
function transformValue(element, valueCallback) {
  return Object.defineProperty(
    html`<div>${element}`,
    'value',
    { get: () => valueCallback(element.value) }
  );
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof letters")).define("viewof letters", ["transformValue","slider"], _letters);
  main.variable(observer("letters")).define("letters", ["Generators", "viewof letters"], (G, _) => G.input(_));
  main.variable(observer()).define(["letters"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("viewof spacedOut")).define("viewof spacedOut", ["transformValue","html"], _spacedOut);
  main.variable(observer("spacedOut")).define("spacedOut", ["Generators", "viewof spacedOut"], (G, _) => G.input(_));
  main.variable(observer()).define(["spacedOut"], _6);
  main.variable(observer("transformValue")).define("transformValue", ["html"], _transformValue);
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  return main;
}
