# Generated by Django 5.0.3 on 2024-04-14 17:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0002_alter_user_dob'),
    ]

    operations = [
        migrations.RenameField(
            model_name='subject',
            old_name='desciption',
            new_name='description',
        ),
    ]
