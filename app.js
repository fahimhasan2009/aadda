import { auth, db, firebaseConfigured } from "./firebase.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged,
  updateProfile, signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  collection, addDoc, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, orderBy, limit, onSnapshot, serverTimestamp, where, runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const $ = id => document.getElementById(id);
const state = { user:null, mode:"login", posts:[], unsubscribe:null, view:"feed", liked:new Set(), saved:new Set() };
const authModal=$("authModal"), feed=$("feed");

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function initials(name="A"){return name.trim().charAt(0).toUpperCase()||"A"}
function safeDate(ts){if(!ts?.toDate)return "এইমাত্র";return ts.toDate().toLocaleString("bn-BD",{dateStyle:"medium",timeStyle:"short"})}
function showAuth(){authModal.classList.remove("hidden")}
function hideAuth(){authModal.classList.add("hidden")}
function setMode(mode){state.mode=mode;const signup=mode==="signup";$("authTitle").textContent=signup?"নতুন অ্যাকাউন্ট তৈরি করো":"আড্ডায় যোগ দাও";$("authSubmit").innerHTML=signup?'অ্যাকাউন্ট তৈরি করো <span>↗</span>':'লগ ইন করো <span>↗</span>';$("nameField").classList.toggle("hidden",!signup);$("switchText").textContent=signup?"আগে থেকেই অ্যাকাউন্ট আছে?":"নতুন এখানে?";$("switchAuth").textContent=signup?"লগ ইন করো":"অ্যাকাউন্ট তৈরি করো";$("authError").textContent="";$("password").autocomplete=signup?"new-password":"current-password"}
$("switchAuth").addEventListener("click",()=>setMode(state.mode==="login"?"signup":"login"));
$("authForm").addEventListener("submit",async e=>{
 e.preventDefault();$("authError").textContent="";
 if(!firebaseConfigured){$("authError").textContent="আগে js/firebase.js ফাইলে Firebase config বসাও।";return}
 const email=$("email").value.trim(),password=$("password").value,name=$("displayName").value.trim();
 try{
  $("authSubmit").disabled=true;
  if(state.mode==="signup"){
   if(!name){$("authError").textContent="তোমার নাম লিখো।";return}
   const cred=await createUserWithEmailAndPassword(auth,email,password);
   await updateProfile(cred.user,{displayName:name});
   await setDoc(doc(db,"users",cred.user.uid),{displayName:name,email,createdAt:serverTimestamp(),bio:""});
  }else await signInWithEmailAndPassword(auth,email,password);
 }catch(err){$("authError").textContent=authError(err)}
 finally{$("authSubmit").disabled=false}
});
function authError(err){const map={"auth/email-already-in-use":"এই ইমেইলে অ্যাকাউন্ট আছে।","auth/invalid-email":"ইমেইল ঠিক নয়।","auth/weak-password":"পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।","auth/invalid-credential":"ইমেইল অথবা পাসওয়ার্ড সঠিক নয়.","auth/too-many-requests":"অনেকবার চেষ্টা হয়েছে। একটু পরে চেষ্টা করো."};return map[err.code]||"সমস্যা হয়েছে: "+err.message}
onAuthStateChanged(auth,async user=>{
 state.user=user;
 if(user){hideAuth();$("logoutButton").classList.remove("hidden");const name=user.displayName||"Adda User";$("sideName").textContent=name;$("sideHandle").textContent="@"+(user.email?.split("@")[0]||"user");["sideAvatar","headerAvatar","composerAvatar"].forEach(id=>$(id).textContent=initials(name));startFeed()}
 else{showAuth();$("logoutButton").classList.add("hidden");if(state.unsubscribe)state.unsubscribe();feed.innerHTML='<div class="empty-state"><div class="empty-icon">✦</div><strong>আড্ডায় স্বাগতম</strong><p>লগ ইন করলে কমিউনিটির পোস্ট দেখতে পাবে।</p></div>'}
});
$("logoutButton").addEventListener("click",()=>signOut(auth).then(()=>toast("লগ আউট হয়েছে।")));
$("postText").addEventListener("input",e=>$("charCount").textContent=`${e.target.value.length} / 1000`);
$("publishButton").addEventListener("click",async()=>{
 const text=$("postText").value.trim();if(!text)return toast("আগে কিছু লিখো।");if(!state.user)return showAuth();
 try{await addDoc(collection(db,"posts"),{text,uid:state.user.uid,authorName:state.user.displayName||"Adda User",createdAt:serverTimestamp(),likeCount:0,commentCount:0});$("postText").value="";$("charCount").textContent="0 / 1000";toast("তোমার লেখা প্রকাশিত হয়েছে!")}
 catch(e){toast("পোস্ট করা যায়নি: "+e.message)}
});
function startFeed(){
 const q=query(collection(db,"posts"),orderBy("createdAt","desc"),limit(60));
 state.unsubscribe=onSnapshot(q,snap=>{state.posts=snap.docs.map(d=>({id:d.id,...d.data()}));renderFeed()},err=>{feed.innerHTML=`<div class="empty-state"><strong>ফিড লোড হয়নি</strong><p>${escapeHtml(err.message)}</p></div>`});
}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderFeed(){
 let posts=[...state.posts];const search=$("searchInput").value.trim().toLowerCase();
 if(search)posts=posts.filter(p=>(p.text||"").toLowerCase().includes(search)||(p.authorName||"").toLowerCase().includes(search));
 if(state.view==="profile")posts=posts.filter(p=>p.uid===state.user?.uid);
 if(state.view==="saved")posts=posts.filter(p=>state.saved.has(p.id));
 if($("sortSelect").value==="old")posts.reverse();
 $("feedHeading").textContent=state.view==="profile"?"আমার পোস্ট":state.view==="saved"?"পছন্দের পোস্ট":"সবার লেখা";
 $("postCount").textContent=`${posts.length}টি পোস্ট`;
 if(!posts.length){feed.innerHTML='<div class="empty-state"><div class="empty-icon">✦</div><strong>এখনো কিছু নেই</strong><p>প্রথম পোস্টটি তুমি লিখে শুরু করতে পারো।</p></div>';return}
 feed.innerHTML=posts.map(p=>`<article class="post-card" data-id="${p.id}">
  <div class="post-head"><div class="avatar">${escapeHtml(initials(p.authorName))}</div><div class="post-author"><strong>${escapeHtml(p.authorName||"Adda User")}</strong><small>${escapeHtml(safeDate(p.createdAt))}</small></div>
  ${p.uid===state.user?.uid?'<button class="post-menu" data-action="delete" title="Delete post">⋯</button>':""}</div>
  <div class="post-body">${escapeHtml(p.text||"")}</div>
  <div class="post-actions"><button class="post-action ${state.liked.has(p.id)?"liked":""}" data-action="like">♡ ${p.likeCount||0} লাইক</button><button class="post-action" data-action="comments">▢ মন্তব্য</button><button class="post-action" data-action="save">${state.saved.has(p.id)?"♥ সংরক্ষিত":"＋ সংরক্ষণ"}</button></div>
  <div class="comment-area hidden"><div class="comment-list" id="comments-${p.id}"></div><form class="comment-form"><input name="comment" maxlength="300" placeholder="একটি মন্তব্য লিখো..." required><button>পাঠাও</button></form></div>
 </article>`).join("");
}
feed.addEventListener("click",async e=>{
 const btn=e.target.closest("[data-action]");if(!btn)return;const card=btn.closest(".post-card"),id=card.dataset.id,p=state.posts.find(x=>x.id===id);if(!p)return;
 const action=btn.dataset.action;
 if(action==="save"){state.saved.has(id)?state.saved.delete(id):state.saved.add(id);renderFeed()}
 if(action==="delete"){if(confirm("এই পোস্টটি মুছে ফেলতে চাও?")){try{await deleteDoc(doc(db,"posts",id));toast("পোস্ট মুছে ফেলা হয়েছে।")}catch(err){toast(err.message)}}}
 if(action==="like"){try{const likeRef=doc(db,"posts",id,"likes",state.user.uid);await runTransaction(db,async tx=>{const snap=await tx.get(likeRef);const postRef=doc(db,"posts",id);const postSnap=await tx.get(postRef);if(!postSnap.exists())return;const count=postSnap.data().likeCount||0;if(snap.exists()){tx.delete(likeRef);tx.update(postRef,{likeCount:Math.max(0,count-1)})}else{tx.set(likeRef,{uid:state.user.uid,createdAt:serverTimestamp()});tx.update(postRef,{likeCount:count+1})}});state.liked.has(id)?state.liked.delete(id):state.liked.add(id);renderFeed()}catch(err){toast("লাইক করা যায়নি: "+err.message)}}
 if(action==="comments"){const area=card.querySelector(".comment-area");area.classList.toggle("hidden");if(!area.classList.contains("hidden"))loadComments(id)}
});
feed.addEventListener("submit",async e=>{
 if(!e.target.matches(".comment-form"))return;e.preventDefault();const card=e.target.closest(".post-card"),id=card.dataset.id,input=e.target.elements.comment,text=input.value.trim();if(!text)return;
 try{await addDoc(collection(db,"posts",id,"comments"),{text,uid:state.user.uid,authorName:state.user.displayName||"Adda User",createdAt:serverTimestamp()});input.value="";toast("মন্তব্য যোগ হয়েছে।")}catch(err){toast("মন্তব্য করা যায়নি: "+err.message)}
});
async function loadComments(postId){
 const list=$("comments-"+postId);list.textContent="মন্তব্য লোড হচ্ছে...";
 try{const snap=await getDocs(query(collection(db,"posts",postId,"comments"),orderBy("createdAt","asc"),limit(30)));list.innerHTML=snap.empty?'<p class="comment">এখনো কোনো মন্তব্য নেই।</p>':snap.docs.map(d=>`<p class="comment"><strong>${escapeHtml(d.data().authorName||"User")}</strong>${escapeHtml(d.data().text)}</p>`).join("")}
 catch(e){list.textContent="মন্তব্য লোড করা যায়নি।"}
}
$("searchInput").addEventListener("input",renderFeed);$("sortSelect").addEventListener("change",renderFeed);
document.querySelectorAll(".nav-link").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-link").forEach(b=>b.classList.remove("active"));btn.classList.add("active");state.view=btn.dataset.view;$("composer").classList.toggle("hidden",state.view!=="feed");renderFeed()}));
$("themeButton").addEventListener("click",()=>document.body.classList.toggle("dark"));
$("todayLabel").textContent=new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()+" ✦";
