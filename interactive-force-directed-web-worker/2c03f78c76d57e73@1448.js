// https://observablehq.com/@mootari/interactive-force-directed-web-worker@1448
import define1 from "./664b9982076c008d@287.js";
import define2 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`
# Interactive Force-Directed Web Worker

**Disclaimer: *Work in progress, published only to grant "early access". It's probably not doing what you think it does. You have been warned.* **

Todos:
- Switch to perspective camera
- Add raycasting / interaction
- Increase z position for nodes close to cursor

`
)}

async function _jsonGraph(d3)
{
  //return null;
  
  const host = 'gist.githubusercontent.com';
  const gist = 'mootari/68881f331639f3950f359877eb6eb3eb';
  const prefix = 'd8';
  const moduleProjects = await d3.json(`https://${host}/${gist}/raw/${prefix}.projects.json`);
  const graph = await d3.json(`https://${host}/${gist}/raw/${prefix}.graph.json`);
  
  const projectIds = {};
  const nodes = [];
  Object.values(moduleProjects).forEach(project => {
    if(projectIds[project] === undefined) {
      projectIds[project] = nodes.length;
      nodes.push({
        name: project,
        id: nodes.length
      });
    }
  });
  
  const linkIds = {};
  graph.nodes.forEach((node, i) => {
    linkIds[node.index] = projectIds[ moduleProjects[node.name] ];
  });
  const links = [];
  graph.links.forEach(link => {
    const source = linkIds[link.source];
    const target = linkIds[link.target];
    if(source !== target) {
      links.push({source, target});
    }
  });
  
  const whitelist = {};
  links.forEach(link => {
    whitelist[link.source] = true;
    whitelist[link.target] = true;
  });
  const nodesFiltered = nodes;
  //const nodesFiltered = nodes.filter(node => whitelist[node.id]);
  
  return {nodes: nodesFiltered, links};
}


function _graph(jsonGraph,d3,numNodes,grouping)
{
  let nodes, links;
  if(jsonGraph) {
    nodes = jsonGraph.nodes;
    links = jsonGraph.links;
  }
  else {
    nodes = d3.range(numNodes).map(i => ({id: i}));
    links = d3.range(numNodes - 1).map(i => ({
      source: Math.floor(Math.pow(i, 1 - grouping)),
      target: i + 1
    }));
  }
  
  console.log('EVAL data');
  //worker.send('setGraph', nodes, links);
  //worker.send('reheat', 1);
  return {nodes, links};
}


function _numNodes(slider){return(
slider({
  title: 'Number of nodes',
  value: 200,
  step: 1,
  min: 100, 
  max: 20000
})
)}

function _grouping(slider)
{
    return slider({
      title: 'Grouping',
      min: 0, 
      max: 1, 
      step: .0001,
      value: .5
    })    
}


function _6()
{/*
  if(this) return this;
  
  const div = DOM.element('div');
  console.log('reload', this);
  div.appendChild(transformValue(
    slider({
      title: 'Many-body charge',
      min: -50,
      max: 0,
      step: 1,
      value: -30
    }),
    value => (worker.send(['force', 'charge'], ['strength', value]), options.manyBodyCharge = value)
  ));
  div.appendChild(transformValue(
    slider({
      title: 'Link charge',
      min: 0,
      max: 5,
      step: 0.001,
      value: 2
    }),
    value => (worker.send(['force', 'link'], ['strength', value]), options.linkCharge = value)
  ));
  return div;
*/}


function _7()
{/*
  worker.send('alpha', alpha);
  worker.subscribe('showAlpha', function (data) {
    if(data[0] === 'get' && data[1] === 'alpha') {
      alphaValue += data[2] - alphaValue;
      worker.send('get', 'alpha');
    }
  });
  worker.send('get', 'alpha');
*/}


function _size(width){return(
[width, ~~(width / (16/9))]
)}

function* _canvas(renderer)
{
  while(true) {
    if(renderer.needsUpdate) {
      renderer.render();
      renderer.needsUpdate = false;
    }
    yield renderer.renderer.domElement;
  }
}


