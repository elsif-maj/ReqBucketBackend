export interface Request {
  id?: string;
  binPath: string;
  event: {
    client_ip: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE';
    url: string;
    path: string;
    headers: Record<string, any>;
    body: Record<string, any>;
    query: Record<string, any>;
    protocol_version: string;
    tls_info: Record<string, any> | null;
  };
  payload?: {
    raw: string;
  };
  timestamp: string;
}
