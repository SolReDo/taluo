const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

export const COLLECTION_NAME = 'user_long_term_memory';
export const VECTOR_SIZE = 1536;

interface QdrantResponse<T> {
  result?: T;
  status: string;
  time?: number;
}

interface SearchResult {
  id: string | number;
  version?: number;
  score: number;
  payload?: Record<string, any>;
  vector?: number[] | Record<string, number[]>;
}

interface UpsertResult {
  operation_id: number;
  status: string;
}

interface DeleteResult {
  operation_id: number;
  status: string;
}

/**
 * REST API 封装
 */
async function qdrantRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${QDRANT_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {}),
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qdrant API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * 搜索向量
 */
export async function searchVectors(
  vector: number[],
  filter?: Record<string, any>,
  limit: number = 10
): Promise<SearchResult[]> {
  const body: Record<string, any> = {
    vector,
    limit,
    with_payload: true,
  };

  if (filter) {
    body.filter = filter;
  }

  const response = await qdrantRequest<QdrantResponse<SearchResult[]>>(
    `/collections/${COLLECTION_NAME}/points/search`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  return response.result || [];
}

/**
 * 插入向量
 */
export async function upsertVector(
  id: string,
  vector: number[],
  payload: Record<string, any>
): Promise<UpsertResult> {
  const response = await qdrantRequest<QdrantResponse<UpsertResult>>(
    `/collections/${COLLECTION_NAME}/points/upsert`,
    {
      method: 'PUT',
      body: JSON.stringify({
        points: [{ id, vector, payload }],
      }),
    }
  );

  return response.result!;
}

/**
 * 删除向量
 */
export async function deleteVector(ids: string[]): Promise<DeleteResult> {
  const response = await qdrantRequest<QdrantResponse<DeleteResult>>(
    `/collections/${COLLECTION_NAME}/points/delete`,
    {
      method: 'POST',
      body: JSON.stringify({
        points: ids,
      }),
    }
  );

  return response.result!;
}

/**
 * 获取集合信息
 */
export async function getCollectionInfo(): Promise<any> {
  const response = await qdrantRequest<QdrantResponse<any>>(
    `/collections/${COLLECTION_NAME}`
  );
  return response.result;
}
