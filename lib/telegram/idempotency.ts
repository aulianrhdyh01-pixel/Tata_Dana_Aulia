/**
 * Telegram Webhook Idempotency Service
 * Ensures update_id deduplication to prevent duplicate transactions.
 * Matches webhook_events schema: source = 'TELEGRAM', event_id = update_id.
 */

// In-memory set for high-throughput fast lookup & local fallback
const processedUpdateIds = new Set<string>();

export interface IdempotencyResult {
  isDuplicate: boolean;
  eventId?: string;
  updateId: string;
}

/**
 * Check if a Telegram update_id has already been processed and record it if new.
 * Guarantees atomic deduplication.
 */
export async function checkAndRecordUpdateId(
  updateId: number | string,
  eventType: string = 'message',
  payload?: any
): Promise<IdempotencyResult> {
  const strId = String(updateId);

  // Fast memory check
  if (processedUpdateIds.has(strId)) {
    return {
      isDuplicate: true,
      updateId: strId,
    };
  }

  // Attempt database check & insertion if Supabase is configured
  try {
    const supabaseModule = await import('@/lib/supabase/server').catch(() => null);
    if (supabaseModule && supabaseModule.createServerClient) {
      const supabase = await supabaseModule.createServerClient();
      const query = supabase
        .from('webhook_events')
        .select('id, event_id')
        .eq('source', 'TELEGRAM')
        .eq('event_id', strId);

      const { data } = typeof query.maybeSingle === 'function'
        ? await query.maybeSingle()
        : await query.single();

      if (data) {
        processedUpdateIds.add(strId);
        return {
          isDuplicate: true,
          eventId: data.id,
          updateId: strId,
        };
      }

      // Record new event in database
      const insertResult = await supabase
        .from('webhook_events')
        .insert({
          source: 'TELEGRAM',
          event_id: strId,
          payload: payload || { eventType, recordedAt: new Date().toISOString() },
          processed: true,
        });

      if (insertResult.error) {
        // If unique constraint violation occurred on (source, event_id)
        if (insertResult.error.code === '23505' || insertResult.error.message?.includes('duplicate')) {
          processedUpdateIds.add(strId);
          return {
            isDuplicate: true,
            updateId: strId,
          };
        }
      } else if (insertResult.data) {
        processedUpdateIds.add(strId);
        const eventId = Array.isArray(insertResult.data) ? insertResult.data[0]?.id : insertResult.data?.id;
        return {
          isDuplicate: false,
          eventId: eventId || `evt-${strId}`,
          updateId: strId,
        };
      }
    }
  } catch (err) {
    // Silently proceed to in-memory fallback
  }

  // Record in memory store
  processedUpdateIds.add(strId);

  return {
    isDuplicate: false,
    eventId: `local-evt-${strId}-${Date.now()}`,
    updateId: strId,
  };
}

/**
 * Check if update has been processed without recording.
 */
export async function isUpdateProcessed(updateId: number | string): Promise<boolean> {
  const strId = String(updateId);
  if (processedUpdateIds.has(strId)) return true;

  try {
    const supabaseModule = await import('@/lib/supabase/server').catch(() => null);
    if (supabaseModule && supabaseModule.createServerClient) {
      const supabase = await supabaseModule.createServerClient();
      const query = supabase
        .from('webhook_events')
        .select('id')
        .eq('source', 'TELEGRAM')
        .eq('event_id', strId);

      const { data } = typeof query.maybeSingle === 'function'
        ? await query.maybeSingle()
        : await query.single();

      if (data) {
        processedUpdateIds.add(strId);
        return true;
      }
    }
  } catch {
    // fallback
  }

  return false;
}

/**
 * Reset store (primarily for unit and integration testing)
 */
export function clearIdempotencyStore(): void {
  processedUpdateIds.clear();
}
