# Generated by Django 5.0.3 on 2024-09-15 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0045_teacher_department'),
    ]

    operations = [
        migrations.AddField(
            model_name='subject',
            name='code',
            field=models.CharField(max_length=10, null=True, unique=True),
        ),
    ]
