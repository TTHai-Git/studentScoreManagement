# Generated by Django 5.0.3 on 2024-09-13 06:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0044_remove_user_department_studentclassroom_department'),
    ]

    operations = [
        migrations.AddField(
            model_name='teacher',
            name='department',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='score.department'),
        ),
    ]
