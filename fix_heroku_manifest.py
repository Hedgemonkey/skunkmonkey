#!/usr/bin/env python
"""
Script to fix the manifest.json issue in Heroku.
This script ensures the manifest.json file has the correct entry point
that django-vite is looking for.
"""
import json
import logging
import os
import shutil
import sys
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize environment
BASE_DIR = Path(__file__).resolve().parent


def fix_manifest():
    """
    Fix the manifest.json file by ensuring it has the correct entry point.
    Django-vite is looking for "main" as the entry point.
    """
    # Check for manifest.json in staticfiles directory first, then static
    manifest_paths = [
        os.path.join(BASE_DIR, 'staticfiles', 'manifest.json'),
        os.path.join(BASE_DIR, 'static', 'manifest.json')
    ]

    manifest_path = None
    for path in manifest_paths:
        if os.path.exists(path):
            manifest_path = path
            logger.info(f"Found manifest.json at: {manifest_path}")
            break

    if not manifest_path:
        logger.error("manifest.json not found in staticfiles or static directories")
        return False

    # Create backup of original manifest.json
    backup_path = manifest_path + ".backup"
    try:
        shutil.copyfile(manifest_path, backup_path)
        logger.info(f"Created backup of manifest.json at {backup_path}")
    except Exception as e:
        logger.error(f"Failed to create backup: {str(e)}")

    # Read the manifest file
    try:
        with open(manifest_path, 'r') as f:
            manifest_content = f.read()

        # Parse to verify it's valid JSON
        try:
            manifest_data = json.loads(manifest_content)
            logger.info(f"Loaded manifest.json with {len(manifest_data)} entries")

            # Check if it already has a "main" entry
            if "main" in manifest_data:
                logger.info("'main' entry already exists in manifest.json")
                print_entry_points(manifest_data)
                return True

            # Find potential entry points to use
            entry_points = list(manifest_data.keys())
            if not entry_points:
                logger.error("No entry points found in manifest.json")
                return False

            # Find specific entry points like "frontend/src/core/js/main.js" or similar
            main_entry = None
            for entry in entry_points:
                if "main.js" in entry or "index.js" in entry:
                    main_entry = entry
                    break

            # If no specific main.js found, use the first entry point
            if main_entry is None:
                main_entry = entry_points[0]
                logger.info(f"No main.js found, using first entry point: {main_entry}")
            else:
                logger.info(f"Found main entry point: {main_entry}")

            # Create "main" entry that points to the same file/imports as the main_entry
            manifest_data["main"] = manifest_data[main_entry]

            # Write updated manifest file
            with open(manifest_path, 'w') as f:
                json.dump(manifest_data, f)

            logger.info("Updated manifest.json with 'main' entry")
            print_entry_points(manifest_data)
            return True

        except json.JSONDecodeError:
            logger.error("Invalid manifest.json - not valid JSON")
            return False

    except Exception as e:
        logger.error(f"Error reading/writing manifest.json: {str(e)}")
        return False


def print_entry_points(manifest_data):
    """Print the entry points in the manifest.json file"""
    logger.info("\nManifest entry points:")
    for entry in manifest_data.keys():
        logger.info(f"- {entry}")
        # Show file it points to if available
        if "file" in manifest_data[entry]:
            logger.info(f"  → {manifest_data[entry]['file']}")


if __name__ == "__main__":
    logger.info("Starting manifest.json fix")
    if fix_manifest():
        logger.info("Successfully fixed manifest.json")
        sys.exit(0)
    else:
        logger.error("Failed to fix manifest.json")
        sys.exit(1)
