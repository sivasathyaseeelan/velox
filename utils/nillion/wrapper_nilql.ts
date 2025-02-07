import { nilql } from '@nillion/nilql';

const KeyType = {
  CLUSTER: 'cluster',
  SECRET: 'secret',
} as const;
type KeyType = typeof KeyType[keyof typeof KeyType];

interface Cluster {
  nodes: object[];
  [key: string]: any;
}

interface Operation {
  [key: string]: boolean;
}

export class NilQLWrapper {
  private cluster: Cluster;
  private secretKey: any;
  private operation: Operation;
  private keyType: KeyType;

  constructor(
    cluster: Cluster,
    operation: string = 'store',
    secretKey: any = null,
    keyType: KeyType = KeyType.CLUSTER
  ) {
    this.cluster = cluster;
    this.secretKey = secretKey;
    this.operation = {
      [operation]: true,
    };
    this.keyType = keyType;
  }

  async init(): Promise<void> {
    if (this.secretKey === null && this.keyType === KeyType.SECRET) {
      this.secretKey = await nilql.SecretKey.generate(
        this.cluster,
        this.operation
      );
    }
    if (this.keyType === KeyType.CLUSTER) {
      this.secretKey = await nilql.ClusterKey.generate(
        this.cluster,
        this.operation
      );
    }
  }

  async encrypt(data: any): Promise<string | string[] | number[]> {
    if (!this.secretKey) {
      throw new Error('NilQLWrapper not initialized. Call init() first.');
    }

    const processData = (input: any): string | number | bigint => {
      if (typeof input === 'string') return input;
      if (typeof input === 'number') return input;
      if (typeof input === 'bigint') return input;
      return JSON.stringify(input);
    };

    return await nilql.encrypt(this.secretKey, processData(data));
  }

  async decrypt(shares: any[]): Promise<any> {
    if (!this.secretKey) {
      throw new Error('NilQLWrapper not initialized. Call init() first.');
    }
    return await nilql.decrypt(this.secretKey, shares);
  }

  async prepareAndAllot(data: any): Promise<any> {
    if (!this.secretKey) {
      throw new Error('NilQLWrapper not initialized. Call init() first.');
    }

    const sanitizeValue = (value: any): any => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.map(sanitizeValue);
        }
        const sanitizedObj: any = {};
        for (const [k, v] of Object.entries(value)) {
          if (k === '$allot') {
            sanitizedObj[k] = sanitizeValue(v);
          } else if (v !== undefined) {
            sanitizedObj[k] = sanitizeValue(v);
          }
        }
        return Object.keys(sanitizedObj).length > 0 ? sanitizedObj : null;
      }
      return value;
    };

    const sanitizedData = sanitizeValue(data);
    return nilql.allot(sanitizedData);
  }

  async unify(shares: any[]): Promise<any> {
    if (!this.secretKey) {
      throw new Error('NilQLWrapper not initialized. Call init() first.');
    }
    return await nilql.unify(this.secretKey, shares);
  }
}