from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import CompanyDrive, Skill, LearningTopic, LearningResource, MockInterviewQuestion
from .serializers import (
    CompanyDriveSerializer,
    PrepPlanSerializer,
    MockInterviewQuestionSerializer
)

# ------------------- Company Drive ViewSet -------------------
class CompanyDriveViewSet(viewsets.ModelViewSet):
    queryset = CompanyDrive.objects.all()
    serializer_class = CompanyDriveSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'domain', 'drive_date', 'location']


# ------------------- Personalized Prep Plan View -------------------
class PersonalizedPrepPlanView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PrepPlanSerializer(data=request.data)
        if serializer.is_valid():
            preferred_role = serializer.validated_data.get('preferred_role', '').lower()
            academic_details = serializer.validated_data.get('academic_course_details', '').lower()

            plan_details = {
                "summary": f"Personalized plan for {preferred_role} based on your academic background.",
                "sections": []
            }

            core_skills_map = {
                "software engineer": ["Data Structures & Algorithms", "Object-Oriented Programming", "System Design", "Web Development Basics"],
                "data analyst": ["Statistics", "Python for Data Analysis", "SQL", "Data Visualization"],
                "consultant": ["Problem Solving", "Case Study Analysis", "Communication", "General Aptitude"],
            }
            relevant_skills = core_skills_map.get(preferred_role, ["General Aptitude", "Basic Coding"])

            # Keyword boost based on academic input
            keyword_skill_map = {
                "data structures": "Data Structures & Algorithms",
                "algorithms": "Data Structures & Algorithms",
                "database": "SQL",
                "sql": "SQL",
                "oop": "Object-Oriented Programming",
                "web": "Web Development Basics",
                "visualization": "Data Visualization"
            }

            for keyword, skill in keyword_skill_map.items():
                if keyword in academic_details and skill not in relevant_skills:
                    relevant_skills.append(skill)

            # Build structured learning plan
            for skill_name in relevant_skills:
                skill_obj = Skill.objects.filter(name=skill_name).first()
                if not skill_obj:
                    continue

                topics = LearningTopic.objects.filter(related_skills=skill_obj)
                topic_details = []
                for topic in topics:
                    resources = LearningResource.objects.filter(associated_topics=topic)
                    resource_details = [
                        {'title': r.title, 'url': r.url, 'type': r.type}
                        for r in resources
                    ]
                    topic_details.append({
                        "name": topic.name,
                        "description": topic.description,
                        "resources": resource_details
                    })

                plan_details["sections"].append({
                    "skill": skill_name,
                    "topics": topic_details
                })

            plan_details["time_estimation"] = {
                "total_weeks": 12,
                "breakdown": "Focus 60% on technical skills, 20% on aptitude, 20% on soft skills."
            }

            return Response(plan_details, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------- Generate Mock Interview View -------------------
class GenerateMockInterviewView(APIView):
    def post(self, request, *args, **kwargs):
        company_id = request.data.get('company_id')
        role = request.data.get('role')
        num_questions = int(request.data.get('num_questions', 5))

        if not company_id or not role:
            return Response({"error": "Company ID and Role are required."}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(CompanyDrive, id=company_id)

        # Try finding questions with exact company+role first
        questions = MockInterviewQuestion.objects.filter(
            company=company,
            role__iexact=role
        ).order_by('?')[:num_questions]

        # Fallbacks
        if not questions.exists():
            questions = MockInterviewQuestion.objects.filter(role__iexact=role).order_by('?')[:num_questions]

        if not questions.exists():
            questions = MockInterviewQuestion.objects.filter(company=company).order_by('?')[:num_questions]

        serializer = MockInterviewQuestionSerializer(questions, many=True)
        return Response({
            "company_name": company.company_name,
            "role": role,
            "questions": serializer.data
        }, status=status.HTTP_200_OK)
