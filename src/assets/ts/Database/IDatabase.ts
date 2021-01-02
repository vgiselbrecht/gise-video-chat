export interface IDatabase{
    initDatabase(database: string, version: number, structur: IDatabaseStructure, callback: (success: boolean, caller: any) => void, caller: any);
    add(object: IDatabaseObject, data: any, callback: (success: boolean, caller: any) => void, caller: any);
    read(object: IDatabaseObject, query: IDatabaseQuery, callback: (success: boolean, data: any, caller: any) => void, caller: any);
}

export interface IDatabaseStructure{
    [object: string]: IDatabaseObject;
}

export interface IDatabaseObject{
    name: string;
    keyPath: string;
    autoIncrement: boolean;
    elements: IDatabaseObjectElementList;
}

export interface IDatabaseObjectElementList{
    [element: string]: IDatabaseObjectElement;
}

export interface IDatabaseObjectElement{
    name: string;
    unique: boolean;
}

export interface IDatabaseQuery{
    element: IDatabaseObjectElement;
    value: any;
}