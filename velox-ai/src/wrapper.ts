import { createJWT, ES256KSigner } from 'did-jwt';
import { Buffer } from 'buffer';
import { NilQLWrapper } from './wrapper_nilql';
import { v4 as uuidv4 } from 'uuid';

interface NodeConfig {
  url: string;
  did: string;
}

interface Credentials {
  secretKey: string;
  orgDid: string;
}

interface SchemaPayload {
  _id: string;
  name: string;
  keys: string[];
  schema: Record<string, unknown>;
}

export class SecretVaultWrapper {
  private nodes: NodeConfig[];
  private nodesJwt: Array<{ url: string; jwt: string }> | null = null;
  private credentials: Credentials;
  private schemaId: string | null;
  private operation: string;
  private tokenExpirySeconds: number;
  private nilqlWrapper: NilQLWrapper | null = null;

  constructor(
    nodes: NodeConfig[],
    credentials: Credentials,
    schemaId: string | null = null,
    operation: string = 'store',
    tokenExpirySeconds: number = 3600
  ) {
    this.nodes = nodes;
    this.credentials = credentials;
    this.schemaId = schemaId;
    this.operation = operation;
    this.tokenExpirySeconds = tokenExpirySeconds;
  }

  async init(): Promise<NilQLWrapper> {
    const nodeConfigs = await Promise.all(
      this.nodes.map(async (node) => ({
        url: node.url,
        jwt: await this.generateNodeToken(node.did),
      }))
    );
    this.nodesJwt = nodeConfigs;
    this.nilqlWrapper = new NilQLWrapper({ nodes: this.nodes }, this.operation);
    await this.nilqlWrapper.init();
    return this.nilqlWrapper;
  }

  setSchemaId(schemaId: string, operation: string = this.operation): void {
    this.schemaId = schemaId;
    this.operation = operation;
  }

  async generateNodeToken(nodeDid: string): Promise<string> {
    const signer = ES256KSigner(Buffer.from(this.credentials.secretKey, 'hex'));
    const payload = {
      iss: this.credentials.orgDid,
      aud: nodeDid,
      exp: Math.floor(Date.now() / 1000) + this.tokenExpirySeconds,
    };
    return await createJWT(payload, {
      issuer: this.credentials.orgDid,
      signer,
    });
  }

  async generateTokensForAllNodes(): Promise<Array<{ node: string; token: string }>> {
    return Promise.all(
      this.nodes.map(async (node) => {
        const token = await this.generateNodeToken(node.did);
        return { node: node.url, token };
      })
    );
  }

  private async makeRequest(
    nodeUrl: string, 
    endpoint: string, 
    token: string, 
    payload: Record<string, unknown>, 
    method: string = 'POST'
  ): Promise<any> {
    const response = await fetch(`${nodeUrl}/api/v1/${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: method === 'GET' ? null : JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    return await response.json();
  }

  async allotData(data: any[]): Promise<any[]> {
    const encryptedRecords: any[] = [];
    for (const item of data) {
      const encryptedItem = await this.nilqlWrapper!.prepareAndAllot(item);
      encryptedRecords.push(encryptedItem);
    }
    return encryptedRecords;
  }

  async flushData(): Promise<Array<{ node: string; result: any }>> {
    const results: Array<{ node: string; result: any }> = [];
    for (const node of this.nodes) {
      const jwt = await this.generateNodeToken(node.did);
      const payload = { schema: this.schemaId } as Record<string, unknown>;
      const result = await this.makeRequest(
        node.url,
        'data/flush',
        jwt,
        payload
      );
      results.push({ node: node.url, result });
    }
    return results;
  }

  async getSchemas(): Promise<any[]> {
    const results: Array<{ node: string; result: any }> = [];
    for (const node of this.nodes) {
      const jwt = await this.generateNodeToken(node.did);
      const result = await this.makeRequest(
        node.url,
        'schemas',
        jwt,
        {},
        'GET'
      );
      results.push({ node: node.url, result });
    }
    return results.map((result) => result.result.data);
  }

  async createSchema(
    schema: Record<string, unknown>, 
    schemaName: string, 
    schemaId: string | null = null
  ): Promise<Array<{ node: string; result: any }>> {
    if (!schemaId) {
      schemaId = uuidv4();
    }
    const schemaPayload = {
      _id: schemaId,
      name: schemaName,
      keys: ['_id'],
      schema,
    } as Record<string, unknown>;  // Cast to Record<string, unknown>

    const results: Array<{ node: string; result: any }> = [];
    for (const node of this.nodes) {
      const jwt = await this.generateNodeToken(node.did);
      const result = await this.makeRequest(
        node.url,
        'schemas',
        jwt,
        schemaPayload  // Now uses Record<string, unknown>
      );
      results.push({ node: node.url, result });
    }
    return results;
  }

  async deleteSchema(schemaId: string): Promise<Array<{ node: string; result: any }>> {
    const results: Array<{ node: string; result: any }> = [];
    for (const node of this.nodes) {
      const jwt = await this.generateNodeToken(node.did);
      const result = await this.makeRequest(
        node.url,
        `schemas`,
        jwt,
        {
          id: schemaId,
        },
        'DELETE'
      );
      results.push({ node: node.url, result });
    }
    return results;
  }

  async writeToNodes(data: any[]): Promise<Array<{ node: string; result?: any; error?: string }>> {
    const idData = data.map((record) => {
      if (!record._id) {
        return { ...record, _id: uuidv4() };
      }
      return record;
    });
    const transformedData = await this.allotData(idData);
    const results: Array<{ node: string; result?: any; error?: string }> = [];

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      try {
        const nodeData = transformedData.map((encryptedShares) => {
          if (encryptedShares.length !== this.nodes.length) {
            return encryptedShares[0];
          }
          return encryptedShares[i];
        });
        const jwt = await this.generateNodeToken(node.did);
        const payload = {
          schema: this.schemaId,
          data: nodeData,
        };
        const result = await this.makeRequest(
          node.url,
          'data/create',
          jwt,
          payload
        );
        results.push({ node: node.url, result });
      } catch (error: any) {
        console.error(`❌ Failed to write to ${node.url}:`, error.message);
        results.push({ node: node.url, error: error.message });
      }
    }

    return results;
  }

  async readFromNodes(filter: Record<string, unknown> = {}): Promise<any[]> {
    const resultsFromAllNodes: Array<{ node: string; data?: any[]; error?: string }> = [];

    for (const node of this.nodes) {
      try {
        const jwt = await this.generateNodeToken(node.did);
        const payload = { schema: this.schemaId, filter };
        const result = await this.makeRequest(
          node.url,
          'data/read',
          jwt,
          payload
        );
        resultsFromAllNodes.push({ node: node.url, data: result.data });
      } catch (error: any) {
        console.error(`❌ Failed to read from ${node.url}:`, error.message);
        resultsFromAllNodes.push({ node: node.url, error: error.message });
      }
    }

    const recordGroups = resultsFromAllNodes.reduce((acc: any[], nodeResult) => {
      nodeResult.data?.forEach((record: any) => {
        const existingGroup = acc.find((group) =>
          group.shares.some((share: any) => share._id === record._id)
        );
        if (existingGroup) {
          existingGroup.shares.push(record);
        } else {
          acc.push({ shares: [record], recordIndex: record._id });
        }
      });
      return acc;
    }, []);

    const recombinedRecords = await Promise.all(
      recordGroups.map(async (record: any) => {
        const recombined = await this.nilqlWrapper!.unify(record.shares);
        return recombined;
      })
    );
    return recombinedRecords;
  }
}