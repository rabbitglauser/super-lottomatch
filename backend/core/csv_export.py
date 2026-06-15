import csv
import io
from typing import Any

from core.config import GUEST_EXPORT_HEADERS
from core.formatting import format_export_bool, format_export_date


def csv_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def build_guest_export_csv(rows: list[Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", lineterminator="\n")
    writer.writerow(GUEST_EXPORT_HEADERS)

    for row in rows:
        writer.writerow(
            [
                csv_value(row.guest_code),
                csv_value(row.first_name),
                csv_value(row.last_name),
                csv_value(row.street),
                csv_value(row.house_number),
                csv_value(row.postal_code),
                csv_value(row.city),
                csv_value(row.phone),
                csv_value(row.email),
                format_export_bool(row.allow_email_marketing),
                format_export_bool(row.allow_post_marketing),
                csv_value(row.notes),
                format_export_date(row.last_participation),
                format_export_date(row.created_at),
            ]
        )

    return f"\ufeff{output.getvalue()}"
