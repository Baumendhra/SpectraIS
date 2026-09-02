from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel as PydanticBaseModel, Field

DataType = TypeVar("DataType")


class ResponseSchema(PydanticBaseModel, Generic[DataType]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[DataType] = None


class PaginatedResponse(PydanticBaseModel, Generic[DataType]):
    items: List[DataType]
    total: int
    page: int
    size: int
    pages: int
