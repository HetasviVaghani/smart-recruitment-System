from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re


def calculate_match_score(resume_text, job_description, job_skills):

    # Normalize text
    resume_text = resume_text.lower()
    job_description = job_description.lower()
    job_skills = job_skills.lower()

    # Combine job description + skills
    job_text = job_description + " " + job_skills

    # TF-IDF similarity
    documents = [resume_text, job_text]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    tfidf_score = similarity * 100

    # Extract job skills (supports comma or newline)
    job_skill_list = [
        skill.strip()
        for skill in re.split(r',|\n', job_skills)
        if skill.strip()
    ]

    matched_skills = []
    missing_skills = []

    # Flexible skill matching
    for skill in job_skill_list:
        skill_words = skill.split()

        if all(word in resume_text for word in skill_words):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    # Skill score calculation
    if len(job_skill_list) > 0:
        skill_score = (len(matched_skills) / len(job_skill_list)) * 100
    else:
        skill_score = 0

    # Final score (skills weighted higher)
    final_score = round((0.2 * tfidf_score) + (0.8 * skill_score), 2)

    # Ensure score does not exceed 100
    final_score = min(final_score, 100)

    # Debug output
    print("TF-IDF Score:", round(tfidf_score, 2))
    print("Skill Score:", round(skill_score, 2))
    print("Matched Skills:", matched_skills)
    print("Missing Skills:", missing_skills)

    return final_score