function* _stepper(graph,renderer,createGraph,createLayout)
{
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  function setupData(nodes, links) {
    const index = {};
    nodes.forEach((node, i) => {
      node.x = 0;
      node.y = 0;
      index[node.id] = node;
    });
    links.forEach(link => {
      link.source = index[link.source];
      link.target = index[link.target];
    });
    return index;
  }
  
  function updatePositions(renderer, coordinates) {
    renderer.setPositions(coordinates);
    renderer.needsUpdate = true;
    renderer.autoZoom(10);
  }
  
  // Avoid mutations on the original data objects.
  const nodes = clone(graph.nodes);
  const links = clone(graph.links);
  // This initialization is normally done by d3-force.
  const index = setupData(nodes, links);
  const pairs = [].concat(...links.map(link => [ link.source.id, link.target.id] ));
  renderer.setLinks(nodes, pairs);

  // The update loop.
  let expectedBufferSize = nodes.length * Float32Array.BYTES_PER_ELEMENT * 3;
  let updateBuffer = null;
  let needsUpdate = false;
  
  const g = createGraph();
  const l = createLayout(g, {
    springLength: 10,
    springCoeff: 0.0008,
    gravity: -100,
    theta: 0.5,
    dragCoeff: 0,
    timeStep: 10
  });
  nodes.forEach(node => { g.addNode(node.id); });
  links.forEach(link => { g.addLink(link.source.id, link.target.id); });
  
  const step = () => {
    l.step();
    const positions = [];
    g.forEachNode(node => {
      const position = l.getNodePosition(node.id);
      positions.push(position.x, position.y, 0);
    });
    renderer.setPositions(positions);
    renderer.needsUpdate = true;
    renderer.autoZoom(10);
  }
  
  /*
  worker.listen('updateLoop', (e) => {
    if(e.data[0] === 'update') {
      updateBuffer = e.data[1];
      needsUpdate = true;
    }
  });
  
  // Unfreeze the simulation.
  worker.send('restart');
  // Kick off the update loop.
  worker.send('update');
  worker.send('pin', 0, 0, 0);
  worker.send('alphaDecay', .0001);
  
  const step = () => {
    if(needsUpdate) {
      if(updateBuffer) {
      //if(updateBuffer && updateBuffer.byteLength === expectedBufferSize) {
        const positions = JSON.parse(updateBuffer);
        //const positions = new Float32Array(updateBuffer);
        updatePositions(renderer, positions);
      }
      updateBuffer = null;
      needsUpdate = false;
      worker.send('update');
    }
  }
  
  invalidation.then(() => {
    console.debug('cleaning up');
    worker.clear('updateLoop');
  });
  */
  
  while(true) {
    step();
    yield true;
  }
}


function _renderer(Renderer,width,invalidation)
{
  const renderer = new Renderer({
    numPoints: 20000,
    numLines: 20000,
    width: width,
    height: Math.floor(width / (16/10)),
    lineColor: '#000',
    //lineColor: null,
    pointColor: '#000',
    //    pointColor: null,
    backgroundColor: '#fffffa',
    pointSize: 5,
    textureSize: 256,
    cameraFov: 45,
    cameraNear: 1,
    cameraFar: 100000,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 800,
    DebugAxes: 100
  });
  
  invalidation.then(() => {
    renderer.renderer.dispose();
  });

  return renderer;
}


