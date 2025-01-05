from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse
from app.models.document_model import DocumentModel
from typing import List, Optional
from datetime import datetime
import pandas as pd
import uuid
import boto3
from app.services.kafka_logger import kafka_logger
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from decimal import Decimal
from io import StringIO

# AWS S3 and DynamoDB initialization
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')
table = dynamodb.Table('documents')
BUCKET_NAME = "handnotes-management-bucket"

DUMMY_DATA = [
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc1",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Sample Document 1",
      "subject": "Education",
      "description": "A detailed description of the first document.",
      "contributor": "John Doe",
      "format_": "PDF",
      "rights": "Public",
      "language_": "English",
      "publisher": "OpenAI Press",
      "date_": "2023-12-01",
      "type_": "Report"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc2",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Sample Document 2",
      "subject": "Science",
      "description": "A detailed description of the second document.",
      "contributor": "Jane Smith",
      "format_": "HTML",
      "rights": "Restricted",
      "language_": "French",
      "publisher": "AI Research Lab",
      "date_": "2023-12-01",
      "type_": "Article"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc3",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Sample Document 3",
      "subject": "Technology",
      "description": "Details about advancements in AI technology.",
      "contributor": "Alice Johnson",
      "format_": "DOCX",
      "rights": "Public",
      "language_": "German",
      "publisher": "Tech World",
      "date_": "2023-12-01",
      "type_": "Whitepaper"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc4",
    "_source": {
      "document_id": "doc4",
      "title": "Document on Climate Change",
      "subject": "Environment",
      "description": "Exploration of climate change impacts.",
      "contributor": "Dr. Richard Brown",
      "format_": "PDF",
      "rights": "Public",
      "language_": "English",
      "publisher": "EcoScience",
      "date_": "2023-12-01",
      "type_": "Research Paper"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc5",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Sample Finance Report",
      "subject": "Finance",
      "description": "Analysis of market trends for 2023.",
      "contributor": "Finance Insights Team",
      "format_": "XLSX",
      "rights": "Confidential",
      "language_": "Spanish",
      "publisher": "Finance Daily",
      "date_": "2023-12-01",
      "type_": "Report"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc6",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Guide to Quantum Computing",
      "subject": "Computing",
      "description": "Comprehensive guide on quantum computing basics.",
      "contributor": "Quantum Experts Group",
      "format_": "EPUB",
      "rights": "Public",
      "language_": "Japanese",
      "publisher": "Quantum Today",
      "date_": "2023-12-01",
      "type_": "Guide"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc7",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Health and Wellness Report",
      "subject": "Health",
      "description": "Tips and research on improving health and wellness.",
      "contributor": "Wellness Team",
      "format_": "PDF",
      "rights": "Public",
      "language_": "English",
      "publisher": "Health Press",
      "date_": "2023-12-01",
      "type_": "Report"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc8",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Global Economic Outlook",
      "subject": "Economics",
      "description": "Forecast and trends in the global economy.",
      "contributor": "Global Markets Team",
      "format_": "PPTX",
      "rights": "Restricted",
      "language_": "Chinese",
      "publisher": "Economy Watch",
      "date_": "2023-12-01",
      "type_": "Presentation"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc9",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Artificial Intelligence Overview",
      "subject": "AI",
      "description": "Introduction to AI concepts and applications.",
      "contributor": "AI Innovators",
      "format_": "PDF",
      "rights": "Public",
      "language_": "Russian",
      "publisher": "AI Digest",
      "date_": "2023-12-01",
      "type_": "Whitepaper"
    }
  },
  {
    "_index": "document_id",
    "_type": "_doc",
    "_id": "doc10",
    "_source": {
      "document_id": "5ff81934-097a-42d9-82dd-1db31c9b01e7",
      "title": "Historical Perspectives on AI",
      "subject": "History",
      "description": "A review of AI development through history.",
      "contributor": "Historical Insights",
      "format_": "PDF",
      "rights": "Public",
      "language_": "English",
      "publisher": "History of Tech",
      "date_": "2023-12-01",
      "type_": "Review"
    }
  }
]
# Optional Elasticsearch initialization
"""
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, 'us-east-1', 'es', session_token=credentials.token)
es = Elasticsearch(
    hosts=[{'host': 'search-docuemnt-2abuawj6psdqqjzwdhfaba4iqm.us-east-1.es.amazonaws.com', 'port': 443}],
    http_auth=('admin', 'Password123$'),
    connection_class=RequestsHttpConnection,
    use_ssl=True,
    verify_certs=True
)
"""

