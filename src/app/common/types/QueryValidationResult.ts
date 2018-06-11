export class QueryValidationResult {
    private errorMessage: string = null;

    constructor(message: string = null) {
        this.errorMessage = message;
    }

    public getErrorPosition(): boolean | [string, number, number] {
        if (!this.errorMessage || !this.errorMessage.includes("syntax error")) {
            return false;
        }
        else {
            let indexOfPosition  = this.errorMessage.indexOf("position") + 8;
            let position = this.errorMessage.slice(indexOfPosition);
            let line: number = +position.split(":")[0];
            let character: number = +position.split(":")[1];
            return [this.errorMessage, line, character];
        }
    }
}