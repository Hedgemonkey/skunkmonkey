#!/bin/bash
# Script to deploy to Heroku with proper build sequence
# - Disable collectstatic during build phase
# - Let Vite build run during Node.js buildpack
# - Run collectstatic during release phase

# Set environment variables
echo "Setting DISABLE_COLLECTSTATIC=1 to prevent premature static collection"
heroku config:set DISABLE_COLLECTSTATIC=1

# Push to Heroku
echo "Pushing to Heroku - this will trigger the Node.js buildpack first"
git push heroku main

echo "Deployment complete! The sequence should now be:"
echo "1. Vite build (during Node.js buildpack)"
echo "2. collectstatic (during release phase)"
echo "3. Web dyno startup with Gunicorn"