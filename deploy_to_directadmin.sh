#!/bin/bash
# Script to selectively deploy Django project to DirectAdmin

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting DirectAdmin Deployment ===${NC}"

# DirectAdmin connection settings
SSH_PORT=53667
REMOTE_USER="hedgemonkey"
REMOTE_HOST="spiralcorp.co.uk"
PROJECT_DIR="/home/hedgemonkey/Documents/Work/code_institute/API_boilerplate/skunkmonkey"
REMOTE_PROJECT_DIR="~/domains/skunkmonkey.co.uk/dev"
REMOTE_PUBLIC_HTML_DIR="~/domains/skunkmonkey.co.uk/public_html/dev"

# SSH options to avoid password prompts
SSH_OPTIONS="-p $SSH_PORT -o ControlMaster=auto -o ControlPath=/tmp/ssh_mux_%h_%p_%r -o ControlPersist=1h"
SCP_OPTIONS="-P $SSH_PORT -o ControlMaster=auto -o ControlPath=/tmp/ssh_mux_%h_%p_%r -o ControlPersist=1h"
RSYNC_SSH="ssh $SSH_OPTIONS"

# Create SSH control socket for connection sharing
echo -e "${GREEN}Setting up SSH connection sharing (enter password once)...${NC}"
ssh $SSH_OPTIONS -M -f -N $REMOTE_USER@$REMOTE_HOST
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to establish SSH connection. Check your credentials.${NC}"
  exit 1
fi

# Step 1: Create directories on the remote server
echo -e "${GREEN}Creating directory structure on server...${NC}"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PROJECT_DIR"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PUBLIC_HTML_DIR"

# Step 2: Copy passenger_wsgi.py to both locations
echo -e "${GREEN}Copying passenger_wsgi.py files...${NC}"
scp $SCP_OPTIONS $PROJECT_DIR/passenger_wsgi.py $REMOTE_USER@$REMOTE_HOST:$REMOTE_PUBLIC_HTML_DIR/
scp $SCP_OPTIONS $PROJECT_DIR/passenger_wsgi_project.py $REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_DIR/passenger_wsgi.py

# Step 3: Create directories for static and media files
echo -e "${GREEN}Creating static and media directories...${NC}"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PROJECT_DIR/staticfiles"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PROJECT_DIR/media"

# Step 4: Create symlinks from public_html to static and media
echo -e "${GREEN}Creating symbolic links for static and media files...${NC}"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "ln -sf $REMOTE_PROJECT_DIR/staticfiles $REMOTE_PUBLIC_HTML_DIR/static"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "ln -sf $REMOTE_PROJECT_DIR/media $REMOTE_PUBLIC_HTML_DIR/media"

# Step 5: Transfer essential project files (excluding development files)
echo -e "${GREEN}Transferring essential project files...${NC}"

# Create a temporary exclude list
EXCLUDE_FILE=$(mktemp)

cat > $EXCLUDE_FILE << EOL
.git*
.venv*
.vscode*
__pycache__
*.pyc
*.pyo
*.pyd
.DS_Store
*.sqlite3
*.log
.env
node_modules
cleanup_*.sh
test_*.py
*.md
fix_*.sh
staticfiles/
media/
EOL

# Transfer only essential files using rsync with exclusion list
rsync -avz --exclude-from=$EXCLUDE_FILE -e "$RSYNC_SSH" \
    $PROJECT_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_DIR/

# Clean up temporary file
rm $EXCLUDE_FILE

# Set appropriate permissions
echo -e "${GREEN}Setting file permissions...${NC}"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "chmod +x $REMOTE_PROJECT_DIR/manage.py"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "chmod +x $REMOTE_PROJECT_DIR/passenger_wsgi.py"
ssh $SSH_OPTIONS $REMOTE_USER@$REMOTE_HOST "chmod +x $REMOTE_PUBLIC_HTML_DIR/passenger_wsgi.py"

echo -e "${YELLOW}=== Deployment Completed ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up Python App in DirectAdmin with these environment variables:"
echo "   - DJANGO_SETTINGS_MODULE=skunkmonkey.settings"
echo "   - DJANGO_SECRET_KEY=your-secret-key-here"
echo "   - DEBUG=False"
echo "   - DATABASE_ENGINE=django.db.backends.mysql"
echo "   - DATABASE_NAME=your_db_name"
echo "   - DATABASE_USER=your_db_user"
echo "   - DATABASE_PASSWORD=your_db_password"
echo "   - DATABASE_HOST=localhost"
echo "   - DATABASE_PORT=3306"
echo "   - SITE_URL=https://skunkmonkey.co.uk/dev"
echo ""
echo "2. Install requirements with: ~/domains/skunkmonkey.co.uk/python_apps/devel/bin/pip install -r requirements.txt"
echo "3. Run migrations: ~/domains/skunkmonkey.co.uk/python_apps/devel/bin/python manage.py migrate"
echo "4. Collect static files: ~/domains/skunkmonkey.co.uk/python_apps/devel/bin/python manage.py collectstatic --noinput"

# Close SSH control connection when done
echo -e "${GREEN}Closing SSH connection...${NC}"
ssh -O exit -p $SSH_PORT -o ControlPath=/tmp/ssh_mux_%h_%p_%r $REMOTE_USER@$REMOTE_HOST
