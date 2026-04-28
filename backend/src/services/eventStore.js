class EventStore {
  constructor() {
    this.events = new Map();
    this.providerHealth = new Map();
    this.lastIngestedAt = null;
  }

  upsertEvents(events = []) {
    for (const event of events) {
      this.events.set(event.id, event);
    }

    if (events.length > 0) {
      this.lastIngestedAt = new Date().toISOString();
    }

    return this.events.size;
  }

  getEvents() {
    return [...this.events.values()].sort(
      (a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime()
    );
  }

  hasEvents() {
    return this.events.size > 0;
  }

  setProviderHealth(providerName, { error = null, lastSync = null } = {}) {
    this.providerHealth.set(providerName, {
      provider: providerName,
      lastSync,
      error
    });
  }

  getProviderHealth() {
    return [...this.providerHealth.values()];
  }

  getLastIngestedAt() {
    return this.lastIngestedAt;
  }
}

export default EventStore;
