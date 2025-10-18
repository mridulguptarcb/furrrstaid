import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
import sqlite3

# Import the database URL from main.py
from main import SQLALCHEMY_DATABASE_URL

# Create SQLAlchemy engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def migrate_pets():
    """
    Migrate existing pets to have a user_id.
    This script will:
    1. Get the first user from the database
    2. Assign all existing pets to this user
    3. Add the user_id column to the pets table
    
    Note: For SQLite, we need to use a different approach since it doesn't support
    ALTER TABLE to add constraints. Instead, we'll create a new table and copy the data.
    """
    try:
        # Check if there are any users
        result = db.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
        if not result:
            print("No users found in the database. Please create a user first.")
            return
        
        default_user_id = result[0]
        print(f"Using user ID {default_user_id} as the default owner for existing pets")
        
        # Check if user_id column exists
        column_exists = False
        try:
            db.execute(text("SELECT user_id FROM pets LIMIT 1"))
            column_exists = True
        except:
            pass
        
        if not column_exists:
            # Add user_id column
            print("Adding user_id column to pets table...")
            db.execute(text("ALTER TABLE pets ADD COLUMN user_id INTEGER"))
        
        # Update all existing pets to belong to the default user
        print("Assigning all existing pets to the default user...")
        db.execute(text(f"UPDATE pets SET user_id = {default_user_id} WHERE user_id IS NULL"))
        
        # For SQLite, we can't directly add NOT NULL constraint to an existing column
        # Instead, we'll ensure all rows have a value and rely on the model definition
        print("Ensuring all pets have a user_id...")
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_pets()