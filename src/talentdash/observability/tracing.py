"""Request and pipeline run tracing utilities."""

import uuid
from contextvars import ContextVar

run_id_var: ContextVar[str | None] = ContextVar("run_id", default=None)
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


def new_run_id() -> str:
    return str(uuid.uuid4())


def new_request_id() -> str:
    return str(uuid.uuid4())


def bind_run_id(run_id: str) -> None:
    run_id_var.set(run_id)


def bind_request_id(request_id: str) -> None:
    request_id_var.set(request_id)


def get_run_id() -> str | None:
    return run_id_var.get()


def get_request_id() -> str | None:
    return request_id_var.get()