function _Renderer(THREE,DOM){return(
class Renderer {

  /**
   */
  constructor(options) {
    const { numPoints, numLines } = options;

    this.camera   = this.createCamera(options);
    this.scene    = this.createScene(options);
    this.renderer = this.createRenderer(options);

    const positions = new THREE.BufferAttribute(new Float32Array(numPoints * 3), 3);
    const indices   = new THREE.BufferAttribute(new Uint16Array(numLines * 2), 1);
    this.points   = this.createPointsMesh(positions, options);
    this.lines    = this.createLinesMesh(positions, indices, options);
    this.scene.add(this.lines);
    this.scene.add(this.points);
  }
  
  autoZoom(pad = 0) {
    this.__zoomOrthographic(this.points, this.camera, this.renderer, pad);
  }

  /**
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   */
  createCamera(options) {
    const {
      cameraFar,
      cameraFov,
      cameraNear,
      cameraX,
      cameraY,
      cameraZ,
      height,
      width
    } = options;
    //const camera = new THREE.PerspectiveCamera(cameraFov, width / height, cameraNear, cameraFar);
    const wh = width / 2, hh = height / 2;
    const camera = new THREE.OrthographicCamera( -wh, wh, hh, -hh, 1, cameraFar);
    camera.position.set(cameraX, cameraY, cameraZ);

    return camera;
  }

  /**
   */
  createScene(options) {
    const {backgroundColor} = options;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    return scene;
  }

  /**
   */
  createRenderer(options) {
    const {height, width} = options;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }

  /**
   */
  createPointTexture(size) {
    const ctx = DOM.context2d(size, size, 1);
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, size, size);

    const sh = size / 2;
    ctx.arc(sh, sh, sh, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    const texture = new THREE.CanvasTexture(ctx.canvas);
    //texture.premultipliedAlpha = true;
    return texture;
  }

  /**
   */
  createPointsMesh(positions, options) {
    const { pointColor, pointSize, textureSize } = options;

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', positions);

    const material = new THREE.PointsMaterial({
      size:            pointSize,
      sizeAttenuation: true,
      color:           pointColor,
      map:             this.createPointTexture(textureSize),
      alphaTest:       .5,
      transparent:     true,
      depthTest:       true,
      depthWrite:      true
    }); 
    const mesh = new THREE.Points(geometry, material);
    return mesh;
  }

  /**
   */
  createLinesMesh(positions, indices, options) {
    const { lineColor } = options;

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', positions);
    geometry.setIndex(indices);

    const material = new THREE.LineBasicMaterial({color: lineColor});
    const mesh = new THREE.LineSegments(geometry, material);
    return mesh;
  }

  /**
   */
  setLinks(nodes, pairs) {
    const map = {};
    nodes.forEach((node, i) => map[node.id] = i);
    
    const indices = this.lines.geometry.getIndex();
    for(let i = 0; i < pairs.length; i++) {
      indices.array[i] = map[pairs[i]];
    }
    indices.needsUpdate = true;
    this.lines.geometry.setDrawRange(0, pairs.length);
  }

  /**
   */
  setPositions(coordinates) {
    const positions = this.points.geometry.attributes.position;
    for(let i = 0; i < coordinates.length; i++) {
      positions.array[i] = coordinates[i];
    }
    this.points.geometry.setDrawRange(0, coordinates.length / 3);
    positions.needsUpdate = true;
  }
  
  /**
   */
  __zoomOrthographic(target, camera, renderer, pad = 0) {
    target.geometry.computeBoundingBox();
    const box = target.geometry.boundingBox;
    let width = box.max.x - box.min.x;
    let height = box.max.y - box.min.y;
    if(!width || !height) {
      return;
    }

    const cx = box.min.x + width / 2;
    const cy = box.min.y + height / 2;

    const size = renderer.getSize();
    const ratio = size.width / size.height;
    const boxRatio = width / height;
    if(boxRatio >= ratio) {
      height = width / ratio;
    }
    else {
      width = height * ratio;
    }
    const wh = width / 2;
    const hh = height / 2;

    camera.left   = cx - wh - pad;
    camera.right  = cx + wh + pad;
    camera.bottom = cy - hh - pad;
    camera.top    = cy + hh + pad;
    camera.updateProjectionMatrix();
  }
  

}
)}

function _createWorker(){return(
function createWorker(workerId, data, onInit) {
  // The core worker script. It inlines the initial worker data
  // and the init callback.
  const script = `
	'use strict';
	const data = ${serialize(data)};
	(${onInit.toString()}).call(this, self, data);
  `;
  const blob = new Blob([script], {type: 'text/javascript'});
  const worker = new Worker(URL.createObjectURL(blob));
  registerWorker(workerId, worker);

  const listeners = {};
  
  worker.send = function send(...args) {
    return this.postMessage(args);
  };
  worker.transfer = function transfer(...args) {
    const transferList = args.pop();
    return worker.postMessage(args, transferList);
  };
  
  worker.clear = function clear(listenerId) {
    if(listeners[listenerId]) {
      this.removeEventListener('message', listeners[listenerId]);
    }
  }

  worker.listen = function listen(listenerId, callback) {
    this.clear(listenerId);
    return this.addEventListener('message', listeners[listenerId] = callback);
  }
  
  return worker;
  
  function registerWorker(workerId, worker) {
    // Keep a global registry of all workers.
    const workers = window.WORKERS || (window.WORKERS = {});
    // Terminate the previous worker instance.
    if(workers[workerId]) {
      workers[workerId].terminate();
    }
    workers[workerId] = worker;    
  }

  // Recursively inlines Function, RegExp and undefined.
  function serialize(value) {
    const type = typeof value;
    const json = JSON.stringify;

    if(type === 'function') {
      return value.toString();
    }
    if(type === 'object') {
      if(value === null) {
        return json(value);
      }
      if(value instanceof RegExp) {
        return value.toString();
      }
      if(Array.isArray(value)) {
        return '[' + value.map(serialize).join(',') + ']';
      }
      const body = Object.keys(value).map(name => json(name) + ':' + serialize(value[name]));
      return '{' + body.join(',') + '}';
    }
    if(type === 'undefined') {
      return type;
    }
    return json(value);
  }
}
)}

