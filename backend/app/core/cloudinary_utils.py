import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from typing import Optional

# Cloudinary is configured using environment variables. 
# We call config() just to be safe, it will read from os.environ
# if CLOUDINARY_URL is present, or we can explicitly pass them.
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dxynqm0zo"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "138947554359677"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "ZsGmnYdlXpsT8T4qWujqdxSYWuk")
)

async def upload_to_cloudinary_async(file: UploadFile, folder: str = "nsg_erp", resource_type: str = "auto") -> Optional[str]:
    """
    Asynchronously uploads a FastAPI UploadFile to Cloudinary.
    """
    try:
        content = await file.read()
        response = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type=resource_type,
            filename_override=file.filename,
            use_filename=True,
            unique_filename=True
        )
        await file.seek(0)
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary async upload error: {e}")
        return None

def upload_to_cloudinary_sync(file: UploadFile, folder: str = "nsg_erp", resource_type: str = "auto") -> Optional[str]:
    """
    Synchronously uploads a FastAPI UploadFile to Cloudinary.
    Use this for standard `def` endpoint functions.
    """
    try:
        content = file.file.read()
        response = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type=resource_type,
            filename_override=file.filename,
            use_filename=True,
            unique_filename=True
        )
        file.file.seek(0)
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary sync upload error: {e}")
        return None

def upload_bytes_to_cloudinary(content: bytes, filename: str, folder: str = "nsg_erp", resource_type: str = "auto") -> Optional[str]:
    """
    Uploads raw bytes to Cloudinary. Useful for generated PDFs/DOCXs.
    """
    try:
        response = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type=resource_type,
            filename_override=filename,
            use_filename=True,
            unique_filename=True
        )
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary bytes upload error: {e}")
        return None

def upload_base64_to_cloudinary(base64_string: str, folder: str = "nsg_erp", resource_type: str = "auto") -> Optional[str]:
    """
    Uploads a base64 data URI string to Cloudinary.
    """
    try:
        response = cloudinary.uploader.upload(
            base64_string,
            folder=folder,
            resource_type=resource_type
        )
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary base64 upload error: {e}")
        return None
