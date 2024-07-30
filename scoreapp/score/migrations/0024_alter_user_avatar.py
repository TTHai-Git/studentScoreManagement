# Generated by Django 5.0.3 on 2024-07-29 11:33

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('score', '0023_alter_scoredetails_score'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=cloudinary.models.CloudinaryField(default='https://res.cloudinary.com/dh5jcbzly/image/upload/v1718648320/r77u5n3w3ddyy4yqqamp.jpg', max_length=255, null=True),
        ),
    ]
