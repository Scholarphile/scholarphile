"""Content management endpoints"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class Subject(BaseModel):
    id: str
    slug: str
    title: str
    description: str | None = None
    icon: str | None = None


class Course(BaseModel):
    id: str
    subject_id: str
    slug: str
    title: str
    description: str | None = None
    level: str | None = None


# Placeholder data - will be replaced with database
SUBJECTS = [
    Subject(id="math", slug="math", title="Mathematics", description="Core mathematics topics", icon="📐"),
    Subject(id="physics", slug="physics", title="Physics", description="Physics and mechanics", icon="⚛️"),
    Subject(id="cs", slug="cs", title="Computer Science", description="Programming and algorithms", icon="💻"),
]

COURSES = [
    Course(id="calc", subject_id="math", slug="calculus", title="Calculus I & II", level="intermediate"),
    Course(id="diffeq", subject_id="math", slug="differential-equations", title="Differential Equations", level="intermediate"),
    Course(id="linalg", subject_id="math", slug="linear-algebra", title="Linear Algebra", level="intermediate"),
]


@router.get("/subjects", response_model=List[Subject])
async def get_subjects():
    """Get all subjects"""
    return SUBJECTS


@router.get("/subjects/{subject_slug}/courses", response_model=List[Course])
async def get_courses(subject_slug: str):
    """Get courses for a subject"""
    courses = [c for c in COURSES if c.subject_id == subject_slug or 
               any(s.slug == subject_slug for s in SUBJECTS if s.id == c.subject_id)]
    return courses


@router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get course details"""
    course = next((c for c in COURSES if c.id == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

