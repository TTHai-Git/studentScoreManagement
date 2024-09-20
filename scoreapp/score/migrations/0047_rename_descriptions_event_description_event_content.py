# Generated by Django 5.0.3 on 2024-09-19 06:11

import ckeditor.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0046_subject_code'),
    ]

    operations = [
        migrations.RenameField(
            model_name='event',
            old_name='descriptions',
            new_name='description',
        ),
        migrations.AddField(
            model_name='event',
            name='content',
            field=ckeditor.fields.RichTextField(null=True),
        ),
    ]
