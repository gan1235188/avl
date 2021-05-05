import { AVLNode, AVLTree } from "./AVL";

class NodeShow extends AVLNode<number>{
  left?: number;
  height?: number;
  level?: number;
  dom?: HTMLElement;
  isVirtual?= false;
}

type Node = NodeShow | undefined;
const avlTree = new AVLTree<number>();
interface renderReturn {
  level: number;
  left: number;
  dom: HTMLElement | undefined;
}

const wrapEl = document.createElement("div");
try {
  const oldWrapEl = document.getElementById('wrap');
  oldWrapEl && document.body.removeChild(oldWrapEl);
  wrapEl.id = 'wrap';
  document.body.appendChild(wrapEl);
} catch { }
const space = 35;
const nodesList: NodeShow[] = [];

function start() {
  for (var i = 0; i < 40; i++) {
    const node = Math.round(Math.random() * 1000);
    avlTree.put(node);
  }

  setTimeout(() => {
    renderTree(avlTree.getTree());
    wrapEl.style.width = nodesList.length * space + 'px';
    const wrapHeight = avlTree.getNodeHeight() * 2 * space + 100;
    wrapEl.style.height = wrapHeight + 'px';
    const { height } = document.body.getBoundingClientRect();
    wrapEl.style.top = (height - wrapHeight) / 2 + 'px';
  }, 1000);
}

function renderTree(node: Node): renderReturn | undefined {
  if (!node) {
    return;
  }

  pushNodesToList();
  for (let index = 0; index < nodesList.length; index++) {
    renderDomNode(nodesList[index], nodesList[index].level as number, index);
  }

  renderRelation();
}

function renderRelation(rootNode = avlTree.getTree() as NodeShow) {
  if (rootNode.leftNode) {
    renderLine(rootNode.dom as HTMLElement, (rootNode.leftNode as NodeShow).dom as HTMLElement);
    renderRelation(rootNode.leftNode);
  }

  if (rootNode.rightNode) {
    renderLine(rootNode.dom as HTMLElement, (rootNode.rightNode as NodeShow).dom as HTMLElement);
    renderRelation(rootNode.rightNode);
  }
}

function renderLine(fromNodeDom: HTMLElement, toNodeDom: HTMLElement) {
  if (!fromNodeDom || !toNodeDom) {
    return;
  }
  const line = document.createElement('div');
  line.className = 'line';
  const fromRect = fromNodeDom.getBoundingClientRect();
  const toRect = toNodeDom.getBoundingClientRect();
  const wrapRect = wrapEl.getBoundingClientRect();
  const x = Math.abs(fromRect.left - toRect.left);
  const y = Math.abs(fromRect.top - toRect.top);
  line.style.height = Math.floor(Math.sqrt(x * x + y * y)) + 'px';
  line.style.top = (fromRect.top - wrapRect.top) + 15 + 'px';

  const deg = Math.atan(y / x) / (Math.PI / 180)

  if (fromRect.left < toRect.left) {
    line.style.left = (fromRect.left - wrapRect.left) + 13 + 'px';
    line.style.transform = `rotate(-${90 - deg}deg)`;
  } else {
    line.style.left = (fromRect.left - wrapRect.left) + 17 + 'px';
    line.style.transform = `rotate(${90 - deg}deg)`;
  }

  wrapEl && wrapEl.appendChild(line);
}

function renderDomNode(node: Node, level: number, left: number) {
  if (!node || node.isVirtual) {
    return;
  }
  const element = document.createElement('div');
  element.className = 'node';
  element.innerText = node.value.toString();
  element.style.top = level * (space * 2) + 'px';
  element.style.left = left * space + 'px';
  wrapEl && wrapEl.appendChild(element);
  node.dom = element;
  return element;
}

function pushNodesToList(node: Node = avlTree.getTree(), level = 1) {
  if (!node) {
    return;
  }

  node.level = level;
  if (node.leftNode) {
    pushNodesToList(node.leftNode, level + 1);
  }

  nodesList.push(node);

  if (node.rightNode) {
    pushNodesToList(node.rightNode, level + 1);
  }
}

start();