from pydantic import BaseModel, Field, field_validator
from pydantic_core import core_schema
from typing import List, Optional
from datetime import datetime
import uuid

# Custom ID class for DynamoDB (using UUID as an example)
class PyUUID(str):
    """
    Custom Pydantic type to handle UUID as a string.
    """
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        try:
            # Check if the value is a valid UUID
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError("Invalid UUID format")

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(str),
            serialization=core_schema.to_string_ser_schema(),
        )

# DocumentModel for DynamoDB
class DocumentModel(BaseModel):
    id: PyUUID = Field(default_factory=lambda: str(uuid.uuid4()), alias="document_id")
    filename: Optional[str] = Field(None, description="The name of the file")
    title: str = Field(..., description="The title of the document")
    creator: str = Field(..., description="The creator or author of the document")
    subject: Optional[str] = Field(None, description="The subject or topic of the document")
    description: Optional[str] = Field(None, description="A description of the document")
    publisher: Optional[str] = Field(None, description="The publisher of the document")
    contributor: Optional[str] = Field(None, description="Contributors to the document")
    date_: datetime = Field(..., description="The creation or publication date of the document")
    type_: Optional[str] = Field(None, description="The type of resource (e.g., text, image)")
    format_: Optional[str] = Field(None, description="The file format (e.g., PDF, DOCX)")
    identifier: str = Field(..., description="Unique identifier for the document")
    language_: Optional[str] = Field(None, description="Language of the document")
    rights: Optional[str] = Field(None, description="Rights information about the document")
    uploaded_by: str = Field(..., description="User who uploaded the document")
    modified_by: str = Field("", description="User who last modified the document")
    created_date: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the document was created")
    last_updated: Optional[datetime] = Field(None, description="Timestamp when the document was last updated")
    
    @field_validator("uploaded_by", mode="before")
    def validate_uploaded_by(cls, v):
        if isinstance(v, dict) and "sub" in v:
            return v["sub"]  # Extract 'sub' from dictionary
        elif isinstance(v, str):
            return v
        raise ValueError("Invalid format for uploaded_by. Expected a string or a dictionary with 'sub'.")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),  # Ensuring datetime is converted to ISO 8601 string
        }
        populate_by_name = True

# DocumentResponse for returning paginated results
class DocumentResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    results: List
