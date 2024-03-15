function _1(md) {
  return md`# Force-directed web worker

This example demonstrates how to compute a [static force-directed graph layout](/@d3/static-force-directed-graph) using [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).`;
}

function _replay(html) {
  return html`<button>replay`;
}

function _data(FileAttachment) {
  return FileAttachment("data.json").json();
}

async function _3(replay, createWorkerFrom, workerScript, invalidation, DOM, data) {
  replay;
  const width = 928;
  const height = Math.floor(width * 0.9);

  const nodes = data.nodes;
  const links = data.links;

  const worker = createWorkerFrom(workerScript);
  worker.addEventListener("message", messaged);
  worker.postMessage({ nodes, links });
  invalidation.then(() => worker.terminate());

  const context = DOM.context2d(width, height);
  context.canvas.style = `width:${width}px;max-width:100%;height:auto;`;
  
  return context.canvas;

  function messaged(event) {
    context.clearRect(0, 0, width, height);
    switch (event.data.type) {
      case "tick":
        progress(event.data.progress);
        break;
      case "end":
        ticked(event.data);
        break;
    }
  }

  function progress(progress) {
    context.fillStyle = "red";
    context.fillRect(0, 0, 2 * progress, 2);
    context.fillStyle = "black";
    context.fillText(`${progress} ticks`, 2, 14);
  }

  function ticked(data) {
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    for (const c of data.links) {
      context.moveTo(c.source.x, c.source.y);
      context.lineTo(c.target.x, c.target.y);
    }
    context.lineWidth = 0.5;
    context.stroke();

    context.beginPath();
    for (const c of data.nodes) {
      context.moveTo(c.x, c.y);
      context.arc(c.x, c.y, 2, 0, Math.PI * 2);
    }
    context.fillStyle = "#000";
    context.fill();

    context.restore();
  }
}

function _createWorkerFrom() {
  return function createWorkerFrom(workerScript) {
    const blob = new Blob([workerScript], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    
    return new Worker(url);
  };
}

async function _workerScript(require) {
  const d3 = await require("d3@7");

return `
importScripts(${JSON.stringify(d3)});
onmessage = function(event) {
const nodes = event.data.nodes,
links = event.data.links;

const simulation = d3.forceSimulation(nodes)
.force("charge", d3.forceManyBody())
.force("link", d3.forceLink(links).strength(1))
.force("x", d3.forceX())
.force("y", d3.forceY())
.stop();

for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
postMessage({type: "tick", progress: i});
simulation.tick();
}

postMessage({type: "end", nodes: nodes, links: links});

self.close();
};
`;
}

export default function define(runtime, observer) {
const main = runtime.module();
main.variable(observer()).define(["md"], _1);
main.variable(observer("viewof replay")).define("viewof replay", ["html"], _replay);
main.variable(observer("replay")).define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
main.variable(observer()).define(["replay", "createWorkerFrom", "workerScript", "invalidation", "DOM", "data"], _3);
main.variable(observer("createWorkerFrom")).define("createWorkerFrom", _createWorkerFrom);
main.variable(observer("workerScript")).define("workerScript", ["require"], _workerScript);
main.variable(observer("data")).define("data", ["FileAttachment"], _data);

return main;
}
