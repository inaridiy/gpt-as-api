import { Tool } from "./Tool";

export class SQLTool extends Tool {
  name = "SQL";
  description = "SQL tool";

  init() {}
  use(input: string): string {
    return input;
  }
}
