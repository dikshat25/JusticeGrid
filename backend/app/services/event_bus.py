class EventBus:
    def __init__(self):
        self.subscribers = {}

    def subscribe(self, event_name: str, callback):
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(callback)

    def publish(self, event_name: str, payload: dict):
        agent = payload.get('speaker', payload.get('agent_name', payload.get('case_id', 'unknown')))
        if event_name == "AgentCompleted":
            print(f"[EVENT BUS] Published {event_name}: {agent}")
        else:
            print(f"[EVENT BUS] Published {event_name}: {payload.get('case_id', 'unknown')}")
        if event_name in self.subscribers:
            for callback in self.subscribers[event_name]:
                try:
                    callback(event_name, payload)
                except Exception as e:
                    print(f"Error in subscriber: {e}")

event_bus = EventBus()
