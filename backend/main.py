from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from fastapi import Form
from fastapi import Request
from pydantic import BaseModel
import numpy as np
import os
from sentence_transformers import SentenceTransformer
import PyPDF2
import faiss
import requests
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
VECTOR_SIZE = 384

def extract_text_from_pdf_filelike(filelike):
    reader = PyPDF2.PdfReader(filelike)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def embed_text(text):
    return model.encode(text)

@app.post("/rank_resumes/")
async def rank_resumes(
    jd_file: UploadFile = File(...),
    resume_files: List[UploadFile] = File(...)
):
    # 1. Read JD text and embed
    jd_text = extract_text_from_pdf_filelike(await jd_file.read())
    jd_vector = embed_text(jd_text)

    # 2. Extract text for all resumes
    resume_texts = []
    vectors = []
    for idx, resume_file in enumerate(resume_files):
        file_bytes = await resume_file.read()
        text = extract_text_from_pdf_filelike(file_bytes)
        vector = embed_text(text)
        resume_id = f"{resume_file.filename}_{idx}"
        resume_texts.append({
            "resume_id": resume_id,
            "filename": resume_file.filename,
            "text": text
        })
        vectors.append(vector)

    # 3. Build FAISS index for this batch
    if not vectors:
        return {"ranked_resumes": [], "job_description_text": jd_text}
    index = faiss.IndexFlatL2(VECTOR_SIZE)
    index.add(np.array(vectors).astype('float32'))

    # 4. Rank (sort by similarity, lower = more similar for L2)
    D, I = index.search(np.array([jd_vector]).astype('float32'), k=len(resume_texts))
    results = []
    for idx, score in zip(I[0], D[0]):
        rec = resume_texts[idx]
        results.append({
            "resume_id": rec["resume_id"],
            "filename": rec["filename"],
            "score": float(score),
            "snippet": rec["text"][:300] + "...",
            "full_text": rec["text"]
        })
    # Sort so best match is first (lowest score)
    results = sorted(results, key=lambda x: x['score'])

    return {
        "ranked_resumes": results,
        "job_description_text": jd_text
    }

class FeedbackRequest(BaseModel):
    resume_text: str
    jd_text: str

@app.post("/llm_feedback/")
async def llm_feedback(req: FeedbackRequest):
    prompt = (
        "You are a career coach and resume expert. "
        "Given the following resume and job description, give specific, actionable feedback for improving the resume to match the job description. "
        "List missing skills, suggest changes, and highlight what is already a good fit.\n\n"
        f"Resume:\n{req.resume_text[:3000]}\n\n"
        f"Job Description:\n{req.jd_text[:3000]}\n\n"
        "Feedback:"
    )
    ollama_url = "http://localhost:11434/api/generate"
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }
    try:
        r = requests.post(ollama_url, json=payload, timeout=60)
        r.raise_for_status()
        data = r.json()
        feedback = data.get("response", "").strip()
        if not feedback:
            feedback = "Could not generate feedback. Try again or check Ollama server."
    except Exception as e:
        feedback = f"LLM Error: {e}"
    return {"feedback": feedback}
