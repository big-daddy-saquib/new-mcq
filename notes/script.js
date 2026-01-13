const topicsPanel = document.getElementById('topics-panel');
const subtopicsPanel = document.getElementById('subtopics-panel');
const subjectSelect = document.getElementById('subject-select');
const searchInput = document.getElementById('search-input');
const darkModeBtn = document.getElementById('dark-mode-toggle');
const toggleAllBtn = document.getElementById('toggle-all');
const breadcrumb = document.getElementById('breadcrumb');
const menuToggle = document.getElementById('menu-toggle');

let notesData;
let currentSubjectIndex = 0;

fetch('notes.json')
  .then(res => res.json())
  .then(data => {
    notesData = data;
    populateSubjects(notesData.subjects);
    renderSubjects(notesData.subjects[currentSubjectIndex]);
  });

function populateSubjects(subjects){
  subjects.forEach((subj, idx)=>{
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = subj.title;
    subjectSelect.appendChild(option);
  });

  subjectSelect.addEventListener('change', ()=>{
    currentSubjectIndex = parseInt(subjectSelect.value);
    searchInput.value = '';
    renderSubjects(notesData.subjects[currentSubjectIndex]);
  });
}

function renderSubjects(subject){
  topicsPanel.innerHTML = '';
  subtopicsPanel.innerHTML = '';
  breadcrumb.textContent = subject.title;

  subject.topics.forEach((topic, idx)=>{
    const topicDiv = document.createElement('div');
    topicDiv.className = 'topic-item';
    topicDiv.textContent = topic.title;
    topicDiv.dataset.index = idx;
    topicsPanel.appendChild(topicDiv);
  });

  const topicItems = document.querySelectorAll('.topic-item');

  function setCurrentTopic(index){
    topicItems.forEach(t=>t.classList.remove('current'));
    topicItems[index].classList.add('current');
  }

  function flashBreadcrumb(){
    breadcrumb.classList.add('flash');
    setTimeout(()=> breadcrumb.classList.remove('flash'), 350);
  }

  function renderSubtopics(index, filterText=''){
    subtopicsPanel.innerHTML = '';
    const topic = subject.topics[index];
    setCurrentTopic(index);
    breadcrumb.textContent = `${subject.title} > ${topic.title}`;

    topic.subtopics.forEach(sub=>{
      const match = sub.title.toLowerCase().includes(filterText) || sub.notes.some(n=>n.toLowerCase().includes(filterText));
      if(!match && filterText) return;

      const subDiv = document.createElement('div');
      subDiv.className = 'subtopic';

      const subTitle = document.createElement('div');
      subTitle.className = 'subtopic-title';

      let mediaIcons = '';
      if(sub.images && sub.images.length>0) mediaIcons += '🖼️';
      if(sub.videos && sub.videos.length>0) mediaIcons += ' 🎥';

      subTitle.innerHTML = `<span class="arrow">▸</span>${sub.title} <span class="media-icons">${mediaIcons}</span>`;
      subDiv.appendChild(subTitle);

      const subContent = document.createElement('div');
      subContent.className = 'subtopic-content';

      if(sub.description){ const desc = document.createElement('p'); desc.textContent=sub.description; subContent.appendChild(desc); }
      if(sub.detailed_explanation){ const d = document.createElement('p'); d.textContent=sub.detailed_explanation; subContent.appendChild(d); }

      const notesList = document.createElement('ul'); notesList.className='subtopic-notes';
      sub.notes.forEach(note=>{ const li=document.createElement('li'); li.textContent=note; notesList.appendChild(li); });
      subContent.appendChild(notesList);

      if(sub.images) sub.images.forEach(img=>{ const imgEl=document.createElement('img'); imgEl.src=img.url; imgEl.alt=img.caption||''; subContent.appendChild(imgEl); if(img.caption){ const cap=document.createElement('div'); cap.textContent=img.caption; cap.style.fontSize='14px'; cap.style.color='#555'; cap.style.marginTop='4px'; subContent.appendChild(cap); } });
      if(sub.videos) sub.videos.forEach(video=>{ const iframe=document.createElement('iframe'); iframe.src=video.url; iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen=true; subContent.appendChild(iframe); if(video.caption){ const cap=document.createElement('div'); cap.textContent=video.caption; cap.style.fontSize='14px'; cap.style.color='#555'; cap.style.marginTop='4px'; subContent.appendChild(cap); } });

      subDiv.appendChild(subContent);
      subtopicsPanel.appendChild(subDiv);

      subTitle.addEventListener('click', ()=>{
        const isVisible=subContent.classList.contains('show');
        subContent.classList.toggle('show');
        subTitle.querySelector('.arrow').classList.toggle('rotate');
        const media=subContent.querySelectorAll('img, iframe');
        media.forEach(el=>el.classList.toggle('show',!isVisible));
        breadcrumb.textContent=`${subject.title} > ${topic.title} > ${sub.title}`;
        flashBreadcrumb();
        if(!isVisible) subContent.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }

  topicItems.forEach(item=>{
    item.addEventListener('click', ()=>{
      topicItems.forEach(t=>t.classList.remove('active'));
      item.classList.add('active');
      renderSubtopics(item.dataset.index, searchInput.value.toLowerCase());
      if(window.innerWidth <= 768) topicsPanel.classList.remove('show');
    });
  });

  if(topicItems.length>0){ topicItems[0].classList.add('active'); renderSubtopics(0); }

  toggleAllBtn.onclick = ()=>{
    const allSubContents = document.querySelectorAll('.subtopic-content');
    const isAnyCollapsed = Array.from(allSubContents).some(c=>!c.classList.contains('show'));
    allSubContents.forEach(c=>{
      const arrow=c.parentElement.querySelector('.arrow');
      c.classList.toggle('show',isAnyCollapsed);
      arrow.classList.toggle('rotate',isAnyCollapsed);
      const media=c.querySelectorAll('img, iframe'); media.forEach(m=>m.classList.toggle('show',isAnyCollapsed));
    });
    toggleAllBtn.textContent=isAnyCollapsed?"Collapse All":"Expand All";
  };
}

// Dark mode toggle
darkModeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
  darkModeBtn.textContent=document.body.classList.contains('dark-mode')?'☀️ Light Mode':'🌙 Dark Mode';
  document.querySelectorAll('.subtopics-panel *').forEach(el=>{ el.style.color=document.body.classList.contains('dark-mode')?'#eee':''; });
});

// Mobile menu toggle
menuToggle.addEventListener('click', ()=>topicsPanel.classList.toggle('show'));
document.addEventListener('click', e=>{
  if(window.innerWidth <=768 && !topicsPanel.contains(e.target) && !menuToggle.contains(e.target)){
    topicsPanel.classList.remove('show');
  }
});
