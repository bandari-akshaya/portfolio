(() => {
  'use strict';

  // ⚠️ Client-side key: visible to anyone who views source/network tab.
  // Fine for a low-traffic personal portfolio if you rotate it periodically;
  // for anything higher-stakes, proxy this through a serverless function instead.
  const GROQ_API_KEY = "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";
  const GROQ_MODEL = "llama-3.3-70b-versatile";
  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

  /* ============ PORTFOLIO CONTEXT (grounding data) ============ */
  const PORTFOLIO_CONTEXT = `
NAME: Bandari Akshaya
TITLE: Frontend Developer, UI/UX Enthusiast, Computer Science Student

SUMMARY: Frontend-focused Computer Science student passionate about designing clean, responsive,
accessible, and visually engaging web experiences. Skilled in HTML, CSS, JavaScript, Python, and API
integration, with a growing interest in modern frontend frameworks and user-centered design.

EDUCATION:
- B.Tech, Computer Science & Engineering, Sree Dattha Group of Institutions (2024–2028)
- Intermediate (MPC), SR Educenter Junior College (2022–2024)
- SSC, Vishwashanthi High School (2021–2022)

SKILLS:
- Programming: Python, JavaScript
- Frontend: HTML5, CSS3, Responsive Web Design, API Integration
- UI/UX: Wireframing, Visual Design, Responsive Layout, User Experience, Accessibility
- Developer Tools: VS Code, Git, GitHub, Microsoft Office
- Computer Science: Problem Solving, Data Structures (basics), REST APIs

PROJECTS:
1. AI Movie Recommender — HTML, CSS, JavaScript, Groq API. AI-powered movie suggestions with
   mood-based recommendations, genre filters, language support, responsive UI.
   GitHub: https://github.com/bandari-akshaya/Ai-movie-recommender
2. Amazon Clone — HTML, CSS. Pixel-perfect responsive layout with navigation bar, product sections,
   and footer. GitHub: https://github.com/bandari-akshaya/amazonclone
3. Study Buddy — HTML, CSS, JavaScript. Generates flashcards and quizzes, smart summaries, interactive
   learning tool. Repository not yet public.

CERTIFICATES:
- Generative AI Content Creation — Coursera
- HTML & CSS Fundamentals — Udemy
- Python Programming — Udemy
- Git & GitHub — Coursera

INTERESTS: Frontend Development, UI/UX Design, Web Technologies, Modern JavaScript, Continuous Learning,
Open Source.

LANGUAGES: English, Telugu

CONTACT:
- Email: bandariakshaya922@gmail.com
- Phone: +91 7780129177
- GitHub: https://github.com/bandari-akshaya
- LinkedIn: https://www.linkedin.com/in/akshaya-bandari/
`.trim();

  const SYSTEM_PROMPT = `
You are "Akshaya's Bot," embedded in Bandari Akshaya's personal portfolio website.

IDENTITY:
- If asked who you are or what you can do, reply exactly: "I'm Akshaya's bot. Ask me anything about Akshaya, and I'll provide the information."

SCOPE (STRICT):
- Only answer questions about Akshaya's skills, projects, education, experience, achievements, or portfolio content.
- If a question is unrelated to Akshaya (general knowledge, unrelated coding help, random topics), reply exactly:
  "I'm Akshaya's bot. I don't have information about that. Feel free to ask anything about Akshaya."

CONTEXT-ONLY ANSWERING:
- Only use the PORTFOLIO CONTEXT below. Never invent or assume facts not present in it.
- If the answer isn't in the context, reply exactly: "I couldn't find that information in Akshaya's portfolio."

FORMAT:
- Keep answers short, clear, and professional. Use "- " at the start of a line for bullet points when listing multiple items (skills, projects, contact details, etc.).
- Use **bold** for field labels or key terms (e.g., "**Email:** ...", "**GitHub Clone:**"). Use *italics* sparingly for emphasis.
- Keep each bullet on its own short line. Do not put long unbroken text in a single line if it can be split into bullets.
- Friendly and professional tone, never robotic, never overly long.
- No markdown code fences, no emojis, no unnecessary preamble.
- Do not generate code unless it exists in the context. Do not speculate or roleplay.

PORTFOLIO CONTEXT:
${PORTFOLIO_CONTEXT}
`.trim();

  /* ============ DOM ============ */
  const launcher = document.getElementById('chatbotLauncher');
  const win = document.getElementById('chatbotWindow');
  const messagesEl = document.getElementById('cbMessages');
  const typingEl = document.getElementById('cbTyping');
  const form = document.getElementById('cbForm');
  const input = document.getElementById('cbInput');
  const sendBtn = form.querySelector('.cb-send');

  let history = [{ role: 'system', content: SYSTEM_PROMPT }];
  let isOpen = false;
  let isBusy = false;

  function toggleWindow(open) {
    isOpen = open ?? !isOpen;
    win.classList.toggle('open', isOpen);
    launcher.classList.toggle('open', isOpen);
    launcher.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) setTimeout(() => input.focus(), 350);
  }
  launcher.addEventListener('click', () => toggleWindow());
  launcher.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleWindow(); }
  });

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }

  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = 'cb-msg ' + (role === 'user' ? 'cb-msg-user' : 'cb-msg-bot');
    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    if (text) bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return bubble;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatInline(rawLine) {
    let t = escapeHtml(rawLine);
    // **bold**
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // *italic* or _italic_ (after bold is handled, so single * left means italic)
    t = t.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/_(.+?)_/g, '<em>$1</em>');
    // emails
    t = t.replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, '<a href="mailto:$1">$1</a>');
    // urls — show a shortened label so long links wrap cleanly
    t = t.replace(/(https?:\/\/[^\s<]+)/g, (m) => {
      const label = m.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `<a href="${m}" target="_blank" rel="noopener">${label}</a>`;
    });
    return t;
  }

  function renderBubble(bubble, rawText) {
    // Turn simple "- " list lines into a real <ul>, apply inline formatting to every line.
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const hasList = lines.some(l => l.startsWith('- ') || l.startsWith('* '));
    if (!hasList) { bubble.innerHTML = formatInline(rawText); return; }

    bubble.innerHTML = '';
    let list = null;
    lines.forEach(line => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!list) { list = document.createElement('ul'); bubble.appendChild(list); }
        const li = document.createElement('li');
        li.innerHTML = formatInline(line.slice(2));
        list.appendChild(li);
      } else {
        list = null;
        const p = document.createElement('div');
        p.innerHTML = formatInline(line);
        bubble.appendChild(p);
      }
    });
  }

  async function streamWords(bubble, fullText) {
    const words = fullText.split(' ');
    let shown = '';
    for (let i = 0; i < words.length; i++) {
      shown += (i === 0 ? '' : ' ') + words[i];
      renderBubble(bubble, shown);
      scrollToBottom();
      await new Promise(r => setTimeout(r, 18));
    }
  }

  async function askGroq(userText) {
    history.push({ role: 'user', content: userText });

    let reply = '';
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: history,
          temperature: 0.3,
          max_tokens: 400
        })
      });

      if (!res.ok) throw new Error('Groq API error: ' + res.status);
      const data = await res.json();
      reply = data.choices?.[0]?.message?.content?.trim()
        || "I couldn't find that information in Akshaya's portfolio.";
    } catch (err) {
      console.error(err);
      reply = "I'm having trouble connecting right now — please try again in a moment.";
    }

    history.push({ role: 'assistant', content: reply });
    // keep history bounded so the request stays small
    if (history.length > 14) history = [history[0], ...history.slice(-12)];
    return reply;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isBusy) return;

    isBusy = true;
    sendBtn.disabled = true;
    input.value = '';
    addMessage('user', text);

    typingEl.classList.add('visible');
    scrollToBottom();

    const reply = await askGroq(text);

    typingEl.classList.remove('visible');
    const bubble = addMessage('bot', '');
    await streamWords(bubble, reply);

    isBusy = false;
    sendBtn.disabled = false;
    input.focus();
  });

})();