function _worker(createWorker,require,d3)
{
  return null;
  // Initial data for the worker. Because it will get
  // inlined we don't have to worry about mutations.
  const workerData = {
    nodes: [],
    links: []
  };
  
  // Note: Executes in worker context.
  const worker = createWorker('force-layout', workerData, function onInit(self, data) {
    const createGraph = require('https://bundle.run/ngraph.graph@0.0.14');
    self.importScripts('https://d3js.org/d3.v5.min.js');

    const sim = d3.forceSimulation()
      //.force('link', d3.forceLink()
      //   .id(d => d.id)
      //   .strength(link => 1)
      //)
      .force('charge', d3.forceManyBody().theta(1.5))
      .force('center', d3.forceCenter(0, 0))
    ;
    sim.stop();

    const positions = [];
    let index;
    const updateGraph = (nodes, links) => {
      let i = -1;
      while(data.nodes[++i] && nodes[i]) {
        nodes[i].x = data.nodes[i].x;
        nodes[i].y = data.nodes[i].y;
        nodes[i].fx = data.nodes[i].fx;
        nodes[i].fy = data.nodes[i].fy;
      }
      sim.nodes(data.nodes = nodes);
      //sim.force('link').links(data.links = links);
      index = {};
      positions.length = nodes.length * 3;
  	  data.nodes.forEach((node, i) => { index[node.id] = node; });
    };
    updateGraph(data.nodes, data.links);
    
    const setFixed = (id, fx, fy) => {
      index[id].fx = fx;
      index[id].fy = fy;
    };
    
    const processMessage = (msg, ctx) => {
      const command = msg[0];
      const args = msg.slice(1);
      // Custom commands.
      switch(command) {
        case 'update':
          const nodes = data.nodes;
          const length = nodes.length;
          let j, n;
          for(let i = 0; i < length; i++) {
            j = i + i + i;
            positions[j    ] = nodes[i].x;
            positions[j + 1] = nodes[i].y;
            positions[j + 2] = 0;
            //n = nodes[i];
            //positions[j + 2] = -(n.fx * n.fx + n.fy * n.fy) || 0;
          }
          return self.postMessage(['update', JSON.stringify(positions)]);
        case 'pin':
          return setFixed(args[0], args[1], args[2]);
        case 'release':
          return setFixed(args[0], null, null);
        case 'get':
          return self.postMessage([ 'get', args[0], ctx[args[0]]() ]);
        case 'setGraph':
          return updateGraph(args[0], args[1]);
        case 'reheat':
          sim.alpha(Math.max(sim.alpha(), args[0]));
          return sim.restart();
          
      }
      // Pass through to simulation.
      return ctx[command].apply(ctx, args);
    }
    
    self.addEventListener('message', function(e) {
      let ctx = sim, data = e.data;
      if(!Array.isArray(data[0])) {
        data = [data];
      }
      // Handle chained commands.
      while(data.length) {
        ctx = processMessage.call(null, data.shift(), ctx);
      }
    });
    
  });
  
  return worker;
  
}


function _d3(require){return(
require('d3')
)}

function _THREE(require){return(
require("three@0.89.0/build/three.min.js")
)}

function _createPanZoom(require){return(
require('https://bundle.run/three.map.control@1.5.0')
)}

function _createGraph(require){return(
require('ngraph.graph@19.1.0/dist/ngraph.graph.js')
)}

function _createLayout(require){return(
require('https://bundle.run/ngraph.forcelayout@0.5.0')
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("jsonGraph")).define("jsonGraph", ["d3"], _jsonGraph);
  main.variable(observer("graph")).define("graph", ["jsonGraph","d3","numNodes","grouping"], _graph);
  main.variable(observer("viewof numNodes")).define("viewof numNodes", ["slider"], _numNodes);
  main.variable(observer("numNodes")).define("numNodes", ["Generators", "viewof numNodes"], (G, _) => G.input(_));
  main.variable(observer("viewof grouping")).define("viewof grouping", ["slider"], _grouping);
  main.variable(observer("grouping")).define("grouping", ["Generators", "viewof grouping"], (G, _) => G.input(_));
  main.variable(observer()).define(_6);
  main.variable(observer()).define(_7);
  main.variable(observer("size")).define("size", ["width"], _size);
  main.variable(observer("canvas")).define("canvas", ["renderer"], _canvas);
  main.variable(observer("stepper")).define("stepper", ["graph","renderer","createGraph","createLayout"], _stepper);
  main.variable(observer("renderer")).define("renderer", ["Renderer","width","invalidation"], _renderer);
  main.variable(observer("Renderer")).define("Renderer", ["THREE","DOM"], _Renderer);
  main.variable(observer("createWorker")).define("createWorker", _createWorker);
  main.variable(observer("worker")).define("worker", ["createWorker","require","d3"], _worker);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("createPanZoom")).define("createPanZoom", ["require"], _createPanZoom);
  const child1 = runtime.module(define1);
  main.import("transformValue", child1);
  const child2 = runtime.module(define2);
  main.import("slider", child2);
  main.import("checkbox", child2);
  main.variable(observer("createGraph")).define("createGraph", ["require"], _createGraph);
  main.variable(observer("createLayout")).define("createLayout", ["require"], _createLayout);
  return main;
}
