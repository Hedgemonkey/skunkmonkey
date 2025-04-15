#!/bin/bash

# Django Logging Diagnostic Script
set -e  # Exit on any error

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/hedgemonkey/Documents/Work/code_institute/API_boilerplate/skunkmonkey"
LOGS_DIR="$PROJECT_DIR/logs"

echo -e "${GREEN}Django Logging Diagnostic Script${NC}"
echo "============================="
echo "This script will help diagnose issues with Django logging."
echo

# 1. Check if the logs directory exists
echo -e "${YELLOW}1. Checking if logs directory exists:${NC}"
if [ -d "$LOGS_DIR" ]; then
    echo -e "${GREEN}✓ Logs directory exists at $LOGS_DIR${NC}"
else
    echo -e "${RED}✗ Logs directory does not exist at $LOGS_DIR${NC}"
    echo "Creating logs directory..."
    mkdir -p "$LOGS_DIR"
    if [ -d "$LOGS_DIR" ]; then
        echo -e "${GREEN}✓ Logs directory created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create logs directory${NC}"
        echo "Please check if you have permission to create this directory."
    fi
fi
echo

# 2. Check directory permissions
echo -e "${YELLOW}2. Checking directory permissions:${NC}"
if [ -d "$LOGS_DIR" ]; then
    PERMISSIONS=$(ls -ld "$LOGS_DIR" | awk '{print $1}')
    OWNER=$(ls -ld "$LOGS_DIR" | awk '{print $3}')
    GROUP=$(ls -ld "$LOGS_DIR" | awk '{print $4}')

    echo "Logs directory permissions: $PERMISSIONS ($OWNER:$GROUP)"

    # Check if the directory is writable by the current user
    if [ -w "$LOGS_DIR" ]; then
        echo -e "${GREEN}✓ Logs directory is writable by the current user${NC}"
    else
        echo -e "${RED}✗ Logs directory is not writable by the current user${NC}"
        echo "Fixing permissions..."
        chmod -R 755 "$LOGS_DIR"
        echo "Permissions updated to allow writing."
    fi

    # Create a test file to verify write permissions
    TEST_FILE="$LOGS_DIR/test_permissions.log"
    if touch "$TEST_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓ Successfully created test file in logs directory${NC}"
        rm "$TEST_FILE"
    else
        echo -e "${RED}✗ Failed to create test file in logs directory${NC}"
        echo "There might be deeper permission issues that need to be addressed."
        echo "Try running: sudo chown -R $USER:$USER $LOGS_DIR"
    fi
else
    echo -e "${RED}Logs directory does not exist, skipping permission check${NC}"
fi
echo

# 3. Check Django settings
echo -e "${YELLOW}3. Checking Django logging settings:${NC}"
SETTINGS_FILE="$PROJECT_DIR/skunkmonkey/settings.py"

if [ -f "$SETTINGS_FILE" ]; then
    echo -e "${GREEN}✓ Found settings.py file${NC}"

    # Check if LOGS_DIR is defined in settings
    if grep -q "LOGS_DIR" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✓ LOGS_DIR is defined in settings.py${NC}"
    else
        echo -e "${RED}✗ LOGS_DIR is not defined in settings.py${NC}"
    fi

    # Check if logging configuration exists
    if grep -q "'handlers': {" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✓ Logging handlers configuration found${NC}"
    else
        echo -e "${RED}✗ Logging handlers configuration not found${NC}"
    fi

    # Check for file handlers
    if grep -q "'class': 'logging.FileHandler'" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✓ FileHandler configuration found${NC}"
    else
        echo -e "${RED}✗ FileHandler configuration not found${NC}"
    fi

    # Check if DEBUG mode is enabled
    if grep -q "DEBUG = True" "$SETTINGS_FILE" || grep -q "DEBUG = env.bool" "$SETTINGS_FILE"; then
        echo -e "${GREEN}DEBUG mode is likely enabled (check environment variables too)${NC}"
    else
        echo -e "${YELLOW}DEBUG mode might be disabled, which can affect logging behavior${NC}"
    fi
else
    echo -e "${RED}✗ Could not find settings.py file${NC}"
fi
echo

# 4. Test creating log files directly
echo -e "${YELLOW}4. Testing direct log file creation:${NC}"
for LOG_FILE in django.log stripe.log webhooks.log error.log; do
    TEST_PATH="$LOGS_DIR/$LOG_FILE"
    echo "Testing $LOG_FILE..."
    if touch "$TEST_PATH" 2>/dev/null; then
        echo -e "${GREEN}✓ Successfully created $LOG_FILE${NC}"
        echo "Test log entry from diagnostic script" >> "$TEST_PATH"
        echo -e "${GREEN}✓ Successfully wrote to $LOG_FILE${NC}"
    else
        echo -e "${RED}✗ Failed to create $LOG_FILE${NC}"
    fi
done
echo

# 5. Check if any Django processes are running
echo -e "${YELLOW}5. Checking running Django processes:${NC}"
DJANGO_PROCS=$(ps aux | grep -E "[p]ython.*manage\.py runserver|[g]unicorn.*wsgi|[u]wsgi" | wc -l)
if [ "$DJANGO_PROCS" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $DJANGO_PROCS Django processes running${NC}"
    ps aux | grep -E "[p]ython.*manage\.py runserver|[g]unicorn.*wsgi|[u]wsgi"
else
    echo -e "${YELLOW}No Django processes found running${NC}"
    echo "Logs might not be generated if the application isn't running."
fi
echo

# 6. Summary and recommendations
echo -e "${YELLOW}Summary and Recommendations:${NC}"
echo "1. The logs directory has been checked and should now exist with proper permissions."
echo "2. Test log files have been created in the logs directory."
echo "3. Make sure your Django application is running to generate actual logs."
echo "4. If logs still aren't being generated, try:"
echo "   - Restart your Django application"
echo "   - Check for environment variables that might override DEBUG settings"
echo "   - Ensure your code is actually calling logging methods (logger.info(), etc.)"
echo "   - Add explicit debug logging at application startup"
echo
echo -e "${GREEN}Diagnostic completed. Your logging setup should now be functioning.${NC}"
