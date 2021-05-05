export class AVLNode<T> {
    leftHeight: number = 0;
    rightHeight: number = 0;
    leftNode: AVLNode<T> | undefined;
    rightNode: AVLNode<T> | undefined;
    parentNode: AVLNode<T> | undefined;
    value: T;

    constructor(value: T) {
        this.value = value;
    }
}

enum CompareResult {
    Equal = 0,
    GT = 1,
    LT = -1
}

type Compare<T> = (node1: T, node2: T) => CompareResult;

export class AVLTree<T> {
    rootNode: AVLNode<T> | undefined;
    compareFn: Compare<T> | undefined;
    put(value: T, compare?: Compare<T>) {
        console.log('put', value);
        const node = new AVLNode(value);
        this.compareFn = compare || this.compareFn;
        if (!this.rootNode) {
            this.rootNode = node;
            (window as any).node = this.rootNode;
            return;
        }

        this.insertNode(node, this.rootNode);
    }

    getTree() {
        return this.rootNode;
    }

    find(node: T) { }

    min(node = this.rootNode): AVLNode<T> | undefined {
        if (!node) {
            return;
        }
        if (node.leftNode) {
            return this.min(node.leftNode)
        }

        return node;
    };
    max(node = this.rootNode): AVLNode<T> | undefined {
        if (!node) {
            return;
        }
        if (node.rightNode) {
            return this.max(node.rightNode)
        }

        return node;
    };
    remove(node: T) { }

    getNodeHeight(node = this.rootNode) {
        if(!node) {
            return 0;
        }
        return Math.max(node.leftHeight, node.rightHeight);
    }

    private insertNode(node: AVLNode<T>, rootNode: AVLNode<T>) {
        if (!rootNode) {
            return;
        }

        const compareResult = this.compare(node, rootNode);

        if (compareResult === 0) {
            return;
        }

        if (compareResult > 0) {
            this.insertNodeToRightChild(rootNode, node);
            return;
        }

        this.insertNodeToLeftChild(rootNode, node);
    }

    private insertNodeToLeftChild(rootNode: AVLNode<T>, node: AVLNode<T>) {
        if (rootNode.leftNode) {
            this.insertNode(node, rootNode.leftNode);
            return;
        }
        rootNode.leftNode = node;
        node.parentNode = rootNode;
        rootNode.leftHeight = 1;

        // 右节点高度为0，说明左节点的插入导致节点的高度差发生了变化
        // 此时需要重新调整高度以及调整平衡
        if (rootNode.rightHeight < rootNode.leftHeight) {
            // 调整所有到root的节点的高度（都+1）
            this.resetHeight(rootNode.leftNode);

            // 重新调整平衡
            this.balance(node);
        };
    }

    private insertNodeToRightChild(rootNode: AVLNode<T>, node: AVLNode<T>) {
        if (rootNode.rightNode) {
            this.insertNode(node, rootNode.rightNode)
            return
        }

        rootNode.rightNode = node;
        node.parentNode = rootNode;
        rootNode.rightHeight = 1;

        // 左节点高度为0，说明右节点的插入导致节点的高度差发生了变化
        // 此时需要重新调整高度以及调整平衡
        if (rootNode.leftHeight === 0) {
            // 调整所有到root的节点的高度（都+1）
            this.resetHeight(rootNode.rightNode);

            // 调整平衡
            this.balance(node);
        }
    }

    private balance(insertNode: AVLNode<T>) {
        const firstUnbalanceNode = this.findFirstUnbalanceNode(insertNode);
        if(!firstUnbalanceNode) {
            return;
        }

        if (firstUnbalanceNode.leftHeight > firstUnbalanceNode.rightHeight && firstUnbalanceNode.leftNode) {
            if (firstUnbalanceNode.leftNode.leftHeight > firstUnbalanceNode.leftNode.rightHeight) {
                this.rotateRight(firstUnbalanceNode);
                // this.rotateRight(insertNode.parentNode?.parentNode as AVLNode<T>);
            } else {
                this.doubleRotateLeftRight(this.findRotateNode(insertNode, firstUnbalanceNode));
                // if(insertNode.parentNode?.parentNode === firstUnbalanceNode) {
                //     this.doubleRotateLeftRight(insertNode);
                // } else {
                //     this.doubleRotateLeftRight(insertNode.parentNode as AVLNode<T>);
                // }
            }

            return;
        }

        if (firstUnbalanceNode.rightHeight > firstUnbalanceNode.leftHeight && firstUnbalanceNode.rightNode) {
            if (firstUnbalanceNode.rightNode.rightHeight > firstUnbalanceNode.rightNode.leftHeight) {
                this.rotateLeft(firstUnbalanceNode);
                // this.rotateLeft(insertNode.parentNode?.parentNode as AVLNode<T>);
            } else {
                this.doubleRotateRightLeft(this.findRotateNode(insertNode, firstUnbalanceNode));
                // if(insertNode.parentNode?.parentNode === firstUnbalanceNode) {
                //     this.doubleRotateRightLeft(insertNode);
                // } else {
                //     this.doubleRotateRightLeft(insertNode.parentNode as AVLNode<T>);
                // }
            }
        }
    }

