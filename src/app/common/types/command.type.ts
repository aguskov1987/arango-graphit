export enum CommandType {
    OpenNewDbAqlTab,
    OpenNewGraphAqlTab
}

export class Command {
    public commandType: CommandType;
    public database: string = "";
    public graph: string = "";
}