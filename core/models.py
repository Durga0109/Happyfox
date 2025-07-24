from django.db import models

class CompanyDrive(models.Model):
    company_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    domain = models.CharField(max_length=100)
    salary_range = models.CharField(max_length=50, blank=True, null=True)
    hiring_timeline = models.CharField(max_length=100, help_text="e.g., 'August 2025', 'Batch 2026'")
    drive_date = models.DateField(help_text="Primary date for ordering drives.")
    location = models.CharField(max_length=100)
    interview_process_description = models.TextField()

    def __str__(self):
        return f"{self.company_name} - {self.role} ({self.drive_date})"

    class Meta:
        ordering = ['drive_date']


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class LearningTopic(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    related_skills = models.ManyToManyField(Skill, related_name='topics')

    def __str__(self):
        return self.name


class LearningResource(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField()
    type = models.CharField(
        max_length=50,
        choices=[
            ('Video', 'Video'),
            ('Article', 'Article'),
            ('Course', 'Course'),
            ('Problem Set', 'Problem Set')
        ]
    )
    associated_topics = models.ManyToManyField(LearningTopic, related_name='resources')

    def __str__(self):
        return self.title

class MockInterviewQuestion(models.Model):
    company = models.ForeignKey('CompanyDrive', on_delete=models.CASCADE)
    role = models.CharField(max_length=100)
    question_text = models.TextField()
    difficulty_level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.company.company_name} - {self.role}: {self.question_text[:50]}"