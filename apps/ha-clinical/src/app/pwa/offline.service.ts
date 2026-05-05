import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

/**
 * OfflineService
 *
 * Monitors network connectivity for field clinicians operating in areas
 * with intermittent connectivity (e.g., rural health units, barangay sites).
 *
 * Exposes:
 *  - isOnline$  : Observable<boolean> — emits on every status change
 *  - isOnline() : synchronous snapshot
 */
@Injectable({ providedIn: 'root' })
export class OfflineService implements OnDestroy {
  private readonly _online$ = new BehaviorSubject<boolean>(navigator.onLine);

  readonly isOnline$: Observable<boolean> = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(distinctUntilChanged());

  constructor() {
    // Keep BehaviorSubject in sync so isOnline() stays accurate
    this.isOnline$.subscribe(status => this._online$.next(status));
  }

  /** Synchronous snapshot of current connectivity. */
  isOnline(): boolean {
    return this._online$.value;
  }

  /** Stream of connectivity changes only (no initial emit). */
  get changes$(): Observable<boolean> {
    return this.isOnline$;
  }

  ngOnDestroy() {
    this._online$.complete();
  }
}
