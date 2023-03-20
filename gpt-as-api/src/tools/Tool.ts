type promised<T> = T | Promise<T>;

export abstract class Tool {
  abstract name?: promised<string>;
  abstract description?: promised<string>;
  abstract use(input: string): promised<string>;
}
