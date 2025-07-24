from rest_framework import serializers
from .models import CompanyDrive, Skill, LearningTopic, LearningResource,MockInterviewQuestion

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class LearningTopicSerializer(serializers.ModelSerializer):
    related_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = LearningTopic
        fields = '__all__'

class LearningResourceSerializer(serializers.ModelSerializer):
    associated_topics = LearningTopicSerializer(many=True, read_only=True)

    class Meta:
        model = LearningResource
        fields = '__all__'

class CompanyDriveSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDrive
        fields = '__all__'

class PrepPlanSerializer(serializers.Serializer):
    preferred_role = serializers.CharField(max_length=100)
    academic_course_details = serializers.CharField()
    plan_details = serializers.JSONField(required=False) 

class MockInterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockInterviewQuestion
        fields = '__all__'

