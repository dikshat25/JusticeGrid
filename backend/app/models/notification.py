from pydantic import BaseModel

class NotificationModel(BaseModel):
    id: str
    title: str
    message: str
    date: str
    read: bool
