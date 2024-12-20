from sqlalchemy.dialects.mysql import MEDIUMTEXT
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    language = db.Column(db.String(3), nullable=False, default="en")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    video_url = db.Column(db.String(300), nullable=False)
    language = db.Column(db.String(3), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))