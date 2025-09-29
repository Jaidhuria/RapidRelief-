import sqlite3
import os
from uuid import uuid4

BASE_DIR = os.path.dirname(__file__)
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
if not os.path.isdir(INSTANCE_DIR):
    os.makedirs(INSTANCE_DIR, exist_ok=True)

DB_FILE = os.path.join(INSTANCE_DIR, "main.db")


def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    schema_path = os.path.join(BASE_DIR, "init-db.sql")
    with open(schema_path, "r") as f:
        sql = f.read()
    conn = get_connection()
    conn.executescript(sql)
    conn.commit()
    conn.close()


def new_id():
    return str(uuid4())













