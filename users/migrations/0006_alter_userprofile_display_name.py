# Generated by Django 5.1.6 on 2025-04-23 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_userprofile_display_name_alter_userprofile_bio'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='display_name',
            field=models.CharField(blank=True, default='', help_text="The name you'd like to be called on the site", max_length=50),
        ),
    ]
