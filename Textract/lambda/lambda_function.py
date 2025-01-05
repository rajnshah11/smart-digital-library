import boto3
import pymongo
import json
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# MongoDB connection string (replace with your own)
mongo_client = pymongo.MongoClient("mongodb+srv://rajnshah:rajshah@cluster0.jsbcp.mongodb.net/?retryWrites=true&w=majority")
db = mongo_client["learning_library"]
collection = db["notes"]

def lambda_handler(event, context):
    logger.info("Lambda function triggered with event: %s", json.dumps(event))
    
    textract_client = boto3.client('textract')

    try:
        for record in event['Records']:
            bucket_name = record['s3']['bucket']['name']
            file_key = record['s3']['object']['key']
            
            # Retrieve `document_id` from S3 object metadata
            s3_client = boto3.client('s3')
            object_metadata = s3_client.head_object(Bucket=bucket_name, Key=file_key)['Metadata']
            document_id = object_metadata.get("document_id")
            
            if not document_id:
                raise ValueError("Document ID not found in S3 metadata")
            
            logger.info("Processing file from bucket: %s, key: %s, document_id: %s", bucket_name, file_key, document_id)

            # Call Textract to analyze the document
            response = textract_client.analyze_document(
                Document={'S3Object': {'Bucket': bucket_name, 'Name': file_key}},
                FeatureTypes=["TABLES", "FORMS"]
            )
            
            # Extract text from Textract response
            extracted_text_blocks = response['Blocks']
            extracted_texts = [block['Text'] for block in extracted_text_blocks if block['BlockType'] == 'LINE']
            extracted_text_str = "\n".join(extracted_texts)
            
            logger.info("Extracted text: %s", extracted_text_str)

            # Update existing MongoDB document with extracted text using `document_id`
            result = collection.update_one(
                {"_id": document_id},
                {"$set": {"text": extracted_text_str}}
            )
            
            if result.matched_count == 0:
                raise ValueError(f"No matching document found for ID {document_id}")
            
            logger.info("Document updated in MongoDB for ID %s", document_id)

    except Exception as e:
        logger.error("Error processing file: %s", str(e))
        raise

    return {
        'statusCode': 200,
        'body': json.dumps('Text extraction complete!')
    }
