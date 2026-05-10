const NEW_ARRIVALS_WINDOW_DAYS = 14;

interface NewArrivalRuleInput {
  isHot?: boolean;
  showInNewArrivalsManual?: boolean;
  createdAt?: string | null;
}

export function hasNewLabel(label?: string) {
  return label?.trim().toLowerCase() === "novo";
}

export function isWithinNewArrivalsWindow(createdAt?: string | null, now = new Date()) {
  if (!createdAt) return false;

  const createdAtDate = new Date(createdAt);
  if (Number.isNaN(createdAtDate.getTime())) return false;

  const diffMs = now.getTime() - createdAtDate.getTime();
  const windowMs = NEW_ARRIVALS_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return diffMs <= windowMs;
}

export function matchesNewArrivalRule(input: NewArrivalRuleInput, now = new Date()) {
  if (input.isHot) return true;
  if (input.showInNewArrivalsManual) return true;
  return isWithinNewArrivalsWindow(input.createdAt, now);
}
