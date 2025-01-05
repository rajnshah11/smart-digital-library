import boto3
import json
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection

# Replace with your region and OpenSearch endpoint
region = 'us-east-1'
host = 'https://search-mydocumentseach-7ffgecp3shly7rg7tdgviusvwa.us-east-1.es.amazonaws.com'
index_name = 'document_id'

# AWS credentials for signing requests
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, 'es', session_token=credentials.token)

# Initialize Elasticsearch client
es = Elasticsearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'REMOVE':
            # Handle delete operation
            id = record['dynamodb']['Keys']['id']['S']
            es.delete(index=index_name, id=id)
        else:
            # Handle insert/update operation
            document = {k: v[list(v.keys())[0]] for k, v in record['dynamodb']['NewImage'].items()}
            id = document['id']
            es.index(index=index_name, id=id, body=document)
    
    return {'statusCode': 200, 'body': json.dumps('Processed records')}