def is_within_date_range(doc, date_from, date_to):
    """
    Helper function to check if a document is within the given date range.
    """
    if date_from:
        if datetime.fromisoformat(doc.get("date_")) < datetime.fromisoformat(date_from):
            return False
    if date_to:
        if datetime.fromisoformat(doc.get("date_")) > datetime.fromisoformat(date_to):
            return False
    return True

# Utility function to clean data types for DynamoDB compatibility
def clean_data_types(value):
    if isinstance(value, float):
        return Decimal(str(value))  
    elif isinstance(value, pd.Timestamp):
        return value.isoformat() 
    elif isinstance(value, dict):
        return {key: clean_data_types(val) for key, val in value.items()}
    elif isinstance(value, list):
        return [clean_data_types(item) for item in value]
    else:
        return value

async def upload_file_to_s3(file, document_id):
    """
    Upload file to S3 and return the new S3 key and version ID.
    """
    new_s3_key = f"{document_id}/{file.filename}"
    s3_client.upload_fileobj(file.file, BUCKET_NAME, new_s3_key, ExtraArgs={"Metadata": {"document_id": document_id}})
    response = s3_client.head_object(Bucket=BUCKET_NAME, Key=new_s3_key)
    new_version_id = response.get("VersionId")
    return new_s3_key, new_version_id


