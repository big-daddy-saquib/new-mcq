const params = new URLSearchParams(window.location.search);
const topicId = params.get("topic") || "mi";

fetch(`topics/${topicId}.json`)
  .then(res => res.json())
  .then(note => renderNote(note))
  .catch(() => {
    document.getElementById("content").innerText = "Topic not found";
  });

function renderNote(note) {
  const title = document.getElementById("topicTitle");
  const content = document.getElementById("content");

  title.textContent = note.topic;

  const overview = document.createElement("div");
  overview.className = "card overview";
  overview.innerHTML = `
    <strong>Definition</strong><br>${note.overview.definition}<br><br>
    <strong>Mechanism</strong><br>${note.overview.mechanism}
    <div class="gold">Golden Fact: ${note.overview.golden_fact}</div>
  `;
  content.appendChild(overview);

  note.sections.forEach(sec => {
    const section = document.createElement("div");
    section.className = "section";

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `<span>${sec.title}</span><span>+</span>`;

    const body = document.createElement("div");
    body.className = "section-content";

    if (sec.type === "list") {
      const ul = document.createElement("ul");
      ul.className = "list";
      sec.content.forEach(i => {
        const li = document.createElement("li");
        li.textContent = i;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (sec.type === "flow") {
      const flow = document.createElement("div");
      flow.className = "flow";
      sec.content.forEach(i => {
        const d = document.createElement("div");
        d.textContent = i;
        flow.appendChild(d);
      });
      body.appendChild(flow);
    }

    header.onclick = () => {
      const open = body.style.display === "block";
      body.style.display = open ? "none" : "block";
      header.lastChild.textContent = open ? "+" : "−";
    };

    section.appendChild(header);
    section.appendChild(body);
    content.appendChild(section);
  });

  const exam = document.createElement("div");
  exam.className = "card exam";
  exam.innerHTML = `<strong>EXAM PEARL</strong><br>${note.exam_pearls.join("<br>")}`;
  content.appendChild(exam);

  const mistake = document.createElement("div");
  mistake.className = "card mistake";
  mistake.innerHTML = `<strong>COMMON MISTAKE</strong><br>${note.mistakes.join("<br>")}`;
  content.appendChild(mistake);
}
