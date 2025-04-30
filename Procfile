web: DJANGO_SETTINGS_MODULE=skunkmonkey.settings gunicorn skunkmonkey.wsgi --log-file -
release: DJANGO_SETTINGS_MODULE=skunkmonkey.settings python manage.py collectstatic --noinput && python direct_static_s3_upload.py
