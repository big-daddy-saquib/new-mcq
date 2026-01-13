let questions = [];
let state = { index:0, answers:[], timer:null };

const subjectKey = new URLSearchParams(window.location.search).get("subject");
const topicKey = new URLSearchParams(window.location.search).get("topic");

const app = document.getElementById("app");
const timerBar = document.getElementById("timerBar");
const progressDots = document.getElementById("progressDots");
const progressWrapper = document.getElementById("progressWrapper");
const topicCards = document.getElementById("topic-cards");
const subjectTitle = document.getElementById("subject-title");

fetch("/data/qbank.json")
  .then(res => res.json())
  .then(data => {
    const subject = data[subjectKey];
    if(!subject){ subjectTitle.textContent="Subject not found"; return; }
    subjectTitle.textContent = subject.title;

    if(!topicKey){
      // Show topics
      topicCards.innerHTML = "";
      Object.entries(subject.topics).forEach(([key, topic])=>{
        const div = document.createElement("div");
        div.className="card";
        div.innerHTML = `
          <div class="icon"><img src="${topic.icon}" /></div>
          <div class="card-content">
            <h3>${topic.title}</h3>
            <p>${topic.mcqs.length} MCQs</p>
          </div>
        `;
        div.onclick=()=>startTopic(key);
        topicCards.appendChild(div);
      });
    } else startTopic(topicKey);
  });

function startTopic(topicKey){
  fetch("/data/qbank.json")
    .then(res=>res.json())
    .then(data=>{
      const topic = data[subjectKey].topics[topicKey];
      questions = topic.mcqs;
      state = { index:0, answers:[], timer:null };
      topicCards.style.display="none";
      renderQuiz();
    });
}

// MCQ functions (similar to your existing code)
function renderProgressDots(){
  progressDots.innerHTML="";
  questions.forEach((_,i)=>{
    const dot=document.createElement("div");
    dot.classList.add("dot");
    if(state.answers[i]) dot.classList.add(state.answers[i]);
    if(i===state.index) dot.classList.add("active");
    progressDots.appendChild(dot);
  });
}

function renderQuiz(){
  timerBar.parentElement.style.display="block";
  progressWrapper.style.display="flex";

  const q = questions[state.index];
  app.innerHTML=`
    <div class="question">${q.question}</div>
    <div id="options"></div>
    <div class="explanation" id="explanation"></div>
    <button id="nextBtn">Next</button>
    <button id="cancelBtn">Cancel Test</button>
  `;

  const optionsEl=document.getElementById("options");
  const explanationEl=document.getElementById("explanation");
  const nextBtn=document.getElementById("nextBtn");
  const cancelBtn=document.getElementById("cancelBtn");

  q.options.forEach((opt,i)=>{
    const div=document.createElement("div");
    div.className="option";
    div.textContent=opt.text;
    div.onclick=()=>selectAnswer(div,opt.correct,explanationEl,nextBtn);
    optionsEl.appendChild(div);
  });

  timerBar.style.width="100%";
  state.time=60;
  state.timer=setInterval(updateTimer,1000);
  nextBtn.style.display="none";
  nextBtn.onclick=nextQuestion;
  cancelBtn.onclick=cancelTest;

  renderProgressDots();
}

function updateTimer(){
  state.time--;
  timerBar.style.width=(state.time/60)*100+"%";
  if(state.time<=0){
    clearInterval(state.timer);
    state.answers[state.index]="skipped";
    renderProgressDots();
    showExplanation();
  }
}

function selectAnswer(el,correct,explanationEl,nextBtn){
  clearInterval(state.timer);
  if(correct) state.answers[state.index]="correct";
  else { state.answers[state.index]="wrong"; el.classList.add("wrong"); }
  renderProgressDots();
  showExplanation();
}

function showExplanation(){
  document.querySelectorAll(".option").forEach((opt,i)=>{
    opt.classList.add("disabled");
    if(questions[state.index].options[i].correct) opt.classList.add("correct");
  });
  const explanationEl=document.getElementById("explanation");
  explanationEl.innerHTML=`<p><strong>Explanation:</strong><br>${questions[state.index].explanation}</p>`;
  explanationEl.style.display="block";
  document.getElementById("nextBtn").style.display="block";
}

function nextQuestion(){
  state.index++;
  if(state.index<questions.length) renderQuiz();
  else renderScore();
}

function cancelTest(){ clearInterval(state.timer); goBack(); }

function renderScore(){
  timerBar.parentElement.style.display="none";
  progressWrapper.style.display="none";

  const total=questions.length;
  const correctCount=state.answers.filter(a=>a==="correct").length;
  const wrongCount=state.answers.filter(a=>a==="wrong").length;
  const skippedCount=state.answers.filter(a=>a==="skipped").length;
  const percent=Math.round((correctCount/total)*100);

  app.innerHTML=`
    <div class="score-wrapper">
      <h2>Your Performance</h2>
      <div class="score-circle"
        style="background: conic-gradient(#4eb153 0% ${percent}%, #e0e0e0 ${percent}% 100%)">
        ${percent}%
      </div>
      <div class="score-labels">
        <div><strong>${correctCount}</strong><br>Correct</div>
        <div><strong>${wrongCount}</strong><br>Wrong</div>
        <div><strong>${skippedCount}</strong><br>Skipped</div>
      </div>
      <button class="restart-btn" onclick="restartQuiz()">Restart Test</button>
      <button class="restart-btn" onclick="goBack()">Go Back</button>
    </div>
  `;
}

function restartQuiz(){ state.index=0; state.answers=[]; renderQuiz(); }
function goBack(){ window.location.href="../qbank.html?subject="+subjectKey; }
function openIndex(){ window.location.href="/qbank.html"; }
