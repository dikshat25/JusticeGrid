from fastapi import BackgroundTasks
from typing import Callable, Any

class TaskRunner:
    def enqueue(self, background_tasks: BackgroundTasks, func: Callable, *args: Any, **kwargs: Any):
        """
        Abstracts the background task execution. 
        Can be swapped with Celery, Cloud Tasks, etc. later.
        """
        background_tasks.add_task(func, *args, **kwargs)

task_runner = TaskRunner()
