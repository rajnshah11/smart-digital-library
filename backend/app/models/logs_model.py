import boto3
import pandas as pd
from fastapi import HTTPException

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('logs')

def fetch_data_from_dynamodb():
    """Fetches the latest logs from DynamoDB and returns them as a Pandas DataFrame."""
    paginator = boto3.client('dynamodb').get_paginator('scan')
    response_iterator = paginator.paginate(TableName='logs')

    items = []
    for page in response_iterator:
        items.extend(page.get('Items', []))
    if not items:
        raise HTTPException(status_code=404, detail="No logs found.")
    
    flattened_items = []
    for item in items:
        flattened_item = {key: list(value.values())[0] for key, value in item.items()}
        flattened_items.append(flattened_item)

    df = pd.DataFrame(flattened_items)

    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')

    df['month'] = df['timestamp'].dt.month
    df['year'] = df['timestamp'].dt.year
    df['month_year'] = df['timestamp'].dt.to_period('M').astype(str)

    return df

def fetch_paginated_logs(page: int, page_size: int, sort_by: str, sort_order: str):
    """Fetch logs from DynamoDB with pagination and sorting."""
    df = fetch_data_from_dynamodb()

    if sort_by not in df.columns:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by field: {sort_by}")

    df = df.sort_values(by=sort_by, ascending=(sort_order == "asc"))

    total_items = len(df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    if start_idx >= total_items:
        raise HTTPException(status_code=404, detail="Page number out of range.")

    paginated_data = df.iloc[start_idx:end_idx].to_dict(orient="records")

    return {
        "data": paginated_data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size,
        },
    }
