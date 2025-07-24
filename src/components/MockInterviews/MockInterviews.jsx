import React, { useState, useEffect } from 'react';
import './MockInterviews.css'; // Create this CSS file

const MockInterviews = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [interviewFinished, setInterviewFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8000/api';

    // Fetch companies for dropdown
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/companydrives/`);
                if (!response.ok) throw new Error('Failed to fetch companies.');
                const data = await response.json();
                setCompanies(data);
            } catch (err) {
                console.error("Error fetching companies:", err);
                setError("Could not load companies for mock interviews.");
            }
        };
        fetchCompanies();
    }, []);

    const startMockInterview = async () => {
        if (!selectedCompanyId || !selectedRole) {
            setError("Please select a company and specify a role.");
            return;
        }
        setLoading(true);
        setError(null);
        setMockInterviewQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setInterviewFinished(false);

        try {
            const response = await fetch(`${API_BASE_URL}/generate_mock_interview/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_id: selectedCompanyId, role: selectedRole, num_questions: 5 }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.questions && data.questions.length > 0) {
                setMockInterviewQuestions(data.questions);
                setInterviewStarted(true);
            } else {
                setError("No mock interview questions found for this company and role. Please try another.");
                setInterviewStarted(false);
            }
        } catch (e) {
            console.error("Failed to start mock interview:", e);
            setError(e.message || "Failed to start mock interview.");
            setInterviewStarted(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (e) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestionIndex]: e.target.value,
        });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < mockInterviewQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setInterviewFinished(true);
            setInterviewStarted(false); // End the interview session
        }
    };

    const currentQuestion = mockInterviewQuestions[currentQuestionIndex];

    return (
        <div className="container">
            <h2>Mock Interviews</h2>

            {!interviewStarted && !interviewFinished && (
                <div className="interview-setup">
                    <div className="form-group">
                        <label htmlFor="companySelect">Select Company:</label>
                        <select
                            id="companySelect"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Company --</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.company_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="roleInput">Enter Role:</label>
                        <input
                            type="text"
                            id="roleInput"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            required
                        />
                    </div>
                    <button onClick={startMockInterview} disabled={loading}>
                        {loading ? 'Loading...' : 'Start Mock Interview'}
                    </button>
                    {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>
            )}

            {interviewStarted && currentQuestion && (
                <div className="interview-session">
                    <h3>Question {currentQuestionIndex + 1} of {mockInterviewQuestions.length} ({currentQuestion.difficulty_level})</h3>
                    <p className="question-text">{currentQuestion.question_text}</p>
                    <textarea
                        className="answer-textarea"
                        placeholder="Type your answer here..."
                        value={userAnswers[currentQuestionIndex] || ''}
                        onChange={handleAnswerChange}
                        rows="8"
                    ></textarea>
                    <button onClick={nextQuestion}>
                        {currentQuestionIndex < mockInterviewQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
                    </button>
                </div>
            )}

            {interviewFinished && (
                <div className="interview-summary">
                    <h3>Interview Finished!</h3>
                    <p>Thank you for completing the mock interview.</p>
                    <h4>Your Answers:</h4>
                    {mockInterviewQuestions.map((q, idx) => (
                        <div key={q.id} className="question-summary-item">
                            <p><strong>Q{idx + 1}:</strong> {q.question_text}</p>
                            <p><strong>Your Answer:</strong> {userAnswers[idx] || "No answer provided."}</p>
                            {/* For hackathon, very basic feedback. In future: compare to expected_keywords */}
                            <p className="feedback-note">
                                * For detailed feedback, a human reviewer or advanced AI is needed (Future Scope).
                                For now, self-assess based on clarity, completeness, and relevance.
                            </p>
                        </div>
                    ))}
                    <button onClick={() => {
                        setInterviewFinished(false);
                        setInterviewStarted(false);
                        setSelectedCompanyId('');
                        setSelectedRole('');
                    }}>Start New Interview</button>
                </div>
            )}
        </div>
    );
};

export default MockInterviews;