from app.models.logs_model import fetch_data_from_dynamodb, fetch_paginated_logs

def get_dashboard_data():
    """Generates the data needed for the dashboard."""
    df = fetch_data_from_dynamodb()

    trends = (
        df.groupby(["month_year", "action"])
        .size()
        .reset_index(name="count")
        .query("count > 0")
        .to_dict(orient="records")
    )

    max_views_per_year = (
        df.query("action == 'get_document_by_id'")
        .groupby("year")
        .size()
        .reset_index(name="count")
        .sort_values(["year", "count"], ascending=[True, False])
        .groupby("year")
        .first()
        .reset_index()
        .to_dict(orient="records")
    )

    heatmap = (
        df.groupby(["year", "month", "action"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
        .to_dict(orient="records")
    )

    return {
        "activity_trends": trends,
        "views_per_year": max_views_per_year,
        "heatmap_distribution": heatmap,
    }

def get_logs(page: int, page_size: int, sort_by: str, sort_order: str):
    """Handles fetching logs with pagination and sorting."""
    return fetch_paginated_logs(page, page_size, sort_by, sort_order)
