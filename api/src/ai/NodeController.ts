import { logger } from '@shared';
import { inherits } from 'util';

function makeGuid() {
    return "g" + Math.random() * 10000;
}

class NodeConnection {
    public guid:string;
    public sourceNode:Node;
    public destinationNode:Node;
    public readonly strength:number;
    constructor(args:{
        sourceNode:Node,
        desinationNode:Node,
    }) {
        this.sourceNode = args.sourceNode;
        this.destinationNode = args.desinationNode;
        this.guid = this.sourceNode.guid + this.destinationNode.guid;
        this.strength = 0.5;
    }
    tick(args: {
        strength:number,
    }) {
        const sendValue = this.sourceNode.value * args.strength;
        this.sourceNode.value -= sendValue;
        this.destinationNode.value += sendValue;
    }
    tickForward() {

    }
};

class Node {
    public guid:string;
    public value:number;
    private d_retention:number;
    constructor() {
        this.guid = "node" + makeGuid();
        this.value = 0;
        this.d_retention = 0.5;
    }
};

class NodeController<NodeType,NodeConnectionType> {
    // These maps are just for cleanup / monitoring
    protected d_connections:Map<string,NodeConnectionType>;
    protected d_nodes:Map<string, NodeType>;
    protected d_sourceNode:NodeType;
    protected d_sourceNodeConnections:Map<string,NodeConnectionType>;
    public guid:string;
    constructor(args: {
        sourceNode:NodeType,
    }) {
        this.d_connections = new Map<string,NodeConnectionType>();
        this.d_sourceNodeConnections = new Map<string,NodeConnectionType>();
        this.d_nodes = new Map<string,NodeType>();
        this.d_sourceNode = args.sourceNode;
        this.guid = "nc" + makeGuid();
    }
};

class SimpleNodeConnection extends NodeConnection {

};

class SimpleNode extends Node {

};

class SimpleNodeController extends NodeController<SimpleNode, SimpleNodeConnection> {
    constructor() {
        const sourceNode = new SimpleNode();
        super({
            sourceNode,
        });
    }
    public initNodes() {
        for (let idx = 0; idx < 10000; idx++) {
            const node = new SimpleNode();
            this.d_nodes.set(node.guid, node);
        }
    }
    public tick() {
        // A -> B
        //   -> C
        //   -> D
        // Connections have strength
        // Nodes have rentention
        // Tick from A calculate the value to send to each connection
        // and send it to B, C, and D, wait some timeout and
        // repeat for B, C, D's connections
        // Then tell B, C and D to do the same for it's connections
        let totalStrength = 0;
        for (const connection of this.d_sourceNodeConnections.values()) {
            totalStrength += connection.strength;
        }
        for (const connection of this.d_sourceNodeConnections.values()) {
            connection.tick({
                strength: connection.strength / totalStrength,
            });
        }
        for (const connection of this.d_sourceNodeConnections.values()) {
            connection.tickForward();
        }
    }
};

class MasterController {
    private d_controllers:Map<string,SimpleNodeController>;
    constructor() {
        this.d_controllers = new Map<string,SimpleNodeController>();
    }
    public initControllers() {
        for (let idx = 0; idx < 1; idx++) {
            const controller = new SimpleNodeController();
            this.d_controllers.set(controller.guid, controller);
            controller.initNodes();
        }
    }
    public tick() {

    }
};

const singleton = new MasterController();

export default singleton;
