import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { get, set, del, keys } from 'idb-keyval';
import { OfflineService } from './offline.service';
import { environment } from '../../environments/environment';

export interface QueuedMutation {
  id: string;          // UUID — used as IDB key
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
  jwt: string;
  enqueuedAt: string;  // ISO-8601
  retries: number;
}

const IDB_PREFIX = 'ha_sync_queue_';
const MAX_RETRIES = 5;

/**
 * SyncQueueService
 *
 * IndexedDB-backed offline mutation queue for field clinicians.
 *
 * When the device is offline, GraphQL write operations (create encounter,
 * schedule appointment, etc.) are serialized to IDB instead of being sent.
 * When connectivity is restored, the queue is drained in FIFO order against
 * the HA BFF. Failed requests are retried up to MAX_RETRIES before being
 * dropped and logged.
 *
 * Security note: JWT tokens stored in IDB expire per Keycloak session.
 * The flush logic checks token expiry and skips/drops stale entries.
 */
@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private isFlushing = false;

  constructor(
    private http: HttpClient,
    private offline: OfflineService,
  ) {
    // Auto-flush when connectivity is restored
    this.offline.changes$.subscribe(online => {
      if (online) this.flush();
    });
  }

  /**
   * Enqueue a GraphQL mutation for deferred execution.
   * Call this instead of direct HTTP POST when offline.
   */
  async enqueue(mutation: Omit<QueuedMutation, 'id' | 'enqueuedAt' | 'retries'>): Promise<string> {
    const id = `${IDB_PREFIX}${crypto.randomUUID()}`;
    const entry: QueuedMutation = {
      ...mutation,
      id,
      enqueuedAt: new Date().toISOString(),
      retries: 0,
    };
    await set(id, entry);
    console.debug(`[SyncQueue] Enqueued ${mutation.operationName} (${id})`);
    return id;
  }

  /** Returns all queued mutations ordered by enqueuedAt (FIFO). */
  async getQueue(): Promise<QueuedMutation[]> {
    const allKeys = (await keys() as string[]).filter(k => k.startsWith(IDB_PREFIX));
    const entries = await Promise.all(allKeys.map(k => get<QueuedMutation>(k)));
    return (entries.filter(Boolean) as QueuedMutation[])
      .sort((a, b) => a.enqueuedAt.localeCompare(b.enqueuedAt));
  }

  /** Number of pending mutations in the queue. */
  async queueSize(): Promise<number> {
    return (await keys() as string[]).filter(k => k.startsWith(IDB_PREFIX)).length;
  }

  /**
   * Flush all queued mutations to the BFF.
   * Called automatically on reconnect, or manually via flushNow().
   */
  async flush(): Promise<void> {
    if (this.isFlushing || !this.offline.isOnline()) return;
    this.isFlushing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) return;

      console.info(`[SyncQueue] Flushing ${queue.length} queued mutation(s)…`);

      for (const entry of queue) {
        await this.executeEntry(entry);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /** Manually trigger a flush (e.g., from UI "Sync Now" button). */
  flushNow(): Promise<void> {
    return this.flush();
  }

  private async executeEntry(entry: QueuedMutation): Promise<void> {
    // Drop entries that have exceeded retry limit
    if (entry.retries >= MAX_RETRIES) {
      console.warn(`[SyncQueue] Dropping ${entry.operationName} after ${MAX_RETRIES} retries`);
      await del(entry.id);
      return;
    }

    // Check JWT expiry — skip stale tokens rather than sending unauthorized requests
    if (this.isTokenExpired(entry.jwt)) {
      console.warn(`[SyncQueue] JWT expired for ${entry.operationName} — dropping entry`);
      await del(entry.id);
      return;
    }

    try {
      await this.http.post(
        environment.haBffUrl,
        { query: entry.query, variables: entry.variables, operationName: entry.operationName },
        { headers: new HttpHeaders({ Authorization: `Bearer ${entry.jwt}`, 'Content-Type': 'application/json' }) },
      ).toPromise();

      await del(entry.id);
      console.debug(`[SyncQueue] ✓ Replayed ${entry.operationName} (${entry.id})`);
    } catch (err) {
      // Increment retry count and persist back to IDB
      const updated: QueuedMutation = { ...entry, retries: entry.retries + 1 };
      await set(entry.id, updated);
      console.warn(`[SyncQueue] ✗ Failed ${entry.operationName} (retry ${updated.retries}/${MAX_RETRIES})`, err);
    }
  }

  /** Decode JWT payload and check exp claim without external libraries. */
  private isTokenExpired(jwt: string): boolean {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp ? Date.now() / 1000 > payload.exp : false;
    } catch {
      return true; // treat unparseable tokens as expired
    }
  }
}