async def add_document_controller(current_user, metadata: dict, file: UploadFile):
    try:
        # Generate a unique document ID (UUID)
        document_id = str(uuid.uuid4())
        s3_key = f"{document_id}/{file.filename}"

        # Upload the file to S3
        s3_client.upload_fileobj(
            file.file,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={"Metadata": {"document_id": document_id}}
        )

        # Fetch the version ID of the uploaded object
        response = s3_client.head_object(Bucket=BUCKET_NAME, Key=s3_key)
        version_id = response.get('VersionId')
        # Prepare the document data to be stored in DynamoDB
        document_data = {
            "document_id": document_id,
            "filename": f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}",
            "version_id": version_id,
            "title": metadata["title"],  # Use square brackets
            "creator": metadata["creator"],  # Use square brackets
            "date_": metadata["date_"],  # Use square brackets
            "identifier": metadata["identifier"],  # Use square brackets
            "subject": metadata["subject"],  # Optional fields with .get()
            "description": metadata["description"],
            "publisher": metadata["publisher"],
            "contributor": metadata["contributor"],
            "type_": metadata["type_"],
            "format_": metadata["format_"],
            "language_": metadata["language_"],
            "rights": metadata["rights"],
            "created_date": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat(),  # Add 'last_updated' for future updates
            "versions": [],  # To track the versions of the document
            "uploaded_by": current_user['sub']
        }
        # Insert the document data into DynamoDB
        table.put_item(Item=document_data)

        # Log the document creation action using Kafka
        action_log = {
            "user": current_user["sub"],
            "action": "add_document",
            "document_id": document_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await kafka_logger.log_action(action_log) 

        # Return success message
        return {"message": "Document created successfully", "document_id": document_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")

async def update_document_controller(document_id: str, current_user, metadata_updates: dict, file: UploadFile = None):
    """
    Update an existing document's metadata or file in DynamoDB and S3.
    """
    try:
        # Fetch the current document metadata from DynamoDB
        response = table.get_item(Key={"document_id": document_id})
        document = response.get("Item")

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Prepare update data for the document version
        old_version = {
            "version_id": document["version_id"],
            "filename": document["filename"],
        }

        update_expression = "SET "
        expression_attribute_values = {}

        # Handle file upload if a new file is provided
        if file:
            old_s3_key = document['filename'].split(f"https://{BUCKET_NAME}.s3.amazonaws.com/")[1]
            new_s3_key, new_version_id = await upload_file_to_s3(file, document_id)
            update_expression += "filename = :filename, version_id = :version_id, "
            expression_attribute_values[":filename"] = f"https://{BUCKET_NAME}.s3.amazonaws.com/{new_s3_key}"
            expression_attribute_values[":version_id"] = new_version_id

        # Append old version to versions array
        table.update_item(
            Key={"document_id": document_id},
            UpdateExpression="SET versions = list_append(versions, :old_version)",
            ExpressionAttributeValues={":old_version": [old_version]},
            ReturnValues="ALL_NEW"
        )

        # Update metadata fields dynamically
        for field, value in metadata_updates.items():
            if value is not None:  # Only update if value is provided
                update_expression += f"{field} = :{field}, "
                expression_attribute_values[f":{field}"] = value

        # Add standard fields for update
        update_expression = update_expression.rstrip(", ")
        update_expression += ", modified_by = :modified_by, last_updated = :last_updated, created_date = :created_date"
        
        # Set additional values for standard fields
        expression_attribute_values[":modified_by"] = current_user["sub"]
        expression_attribute_values[":last_updated"] = datetime.utcnow().isoformat()
        expression_attribute_values[":created_date"] = document.get("created_date", datetime.utcnow().isoformat())

        # Perform DynamoDB update operation
        table.update_item(
            Key={"document_id": document_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        # Log document update using Kafka
        action_log = {
            "user": current_user["sub"],
            "action": "update_document",
            "document_id": document_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await kafka_logger.log_action(action_log)

        # Return success message
        return {"message": "Document updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")

async def get_document_by_id_controller(document_id: str, current_user):
    """
    Fetch a document by its ID from DynamoDB and return its metadata.
    """
    try:
        response = table.get_item(Key={"document_id": document_id})
        document = response.get("Item")
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Log the document retrieval action using Kafka
        action_log = {
            "user": current_user["sub"],
            "action": "get_document_by_id",
            "document_id": document_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await kafka_logger.log_action(action_log)

        return document

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch document: {str(e)}")


async def delete_document_controller(document_id: str, current_user):
    """
    Delete a document from DynamoDB and S3.
    """
    try:
        # Fetch the document metadata from DynamoDB
        response = table.get_item(Key={"document_id": document_id})
        document = response.get("Item")

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Extract the S3 key from the document metadata
        s3_key = document['filename'].split(f"https://{BUCKET_NAME}.s3.amazonaws.com/")[1]

        # Check if versioning is enabled on the S3 bucket
        versioning_status = s3_client.get_bucket_versioning(Bucket=BUCKET_NAME)
        if versioning_status.get('Status') != 'Enabled':
            raise HTTPException(status_code=400, detail="S3 Versioning is not enabled for this bucket")

        # Retrieve all versions of the object and delete them
        versions = s3_client.list_object_versions(Bucket=BUCKET_NAME, Prefix=s3_key)
        for version in versions.get('Versions', []):
            s3_client.delete_object(
                Bucket=BUCKET_NAME,
                Key=s3_key,
                VersionId=version['VersionId']
            )

        # Add delete marker to soft delete the object
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)

        # Log the document deletion action using Kafka
        action_log = {
            "user": current_user["sub"],
            "action": "delete_document",
            "document_id": document_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await kafka_logger.log_action(action_log)

        # Delete the document metadata from DynamoDB
        table.delete_item(Key={"document_id": document_id})

        # Return success message
        return JSONResponse(content={"message": "Document deleted successfully"})

    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTP exceptions directly

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

async def get_documents_controller(
    skip: int,
    limit: int,
    sort_by: Optional[str],
    order: Optional[str],
    search: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
):
    """""
    
    try:
        # Validate and set sort field
        sort_field = sort_by if sort_by in VALID_SORT_FIELDS else "date_"

        # Build Elasticsearch query
        query = {
            "query": {
                "bool": {
                    "must": [],
                    "filter": []
                }
            },
            "from": skip,
            "size": limit,
            "sort": [
                {sort_field: {"order": order or "asc", "missing": "_last"}}
            ]
        }

        # Full-text search query (if provided)
        if search:
            query["query"]["bool"]["must"].append({
                "multi_match": {
                    "query": search,
                    "fields": [
                        "title", "description", "contributor", 
                        "format_", "language_", 
                        "publisher"
                    ]
                }
            })
        # Add date range filter
        if date_from and date_to:
                if datetime.fromisoformat(date_from) > datetime.fromisoformat(date_to):
                    raise HTTPException(
                        status_code=400,
                        detail="The 'to_date' must be greater than or equal to 'from_date'."
                    )
        if date_from or date_to:
            date_filter = {"range": {"date_": {}}}
            if date_from:
                date_filter["range"]["date_"]["gte"] = date_from
            if date_to:
                date_filter["range"]["date_"]["lte"] = date_to
            query["query"]["bool"]["filter"].append(date_filter)


        # Execute query on Elasticsearch
        response = es.search(index="document_id", body=query)

        # Extract results and total count
        total_count = response["hits"]["total"]["value"]
        documents = response["hits"]["hits"]
    """
    try:
        VALID_SORT_FIELDS = {"document_id", "title", "date_"}
    # Validate sort field
        sort_field = sort_by if sort_by in VALID_SORT_FIELDS else "date_"
        # Extract source data
        data = [doc["_source"] for doc in DUMMY_DATA]
        # Full-text search
        if search:
            data = [
                doc for doc in data if search.lower() in (
                    doc.get("title", "").lower() +
                    doc.get("description", "").lower() +
                    doc.get("contributor", "").lower() +
                    doc.get("subject", "").lower() +
                    doc.get("format_", "").lower() +
                    doc.get("language_", "").lower() +
                    doc.get("publisher", "").lower()
                )
            ]

        if date_from and date_to:
                if datetime.fromisoformat(date_from) > datetime.fromisoformat(date_to):
                    raise HTTPException(
                        status_code=400,
                        detail="The 'to_date' must be greater than or equal to 'from_date'."
                    )
        # Date range filtering
        if date_from or date_to:
            def is_within_date_range(doc):
                doc_date = datetime.fromisoformat(doc["date_"])
                if date_from and doc_date < datetime.fromisoformat(date_from):
                    return False
                if date_to and doc_date > datetime.fromisoformat(date_to):
                    return False
                return True

            data = [doc for doc in data if is_within_date_range(doc)]

        # Sorting
        data.sort(
            key=lambda doc: doc.get(sort_field),
            reverse=(order == "desc")
        )

        # Pagination
        paginated_data = data[skip: skip + limit]

        return {
            "total_count": len(data),
            "page": skip // limit + 1,
            "page_size": limit,
            "results": paginated_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")


async def process_bulk_upload(file: UploadFile, current_user) -> int:
    try:
        # Determine the file type based on its extension
        if file.filename.endswith(".csv"):
            file.file.seek(0)
            content = file.file.read().decode("utf-8")
            df = pd.read_csv(StringIO(content))
        elif file.filename.endswith((".xls", ".xlsx")):
            file.file.seek(0)
            df = pd.read_excel(file.file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a CSV or Excel file."
            )

        # Validate required columns in the DataFrame
        required_columns = {"title", "creater", "description", "publisher", "contributor",
                            "date_", "type_", "format_", "language_", "rights"}
        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"File is missing required columns: {', '.join(missing_columns)}"
            )

        # Prepare documents for insertion into DynamoDB
        documents = []
        for _, row in df.iterrows():
            document_id = str(uuid.uuid4())

            document = {
                "document_id": document_id,
                "title": row.get("title", ""),
                "creater": row.get("creater", ""),
                "description": row.get("description", ""),
                "publisher": row.get("publisher", ""),
                "contributor": row.get("contributor", ""),
                "date_": row.get("date_", ""),
                "type_": row.get("type_", ""),
                "format_": row.get("format_", ""),
                "language_": row.get("language_", ""),
                "rights": row.get("rights", ""),
                "identifier": str(uuid.uuid4()),
                "uploaded_by": current_user["sub"],
                "modified_by": "",
                "created_date": datetime.utcnow().isoformat(),
                "last_updated": None,
            }

            # Clean data types for DynamoDB compatibility
            document = clean_data_types(document)

            action_log = {
                "user": current_user["sub"],
                "action": "bulk_upload_document",
                "document_id": document_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            await kafka_logger.log_action(action_log)

            documents.append(document)

        # Use DynamoDB's BatchWriteItem for bulk insertion
        with table.batch_writer() as batch:
            for document in documents:
                batch.put_item(Item=document)

        return len(documents)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process bulk upload: {str(e)}")
