// Simple event bus for cross-component communication
type EventCallback = () => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  subscribe(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  publish(event: string): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback());
    }
  }

  unsubscribe(event: string, callback: EventCallback): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Event names
export const EVENTS = {
  SAVE_IMAGE: "save-image",
};
