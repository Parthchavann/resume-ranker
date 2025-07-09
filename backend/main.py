from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import numpy as np
import os
from sentence_transformers import SentenceTransformer
import PyPDF2
import faiss
import requests

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
index = faiss.IndexFlatL2(VECTOR_SIZE)
resume_texts = []

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def embed_text(text):
    return model.encode(text)

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
    os.makedirs("resumes", exist_ok=True)
    file_location = f"resumes/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())
    text = extract_text_from_pdf(file_location)
    vector = embed_text(text)
    index.add(np.array([vector]).astype('float32'))
    resume_id = f"{file.filename}_{len(resume_texts)}"
    resume_texts.append({"resume_id": resume_id, "filename": file.filename, "text": text})
    return {"resume_id": resume_id, "msg": f"Resume {file.filename} uploaded and indexed."}

@app.post("/rank_resumes/")
async def rank_resumes(jd_file: UploadFile = File(...)):
    os.makedirs("jds", exist_ok=True)
    jd_location = f"jds/{jd_file.filename}"
    with open(jd_location, "wb") as f:
        f.write(await jd_file.read())
    jd_text = extract_text_from_pdf(jd_location)
    jd_vector = embed_text(jd_text)
    D, I = index.search(np.array([jd_vector]).astype('float32'), k=min(5, index.ntotal))
    results = []
    for idx, score in zip(I[0], D[0]):
        if idx < len(resume_texts):
            results.append({
                "resume_id": resume_texts[idx]["resume_id"],
                "filename": resume_texts[idx]["filename"],
                "score": float(score),
                "snippet": resume_texts[idx]["text"][:300] + "...",
                "full_text": resume_texts[idx]["text"]
            })
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

