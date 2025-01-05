from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from typing import List, Optional
import uuid
from app.controllers.auth_controller import check_role
from app.core.security import get_current_user
from app.controllers.document_controller import (
    add_document_controller,
    get_documents_controller,
    update_document_controller,
    delete_document_controller,
    get_document_by_id_controller,
    process_bulk_upload,
)
from app.models.document_model import DocumentResponse

# Router instance
router = APIRouter()

# Dependency to check if the user is an admin
async def is_admin(current_user: dict = Depends(get_current_user)):
    await check_role(current_user, required_role="admin")
    return current_user


@router.post("/add-document", response_description="Add a new document", status_code=status.HTTP_201_CREATED)
async def add_document(
    current_user: dict = Depends(is_admin),
    title: str = Form(...),
    creator: str = Form(...),
    date_: str = Form(...),
    subject: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    publisher: Optional[str] = Form(None),
    contributor: Optional[str] = Form(None),
    type_: Optional[str] = Form(None),
    format_: Optional[str] = Form(None),
    language_: Optional[str] = Form(None),
    rights: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    metadata = {
        "title": title,
        "creator": creator,
        "date_": date_,
        "identifier": str(uuid.uuid4()),
        "subject": subject,
        "description": description,
        "publisher": publisher,
        "contributor": contributor,
        "type_": type_,
        "format_": format_,
        "language_": language_,
        "rights": rights,
    }
    return await add_document_controller(current_user, metadata, file)


@router.post("/bulk-upload", response_description="Bulk upload documents", status_code=status.HTTP_201_CREATED)
async def bulk_upload(
    file: UploadFile = File(...), 
    current_user: dict = Depends(is_admin)
):
    """
    Bulk upload documents from a CSV file.
    """
    result = await process_bulk_upload(file=file, current_user=current_user)
    return {"message": f"{result} documents uploaded successfully."}


@router.put("/update-document/{document_id}", response_description="Update document", status_code=status.HTTP_200_OK)
async def update_document(
    document_id: str,
    current_user: dict = Depends(is_admin),
    title: Optional[str] = Form(None),
    creator: Optional[str] = Form(None),
    date_: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    publisher: Optional[str] = Form(None),
    contributor: Optional[str] = Form(None),
    type_: Optional[str] = Form(None),
    format_: Optional[str] = Form(None),
    language_: Optional[str] = Form(None),
    rights: Optional[str] = Form(None),
    file: UploadFile = File(None),
):
    metadata_updates = {
        "title": title,
        "creator": creator,
        "date_": date_,
        "subject": subject,
        "description": description,
        "publisher": publisher,
        "contributor": contributor,
        "type_": type_,
        "format_": format_,
        "language_": language_,
        "rights": rights,
    }
    return await update_document_controller(document_id, current_user, metadata_updates, file)

@router.delete("/delete-document/{document_id}", response_description="Delete document", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, current_user: dict = Depends(is_admin)):
    await delete_document_controller(document_id, current_user)
    return {"message": "Document deleted successfully"}


@router.get("/get-document/{document_id}", response_description="Get document by ID", status_code=status.HTTP_200_OK)
async def get_document_by_id(document_id: str, current_user: dict = Depends(get_current_user)):
    document = await get_document_by_id_controller(document_id, current_user)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )
    return document


@router.get("/get-documents", response_model=DocumentResponse, status_code=status.HTTP_200_OK)
async def get_documents(
    skip: int = Query(0, ge=0, description="Number of documents to skip for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Number of documents to return (max 100)"),
    search: Optional[str] = Query(None, description="Search term for title or description"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    sort_by: Optional[str] = Query("date_", description="Field to sort by (e.g., 'date', 'title')"),
    order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order ('asc' or 'desc')"),
):
    return await get_documents_controller(
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )