import os
import sqlite3

db_path = os.path.abspath('db.sqlite3')
print(f"Absolute path to database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check Category table
try:
    cursor.execute("SELECT * FROM category_category")
    rows = cursor.fetchall()
    print(f"\nFound {len(rows)} records in category_category:")
    for row in rows:
        print(f"  - ID: {row[0]}, Name: {row[1]}")
except Exception as e:
    print(f"Error reading category_category: {e}")

conn.close()
