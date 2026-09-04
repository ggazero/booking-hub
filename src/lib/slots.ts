export const SLOTS = ['오전', '오후-1', '오후-2'] as const;
export type Slot = typeof SLOTS[number];

export const NEED: Record<string, number> = {
  서울: 1,
  내부: 1,
  경기: 2,
  지방: 3,
};

export function requiredSlots(kind: string, wanted: Slot[]): Slot[] {
  if (!NEED[kind]) return wanted;

  const needCount = NEED[kind];

  if (needCount === 1) {
    return wanted;
  }

  if (needCount === 2) {
    const adjacent: Record<Slot, Slot[]> = {
      '오전': ['오전', '오후-1'],
      '오후-1': ['오후-1', '오후-2'],
      '오후-2': ['오후-1', '오후-2'],
    };
    if (wanted.length > 0) {
      return adjacent[wanted[0]];
    }
    return [];
  }

  if (needCount === 3) {
    return SLOTS.slice();
  }

  return wanted;
}

export function occupied(date: string, bookings: any[]): Set<Slot> {
  const result = new Set<Slot>();

  bookings.forEach((booking) => {
    if (booking.date === date && booking.slot_assigned) {
      const slots = booking.slot_assigned.split(',').map((s: string) => s.trim() as Slot);
      slots.forEach((slot: Slot) => result.add(slot));
    }
  });

  return result;
}
