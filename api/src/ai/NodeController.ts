import { logger } from '@shared';
import { inherits } from 'util';
import {
    SerializedNodeConnection,
    SerializedNode,
    SerializedNodeController,
    SerializedMasterController,
} from "../../../SharedTypes";

function makeGuid() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

const CANVAS = {
    width: 1500,
    height: 1500,
};

class NodeConnection {
    public guid:string;
    public sourceNode:Node;
    public destinationNode:Node;
    public strength:number;
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
    serialize():SerializedNodeConnection {
        return {
            guid: this.guid,
            strength: this.strength,
            sourceNode: this.sourceNode.guid,
            destinationNode: this.destinationNode.guid,
        };
    }
};

class Node {
    public guid:string;
    public value:number;
    private d_retention:number;
    private d_position:{
        x:number,
        y:number,
    };
    constructor() {
        this.guid = "node" + makeGuid();
        this.value = 0;
        this.d_retention = 0.5;
        this.d_position = {
            x: Math.floor(Math.random() * CANVAS.width),
            y: Math.floor(Math.random() * CANVAS.height),
        }
    }
    public serialize():SerializedNode {
        return {
            guid: this.guid,
            position: this.d_position,
            retention: this.d_retention,
            value: this.value,
        };
    }
};

class NodeController {
    // These maps are just for cleanup / monitoring
    protected d_connections:Map<string,NodeConnection>;
    protected d_nodes:Map<string, Node>;
    protected d_sourceNode:Node;
    protected d_sourceNodeConnections:Map<string,NodeConnection>;
    public guid:string;
    constructor(args: {
        sourceNode:Node,
    }) {
        this.d_connections = new Map<string,NodeConnection>();
        this.d_sourceNodeConnections = new Map<string,NodeConnection>();
        this.d_nodes = new Map<string,Node>();
        this.d_sourceNode = args.sourceNode;
        this.guid = "nc" + makeGuid();
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
    public serialize():SerializedNodeController {
        const nodes = [];
        for (const node of this.d_nodes.values()) {
            nodes.push(node.serialize());
        }
        const connections = [];
        for (const conn of this.d_connections.values()) {
            connections.push(conn.serialize());
        }
        return {
            nodes,
            connections,
        }
    }
};

class SimpleNodeConnection extends NodeConnection {

};

class SimpleNode extends Node {

};

class SimpleNodeController extends NodeController {
    constructor() {
        const sourceNode = new SimpleNode();
        super({
            sourceNode,
        });
    }
    public initNodes() {
        const N = 1000;
        const createdNodes:Array<SimpleNode> = [];
        for (let idx = 0; idx < N; idx++) {
            const node = new SimpleNode();
            this.d_nodes.set(node.guid, node);
            createdNodes.push(node);
        }
        for (let idx = 0; idx < N / 2; idx ++) {
            const connection = new SimpleNodeConnection({
                sourceNode: createdNodes[Math.floor(Math.random() * N)],
                desinationNode: createdNodes[Math.floor(Math.random() * N)],
            });
            this.d_connections.set(connection.guid, connection);
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
    public serialize():SerializedMasterController {
        const controllers = [];
        for (const controller of this.d_controllers.values()) {
            controllers.push(controller.serialize());
        }
        return {
            controllers,
        };
    }
};

const singleton = new MasterController();

export default singleton;
