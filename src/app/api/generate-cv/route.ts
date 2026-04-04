import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    fullName, email, phone, location, linkedin,
    education, skills, experience, projects,
    languages, objective, projectTitle, companyName,
  } = body

  const prompt = `You are a professional CV writer. Generate a structured CV as a JSON object.

Student information:
- Name: ${fullName}
- Email: ${email || 'N/A'}
- Phone: ${phone || 'N/A'}
- Location: ${location || 'N/A'}
- LinkedIn: ${linkedin || 'N/A'}
- Education: ${education}
- Technical Skills: ${skills}
- Internships / Work Experience: ${experience || 'None provided'}
- Academic & Personal Projects: ${projects || 'None provided'}
- Languages: ${languages || 'Arabic, French, English'}
- Career Objective: ${objective || 'Not provided'}
- Applying for: ${projectTitle || 'Engineering internship'} at ${companyName || 'a tech company'}

Return ONLY a valid JSON object — no markdown, no explanation, no backticks. The JSON must follow this exact schema:
{
  "summary": "2-3 sentence professional summary tailored to the target role",
  "objective": "1-2 sentence career objective",
  "education": [
    {
      "degree": "Full degree name",
      "institution": "Institution name",
      "year": "Start year – End year (or expected)",
      "details": "Optional: GPA, specialization, honors"
    }
  ],
  "experience": [
    {
      "title": "Role / position title",
      "company": "Company or organization name",
      "period": "Month Year – Month Year (e.g. Jun 2024 – Aug 2024)",
      "description": "2-3 sentences: what you built, technologies used, impact"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "1-2 sentences describing the project, its purpose and your role",
      "technologies": ["tech1", "tech2", "tech3"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["Arabic (Native)", "French (B2)", "English (B2)"]
  }
}

Important rules:
- Parse the experience field carefully — each internship or job should be a separate entry in the "experience" array
- Parse the projects field carefully — each project should be a separate entry in the "projects" array
- If experience or projects are empty, return empty arrays []
- Do NOT invent experiences or projects that were not provided
- Do enrich descriptions with professional language based on what was provided
- Make sure the JSON is complete and valid
`

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const groqData = await groqRes.json()
    const raw = groqData.choices?.[0]?.message?.content ?? ''

    // Extract JSON safely — handles cases where model wraps in markdown
    const start = raw.indexOf('{')
    const end   = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No valid JSON returned by AI')

    const jsonStr = raw.slice(start, end + 1)
    const cv = JSON.parse(jsonStr)

    return NextResponse.json({ cv })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Generation failed' }, { status: 500 })
  }
}