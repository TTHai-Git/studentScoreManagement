# Generated by Django 5.0.3 on 2024-05-22 06:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0014_alter_role_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='code',
            field=models.CharField(default=None, max_length=10, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='teacher',
            name='code',
            field=models.CharField(default=None, max_length=10, null=True, unique=True),
        ),
    ]