    private findRotateNode(insertNode: AVLNode<T>, firstUnbalanceNode: AVLNode<T>): AVLNode<T> {
        if (insertNode.parentNode?.parentNode === firstUnbalanceNode) {
            return insertNode
        }

        return this.findRotateNode(insertNode.parentNode as AVLNode<T>, firstUnbalanceNode);
    }

    private findFirstUnbalanceNode(node: AVLNode<T>): AVLNode<T> | undefined {
        if (Math.abs(node.leftHeight - node.rightHeight) > 1) {
            return node;
        }

        return node.parentNode && this.findFirstUnbalanceNode(node.parentNode);
    }

    private resetHeight(node: AVLNode<T>) {
        if (!node) {
            return;
        }

        node.leftHeight = node.leftNode ? this.getNodeHeight(node.leftNode) + 1 : 0;
        node.rightHeight = node.rightNode ? this.getNodeHeight(node.rightNode) + 1 : 0;

        node.parentNode && this.resetHeight(node.parentNode);
    }

    private compare(node1: AVLNode<T>, node2: AVLNode<T>) {
        if (typeof this.compareFn === 'function') {
            return this.compareFn(node1.value, node2.value);
        }

        if (node1.value > node2.value) {
            return CompareResult.GT;
        }

        if (node1.value === node2.value) {
            return CompareResult.Equal;
        }

        return CompareResult.LT;
    }

    // 单右旋
    private rotateRight(rotateRootNode: AVLNode<T>) {
        console.log('单旋：右旋，', rotateRootNode.value);
        const newRotateRootNode = rotateRootNode.leftNode as AVLNode<T>;
        const parentNode = rotateRootNode.parentNode as AVLNode<T>;
        if (parentNode && parentNode.leftNode === rotateRootNode) {
            parentNode.leftNode = newRotateRootNode;
        } else if(parentNode && parentNode.rightNode === rotateRootNode) {
            parentNode.rightNode = newRotateRootNode;
        } else {
            this.rootNode = newRotateRootNode;
        }

        rotateRootNode.parentNode = newRotateRootNode;
        rotateRootNode.leftNode = newRotateRootNode.rightNode;
        newRotateRootNode.rightNode && (newRotateRootNode.rightNode.parentNode = rotateRootNode);
        newRotateRootNode.parentNode = parentNode;
        newRotateRootNode.rightNode = rotateRootNode;

        if(rotateRootNode === this.rootNode) {
            this.rootNode = newRotateRootNode;
        }
        this.resetHeight(rotateRootNode);
        this.resetHeight(newRotateRootNode);
        parentNode && this.resetHeight(parentNode);
        return newRotateRootNode;
    }

    // 单左旋
    private rotateLeft(rotateRootNode: AVLNode<T>) {
        console.log('单旋：左旋，', rotateRootNode.value);
        const newRotateRootNode = rotateRootNode.rightNode as AVLNode<T>;
        const parentNode = rotateRootNode.parentNode as AVLNode<T>;

        if (parentNode && parentNode.rightNode === rotateRootNode) {
            parentNode.rightNode = newRotateRootNode;
        } else if(parentNode && parentNode.leftNode === rotateRootNode) {
            parentNode.leftNode = newRotateRootNode;
        } else {
            this.rootNode = newRotateRootNode;
        }

        rotateRootNode.parentNode = newRotateRootNode;
        rotateRootNode.rightNode = newRotateRootNode.leftNode;
        newRotateRootNode.leftNode && (newRotateRootNode.leftNode.parentNode = rotateRootNode);
        newRotateRootNode.parentNode = parentNode;
        newRotateRootNode.leftNode = rotateRootNode;

        if(rotateRootNode === this.rootNode) {
            this.rootNode = newRotateRootNode;
        }

        this.resetHeight(rotateRootNode);
        this.resetHeight(newRotateRootNode);
        parentNode && this.resetHeight(parentNode);
        return newRotateRootNode;
    }

    // 双旋：左旋 -> 右旋
    private doubleRotateLeftRight(insertNode: AVLNode<T>) {
        console.log('开始双旋：左旋 -> 右旋');
        const parentNode = insertNode.parentNode  as AVLNode<T>;
        this.rotateRight(this.rotateLeft(parentNode as AVLNode<T>).parentNode as AVLNode<T>);
    }

    // 双旋：右旋 -> 左旋
    private doubleRotateRightLeft(insertNode: AVLNode<T>) {
        console.log('开始双旋：右旋 -> 左旋');
        const parentNode = insertNode.parentNode  as AVLNode<T>;
        this.rotateLeft(this.rotateRight(parentNode as AVLNode<T>).parentNode as AVLNode<T>);
    }
}