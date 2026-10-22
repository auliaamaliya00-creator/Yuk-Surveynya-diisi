/* Survei Data Mahasiswa - front end.
   Set WEB_APP_URL after deploying Code.gs as a Google Apps Script Web App. */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzU6UX4QUN0DIipiv3m5oO0sCr1yHkzUniIvybBY8yoYgBIZ5rrAGtYqAW948WCmxHT/exec";

const DASS_ITEMS = [
"Saya merasa bahwa diri saya menjadi marah karena hal-hal sepele.",
"Saya merasa bibir saya sering kering.",
"Saya sama sekali tidak dapat merasakan perasaan positif.",
"Saya mengalami kesulitan bernafas (misalnya: seringkali terengah-engah atau tidak dapat bernafas padahal tidak melakukan aktivitas fisik sebelumnya).",
"Saya sepertinya tidak kuat lagi untuk melakukan suatu kegiatan.",
"Saya cenderung bereaksi berlebihan terhadap suatu situasi.",
"Saya merasa goyah (misalnya, kaki terasa mau ’copot’).",
"Saya merasa sulit untuk bersantai.",
"Saya menemukan diri saya berada dalam situasi yang membuat saya merasa sangat cemas dan saya akan merasa sangat lega jika semua ini berakhir.",
"Saya merasa tidak ada hal yang dapat diharapkan di masa depan.",
"Saya menemukan diri saya mudah merasa kesal.",
"Saya merasa telah menghabiskan banyak energi untuk merasa cemas.",
"Saya merasa sedih dan tertekan.",
"Saya menemukan diri saya menjadi tidak sabar ketika mengalami penundaan (misalnya: kemacetan lalu lintas, menunggu sesuatu).",
"Saya merasa lemas seperti mau pingsan.",
"Saya merasa saya kehilangan minat akan segala hal.",
"Saya merasa bahwa saya tidak berharga sebagai seorang manusia.",
"Saya merasa bahwa saya mudah tersinggung.",
"Saya berkeringat secara berlebihan (misalnya: tangan berkeringat), padahal temperatur tidak panas atau tidak melakukan aktivitas fisik sebelumnya.",
"Saya merasa takut tanpa alasan yang jelas.",
"Saya merasa bahwa hidup tidak bermanfaat.",
"Saya merasa sulit untuk beristirahat.",
"Saya mengalami kesulitan dalam menelan.",
"Saya tidak dapat merasakan kenikmatan dari berbagai hal yang saya lakukan.",
"Saya menyadari kegiatan jantung, walaupun saya tidak sehabis melakukan aktivitas fisik (misalnya: merasa detak jantung meningkat atau melemah).",
"Saya merasa putus asa dan sedih.",
"Saya merasa bahwa saya sangat mudah marah.",
"Saya merasa saya hampir panik.",
"Saya merasa sulit untuk tenang setelah sesuatu membuat saya kesal.",
"Saya takut bahwa saya akan ‘terhambat’ oleh tugas-tugas sepele yang tidak biasa saya lakukan.",
"Saya tidak merasa antusias dalam hal apapun.",
"Saya sulit untuk sabar dalam menghadapi gangguan terhadap hal yang sedang saya lakukan.",
"Saya sedang merasa gelisah.",
"Saya merasa bahwa saya tidak berharga.",
"Saya tidak dapat memaklumi hal apapun yang menghalangi saya untuk menyelesaikan hal yang sedang saya lakukan.",
"Saya merasa sangat ketakutan.",
"Saya melihat tidak ada harapan untuk masa depan.",
"Saya merasa bahwa hidup tidak berarti.",
"Saya menemukan diri saya mudah gelisah.",
"Saya merasa khawatir dengan situasi dimana saya mungkin menjadi panik dan mempermalukan diri sendiri.",
"Saya merasa gemetar (misalnya: pada tangan).",
"Saya merasa sulit untuk meningkatkan inisiatif dalam melakukan sesuatu."
];
const SUBSCALES = {
  Depresi: [3,5,10,13,16,17,21,24,26,31,34,37,38,42],
  Kecemasan: [2,4,7,9,15,19,20,23,25,28,30,36,40,41],
  Stres: [1,6,8,11,12,14,18,22,27,29,32,33,35,39]
};
const LABELS = [
  "Tidak pernah sesuai dengan saya",
  "Kadang-kadang sesuai dengan saya",
  "Sering sesuai dengan saya",
  "Sangat sering sesuai dengan saya"
];
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
let currentSection = 0;
let finalPayload = null;
let audioContext = null;
let musicTimer = null;
let musicEnabled = false;
let toastTimer = null;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
function safeAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === "suspended") audioContext.resume().catch(()=>{});
  return audioContext;
}
function playPop() {
  const ctx = safeAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(760, now);
  osc.frequency.exponentialRampToValueAtTime(310, now + .075);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.38, now + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .12);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(now); osc.stop(now + .13);
}
function musicNote() {
  if (!musicEnabled) return;
  const ctx = safeAudioContext();
  if (!ctx) return;
  const notes = [523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
  const i = Math.floor((Date.now()/500)%notes.length);
  const now = ctx.currentTime;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = notes[i];
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.linearRampToValueAtTime(.10,now+.03);
  gain.gain.exponentialRampToValueAtTime(.0001,now+.36);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.38);
}
function setSound(on) {
  musicEnabled = on;
  const btn = $("#soundToggle");
  btn.textContent = on ? "♫ Suara: ON" : "♫ Suara: OFF";
  btn.setAttribute("aria-pressed", String(on));
  if (on) {
    safeAudioContext();
    playPop();
    if (!musicTimer) musicTimer = setInterval(musicNote, 500);
    toast("Musik dan efek klik aktif ♫");
  } else {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    toast("Suara dimatikan");
  }
}
function spawnDecorations() {
  const ambient = $("#ambient"), sparkle = $("#sparkleLayer");
  const symbols = ["💗","♡","🌸","🌷","✿","🦋","✨","⭐"];
  for (let i=0;i<34;i++) {
    const el = document.createElement("span");
    el.className = "floaty";
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left = Math.random()*100+"%";
    el.style.fontSize = (13+Math.random()*21)+"px";
    el.style.animationDuration = (9+Math.random()*17)+"s";
    el.style.animationDelay = (-Math.random()*25)+"s";
    ambient.appendChild(el);
  }
  for (let i=0;i<44;i++) {
    const el=document.createElement("span");
    el.className="sparkle"; el.textContent=Math.random()>.5?"✦":"·";
    el.style.left=Math.random()*100+"%";el.style.top=Math.random()*100+"%";
    el.style.fontSize=(10+Math.random()*18)+"px";el.style.animationDelay=(Math.random()*3)+"s";
    sparkle.appendChild(el);
  }
}
function renderQuestions() {
  const targets = [$("#questionsA"),$("#questionsB"),$("#questionsC")];
  DASS_ITEMS.forEach((text,index) => {
    const sectionIndex = Math.floor(index/14);
    const num = index+1;
    const card = document.createElement("article");
    card.className = "question-card";
    card.dataset.question = String(num);
    const p = document.createElement("p");
    p.className = "question-text";
    const n = document.createElement("span");
    n.className = "question-number"; n.textContent = String(num);
    p.append(n, document.createTextNode(text));
    const options = document.createElement("div");
    options.className = "options";
    LABELS.forEach((label,value) => {
      const lab=document.createElement("label");lab.className="option";
      const input=document.createElement("input");
      input.type="radio";input.name="dass_"+num;input.value=String(value);input.required=true;
      input.setAttribute("aria-label",value+" — "+label);
      input.addEventListener("change",()=>{card.classList.add("answered");updateProgress();playPop();});
      const span=document.createElement("span");span.textContent=String(value);span.title=label;
      lab.append(input,span);options.append(lab);
    });
    const hint=document.createElement("small");
    hint.className="hint";hint.textContent="Pilih 0, 1, 2, atau 3 sesuai keterangan skala.";
    card.append(p,options,hint);targets[sectionIndex].append(card);
  });
}
function showSection(index) {
  currentSection=index;
  $$(".form-section").forEach((s,i)=>s.classList.toggle("active",i===index));
  updateProgress();
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateProgress() {
  const total=42;
  const answered=$$('input[name^="dass_"]:checked').length;
  const basicTotal=11;
  const basicAnswered=["universitas","fakultas","jurusan","umur","jenis_kelamin","tinggi","berat","golongan_darah","tidur","olahraga","sosmed"].filter(n=>{
    const el=$(`[name="${n}"]`);return el && String(el.value).trim()!=="";
  }).length;
  const pct=Math.round((answered+(basicAnswered.length/basicTotal)*4)/(total+4)*100);
  $("#progressBar").style.width=pct+"%";
  $("#progressPercent").textContent=pct+"%";
  $("#progressText").textContent="Bagian "+(currentSection+1)+" dari 4";
}
function validateSection(section) {
  const error=$(".form-error",section);
  error.textContent="";
  if (Number(section.dataset.section)===0) {
    const form=$("#surveyForm");
    const fields=["universitas","fakultas","jurusan","umur","jenis_kelamin","tinggi","berat","golongan_darah","tidur","olahraga","sosmed"];
    for (const name of fields) {
      const el=form.elements[name];
      if (!el || !String(el.value).trim()) { error.textContent="Masih ada data yang kosong. Lengkapi semua kolom bertanda * dulu, ya."; el?.focus();return false; }
      if (!el.checkValidity()) { error.textContent=name==="umur"?"Umur responden harus 17–24 tahun. Periksa kembali, ya.":"Ada angka atau pilihan yang di luar batas wajar. Coba periksa lagi, ya.";el.focus();return false; }
    }
    const age=Number(form.elements.umur.value);
    if(age<17||age>24){error.textContent="Maaf, survei ini hanya untuk responden usia 17–24 tahun.";form.elements.umur.focus();return false;}
  }
  if (Number(section.dataset.section)>0) {
    const missing=[];
    for(let n=1;n<=42;n++){
      const inThis = $$(`input[name="dass_${n}"]`,section);
      if(inThis.length && !inThis.some(el=>el.checked)) missing.push(n);
    }
    if(missing.length){error.textContent=`Jawaban nomor ${missing.slice(0,5).join(", ")}${missing.length>5?" dan lainnya":""} belum dipilih. Lengkapi dulu, ya.`;const first=$(`input[name="dass_${missing[0]}"]`,section);first?.focus();return false;}
  }
  if(Number(section.dataset.section)===3 && !$("#confirmAnswers").checked){error.textContent="Centang konfirmasi setelah memeriksa jawaban.";return false;}
  return true;
}
function categoryFor(name,score) {
  if(name==="Depresi"){
    if(score<=9)return "Normal";if(score<=13)return "Ringan";if(score<=20)return "Sedang";if(score<=27)return "Berat";return "Sangat berat";
  }
  if(name==="Kecemasan"){
    if(score<=7)return "Normal";if(score<=9)return "Ringan";if(score<=14)return "Sedang";if(score<=19)return "Berat";return "Sangat berat";
  }
  if(score<=14)return "Normal";if(score<=18)return "Ringan";if(score<=25)return "Sedang";if(score<=33)return "Berat";return "Sangat berat";
}
function getPayload() {
  const form=$("#surveyForm"),fd=new FormData(form),answers={};
  for(let i=1;i<=42;i++) answers["DASS_"+String(i).padStart(2,"0")]=Number(fd.get("dass_"+i));
  const scores={};
  Object.entries(SUBSCALES).forEach(([name,items])=>{
    const score=items.reduce((sum,n)=>sum+answers["DASS_"+String(n).padStart(2,"0")],0);
    scores[name]={score,category:categoryFor(name,score)};
  });
  return {
    nama:String(fd.get("nama")||"").trim(),
    universitas:String(fd.get("universitas")).trim(),
    fakultas:String(fd.get("fakultas")).trim(),
    jurusan:String(fd.get("jurusan")).trim(),
    umur:Number(fd.get("umur")),
    jenis_kelamin:String(fd.get("jenis_kelamin")),
    tinggi:Number(fd.get("tinggi")),
    berat:Number(fd.get("berat")),
    golongan_darah:String(fd.get("golongan_darah")),
    durasi_tidur:Number(fd.get("tidur")),
    durasi_olahraga:Number(fd.get("olahraga")),
    durasi_sosmed:Number(fd.get("sosmed")),
    answers,scores,
    consent:true,
    submittedAt:new Date().toISOString()
  };
}
async function sendToSheets(payload) {
  if(!WEB_APP_URL.startsWith("https://script.google.com/macros/s/") || WEB_APP_URL.includes("PASTE_URL")) {
    throw new Error("URL Google Apps Script belum dipasang. Pengiriman belum dilakukan.");
  }
  // no-cors avoids preflight issues for static GitHub Pages. Apps Script receives the POST,
  // but the browser cannot read its response; verify the new row in Sheets before sharing.
  await fetch(WEB_APP_URL,{
    method:"POST",
    mode:"no-cors",
    redirect:"follow",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload)
  });
}
function showResults(payload,saveStatus) {
  $("#surveyScreen").hidden=true;$("#resultScreen").hidden=false;
  $("#saveMessage").textContent=saveStatus;
  const grid=$("#scoreGrid");grid.innerHTML="";
  Object.entries(payload.scores).forEach(([name,data])=>{
    const item=document.createElement("div");item.className="score-item";
    const h=document.createElement("h3");h.textContent=name;
    const value=document.createElement("div");value.className="score-value";value.textContent=data.score;
    const cat=document.createElement("div");cat.className="score-category";cat.textContent=data.category;
    item.append(h,value,cat);grid.append(item);
  });
  window.scrollTo({top:0,behavior:"smooth"});
}
function buildExportRow(payload) {
  const row = {
    Waktu_Kirim:payload.submittedAt,Nama:payload.nama,Universitas:payload.universitas,Fakultas:payload.fakultas,
    Jurusan:payload.jurusan,Umur:payload.umur,Jenis_Kelamin:payload.jenis_kelamin,Tinggi_cm:payload.tinggi,
    Berat_kg:payload.berat,Golongan_Darah:payload.golongan_darah,Durasi_Tidur_jam:payload.durasi_tidur,
    Durasi_Olahraga_jam_per_pekan:payload.durasi_olahraga,Durasi_Sosmed_jam_per_hari:payload.durasi_sosmed,
    Skor_Depresi:payload.scores.Depresi.score,Kategori_Depresi:payload.scores.Depresi.category,
    Skor_Kecemasan:payload.scores.Kecemasan.score,Kategori_Kecemasan:payload.scores.Kecemasan.category,
    Skor_Stres:payload.scores.Stres.score,Kategori_Stres:payload.scores.Stres.category
  };
  Object.assign(row,payload.answers);
  return row;
}
function downloadXLSX(payload) {
  const row=buildExportRow(payload);
  const keys=Object.keys(row);
  if (window.XLSX) {
    const sheet=XLSX.utils.json_to_sheet([row],{header:keys});
    sheet['!cols']=keys.map(k=>({wch:Math.min(34,Math.max(12,k.length+2))}));
    const book=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book,sheet,"Jawaban Saya");
    XLSX.writeFile(book,"Survei_Data_Mahasiswa_Jawaban_Saya.xlsx");
    return;
  }
  // Fallback if the optional spreadsheet library is unavailable.
  const csv=[keys.join(","),keys.map(k=>csvEscape(row[k])).join(",")].join("\r\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="Survei_Data_Mahasiswa_Jawaban_Saya.csv";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
  toast("File Excel belum bisa dibuat, jadi jawaban diunduh sebagai CSV.");
}
function csvEscape(value){return '"'+String(value??"").replace(/"/g,'""')+'"';}

document.addEventListener("DOMContentLoaded",()=>{
  spawnDecorations();renderQuestions();
  $("#consentCheck").addEventListener("change",()=>$("#startButton").disabled=!$("#consentCheck").checked);
  $("#soundToggle").addEventListener("click",()=>{setSound(!musicEnabled);});
  document.addEventListener("click",event=>{
    if(event.target.closest("button") && event.target.id!=="soundToggle") playPop();
  });
  $("#startButton").addEventListener("click",()=>{
    if(!$("#consentCheck").checked)return;
    $("#welcomeScreen").hidden=true;$("#surveyScreen").hidden=false;$("#surveyScreen").classList.add("active");showSection(0);
  });
  $$("[data-step]").forEach(btn=>btn.addEventListener("click",()=>{
    const input=$("#"+btn.dataset.target),step=Number(btn.dataset.step);
    const current=input.value===""?0:Number(input.value);
    const min=Number(input.min||0),max=Number(input.max||999);
    const next=Math.max(min,Math.min(max,Math.round((current+step)*100)/100));
    input.value=String(next);input.dispatchEvent(new Event("input",{bubbles:true}));playPop();
  }));
  $$(".next-button").forEach(btn=>btn.addEventListener("click",()=>{
    const section=$(`.form-section[data-section="${currentSection}"]`);
    if(!validateSection(section)){toast("Periksa kolom yang masih kosong, ya.");return;}
    if(currentSection<3)showSection(currentSection+1);
  }));
  $$(".prev-button").forEach(btn=>btn.addEventListener("click",()=>showSection(Math.max(0,currentSection-1))));
  $("#surveyForm").addEventListener("input",updateProgress);
  $("#surveyForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const section=$('.form-section[data-section="3"]');
    if(!validateSection(section)){toast("Lengkapi jawaban terakhir dulu, ya.");return;}
    const payload=getPayload();
    const submit=$("#submitButton");submit.disabled=true;submit.textContent="Mengirim jawaban…";
    try {
      await sendToSheets(payload);
      finalPayload=payload;
      showResults(payload,"Makasih yaa! Permintaan pengiriman sudah dikirim. Untuk memastikan jawaban benar-benar tersimpan, pengelola survei perlu memeriksa apakah baris baru muncul di Google Sheets.");
      toast("Permintaan dikirim 💗 Pastikan barisnya muncul di Sheets.");
    } catch(error) {
      console.error(error);
      submit.disabled=false;submit.textContent="Kirim Jawaban 💌";
      const err=error?.message||"Ada kendala saat menyiapkan pengiriman.";
      toast(err);
      section.querySelector(".form-error").textContent=err+" Coba lagi setelah URL backend diperiksa.";
    }
  });
  $("#downloadButton").addEventListener("click",()=>{if(finalPayload)downloadXLSX(finalPayload);});
  $("#finishButton").addEventListener("click",()=>{location.reload();});
  updateProgress();
});
