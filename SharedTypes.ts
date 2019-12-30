// import { logger } from '@shared';
// import { inherits } from 'util';

export type SerializedNodeConnection = {
    guid:string,
    strength:number,
    sourceNode:string,
    destinationNode:string,
};

export type SerializedNode = {
    guid:string,
    position:{
        x:number,
        y:number,
    }
    retention:number,
    value:number,
};

export type SerializedNodeController = {
    nodes:Array<SerializedNode>,
    connections:Array<SerializedNodeConnection>,
};

export type SerializedMasterController = {
    controllers:Array<SerializedNodeController>,
};
