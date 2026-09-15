import { createHash } from 'node:crypto';
export const GENESIS_HASH = '0'.repeat(64);
export function eventPayload(event) {
  return JSON.stringify({ sequenceNo: event.sequence_no, eventType: event.event_type, eventDate: new Date(event.event_date).toISOString(), location: event.location || '', details: event.details, actorName: event.actor_name });
}
export function hashEvent(previousHash, event) { return createHash('sha256').update(`${previousHash}|${eventPayload(event)}`).digest('hex'); }
export function verifyChain(events) {
  let previous = GENESIS_HASH;
  const problems = [];
  for (const event of events) {
    const expected = hashEvent(previous, event);
    if (event.previous_hash !== previous) problems.push(`Event ${event.sequence_no}: previous hash link is invalid`);
    if (event.current_hash !== expected) problems.push(`Event ${event.sequence_no}: content hash does not match`);
    previous = event.current_hash;
  }
  return { valid: problems.length === 0, checkedEvents: events.length, problems };
}
