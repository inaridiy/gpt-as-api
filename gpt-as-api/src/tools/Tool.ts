type promised<T> = T | Promise<T>;

export abstract class Tool<T = any> {
  abstract name: string;
  abstract description?: string;
  abstract init(env: T): promised<void>;
  abstract use(input: string): promised<string>;
}
