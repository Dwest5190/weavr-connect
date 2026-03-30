import { useState, useEffect, useRef, useCallback } from "react";

/* ══════ CONFIG ══════ */
var STAGES=[
  {key:"first-visit",label:"First Visit",color:"#6EE7B7",grad:"linear-gradient(135deg,#6EE7B7,#3DD9A0)"},
  {key:"salvation",label:"Salvation",color:"#A78BFA",grad:"linear-gradient(135deg,#A78BFA,#8B5CF6)"},
  {key:"baptism",label:"Baptism",color:"#67E8F9",grad:"linear-gradient(135deg,#67E8F9,#22D3EE)"},
  {key:"next-steps",label:"Next Steps",color:"#FBBF24",grad:"linear-gradient(135deg,#FBBF24,#F59E0B)"},
  {key:"bgroup",label:"BGroup",color:"#F9A8D4",grad:"linear-gradient(135deg,#F9A8D4,#EC4899)"},
  {key:"ateam",label:"ATeam",color:"#34D399",grad:"linear-gradient(135deg,#34D399,#10B981)"}
];
var SIDX=Object.fromEntries(STAGES.map(function(s,i){return[s.key,i]}));
var DEFAULT_TPL={"first-visit":"Hey {firstName}, it was great having you! How was your visit?",salvation:"Hey {firstName}, so excited about your decision! Can we connect?","next-steps":"Hey {firstName}! Next Steps is coming up. Want a seat?",baptism:"Hey {firstName}, baptism is incredible. Can we talk?",bgroup:"Hey {firstName}! BGroups are where community happens. Interested?",ateam:"Hey {firstName}, you'd be amazing on ATeam. Can we chat?"};
var NEXT_ACT={"first-visit":"Send welcome message",salvation:"Schedule discipleship","next-steps":"Invite to Next Steps",baptism:"Schedule baptism chat",bgroup:"Connect to BGroup",ateam:"Invite to ATeam"};
var FU_SUGGEST={"first-visit":{days:1,label:"24 hrs"},salvation:{days:3,label:"3 days"},baptism:{days:5,label:"5 days"},"next-steps":{days:7,label:"1 week"},bgroup:{days:7,label:"1 week"},ateam:{days:7,label:"1 week"}};
var DEFAULT_CI=[
  {key:"conversation",label:"Had Conversation",icon:"msg",color:"#7C3AED"},
  {key:"text-sent",label:"Sent Text",icon:"phone",color:"#06B6D4"},
  {key:"voicemail",label:"Left Voicemail",icon:"phone",color:"#F59E0B"},
  {key:"email-sent",label:"Sent Email",icon:"check",color:"#10B981"}
];
var DEFAULT_FIELDS=[
  {key:"firstName",label:"First Name",type:"text",required:true,enabled:true},
  {key:"lastName",label:"Last Name",type:"text",required:false,enabled:true},
  {key:"phone",label:"Phone",type:"text",required:false,enabled:true},
  {key:"email",label:"Email",type:"text",required:false,enabled:true},
  {key:"currentStage",label:"Stage",type:"stage",required:true,enabled:true},
  {key:"serviceAttended",label:"Service Attended",type:"text",required:false,enabled:true},
  {key:"campus",label:"Campus",type:"dropdown",options:["Main","North","South","Online"],required:false,enabled:false},
  {key:"ageGroup",label:"Age Group",type:"dropdown",options:["18-25","26-35","36-45","46-55","56+"],required:false,enabled:false},
  {key:"howHeard",label:"How Did You Hear?",type:"dropdown",options:["Friend","Social Media","Website","Walk-in","Other"],required:false,enabled:false},
  {key:"prayerRequest",label:"Prayer Request",type:"text",required:false,enabled:false},
  {key:"hasKids",label:"Has Children",type:"checkbox",required:false,enabled:false},
  {key:"wantsInfo",label:"Wants More Info",type:"checkbox",required:false,enabled:false}
];
var TC=["#7C3AED","#06B6D4","#EC4899","#F59E0B","#10B981","#EF4444","#6366F1","#14B8A6"];
var THEMES={
  light:{bg:"#F5F6FA",card:"#FFFFFF",cardBorder:"none",text:"#1A1D2E",textSub:"#5E6278",textMuted:"#A1A5B7",inp:"#F9FAFB",inpBorder:"#EDF0F5",divider:"#F1F3F8",hover:"rgba(124,58,237,0.03)",thBg:"#F9FAFB"},
  dark:{bg:"linear-gradient(145deg,#1A1744,#252262,#1A1744)",card:"rgba(42,38,115,0.65)",cardBorder:"1px solid rgba(255,255,255,0.1)",text:"#F1F5F9",textSub:"#94A3B8",textMuted:"#64748B",inp:"rgba(255,255,255,0.08)",inpBorder:"rgba(255,255,255,0.12)",divider:"rgba(255,255,255,0.07)",hover:"rgba(255,255,255,0.04)",thBg:"rgba(255,255,255,0.04)"},
  mono:{bg:"#F8F9FA",card:"#FFFFFF",cardBorder:"1px solid #E9ECEF",text:"#212529",textSub:"#6C757D",textMuted:"#ADB5BD",inp:"#F8F9FA",inpBorder:"#DEE2E6",divider:"#E9ECEF",hover:"rgba(0,0,0,0.02)",thBg:"#F8F9FA"}
};
var COLORWAYS={
  purple:{primary:"#7C3AED",primaryGrad:"linear-gradient(135deg,#8B5CF6,#7C3AED)",accent:"#A78BFA",sidebar:"linear-gradient(180deg,#3730A3,#2E2A6E 60%,#1E1B4B)",logo:"linear-gradient(135deg,#7C3AED,#06B6D4)",hero:"linear-gradient(135deg,#5B47B0,#3730A3)",darkHero:"linear-gradient(135deg,#3730A3,#2E2A6E)",darkBg:"linear-gradient(145deg,#1E1B4B,#2E2A6E,#1E1B4B)",darkCard:"rgba(55,48,163,0.35)",darkSolid:"#2E2A6E"},
  teal:{primary:"#0891B2",primaryGrad:"linear-gradient(135deg,#22D3EE,#0891B2)",accent:"#67E8F9",sidebar:"linear-gradient(180deg,#1A6B7F,#155E6E 60%,#0E3A4F)",logo:"linear-gradient(135deg,#06B6D4,#10B981)",hero:"linear-gradient(135deg,#0E7490,#1A6B7F)",darkHero:"linear-gradient(135deg,#155E6E,#0E3A4F)",darkBg:"linear-gradient(145deg,#0E3A4F,#1A6B7F,#0E3A4F)",darkCard:"rgba(26,107,127,0.35)",darkSolid:"#155E6E"},
  rose:{primary:"#E11D48",primaryGrad:"linear-gradient(135deg,#FB7185,#E11D48)",accent:"#FDA4AF",sidebar:"linear-gradient(180deg,#5C1229,#4A0E20 60%,#3B0A18)",logo:"linear-gradient(135deg,#E11D48,#F59E0B)",hero:"linear-gradient(135deg,#9F1239,#5C1229)",darkHero:"linear-gradient(135deg,#4A0E20,#3B0A18)",darkBg:"linear-gradient(145deg,#3B0A18,#5C1229,#3B0A18)",darkCard:"rgba(92,18,41,0.35)",darkSolid:"#4A0E20"},
  emerald:{primary:"#059669",primaryGrad:"linear-gradient(135deg,#34D399,#059669)",accent:"#6EE7B7",sidebar:"linear-gradient(180deg,#0B6B4A,#064E3B 60%,#04362A)",logo:"linear-gradient(135deg,#059669,#06B6D4)",hero:"linear-gradient(135deg,#047857,#0B6B4A)",darkHero:"linear-gradient(135deg,#064E3B,#04362A)",darkBg:"linear-gradient(145deg,#04362A,#0B6B4A,#04362A)",darkCard:"rgba(11,107,74,0.35)",darkSolid:"#064E3B"},
  mono:{primary:"#495057",primaryGrad:"linear-gradient(135deg,#6C757D,#495057)",accent:"#ADB5BD",sidebar:"linear-gradient(180deg,#F8F9FA,#E9ECEF 60%,#DEE2E6)",logo:"linear-gradient(135deg,#6C757D,#495057)",hero:"linear-gradient(135deg,#E9ECEF,#DEE2E6)",darkHero:"linear-gradient(135deg,#E9ECEF,#DEE2E6)",darkBg:"#F8F9FA",darkCard:"#FFFFFF",darkSolid:"#FFFFFF"}
};

var uid=function(){return Date.now().toString(36)+Math.random().toString(36).substr(2,8)};
var openUrl=function(url){try{window.open(url,"_top")}catch(e){try{window.parent.location.href=url}catch(e2){}}};
var smsUrl=function(phone,body){return"sms:"+phone+(body?"&body="+encodeURIComponent(body):"")};
var telUrl=function(phone){return"tel:"+phone};
var mailUrl=function(email,subj,body){return"mailto:"+email+"?subject="+encodeURIComponent(subj||"")+"&body="+encodeURIComponent(body||"")};
var tplFor=function(person,templates){var t=(templates||{})[person.currentStage]||DEFAULT_TPL[person.currentStage]||"";return t.replace("{firstName}",person.firstName).replace("{lastName}",person.lastName||"")};
var emailFor=function(person,config){var eTpls=(config||{}).emailTemplates||{};var eSubjs=(config||{}).emailSubjects||{};var body=(eTpls[person.currentStage]||DEFAULT_TPL[person.currentStage]||"").replace("{firstName}",person.firstName).replace("{lastName}",person.lastName||"");var subj=(eSubjs[person.currentStage]||"Following up").replace("{firstName}",person.firstName);return{subj:subj,body:body}};

/* ══════ CONTACT ACTION PANEL ══════ */
function ContactAction(p){
  var [copied,setCopied]=useState("");
  var doCopy=function(text,id){copyText(text,function(ok){if(ok){setCopied(id);setTimeout(function(){setCopied("")},2000)}})};
  var person=p.person;var msg=p.message||"";var em=p.email||{};
  return <Modal title={"Contact "+person.firstName} onClose={p.onClose}>
    {person.phone&&<div style={{marginBottom:13}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Phone</div>
      <div style={{display:"flex",alignItems:"center",gap:7,background:"var(--inp)",borderRadius:10,padding:"10px 13px"}}>
        <I n="phone" sz={16} c="var(--primary)"/>
        <span style={{flex:1,fontSize:13,fontWeight:600,color:"var(--text)",letterSpacing:"0.02em"}}>{fmtPhone(person.phone)}</span>
        <button onClick={function(){doCopy(person.phone,"phone")}} style={{padding:"5px 11px",borderRadius:7,background:copied==="phone"?"#10B981":"var(--primary)",color:"#fff",border:"none",fontSize:9,fontWeight:600,cursor:"pointer"}}>{copied==="phone"?"Copied!":"Copy #"}</button>
      </div>
      <div style={{display:"flex",gap:5,marginTop:6}}>
        <a href={smsUrl(person.phone,msg)} target="_top" style={{flex:1,textDecoration:"none",padding:"8px",borderRadius:8,background:"#06B6D410",border:"1px solid #06B6D425",textAlign:"center",fontSize:10,fontWeight:600,color:"#06B6D4",display:"block"}}>Open in Messages</a>
        <a href={telUrl(person.phone)} target="_top" style={{flex:1,textDecoration:"none",padding:"8px",borderRadius:8,background:"var(--primary)10",border:"1px solid var(--primary)25",textAlign:"center",fontSize:10,fontWeight:600,color:"var(--primary)",display:"block"}}>Call</a>
      </div>
    </div>}
    {msg&&<div style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)"}}>Text Message</div>
        <button onClick={function(){doCopy(msg,"msg")}} style={{padding:"3px 10px",borderRadius:5,background:copied==="msg"?"#10B981":"var(--inp)",color:copied==="msg"?"#fff":"var(--text-sub)",border:"1px solid var(--inp-border)",fontSize:9,fontWeight:600,cursor:"pointer"}}>{copied==="msg"?"Copied!":"Copy"}</button>
      </div>
      <div style={{background:"var(--inp)",borderRadius:8,padding:"10px 13px",fontSize:11,color:"var(--text)",lineHeight:1.7,border:"1px solid var(--inp-border)"}}>{msg}</div>
    </div>}
    {person.email&&<div>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Email</div>
      <div style={{background:"var(--inp)",borderRadius:10,padding:"10px 13px",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><I n="mail" sz={14} c="#10B981"/><span style={{fontSize:12,fontWeight:600,color:"var(--text)",flex:1}}>{person.email}</span><button onClick={function(){doCopy(person.email,"email")}} style={{padding:"3px 8px",borderRadius:5,background:copied==="email"?"#10B981":"var(--card)",color:copied==="email"?"#fff":"var(--text-sub)",border:"1px solid var(--inp-border)",fontSize:9,fontWeight:600,cursor:"pointer"}}>{copied==="email"?"Copied!":"Copy"}</button></div>
        {em.subj&&<div style={{marginBottom:5}}><div style={{fontSize:8,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase"}}>Subject</div><div style={{fontSize:10,color:"var(--text)",marginTop:2}}>{em.subj}</div></div>}
        {em.body&&<div><div style={{fontSize:8,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase"}}>Body</div><div style={{fontSize:10,color:"var(--text-sub)",marginTop:2,lineHeight:1.6}}>{em.body}</div></div>}
      </div>
      <div style={{display:"flex",gap:5}}>
        <a href={mailUrl(person.email,em.subj||"",em.body||"")} target="_top" style={{flex:1,textDecoration:"none",padding:"8px",borderRadius:8,background:"#10B98110",border:"1px solid #10B98125",textAlign:"center",fontSize:10,fontWeight:600,color:"#10B981",display:"block"}}>Open in Mail</a>
        <button onClick={function(){doCopy((em.subj?"Subject: "+em.subj+"\n\n":"")+em.body,"ebody")}} style={{flex:1,padding:"8px",borderRadius:8,background:"var(--inp)",border:"1px solid var(--inp-border)",fontSize:10,fontWeight:600,color:"var(--text-sub)",cursor:"pointer"}}>{copied==="ebody"?"Copied!":"Copy All"}</button>
      </div>
    </div>}
  </Modal>;
}
var ago=function(d){return d?Math.floor((Date.now()-new Date(d).getTime())/864e5):null};
var fmt=function(d){return d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"\u2014"};
var fmtS=function(d){return d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"\u2014"};
var NON_ALPHA=/[^a-z]/g;
var csvParse=function(t){var r=[],c="",q=false;for(var i=0;i<t.length;i++){if(t[i]==='"')q=!q;else if(t[i]===","&&!q){r.push(c.trim());c="";}else c+=t[i]}r.push(c.trim());return r};
var csvCell=function(c){var s=String(c==null?"":c),dq=String.fromCharCode(34);return dq+s.split(dq).join(dq+dq)+dq};
var csvExport=function(h,rows,fn){var csv=[h].concat(rows).map(function(r){return r.map(csvCell).join(",")}).join("\n");var b=new Blob([csv],{type:"text/csv"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download=fn||"export.csv";a.click();URL.revokeObjectURL(u)};
var classifyHeader=function(h){var hl=h.toLowerCase().replace(NON_ALPHA,"");if(hl.includes("first"))return"firstName";if(hl.includes("last"))return"lastName";if(hl.includes("phone")||hl.includes("mobile"))return"phone";if(hl.includes("email"))return"email";if(hl.includes("stage")||hl.includes("step"))return"currentStage";if(hl.includes("service"))return"serviceAttended";return null};
var fmtPhone=function(v){var d=(v||"").replace(/\D/g,"");if(d.length===0)return"";if(d.length<=3)return"("+d;if(d.length<=6)return"("+d.slice(0,3)+") "+d.slice(3);return"("+d.slice(0,3)+") "+d.slice(3,6)+"-"+d.slice(6,10)};
/* Reliable copy function */
var copyText=function(text,cb){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){if(cb)cb(true)}).catch(function(){fallbackCopy(text,cb)});
  }else{fallbackCopy(text,cb)}
};
var fallbackCopy=function(text,cb){
  var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");if(cb)cb(true)}catch(e){if(cb)cb(false)}
  document.body.removeChild(ta);
};
function calcScore(p){var s=50,d=ago(p.lastContactDate);if(d===null)s-=30;else if(d<=1)s+=20;else if(d<=3)s+=10;else if(d<=7)s-=5;else if(d<=14)s-=15;else s-=25;s+=(SIDX[p.currentStage]||0)*5;var ch=p.checkIns||[];s+=Math.min(ch.filter(function(c){return ago(c.date)<=14}).length*5,15);var pos=ch.filter(function(c){return c.type==="conversation"||c.type==="interested"}).length;var neg=ch.filter(function(c){return c.type==="no-response"}).length;if(ch.length>0){s+=Math.round(pos/ch.length*15);s-=Math.round(neg/ch.length*10)}if(ago(p.createdAt)>30&&(SIDX[p.currentStage]||0)===0)s-=10;return Math.max(0,Math.min(100,Math.round(s)))}
function scoreColor(s){return s>=75?"#10B981":s>=50?"#06B6D4":s>=30?"#F59E0B":"#EF4444"}
function scoreLabel(s){return s>=75?"Highly Engaged":s>=50?"Engaged":s>=30?"At Risk":"Disengaging"}
var db={async get(k,fb){try{var p=window.storage.get(k);var timeout=new Promise(function(r){setTimeout(function(){r(null)},2000)});var r=await Promise.race([p,timeout]);return r&&r.value?JSON.parse(r.value):fb}catch(e){return fb}},async set(k,v){try{await window.storage.set(k,JSON.stringify(v))}catch(e){}}};

/* ══════ ICONS ══════ */
var I=function(props){var n=props.n,size=props.sz||18,col=props.c||"currentColor";var paths={home:<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeWidth="1.5" strokeLinejoin="round"/>,users:<g><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5"/></g>,plus:<path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round"/>,upload:<g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" strokeLinecap="round"/><polyline points="17 8 12 3 7 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" strokeLinecap="round"/></g>,search:<g><circle cx="11" cy="11" r="8" strokeWidth="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="1.5" strokeLinecap="round"/></g>,x:<g><line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round"/></g>,check:<polyline points="20 6 9 17 4 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,up:<polyline points="18 15 12 9 6 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,msg:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="1.5" strokeLinejoin="round"/>,edit:<g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="1.5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="1.5"/></g>,trash:<g><polyline points="3 6 5 6 21 6" strokeWidth="1.5"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" strokeLinecap="round"/></g>,gear:<g><circle cx="12" cy="12" r="3" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="1.5"/></g>,dl:<g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5"/><polyline points="7 10 12 15 17 10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeWidth="1.5" strokeLinecap="round"/></g>,phone:<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeWidth="1.5"/>,mail:<g><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" strokeWidth="1.5"/></g>,copy:<g><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="1.5"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="1.5"/></g>,flag:<g><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" strokeWidth="1.5"/><line x1="4" y1="22" x2="4" y2="15" strokeWidth="1.5"/></g>,zap:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="1.5" strokeLinejoin="round"/>,chart:<path d="M18 20V10M12 20V4M6 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,send:<g><line x1="22" y1="2" x2="11" y2="13" strokeWidth="1.5"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="1.5" strokeLinejoin="round"/></g>,card:<g><rect x="2" y="3" width="20" height="18" rx="2" strokeWidth="1.5"/><line x1="2" y1="9" x2="22" y2="9" strokeWidth="1.5"/></g>,sun:<g><circle cx="12" cy="12" r="5" strokeWidth="1.5"/><line x1="12" y1="1" x2="12" y2="3" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="23" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="12" x2="3" y2="12" strokeWidth="1.5" strokeLinecap="round"/><line x1="21" y1="12" x2="23" y2="12" strokeWidth="1.5" strokeLinecap="round"/></g>,target:<g><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" strokeWidth="1.5"/></g>,cal:<g><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5"/></g>,clock:<g><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><polyline points="12 6 12 12 16 14" strokeWidth="1.5" strokeLinecap="round"/></g>,eye:<g><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" strokeWidth="1.5"/></g>,palette:<g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.21-1.01-.55-1.37-.33-.35-.55-.83-.55-1.37 0-1.1.9-2 2-2h2.36C19.86 15.26 22 13.13 22 10.5 22 5.81 17.52 2 12 2z" strokeWidth="1.5"/><circle cx="7.5" cy="11.5" r="1.5" fill={col} strokeWidth="0"/><circle cx="10.5" cy="7.5" r="1.5" fill={col} strokeWidth="0"/><circle cx="15.5" cy="7.5" r="1.5" fill={col} strokeWidth="0"/></g>,heart:<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="1.5" strokeLinejoin="round"/>,back:<g><line x1="19" y1="12" x2="5" y2="12" strokeWidth="1.5" strokeLinecap="round"/><polyline points="12 19 5 12 12 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></g>,grip:<g><circle cx="9" cy="6" r="1.5" fill={col} strokeWidth="0"/><circle cx="15" cy="6" r="1.5" fill={col} strokeWidth="0"/><circle cx="9" cy="12" r="1.5" fill={col} strokeWidth="0"/><circle cx="15" cy="12" r="1.5" fill={col} strokeWidth="0"/><circle cx="9" cy="18" r="1.5" fill={col} strokeWidth="0"/><circle cx="15" cy="18" r="1.5" fill={col} strokeWidth="0"/></g>,expand:<g><polyline points="15 3 21 3 21 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 21 3 21 3 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="3" x2="14" y2="10" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="21" x2="10" y2="14" strokeWidth="1.5" strokeLinecap="round"/></g>,grid:<g><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/></g>};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={col} xmlns="http://www.w3.org/2000/svg">{paths[n]}</svg>};

/* ══════ SMALL COMPONENTS ══════ */
function RingMini(p){var size=p.sz||52,sw=4,r=(size-sw)/2,circ=2*Math.PI*r,pct=p.max>0?Math.min(p.value/p.max,1):0;return <div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{position:"absolute",transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={p.color} strokeWidth={sw} strokeDasharray={String(circ)} strokeDashoffset={String(circ*(1-pct))} strokeLinecap="round"/></svg><span style={{position:"relative",fontSize:size>40?16:12,fontWeight:700,color:"#fff"}}>{p.value}</span></div>}
function ScoreRing(p){var size=p.sz||40,sw=2.5,r=(size-sw)/2,circ=2*Math.PI*r,col=scoreColor(p.score);return <div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{position:"absolute",transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" style={{opacity:0.08}} strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={String(circ)} strokeDashoffset={String(circ*(1-p.score/100))} strokeLinecap="round"/></svg><span style={{position:"relative",fontSize:9,fontWeight:700,color:col}}>{p.score}</span></div>}
var Dot=function(p){var s=p.sz||8;return <span style={{width:s,height:s,borderRadius:"50%",background:p.color||"#ccc",display:"inline-block",flexShrink:0}}/>};

function Btn(p){var v=p.v||"default";var base={display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",border:"none",transition:"all 0.2s"};var styles=v==="ghost"?{background:"var(--inp)",color:"var(--text-sub)",border:"1px solid var(--inp-border)"}:v==="red"?{background:"#FEF2F2",color:"#EF4444",border:"1px solid #FECACA"}:v==="green"?{background:"#ECFDF5",color:"#059669",border:"1px solid #D1FAE5"}:v==="teal"?{background:"#ECFEFF",color:"#0891B2",border:"1px solid #CFFAFE"}:{background:"var(--primary)",color:"#fff",boxShadow:"0 2px 8px var(--primary)30"};return <button style={{...base,...styles,...p.sx}} onClick={p.onClick} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)"}}>{p.icon && <I n={p.icon} sz={14}/>}{p.label}</button>}

function Field(p){return <div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{p.label}</div><input style={{width:"100%",padding:"10px 13px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}} value={p.value} onChange={function(e){p.onChange(e.target.value)}} autoFocus={p.autoFocus} placeholder={p.placeholder}/></div>}

function Reveal(p){
  var [vis,setVis]=useState(false);var [closing,setClosing]=useState(false);
  useEffect(function(){if(p.open&&!vis){setVis(true);setClosing(false)}if(!p.open&&vis&&!closing){setClosing(true);setTimeout(function(){setVis(false);setClosing(false)},420)}},[p.open]);
  if(!vis)return null;
  return <div style={{animation:closing?"revealUp 0.42s cubic-bezier(0.4,0,0.2,1) forwards":"revealDown 0.42s cubic-bezier(0.4,0,0.2,1)",overflow:"hidden"}}>{p.children}</div>;
}

var SORT_OPTS=[{key:"newest",label:"Newest"},{key:"oldest",label:"Oldest"},{key:"name-az",label:"Name A-Z"},{key:"name-za",label:"Name Z-A"},{key:"last-contact",label:"Last Contacted"},{key:"score-high",label:"Score High"},{key:"score-low",label:"Score Low"}];
var sortPeople=function(list,sortKey){var arr=list.slice();if(sortKey==="newest")arr.sort(function(a,b){return new Date(b.createdAt||0)-new Date(a.createdAt||0)});if(sortKey==="oldest")arr.sort(function(a,b){return new Date(a.createdAt||0)-new Date(b.createdAt||0)});if(sortKey==="name-az")arr.sort(function(a,b){return(a.firstName||"").localeCompare(b.firstName||"")});if(sortKey==="name-za")arr.sort(function(a,b){return(b.firstName||"").localeCompare(a.firstName||"")});if(sortKey==="last-contact")arr.sort(function(a,b){var da=a.lastContactDate?new Date(a.lastContactDate):new Date(0);var db=b.lastContactDate?new Date(b.lastContactDate):new Date(0);return da-db});if(sortKey==="score-high")arr.sort(function(a,b){return calcScore(b)-calcScore(a)});if(sortKey==="score-low")arr.sort(function(a,b){return calcScore(a)-calcScore(b)});return arr};
function SortBar(p){return <div className="weavr-sort-wrap" style={{display:"flex",gap:5,flexWrap:"wrap"}}>{(p.opts||SORT_OPTS).map(function(o){var active=p.value===o.key;return <button key={o.key} onClick={function(){p.onChange(active?"newest":o.key)}} style={{padding:"5px 11px",borderRadius:8,border:active?"1px solid var(--primary)":"1px solid transparent",background:active?"var(--primary)08":"var(--inp)",fontSize:9,fontWeight:active?700:500,color:active?"var(--primary)":"var(--text-muted)",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={function(e){if(!active)e.currentTarget.style.background="var(--divider)"}} onMouseLeave={function(e){if(!active)e.currentTarget.style.background="var(--inp)"}}>{o.label}</button>})}</div>}

function Modal(p){return <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",animation:"gentleFade 0.3s ease"}} onClick={p.onClose}><div className="weavr-modal-inner" style={{background:"var(--card-solid)",borderRadius:20,padding:26,width:p.wide?580:400,maxWidth:"92vw",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.15)",animation:"gentleFade 0.35s cubic-bezier(0.22,1,0.36,1)"}} onClick={function(e){e.stopPropagation()}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h3 style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>{p.title}</h3><button style={{background:"var(--inp)",border:"1px solid var(--inp-border)",borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}} onClick={p.onClose}><I n="x" sz={16} c="var(--text-muted)"/></button></div>{p.children}</div></div>}

/* ══════ MINI CALENDAR ══════ */
function MiniCal(p){
  var [viewDate,setViewDate]=useState(function(){return p.selected?new Date(p.selected):new Date()});
  var year=viewDate.getFullYear(),month=viewDate.getMonth();
  var firstDay=new Date(year,month,1).getDay();
  var daysInMonth=new Date(year,month+1,0).getDate();
  var today=new Date();today.setHours(0,0,0,0);
  var cells=[];for(var i=0;i<firstDay;i++)cells.push(null);for(var d=1;d<=daysInMonth;d++)cells.push(d);
  var monthName=new Date(year,month).toLocaleDateString("en-US",{month:"long",year:"numeric"});
  var selD=p.selected?new Date(p.selected):null;if(selD)selD.setHours(0,0,0,0);
  var prev=function(){setViewDate(new Date(year,month-1,1))};
  var next=function(){setViewDate(new Date(year,month+1,1))};

  return <div style={{background:"var(--card)",borderRadius:17,padding:13,border:"1px solid var(--inp-border)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:14}}>{"\u2039"}</button>
      <span style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{monthName}</span>
      <button onClick={next} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:14}}>{"\u203A"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
      {["S","M","T","W","T","F","S"].map(function(d,i){return <div key={i} style={{fontSize:9,fontWeight:700,color:"var(--text-muted)",padding:3}}>{d}</div>})}
      {cells.map(function(day,i){
        if(!day)return <div key={"e"+i}/>;
        var dt=new Date(year,month,day);dt.setHours(0,0,0,0);
        var isToday=dt.getTime()===today.getTime();
        var isSel=selD&&dt.getTime()===selD.getTime();
        var isPast=dt<today;
        return <button key={i} disabled={isPast} onClick={function(){p.onSelect(dt.toISOString().split("T")[0])}} style={{width:32,height:32,borderRadius:8,border:"none",fontSize:10,fontWeight:isSel?700:isToday?600:400,background:isSel?"var(--primary)":isToday?"var(--primary)15":"transparent",color:isSel?"#fff":isPast?"var(--text-muted)":"var(--text)",cursor:isPast?"default":"pointer",opacity:isPast?0.4:1}}>{day}</button>;
      })}
    </div>
  </div>;
}

/* ══════ OVERVIEW ══════ */
var OV_WIDGETS=[
  {key:"next-up",label:"Next Up",icon:"zap",defaultSize:"full"},
  {key:"mml",label:"Monday Morning List",icon:"sun",defaultSize:"full"},
  {key:"funnel",label:"Engagement Funnel",icon:"chart",defaultSize:"full"},
  {key:"weekly-stats",label:"Weekly Stats",icon:"target",defaultSize:"full"},
  {key:"kpis",label:"KPI Summary",icon:"users",defaultSize:"full"},
  {key:"distribution",label:"Engagement Distribution",icon:"chart",defaultSize:"half"},
  {key:"velocity",label:"Stage Velocity",icon:"clock",defaultSize:"half"},
  {key:"team",label:"Team Performance",icon:"flag",defaultSize:"half"},
  {key:"recent",label:"Recent Check-ins",icon:"msg",defaultSize:"half"},
  {key:"stale",label:"Stale Contacts",icon:"eye",defaultSize:"half"},
  {key:"weekly-summary",label:"This Week Summary",icon:"cal",defaultSize:"half"}
];
var DEFAULT_OV_WIDGETS=["next-up","mml","funnel","weekly-stats","kpis"];

function WeeklyStats(p){
  var data=(p.config.weeklyStats||[]).slice();
  var [tab,setTab]=useState("week");
  var [showAdd,setShowAdd]=useState(false);
  var [selCat,setSelCat]=useState("ftg");
  var [compare,setCompare]=useState("none");
  var [form,setForm]=useState({ftg:0,salvations:0,baptisms:0,nextSteps:0,ateamAtt:0,newAteam:0,activeBg:0});
  var cats=[{key:"ftg",label:"First Time Guests",short:"FTG",color:"#6EE7B7",grad:"linear-gradient(135deg,#6EE7B7,#3DD9A0)"},{key:"salvations",label:"Salvations",short:"Salv",color:"#A78BFA",grad:"linear-gradient(135deg,#A78BFA,#8B5CF6)"},{key:"baptisms",label:"Baptisms",short:"Bapt",color:"#67E8F9",grad:"linear-gradient(135deg,#67E8F9,#22D3EE)"},{key:"nextSteps",label:"Next Steps",short:"NS",color:"#FBBF24",grad:"linear-gradient(135deg,#FBBF24,#F59E0B)"},{key:"ateamAtt",label:"ATeam Attend.",short:"AT",color:"#34D399",grad:"linear-gradient(135deg,#34D399,#10B981)"},{key:"newAteam",label:"New ATeamers",short:"New AT",color:"#F9A8D4",grad:"linear-gradient(135deg,#F9A8D4,#EC4899)"},{key:"activeBg",label:"Active BGroups",short:"BG",color:"#818CF8",grad:"linear-gradient(135deg,#818CF8,#6366F1)"}];
  var addWeek=function(){var entry={...form,week:new Date().toISOString().split("T")[0]};p.setConfig({...p.config,weeklyStats:data.concat([entry])});setShowAdd(false);setForm({ftg:0,salvations:0,baptisms:0,nextSteps:0,ateamAtt:0,newAteam:0,activeBg:0})};
  var delWeek=function(i){var nd=data.filter(function(_,j){return j!==i});p.setConfig({...p.config,weeklyStats:nd})};
  var recent=data.slice(-12);
  var latest=recent.length>0?recent[recent.length-1]:{};
  var prev=recent.length>1?recent[recent.length-2]:{};
  var getAvg=function(key){if(recent.length===0)return 0;return Math.round(recent.reduce(function(a,w){return a+(w[key]||0)},0)/recent.length)};
  var getDelta=function(key){var cur=latest[key]||0;var prv=prev[key]||0;return prv===0?0:cur-prv};

  var makePath=function(key,w,h,pts,maxOverride){if(pts.length<2)return"";var maxV=maxOverride||Math.max.apply(null,pts.map(function(v){return v||0}).concat([1]));var step=w/(pts.length-1);var coords=pts.map(function(v,i){return{x:i*step,y:h-((v||0)/maxV)*(h-8)-4}});var d="M"+coords[0].x+","+coords[0].y;for(var i=1;i<coords.length;i++){var cp1x=coords[i-1].x+(coords[i].x-coords[i-1].x)*0.4;var cp2x=coords[i-1].x+(coords[i].x-coords[i-1].x)*0.6;d+=" C"+cp1x+","+coords[i-1].y+" "+cp2x+","+coords[i].y+" "+coords[i].x+","+coords[i].y}return d};
  var makeArea=function(key,w,h,pts,maxOverride){var line=makePath(key,w,h,pts,maxOverride);if(!line)return"";return line+" L"+w+","+h+" L0,"+h+" Z"};

  var chartW=480;var chartH=100;
  var selCatObj=cats.find(function(c){return c.key===selCat})||cats[0];
  var chartPts=recent.map(function(w){return w[selCat]||0});
  var avgLine=getAvg(selCat);

  var getCompPts=function(){
    if(compare==="none"||data.length<2)return null;
    var len=recent.length;
    if(compare==="prev-week"&&data.length>=len+1){return data.slice(-(len+1),-1).map(function(w){return w[selCat]||0})}
    if(compare==="prev-quarter"&&data.length>=len+13){return data.slice(-(len+13),-(13)).map(function(w){return w[selCat]||0})}
    if(compare==="prev-year"&&data.length>=len+52){return data.slice(-(len+52),-(52)).map(function(w){return w[selCat]||0})}
    var offset=compare==="prev-week"?1:compare==="prev-quarter"?13:52;
    if(data.length>offset){var start=Math.max(0,data.length-len-offset);var end=data.length-offset;return data.slice(start,end).map(function(w){return w[selCat]||0})}
    return null;
  };
  var compPts=getCompPts();
  var allPts=chartPts.concat(compPts||[]).concat([avgLine,1]);
  var chartMax=Math.max.apply(null,allPts);

  return <div style={{background:"var(--card)",borderRadius:17,overflow:"hidden",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
    <div style={{background:"var(--hero)",padding:"19px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h3 style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:2}}>Weekly Church Stats</h3><p style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>{data.length} weeks tracked</p></div>
        <div style={{display:"flex",gap:5}}>
          {["week","trends","data"].map(function(t){return <button key={t} onClick={function(){setTab(t)}} style={{padding:"5px 11px",borderRadius:7,border:"none",fontSize:9,fontWeight:tab===t?700:500,color:tab===t?"#fff":"rgba(255,255,255,0.5)",background:tab===t?"rgba(255,255,255,0.15)":"transparent",cursor:"pointer"}}>{t==="week"?"This Week":t==="trends"?"Trends":"Data"}</button>})}
          <button onClick={function(){setShowAdd(!showAdd)}} style={{padding:"5px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",fontSize:9,fontWeight:600,color:"#fff",cursor:"pointer"}}>{showAdd?"Cancel":"+ Log Week"}</button>
        </div>
      </div>
    </div>

    <Reveal open={showAdd}><div style={{padding:"13px 19px",background:"var(--inp)",borderBottom:"1px solid var(--divider)"}}>
      <div className="weavr-ws-input" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {cats.map(function(c){return <div key={c.key}><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:c.color,marginBottom:3}}>{c.short}</div><input type="number" min="0" value={form[c.key]} onChange={function(e){var nf={...form};nf[c.key]=parseInt(e.target.value)||0;setForm(nf)}} style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:13,fontWeight:700,textAlign:"center",boxSizing:"border-box"}}/></div>})}
      </div>
      <div style={{marginTop:10,textAlign:"right"}}><Btn label="Save Week" onClick={addWeek} sx={{padding:"6px 16px",fontSize:10}}/></div>
    </div></Reveal>

    <div style={{padding:"19px 22px"}}>
    {tab==="week"&&<div>
      {recent.length>0?<div className="weavr-ws-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {cats.map(function(c){var val=latest[c.key]||0;var delta=getDelta(c.key);var avg=getAvg(c.key);return <div key={c.key} style={{background:c.color+"08",borderRadius:14,padding:"14px 13px",position:"relative",overflow:"hidden",border:"1px solid "+c.color+"12"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.grad}}/>
          <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:c.color,marginBottom:6}}>{c.short}</div>
          <div style={{fontSize:30,fontWeight:800,color:"var(--text)",lineHeight:1}}>{val}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
            {delta!==0&&<span style={{fontSize:9,fontWeight:700,color:delta>0?"#10B981":"#EF4444",display:"flex",alignItems:"center",gap:2}}><span style={{fontSize:8}}>{delta>0?"\u25B2":"\u25BC"}</span>{Math.abs(delta)}</span>}
            <span style={{fontSize:8,color:"var(--text-muted)"}}>avg {avg}</span>
          </div>
        </div>})}
      </div>:<div style={{textAlign:"center",padding:"26px 0",color:"var(--text-muted)"}}><div style={{fontSize:12,fontWeight:600}}>No weekly data yet</div><p style={{fontSize:10,marginTop:5}}>Click "+ Log Week" to enter your first week of stats</p></div>}
    </div>}

    {tab==="trends"&&<div>
      <div className="weavr-stats-compare" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {cats.map(function(c){return <button key={c.key} onClick={function(){setSelCat(c.key)}} style={{padding:"3px 6px",borderRadius:5,border:selCat===c.key?"1px solid "+c.color:"1px solid var(--inp-border)",background:selCat===c.key?c.color+"15":"var(--inp)",fontSize:8,fontWeight:selCat===c.key?700:500,color:selCat===c.key?c.color:"var(--text-muted)",cursor:"pointer"}}>{c.short}</button>})}
        </div>
        <div style={{display:"flex",gap:2}}>
          {[{k:"none",l:"Current"},{k:"prev-week",l:"vs Prev"},{k:"prev-quarter",l:"vs Qtr"},{k:"prev-year",l:"vs Year"}].map(function(o){return <button key={o.k} onClick={function(){setCompare(o.k)}} style={{padding:"2px 6px",borderRadius:5,border:"none",fontSize:8,fontWeight:compare===o.k?700:500,color:compare===o.k?"var(--primary)":"var(--text-muted)",background:compare===o.k?"var(--primary)10":"transparent",cursor:"pointer"}}>{o.l}</button>})}
        </div>
      </div>
      {chartPts.length>=2?<div>
        <svg width="100%" viewBox={"0 0 "+chartW+" "+(chartH+20)} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
          <defs><linearGradient id={"wsg-"+selCat} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={selCatObj.color} stopOpacity="0.25"/><stop offset="100%" stopColor={selCatObj.color} stopOpacity="0.02"/></linearGradient></defs>
          {[0.5,1].map(function(f){var y=chartH-(f)*(chartH-8)-4;return <g key={f}><line x1="0" y1={y} x2={chartW} y2={y} stroke="var(--divider)" strokeWidth="0.5" strokeDasharray="3"/><text x="-2" y={y+3} textAnchor="end" fill="var(--text-muted)" fontSize="8">{Math.round(f*chartMax)}</text></g>})}
          <path d={makeArea(selCat,chartW,chartH,chartPts,chartMax)} fill={"url(#wsg-"+selCat+")"}/>
          {compPts&&compPts.length>=2&&<path d={makePath("comp",chartW,chartH,compPts.length>chartPts.length?compPts.slice(0,chartPts.length):compPts,chartMax)} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4" opacity="0.4"/>}
          <path d={makePath(selCat,chartW,chartH,chartPts,chartMax)} fill="none" stroke={selCatObj.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {chartPts.map(function(v,i){var step=chartPts.length>1?chartW/(chartPts.length-1):chartW;var x=i*step;var y=chartH-((v||0)/chartMax)*(chartH-8)-4;return <g key={i}><circle cx={x} cy={y} r="3" fill={selCatObj.color} stroke="var(--card-solid)" strokeWidth="1.5"/><text x={x} y={chartH+14} textAnchor="middle" fill="var(--text-muted)" fontSize="7">{recent[i]&&recent[i].week?recent[i].week.slice(5):""}</text></g>})}
          {avgLine>0&&<line x1="0" y1={chartH-(avgLine/chartMax)*(chartH-8)-4} x2={chartW} y2={chartH-(avgLine/chartMax)*(chartH-8)-4} stroke={selCatObj.color} strokeWidth="0.8" strokeDasharray="4" opacity="0.4"/>}
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
          <div style={{display:"flex",alignItems:"baseline",gap:5}}><span style={{fontWeight:700,color:selCatObj.color,fontSize:14}}>{chartPts[chartPts.length-1]||0}</span><span style={{fontSize:9,color:"var(--text-muted)"}}>{selCatObj.label}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {compPts&&<span style={{fontSize:8,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:0,borderTop:"1.5px dashed var(--text-muted)",display:"inline-block"}}/>{compare==="prev-week"?"prev week":compare==="prev-quarter"?"prev quarter":"prev year"}</span>}
            <span style={{fontSize:9,color:"var(--text-muted)"}}>avg <span style={{fontWeight:700,color:selCatObj.color}}>{avgLine}</span></span>
          </div>
        </div>
      </div>:<div style={{textAlign:"center",padding:"16px 0",color:"var(--text-muted)",fontSize:10}}>Need at least 2 weeks for trends</div>}
    </div>}

    {tab==="data"&&<div>
      {data.length===0?<div style={{textAlign:"center",padding:"26px 0",color:"var(--text-muted)",fontSize:11}}>No data yet</div>:
      <div style={{maxHeight:272,overflowY:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={{padding:"6px",fontSize:8,fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",textAlign:"left",borderBottom:"1px solid var(--divider)"}}>Week</th>{cats.map(function(c){return <th key={c.key} style={{padding:"6px",fontSize:8,fontWeight:700,textTransform:"uppercase",color:c.color,textAlign:"center",borderBottom:"1px solid var(--divider)"}}>{c.short}</th>})}<th style={{padding:"6px",width:30,borderBottom:"1px solid var(--divider)"}}></th></tr></thead>
        <tbody>{data.slice().reverse().map(function(w,i){var oi=data.length-1-i;return <tr key={i}><td style={{padding:"5px 6px",fontSize:10,color:"var(--text)",borderBottom:"1px solid var(--divider)"}}>{w.week||"?"}</td>{cats.map(function(c){return <td key={c.key} style={{padding:"5px 6px",fontSize:11,fontWeight:600,color:"var(--text)",textAlign:"center",borderBottom:"1px solid var(--divider)"}}>{w[c.key]||0}</td>})}<td style={{padding:"5px 6px",borderBottom:"1px solid var(--divider)"}}><button onClick={function(){delWeek(oi)}} style={{background:"none",border:"none",cursor:"pointer",opacity:0.3,padding:2}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.3"}}><I n="x" sz={10} c="#EF4444"/></button></td></tr>})}</tbody></table>
      </div>}
    </div>}
    </div>
  </div>;
}

function Overview(p){
  var people=p.people,teams=p.teams,total=people.length;
  var [mmlOpen,setMmlOpen]=useState(false);
  var [dragIdx,setDragIdx]=useState(null);
  var [mmlCustom,setMmlCustom]=useState(null);
  var [showWidgetPicker,setShowWidgetPicker]=useState(false);
  var ovWidgets=p.config.overviewWidgets||DEFAULT_OV_WIDGETS;
  var [dragWidget,setDragWidget]=useState(null);
  var mx=Math.max.apply(null,STAGES.map(function(s){return people.filter(function(x){return x.currentStage===s.key}).length}).concat([1]));
  var mmlBase=people.filter(function(x){return!x.fullyConnected}).map(function(x){var sc=calcScore(x),d=ago(x.lastContactDate),pri=100-sc;if(d===null)pri+=30;else if(d>7)pri+=20;else if(d>3)pri+=10;if((SIDX[x.currentStage]||0)<=1)pri+=10;return{...x,engScore:sc,priority:pri}}).sort(function(a,b){return b.priority-a.priority}).slice(0,10);
  var mml=mmlCustom||mmlBase;
  var onDragStart=function(i){setDragIdx(i)};
  var onDragOver=function(e,i){e.preventDefault();if(dragIdx===null||dragIdx===i)return;var arr=mml.slice();var item=arr.splice(dragIdx,1)[0];arr.splice(i,0,item);setMmlCustom(arr);setDragIdx(i)};
  var onDragEnd=function(){setDragIdx(null)};
  var toggleWidget=function(key){var nw=ovWidgets.indexOf(key)>=0?ovWidgets.filter(function(k){return k!==key}):ovWidgets.concat([key]);p.setConfig({...p.config,overviewWidgets:nw})};
  var onWDragStart=function(i){setDragWidget(i)};
  var onWDragOver=function(e,i){e.preventDefault();if(dragWidget===null||dragWidget===i)return;var arr=ovWidgets.slice();var item=arr.splice(dragWidget,1)[0];arr.splice(i,0,item);p.setConfig({...p.config,overviewWidgets:arr});setDragWidget(i)};
  var onWDragEnd=function(){setDragWidget(null)};

  if(!total)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"70vh",textAlign:"center",padding:"16px"}}><div><div style={{width:88,height:88,borderRadius:20,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",boxShadow:"0 8px 32px var(--primary)25"}}><WeavrLogo sz={44}/></div><h2 style={{fontSize:22,fontWeight:800,color:"var(--text)",marginBottom:8,letterSpacing:"-0.01em"}}>Welcome to Weavr</h2><p style={{fontSize:12,color:"var(--text-muted)",maxWidth:420,margin:"0 auto 36px",lineHeight:1.8}}>Start weaving people into your church community. Add your first person to get started.</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn icon="plus" label="Add Person" onClick={p.onAdd}/><Btn icon="upload" label="Import CSV" onClick={p.onImport} v="ghost"/></div></div></div>;

  var renderWidget=function(key){
    if(key==="next-up"){var top1=mml[0];if(!top1)return null;var stg=STAGES.find(function(s){return s.key===top1.currentStage});var d=ago(top1.lastContactDate);var tm=teams.find(function(t){return t.id===top1.assignedTo});return <div className="weavr-next-up" style={{display:"flex",gap:13,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:280,background:"var(--card)",borderRadius:19,padding:"19px 22px",boxShadow:"var(--card-shadow)",display:"flex",alignItems:"center",gap:15,cursor:"pointer",transition:"all 0.2s",border:"1px solid var(--divider)"}} onClick={function(){p.onPerson(top1)}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="var(--card-shadow)"}}>
        <div style={{width:52,height:52,borderRadius:14,background:stg?stg.grad:"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n="zap" sz={22} c="#fff"/></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--primary)",marginBottom:3}}>Next Up</div>
          <div style={{fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:2}}>{top1.firstName} {top1.lastName}</div>
          <div style={{fontSize:10,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:7}}><span style={{color:stg?stg.color:"#999",fontWeight:600}}>{stg?stg.label:"?"}</span><span>{d===null?"Never contacted":d+"d ago"}</span>{tm&&<span style={{color:tm.color}}>{tm.name}</span>}</div>
        </div>
        <div style={{display:"flex",gap:7,flexShrink:0}}>
          {top1.phone&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:40,height:40,borderRadius:10,background:"#06B6D408",border:"1px solid #06B6D415",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><I n="msg" sz={16} c="#06B6D4"/></button>}
          {top1.phone&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:40,height:40,borderRadius:10,background:"var(--primary)08",border:"1px solid var(--primary)15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><I n="phone" sz={16} c="var(--primary)"/></button>}
          {top1.email&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:40,height:40,borderRadius:10,background:"#10B98108",border:"1px solid #10B98115",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><I n="mail" sz={16} c="#10B981"/></button>}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {[{l:"New This Week",v:people.filter(function(x){return ago(x.createdAt)<=7}).length,c:"#10B981"},{l:"Need Follow-Up",v:people.filter(function(x){return!x.fullyConnected&&(ago(x.lastContactDate)===null||ago(x.lastContactDate)>3)}).length,c:"#EF4444"},{l:"Fully Connected",v:people.filter(function(x){return x.fullyConnected}).length,c:"#F59E0B"}].map(function(k){return <div key={k.l} style={{background:k.c+"08",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,border:"1px solid "+k.c+"12",minWidth:170}}><div style={{fontSize:17,fontWeight:800,color:k.c}}>{k.v}</div><div style={{fontSize:9,fontWeight:600,color:"var(--text-muted)",lineHeight:1.3}}>{k.l}</div></div>})}
      </div>
    </div>}

    if(key==="mml"&&mml.length>0)return <div style={{background:"var(--card)",borderRadius:19,padding:"13px 19px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <button onClick={function(){setMmlOpen(!mmlOpen)}} style={{width:"100%",display:"flex",alignItems:"center",gap:7,background:"none",border:"none",padding:"3px 0",cursor:"pointer",textAlign:"left"}}>
        <I n="sun" sz={18} c="#F59E0B"/>
        <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",flex:1}}>Monday Morning List</h3>
        {mmlCustom&&<button onClick={function(){setMmlCustom(null)}} style={{fontSize:9,fontWeight:600,color:"var(--text-muted)",background:"var(--inp)",border:"1px solid var(--inp-border)",borderRadius:5,padding:"2px 6px",cursor:"pointer"}}>Reset Order</button>}
        <span style={{fontSize:10,color:"var(--text-muted)",fontWeight:600,background:"var(--inp)",padding:"2px 8px",borderRadius:7}}>{mml.length}</span>
        <span style={{fontSize:12,color:"var(--text-muted)",transform:mmlOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>{"\u25BE"}</span>
      </button>
      <Reveal open={mmlOpen}><div style={{marginTop:10}}>
        {mml.map(function(x,i){var stg=STAGES.find(function(s){return s.key===x.currentStage});var d=ago(x.lastContactDate);var tm=teams.find(function(t){return t.id===x.assignedTo});return <div key={x.id} draggable onDragStart={function(){onDragStart(i)}} onDragOver={function(e){onDragOver(e,i)}} onDragEnd={onDragEnd} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 6px",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"grab",opacity:dragIdx===i?0.5:1,transition:"all 0.15s",borderRadius:10,margin:"0 -8px"}} onClick={function(){p.onPerson(x)}} onMouseEnter={function(e){e.currentTarget.style.background="var(--hover)"}} onMouseLeave={function(e){e.currentTarget.style.background="transparent"}}><div style={{display:"flex",flexDirection:"column",gap:2,opacity:0.25,cursor:"grab",flexShrink:0,padding:"0 2px"}}><div style={{width:12,height:2,background:"var(--text-muted)",borderRadius:1}}/><div style={{width:12,height:2,background:"var(--text-muted)",borderRadius:1}}/><div style={{width:12,height:2,background:"var(--text-muted)",borderRadius:1}}/></div><div style={{width:32,height:32,borderRadius:8,background:stg?stg.color+"12":"var(--inp)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:stg?stg.color:"var(--text-muted)",flexShrink:0}}>{(x.firstName||"?").charAt(0)}{(x.lastName||"").charAt(0)}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:9,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:7,marginTop:2}}><span style={{color:stg?stg.color:"#999",fontWeight:600}}>{stg?stg.label:"?"}</span><span>{d===null?"Never":d+"d ago"}</span>{tm&&<span style={{color:tm.color}}>{tm.name}</span>}</div></div><ScoreRing score={x.engScore} sz={34}/></div>})}
      </div></Reveal>
    </div>;

    if(key==="funnel")return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:19}}>Engagement Funnel</h3>
      {STAGES.map(function(s){var ct=s.key==="bgroup"?people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length:s.key==="ateam"?people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length:people.filter(function(x){return x.currentStage===s.key}).length;return <div key={s.key} style={{display:"flex",alignItems:"center",gap:13,marginBottom:11,cursor:"pointer",transition:"all 0.15s"}} onClick={function(){p.navTo("people",s.key)}} onMouseEnter={function(e){e.currentTarget.style.opacity="0.8"}} onMouseLeave={function(e){e.currentTarget.style.opacity="1"}}><div style={{width:90,fontSize:10,fontWeight:600,color:"var(--text-sub)",textAlign:"right",flexShrink:0}}>{s.label}</div><div style={{flex:1,height:10,background:"var(--divider)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(ct/mx*100,4)+"%",background:s.color,borderRadius:4,transition:"width 1s ease"}}/></div><div style={{width:36,fontSize:12,fontWeight:800,color:s.color,textAlign:"right"}}>{ct}</div></div>})}
      {(function(){var fc=people.filter(function(x){return x.fullyConnected}).length;if(fc===0)return null;return <div style={{display:"flex",alignItems:"center",gap:13,marginTop:6,cursor:"pointer",padding:"8px 0 0",borderTop:"1px solid var(--divider)"}} onClick={function(){p.navTo("connected")}}><div style={{width:90,fontSize:10,fontWeight:700,color:"#F59E0B",textAlign:"right",flexShrink:0}}>Connected</div><div style={{flex:1,height:10,background:"var(--divider)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(fc/mx*100,4)+"%",background:"#F59E0B",borderRadius:4}}/></div><div style={{width:36,fontSize:12,fontWeight:800,color:"#F59E0B",textAlign:"right"}}>{fc}</div></div>})()}
    </div>;

    if(key==="weekly-stats")return <WeeklyStats config={p.config} setConfig={p.setConfig}/>;

    if(key==="kpis"){var added7=people.filter(function(x){return ago(x.createdAt)<=7}).length;var needFollow=people.filter(function(x){return!x.fullyConnected&&(ago(x.lastContactDate)===null||ago(x.lastContactDate)>3)}).length;var avgScore=total>0?Math.round(people.map(calcScore).reduce(function(a,b){return a+b},0)/total):0;return <div className="weavr-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>{[{l:"Total People",v:total,i:"users",c:"var(--primary)",bg:"var(--primary)"},{l:"Added (7d)",v:added7,i:"plus",c:"#10B981",bg:"#10B981"},{l:"Need Follow-Up",v:needFollow,i:"flag",c:"#EF4444",bg:"#EF4444"},{l:"Avg Score",v:avgScore,i:"target",c:"#06B6D4",bg:"#06B6D4"}].map(function(k){return <div key={k.l} style={{background:k.bg+"0A",borderRadius:17,padding:"19px",position:"relative",overflow:"hidden",border:"1px solid "+k.bg+"15"}}><div style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:10,background:k.bg+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={18} c={k.c}/></div><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:k.c,marginBottom:8}}>{k.l}</div><div style={{fontSize:25,fontWeight:800,color:"var(--text)",lineHeight:1}}>{k.v}</div></div>})}</div>}

    if(key==="stale"){var stale=people.filter(function(x){return!x.fullyConnected}).filter(function(x){var d=ago(x.lastContactDate);return d===null||d>=14}).sort(function(a,b){var da=ago(a.lastContactDate),db=ago(b.lastContactDate);return(db===null?999:db)-(da===null?999:da)});return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Stale Contacts (14d+)</h3>{stale.length===0?<div style={{color:"var(--text-muted)",padding:"16px 0",textAlign:"center",fontSize:11}}>No stale contacts</div>:<div style={{maxHeight:255,overflowY:"auto"}}>{stale.slice(0,15).map(function(x,i){var d=ago(x.lastContactDate);var stg=STAGES.find(function(s){return s.key===x.currentStage});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><Dot color={stg?stg.color:"#ccc"} sz={8}/><div style={{flex:1,fontSize:10,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><span style={{fontSize:9,fontWeight:600,color:"#EF4444"}}>{d===null?"Never":d+"d"}</span></div>})}</div>}</div>}

    if(key==="recent"){var recentCI=[];people.forEach(function(x){(x.checkIns||[]).forEach(function(c){if(ago(c.date)<=7)recentCI.push({...c,person:x})})});recentCI.sort(function(a,b){return new Date(b.date)-new Date(a.date)});var ciTypes=p.config.checkInTypes||DEFAULT_CI;return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Recent Check-ins (7d)</h3>{recentCI.length===0?<div style={{color:"var(--text-muted)",padding:"16px 0",textAlign:"center",fontSize:11}}>No recent check-ins</div>:<div style={{maxHeight:255,overflowY:"auto"}}>{recentCI.slice(0,15).map(function(c,i){var ct=ciTypes.find(function(t){return t.key===c.type});return <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><I n={ct?ct.icon:"msg"} sz={12} c={ct?ct.color:"var(--text-muted)"}/><div style={{flex:1,fontSize:10,color:"var(--text-sub)"}}>{c.person.firstName} {c.person.lastName} - {ct?ct.label:c.type}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{fmtS(c.date)}</div></div>})}</div>}</div>}

    if(key==="weekly-summary"){var w7=people.filter(function(x){return ago(x.createdAt)<=7}).length;var fu7=0;var adv7=0;var fc7=people.filter(function(x){return x.fullyConnected&&ago(x.fullyConnectedDate)<=7}).length;people.forEach(function(x){(x.checkIns||[]).forEach(function(c){if(ago(c.date)<=7)fu7++});STAGES.forEach(function(s){if(s.key!=="first-visit"&&x.stages&&x.stages[s.key]&&ago(x.stages[s.key].date)<=7)adv7++})});return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>This Week</h3><div className="weavr-weekly-summary-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{[{l:"New People",v:w7,c:"#10B981",i:"plus"},{l:"Follow-ups Done",v:fu7,c:"var(--primary)",i:"check"},{l:"Stage Advances",v:adv7,c:"#06B6D4",i:"up"},{l:"Fully Connected",v:fc7,c:"#F59E0B",i:"target"}].map(function(k){return <div key={k.l} style={{background:k.c+"08",borderRadius:12,padding:"13px 14px",display:"flex",alignItems:"center",gap:10,border:"1px solid "+k.c+"12"}}><div style={{width:40,height:40,borderRadius:10,background:k.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={17} c={k.c}/></div><div><div style={{fontSize:19,fontWeight:800,color:"var(--text)"}}>{k.v}</div><div style={{fontSize:9,color:"var(--text-muted)",fontWeight:600}}>{k.l}</div></div></div>})}</div></div>}

    if(key==="distribution"){var scoreDist=[{label:"0-25 (Cold)",color:"#EF4444",count:people.filter(function(x){var s=calcScore(x);return s>=0&&s<=25}).length},{label:"26-50 (Warming)",color:"#F59E0B",count:people.filter(function(x){var s=calcScore(x);return s>25&&s<=50}).length},{label:"51-75 (Engaged)",color:"#06B6D4",count:people.filter(function(x){var s=calcScore(x);return s>50&&s<=75}).length},{label:"76-100 (Connected)",color:"#10B981",count:people.filter(function(x){var s=calcScore(x);return s>75}).length}];var maxB=Math.max.apply(null,scoreDist.map(function(b){return b.count}).concat([1]));return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Engagement Distribution</h3>{scoreDist.map(function(b){return <div key={b.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:50,fontSize:16,fontWeight:700,color:b.color,textAlign:"right"}}>{b.count}</div><div style={{flex:1}}><div style={{height:28,background:"var(--divider)",borderRadius:7,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(b.count/maxB*100,3)+"%",background:b.color,borderRadius:7}}/></div><div style={{fontSize:9,color:"var(--text-muted)",marginTop:2}}>{b.label}</div></div></div>})}</div>}

    if(key==="velocity"){var stageStats=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"}).map(function(s){var inStg=people.filter(function(x){return x.currentStage===s.key});var avgD=0;if(inStg.length>0){avgD=Math.round(inStg.reduce(function(a,x){var sd=x.stages&&x.stages[s.key]?x.stages[s.key].date:x.createdAt;return a+(ago(sd)||0)},0)/inStg.length)}return{...s,count:inStg.length,avgDays:avgD}});return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Stage Velocity</h3>{stageStats.map(function(s){return <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Dot color={s.color} sz={8}/><div style={{flex:1,fontSize:11,fontWeight:500,color:"var(--text-sub)"}}>{s.label}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{s.count}</div><div style={{width:60,textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{s.avgDays}</span><span style={{fontSize:9,color:"var(--text-muted)"}}>d</span></div></div>})}</div>}

    if(key==="team"){var teamStats=teams.map(function(t){var assigned=people.filter(function(x){return x.assignedTo===t.id});var followedUp=assigned.filter(function(x){return ago(x.lastContactDate)!==null&&ago(x.lastContactDate)<=7}).length;var asc=assigned.length>0?Math.round(assigned.map(calcScore).reduce(function(a,b){return a+b},0)/assigned.length):0;return{...t,assigned:assigned.length,followedUp:followedUp,avgScore:asc}}).filter(function(t){return t.assigned>0});if(teamStats.length===0)return null;return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Team Performance</h3>{teamStats.map(function(t){var rate=t.assigned>0?Math.round(t.followedUp/t.assigned*100):0;return <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",background:"var(--inp)",borderRadius:10,marginBottom:5}}><div style={{width:36,height:36,borderRadius:8,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{t.assigned} assigned - {rate}% followed up</div></div><ScoreRing score={t.avgScore} sz={36}/></div>})}</div>}

    return null;
  };

  return <div>
    <div className="weavr-pipeline-hero" style={{background:"var(--hero)",borderRadius:20,padding:"26px 29px",marginBottom:22,position:"relative",overflow:"hidden"}}>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div><h2 style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:3,letterSpacing:"-0.01em"}}>Engagement Pipeline</h2><p style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{total} people tracked</p></div>
          <button onClick={function(){setShowWidgetPicker(!showWidgetPicker)}} style={{padding:"6px 11px",borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.6)",backdropFilter:"blur(4px)"}}><I n="gear" sz={12} c="rgba(255,255,255,0.6)"/>Customize</button>
        </div>
        <div className="weavr-pipeline-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>{STAGES.map(function(s,i){var ct=s.key==="bgroup"?people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length:s.key==="ateam"?people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length:people.filter(function(x){return x.currentStage===s.key}).length;var prev=i>0?people.filter(function(x){return x.currentStage===STAGES[i-1].key}).length:total;var conv=i>0&&prev>0?Math.round(ct/prev*100):null;return <div key={s.key} style={{background:"rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 10px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.06)",textAlign:"center",transition:"all 0.2s"}} onClick={function(){p.navTo("people",s.key)}} onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.14)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={function(e){e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(0)"}}><div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:5}}>{ct}</div><div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.6)",marginBottom:3}}>{s.label}</div>{conv!==null&&<div style={{fontSize:8,fontWeight:700,color:s.color,background:s.color+"20",padding:"2px 6px",borderRadius:5,display:"inline-block"}}>{conv}%</div>}</div>})}</div>
      </div>
    </div>

    <Reveal open={showWidgetPicker}><div style={{background:"var(--card)",borderRadius:19,padding:"19px 22px",marginBottom:19,boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
        <div><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>Add Widgets</div><div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>Hover any widget to resize, reorder, or remove it.</div></div>
        <button onClick={function(){setShowWidgetPicker(false)}} style={{padding:"6px 13px",borderRadius:8,background:"var(--primary)",color:"#fff",border:"none",fontSize:10,fontWeight:600,cursor:"pointer"}}>Done</button>
      </div>
      <div className="weavr-widget-picker" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
        {OV_WIDGETS.map(function(w){var on=ovWidgets.indexOf(w.key)>=0;return <button key={w.key} onClick={function(){toggleWidget(w.key)}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"11px 8px",borderRadius:12,border:on?"1px solid var(--primary)":"1px solid var(--inp-border)",background:on?"var(--primary)06":"var(--inp)",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}><div style={{width:32,height:32,borderRadius:8,background:on?"var(--primary)12":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={w.icon} sz={14} c={on?"var(--primary)":"var(--text-muted)"}/></div><span style={{fontSize:9,fontWeight:on?600:500,color:on?"var(--primary)":"var(--text-muted)",lineHeight:1.3}}>{w.label}</span></button>})}
      </div>
    </div></Reveal>

    <div className="weavr-ov-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
      {ovWidgets.map(function(key,idx){var el=renderWidget(key);if(!el)return null;var sizes=p.config.widgetSizes||{};var wDef=OV_WIDGETS.find(function(o){return o.key===key});var sz=sizes[key]||(wDef?wDef.defaultSize:"full");var toggleSz=function(){var ns={...(p.config.widgetSizes||{})};ns[key]=sz==="full"?"half":"full";p.setConfig({...p.config,widgetSizes:ns})};return <div key={key} className="weavr-widget-wrap" style={{gridColumn:sz==="full"?"1 / -1":"auto",position:"relative"}} draggable onDragStart={function(){onWDragStart(idx)}} onDragOver={function(e){onWDragOver(e,idx)}} onDragEnd={onWDragEnd}>
        <div className="weavr-widget-ctrl" style={{position:"absolute",top:12,right:12,zIndex:5,display:"flex",gap:3,opacity:0,transition:"opacity 0.2s"}}>
          <button onClick={toggleSz} style={{width:28,height:28,borderRadius:7,background:"var(--card)",border:"1px solid var(--divider)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}} title={sz==="full"?"Make compact":"Make full width"}><I n={sz==="full"?"grid":"expand"} sz={12} c="var(--text-muted)"/></button>
          <button onClick={function(){toggleWidget(key)}} style={{width:28,height:28,borderRadius:7,background:"var(--card)",border:"1px solid var(--divider)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}} title="Remove widget"><I n="x" sz={12} c="var(--text-muted)"/></button>
          <div style={{width:28,height:28,borderRadius:7,background:"var(--card)",border:"1px solid var(--divider)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"grab",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}} title="Drag to reorder"><I n="grip" sz={12} c="var(--text-muted)"/></div>
        </div>
        {el}
      </div>})}
    </div>
  </div>;
}

/* ══════ PEOPLE TABLE ══════ */
function PeopleView(p){
  var stObj=p.stageFilter?STAGES.find(function(s){return s.key===p.stageFilter}):null;var [teamF,setTeamF]=useState("");var [sortKey,setSortKey]=useState("newest");
  var fil=sortPeople(p.people.filter(function(x){
    if(!p.stageFilter)return true;
    if(p.stageFilter==="bgroup")return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed;
    if(p.stageFilter==="ateam")return x.stages&&x.stages.ateam&&x.stages.ateam.completed;
    return x.currentStage===p.stageFilter;
  }).filter(function(x){return !teamF||x.assignedTo===teamF||(teamF==="none"&&!x.assignedTo)}).filter(function(x){if(!p.search)return true;var q=p.search.toLowerCase();return(x.firstName+" "+x.lastName).toLowerCase().includes(q)||(x.phone||"").includes(q)||(x.email||"").toLowerCase().includes(q)}),sortKey);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
      <div><h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8,letterSpacing:"-0.01em"}}>{stObj&&<Dot color={stObj.color} sz={10}/>}{stObj?stObj.label:"All People"}</h2><p style={{fontSize:11,color:"var(--text-muted)",marginTop:3}}>{fil.length} people</p></div>
      <div style={{display:"flex",gap:7}}>{p.teams.length>0&&<select style={{padding:"6px 10px",fontSize:10,borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",cursor:"pointer"}} value={teamF} onChange={function(e){setTeamF(e.target.value)}}><option value="">All Members</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}<option value="none">Unassigned</option></select>}<Btn icon="upload" label="Import" onClick={p.onImport} v="ghost"/></div>
    </div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:13}}>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:"var(--card)",borderRadius:17,padding:"0 14px",border:"1px solid var(--inp-border)"}}><I n="search" sz={16} c="var(--text-muted)"/><input style={{flex:1,padding:"10px 0",border:"none",background:"transparent",color:"var(--text)",fontSize:12,outline:"none"}} placeholder="Search..." value={p.search} onChange={function(e){p.setSearch(e.target.value)}}/>{p.search&&<button style={{background:"none",border:"none",padding:3,cursor:"pointer"}} onClick={function(){p.setSearch("")}}><I n="x" sz={14} c="var(--text-muted)"/></button>}</div>
      <SortBar value={sortKey} onChange={setSortKey}/>
    </div>
    <div style={{background:"var(--card)",borderRadius:19,padding:0,overflow:"hidden",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Name","Stage","Score","Assigned","Status","Contact","Next",""].map(function(h){return <th key={h||"act"} style={{padding:"11px 14px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",textAlign:"left",borderBottom:"1px solid var(--divider)",width:h===""?40:"auto"}}>{h}</th>})}</tr></thead>
      <tbody>{fil.map(function(x){var s=STAGES.find(function(st){return st.key===x.currentStage});var d=ago(x.lastContactDate);var urg=d===null||d>3;var sc=calcScore(x);var tm=p.teams.find(function(t){return t.id===x.assignedTo});return <tr key={x.id} style={{cursor:"pointer",transition:"background 0.15s"}} onMouseEnter={function(e){e.currentTarget.style.background="var(--hover)"}} onMouseLeave={function(e){e.currentTarget.style.background=""}}>
        <td style={{padding:"11px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:s?s.color+"10":"var(--inp)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:s?s.color:"var(--text-muted)",flexShrink:0}}>{(x.firstName||"?").charAt(0)}{(x.lastName||"").charAt(0)}</div><span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</span></div></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:600,color:s?s.color:"#999",background:s?s.color+"10":"var(--inp)",padding:"3px 8px",borderRadius:7}}><Dot color={s?s.color:"#ccc"} sz={6}/>{s?s.label:"?"}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}><ScoreRing score={sc} sz={34}/></td>
        <td style={{padding:"11px 14px",fontSize:10,borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{tm?<span style={{color:tm.color,fontWeight:600}}>{tm.name}</span>:<span style={{color:"var(--text-muted)"}}>-</span>}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{urg?<span style={{fontSize:9,fontWeight:600,padding:"3px 10px",borderRadius:7,background:"#FEF2F2",color:"#EF4444",border:"1px solid #FECACA"}}>Follow Up</span>:<span style={{fontSize:9,fontWeight:600,padding:"3px 10px",borderRadius:7,background:"#ECFDF5",color:"#10B981",border:"1px solid #D1FAE5"}}>On Track</span>}</td>
        <td style={{padding:"11px 14px",fontSize:10,color:"var(--text-muted)",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{x.lastContactDate?fmtS(x.lastContactDate):"Never"}</td>
        <td style={{padding:"11px 14px",fontSize:10,color:"var(--text-sub)",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{NEXT_ACT[x.currentStage]}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid var(--divider)",textAlign:"center"}}><button onClick={function(e){e.stopPropagation();if(confirm("Delete "+x.firstName+" "+x.lastName+"?"))p.onDelete(x.id)}} style={{background:"none",border:"none",padding:3,cursor:"pointer",opacity:0.3}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.3"}}><I n="trash" sz={14} c="#EF4444"/></button></td>
      </tr>})}</tbody></table>
      {fil.length===0&&<div style={{textAlign:"center",padding:"38px",color:"var(--text-muted)"}}><I n="users" sz={28} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:8}}>No people found</div></div>}
    </div>
  </div>;
}

/* ══════ ASSIGNED CARDS ══════ */
function AssignedCards(p){
  var [selTeam,setSelTeam]=useState(p.teams.length>0?p.teams[0].id:"");
  var [workMode,setWorkMode]=useState(false);
  var [acView,setAcView]=useState("grid");
  var [acSort,setAcSort]=useState("last-contact");
  var [workIdx,setWorkIdx]=useState(0);
  var [workNote,setWorkNote]=useState("");
  var [workFlash,setWorkFlash]=useState("");
  var tm=p.teams.find(function(t){return t.id===selTeam});
  var assigned=sortPeople(p.people.filter(function(x){return x.assignedTo===selTeam&&!x.fullyConnected}),acSort);
  var workPerson=assigned[workIdx];
  var workStg=workPerson?STAGES.find(function(s){return s.key===workPerson.currentStage}):null;
  var workScore=workPerson?calcScore(workPerson):0;
  var workD=workPerson?ago(workPerson.lastContactDate):null;

  var workFollowUp=function(){if(!workPerson)return;p.onUpdate({...workPerson,lastContactDate:new Date().toISOString(),checkIns:[...(workPerson.checkIns||[]),{type:"conversation",note:workNote||"Followed up",date:new Date().toISOString()}]});setWorkNote("");setWorkFlash("Logged!");setTimeout(function(){setWorkFlash("")},1500)};
  var workNext=function(){if(workIdx<assigned.length-1)setWorkIdx(workIdx+1)};
  var workPrev=function(){if(workIdx>0)setWorkIdx(workIdx-1)};
  var workAdvance=function(){if(!workPerson)return;var lin=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});var li=lin.findIndex(function(s){return s.key===workPerson.currentStage});if(li<lin.length-1){var nk=lin[li+1].key;p.onUpdate({...workPerson,currentStage:nk,stages:{...workPerson.stages,[nk]:{date:new Date().toISOString(),completed:true}}})}};
  var workStepBack=function(){if(!workPerson)return;var lin=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});var li=lin.findIndex(function(s){return s.key===workPerson.currentStage});if(li>0){p.onUpdate({...workPerson,currentStage:lin[li-1].key})}};
  var workUpMs=function(data){if(!workPerson)return;var allMs={...(workPerson.milestones||{})};allMs[workPerson.currentStage]={...(allMs[workPerson.currentStage]||{}),...data};p.onUpdate({...workPerson,milestones:allMs})};
  var workTpl=function(){if(!workPerson)return"";var t=(p.templates||{})[workPerson.currentStage]||DEFAULT_TPL[workPerson.currentStage]||"";return t.replace("{firstName}",workPerson.firstName).replace("{lastName}",workPerson.lastName)};
  var workEmailSubj=function(){if(!workPerson)return"Following up";var s=((p.config||{}).emailSubjects||{})[workPerson.currentStage]||"Following up";return s.replace("{firstName}",workPerson.firstName)};
  var workEmailBody=function(){if(!workPerson)return"";var t=((p.config||{}).emailTemplates||{})[workPerson.currentStage]||workTpl();return t.replace("{firstName}",workPerson.firstName).replace("{lastName}",workPerson.lastName)};
  var workMs=(workPerson&&workPerson.milestones||{})[workPerson?workPerson.currentStage:""]||{};
  var workLinIdx=(function(){var lin=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});return workPerson?lin.findIndex(function(s){return s.key===workPerson.currentStage}):-1})();

  return <div>
    <div className="weavr-ac-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8,letterSpacing:"-0.01em"}}><I n="card" sz={22} c="var(--primary)"/>Assigned Cards</h2><p style={{fontSize:11,color:"var(--text-muted)",marginTop:3}}>View and work contacts by team member</p></div>
      <div style={{display:"flex",gap:5}}>
        <div style={{display:"flex",gap:2,background:"var(--inp)",borderRadius:8,padding:2}}>
          {["grid","list"].map(function(v){return <button key={v} onClick={function(){setAcView(v);setWorkMode(false)}} style={{padding:"5px 10px",borderRadius:7,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",background:!workMode&&acView===v?"var(--card)":"transparent",color:!workMode&&acView===v?"var(--text)":"var(--text-muted)",boxShadow:!workMode&&acView===v?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{v==="grid"?"Grid":"List"}</button>})}
        </div>
        <button onClick={function(){setWorkMode(!workMode);setWorkIdx(0);setWorkFlash("")}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:10,border:workMode?"2px solid var(--primary)":"2px solid var(--inp-border)",background:workMode?"var(--primary)08":"var(--inp)",fontSize:10,fontWeight:600,color:workMode?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}><I n="zap" sz={14} c={workMode?"var(--primary)":"var(--text-muted)"}/>{workMode?"Exit Work Mode":"Work Mode"}</button>
      </div>
    </div>
    <div className="weavr-ac-teams" style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
      {p.teams.map(function(t){var ct=p.people.filter(function(x){return x.assignedTo===t.id&&!x.fullyConnected}).length;return <button key={t.id} onClick={function(){setSelTeam(t.id);setWorkIdx(0)}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:10,border:selTeam===t.id?"2px solid "+t.color:"2px solid transparent",background:selTeam===t.id?"var(--card)":"var(--inp)",fontSize:10,fontWeight:600,color:selTeam===t.id?t.color:"var(--text-sub)",cursor:"pointer"}}><div style={{width:24,height:24,borderRadius:7,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div>{t.name} ({ct})</button>})}
    </div>
    {!workMode&&<div style={{marginBottom:13}}><SortBar value={acSort} onChange={setAcSort}/></div>}
    {p.teams.length===0?<div style={{background:"var(--card)",borderRadius:19,padding:32,textAlign:"center",color:"var(--text-muted)"}}><I n="users" sz={28} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:8}}>Add team members in Settings first</div></div>:
    workMode&&workPerson?<div style={{background:"var(--card)",borderRadius:19,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",animation:"gentleFade 0.4s cubic-bezier(0.22,1,0.36,1)"}}>
      <div style={{background:workStg?workStg.grad:"var(--sidebar)",padding:"19px 26px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:600,marginBottom:3}}>{workIdx+1} of {assigned.length}</div>
            <div style={{fontSize:19,fontWeight:700,color:"#fff"}}>{workPerson.firstName} {workPerson.lastName}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:3,display:"flex",alignItems:"center",gap:7}}><span>{workStg?workStg.label:"?"}</span><span>{workD===null?"Never contacted":workD+"d ago"}</span></div>
          </div>
          <RingMini value={workScore} max={100} color={scoreColor(workScore)} sz={56}/>
        </div>
      </div>
      <div style={{padding:"16px 26px"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:13,flexWrap:"wrap"}}>
          {workPerson.phone&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"6px 13px",borderRadius:8,background:"#06B6D410",fontSize:10,fontWeight:600,color:"#06B6D4",display:"flex",alignItems:"center",gap:4,border:"1px solid #06B6D425",cursor:"pointer"}}><I n="msg" sz={13} c="#06B6D4"/>Text</button>}
          {workPerson.phone&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"6px 13px",borderRadius:8,background:"var(--primary)10",fontSize:10,fontWeight:600,color:"var(--primary)",display:"flex",alignItems:"center",gap:4,border:"1px solid var(--primary)25",cursor:"pointer"}}><I n="phone" sz={13} c="var(--primary)"/>Call</button>}
          {workPerson.email&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"6px 13px",borderRadius:8,background:"#10B98110",fontSize:10,fontWeight:600,color:"#10B981",display:"flex",alignItems:"center",gap:4,border:"1px solid #10B98125",cursor:"pointer"}}><I n="mail" sz={13} c="#10B981"/>Email</button>}
          <div style={{flex:1}}/>
          <button onClick={function(){p.onPerson(workPerson)}} style={{padding:"5px 10px",borderRadius:8,background:"var(--inp)",border:"1px solid var(--inp-border)",fontSize:9,fontWeight:600,color:"var(--text-sub)",cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><I n="eye" sz={12} c="var(--text-muted)"/>Full Profile</button>
        </div>
        <div style={{background:"var(--inp)",borderRadius:10,padding:"8px 11px",marginBottom:11,fontSize:10,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:7}}><I n="zap" sz={14} c={workStg?workStg.color:"var(--text-muted)"}/><b style={{color:"var(--text)"}}>Next:</b>{NEXT_ACT[workPerson.currentStage]}</div>
        {workPerson.currentStage==="salvation"&&<div style={{background:"var(--inp)",borderRadius:10,padding:"8px 11px",marginBottom:11,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,fontWeight:600,color:"var(--text-muted)"}}>Date Saved</span><input type="date" value={workMs.dateSaved||""} onChange={function(e){workUpMs({dateSaved:e.target.value})}} style={{padding:"5px 8px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10}}/></div>}
        {workPerson.currentStage==="baptism"&&<div style={{background:"var(--inp)",borderRadius:10,padding:"8px 11px",marginBottom:11,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9,fontWeight:600,color:"var(--text-muted)"}}>Date Baptized</span><input type="date" value={workMs.dateBaptized||""} onChange={function(e){workUpMs({dateBaptized:e.target.value})}} style={{padding:"5px 8px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10}}/></div>}
        {workPerson.currentStage==="next-steps"&&<div style={{background:"var(--inp)",borderRadius:10,padding:"11px 13px",marginBottom:11}}>
          {[{k:"textSent",l:"Text/Email Sent"},{k:"registered",l:"Registered"},{k:"attended",l:"Attended"}].map(function(item){return <div key={item.k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><input type="checkbox" checked={!!workMs[item.k]} onChange={function(){var nd={};nd[item.k]=!workMs[item.k];if(!workMs[item.k])nd[item.k+"Date"]=new Date().toISOString().split("T")[0];workUpMs(nd)}} style={{width:15,height:15,accentColor:"#FBBF24"}}/><span style={{fontSize:9,color:"var(--text)",flex:1}}>{item.l}</span>{workMs[item.k]&&<input type="date" value={workMs[item.k+"Date"]||""} onChange={function(e){var nd={};nd[item.k+"Date"]=e.target.value;workUpMs(nd)}} style={{padding:"2px 5px",borderRadius:5,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:9,width:120}}/>}</div>})}
        </div>}
        {(function(){var wHasBG=workPerson.stages&&workPerson.stages.bgroup&&workPerson.stages.bgroup.completed;var wHasAT=workPerson.stages&&workPerson.stages.ateam&&workPerson.stages.ateam.completed;var wToggleBG=function(){var ns={...workPerson.stages};if(wHasBG){delete ns.bgroup}else{ns.bgroup={date:new Date().toISOString(),completed:true}}p.onUpdate({...workPerson,stages:ns})};var wToggleAT=function(){var ns={...workPerson.stages};if(wHasAT){delete ns.ateam}else{ns.ateam={date:new Date().toISOString(),completed:true}}p.onUpdate({...workPerson,stages:ns})};return <div style={{marginBottom:11}}>
          <div style={{display:"flex",gap:7}}>
            <button onClick={wToggleBG} style={{flex:1,padding:"8px 11px",borderRadius:8,border:wHasBG?"2px solid #EC4899":"2px dashed var(--inp-border)",background:wHasBG?"#EC489908":"var(--inp)",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><div style={{width:18,height:18,borderRadius:4,background:wHasBG?"#EC4899":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{wHasBG&&<I n="check" sz={10} c="#fff"/>}</div><span style={{fontSize:10,fontWeight:600,color:wHasBG?"#EC4899":"var(--text-muted)"}}>BGroup</span></button>
            <button onClick={wToggleAT} style={{flex:1,padding:"8px 11px",borderRadius:8,border:wHasAT?"2px solid #34D399":"2px dashed var(--inp-border)",background:wHasAT?"#34D39908":"var(--inp)",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><div style={{width:18,height:18,borderRadius:4,background:wHasAT?"#34D399":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{wHasAT&&<I n="check" sz={10} c="#fff"/>}</div><span style={{fontSize:10,fontWeight:600,color:wHasAT?"#34D399":"var(--text-muted)"}}>ATeam</span></button>
          </div>
          {wHasBG&&wHasAT&&!workPerson.fullyConnected&&<button onClick={function(){p.onUpdate({...workPerson,fullyConnected:true,fullyConnectedDate:new Date().toISOString()});setWorkFlash("Fully Connected!");setTimeout(function(){setWorkFlash("");if(workIdx<assigned.length-1)setWorkIdx(workIdx+1)},1500)}} style={{width:"100%",marginTop:6,padding:"10px 13px",borderRadius:8,border:"2px solid #F59E0B",background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:11,fontWeight:700,color:"#92400E"}} onMouseEnter={function(e){e.currentTarget.style.background="linear-gradient(135deg,#F59E0B,#FBBF24)";e.currentTarget.style.color="#fff"}} onMouseLeave={function(e){e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7,#FDE68A)";e.currentTarget.style.color="#92400E"}}>{"⭐"} Mark Fully Connected</button>}
          {workPerson.fullyConnected&&<div style={{marginTop:6,background:"#F59E0B10",border:"1px solid #F59E0B30",borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:600,color:"#F59E0B"}}>{"⭐"} Fully Connected</div>}
        </div>})()}
        <div style={{display:"flex",gap:7,marginBottom:11}}><input style={{flex:1,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,outline:"none",boxSizing:"border-box"}} placeholder="Add a note..." value={workNote} onChange={function(e){setWorkNote(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")workFollowUp()}}/></div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <Btn icon="check" label={workFlash||"Followed Up"} v="green" onClick={workFollowUp} sx={{padding:"8px 16px",fontSize:11}}/>
          {workLinIdx>0&&<button onClick={workStepBack} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"8px 11px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text-sub)"}}><span style={{transform:"rotate(180deg)",display:"inline-block"}}><I n="up" sz={13}/></span>Back</button>}
          {workLinIdx<3&&<Btn icon="up" label="Advance" onClick={workAdvance} sx={{padding:"8px 13px",fontSize:11}}/>}
          <div style={{flex:1}}/>
          <button onClick={workPrev} disabled={workIdx===0} style={{width:40,height:40,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",cursor:workIdx===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:workIdx===0?0.3:1}}><span style={{transform:"rotate(180deg)",display:"inline-flex"}}><I n="up" sz={16} c="var(--text-sub)"/></span></button>
          <button onClick={workNext} disabled={workIdx>=assigned.length-1} style={{width:40,height:40,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",cursor:workIdx>=assigned.length-1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:workIdx>=assigned.length-1?0.3:1}}><I n="up" sz={16} c="var(--text-sub)"/></button>
        </div>
      </div>
    </div>:
    workMode&&!workPerson?<div style={{background:"var(--card)",borderRadius:19,padding:38,textAlign:"center",color:"var(--text-muted)"}}><I n="check" sz={32} c="#10B981"/><div style={{fontWeight:600,marginTop:10,color:"#10B981"}}>All caught up!</div><div style={{fontSize:10,marginTop:3}}>No pending contacts for {tm?tm.name:"this team"}</div></div>:
    acView==="list"?<div style={{background:"var(--card)",borderRadius:19,overflow:"hidden",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      {assigned.map(function(x,i){var stg=STAGES.find(function(s){return s.key===x.currentStage});var sc=calcScore(x);var d=ago(x.lastContactDate);return <div key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><div style={{width:32,height:32,borderRadius:7,background:stg?stg.color+"15":"var(--inp)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:stg?stg.color:"var(--text-muted)"}}>{(x.firstName||"?").charAt(0)}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:9,color:"var(--text-muted)",display:"flex",gap:7}}><span style={{color:stg?stg.color:"#999"}}>{stg?stg.label:"?"}</span><span>{d===null?"Never":d+"d ago"}</span></div></div><ScoreRing score={sc} sz={30}/></div>})}
      {assigned.length===0&&<div style={{padding:32,textAlign:"center",color:"var(--text-muted)"}}>{tm?"No pending contacts for "+tm.name:"Select a team member"}</div>}
    </div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:15}}>
      {assigned.map(function(x){
        var stg=STAGES.find(function(s){return s.key===x.currentStage});var sc=calcScore(x);var d=ago(x.lastContactDate);
        return <div key={x.id} style={{background:"var(--card)",borderRadius:17,padding:"19px",cursor:"pointer",border:"1px solid var(--divider)",boxShadow:"var(--card-shadow)",transition:"all 0.2s"}} onClick={function(){p.onPerson(x)}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="var(--card-shadow)"}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}>
            <div style={{width:44,height:44,borderRadius:12,background:stg?stg.color+"12":"var(--inp)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:stg?stg.color:"var(--text-muted)",flexShrink:0}}>{(x.firstName||"?").charAt(0)}{(x.lastName||"").charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><span style={{fontSize:9,fontWeight:600,color:stg?stg.color:"var(--text-muted)"}}>{stg?stg.label:"?"}</span><span style={{fontSize:9,color:"var(--text-muted)"}}>{d===null?"Never contacted":d+"d ago"}</span></div></div>
            <ScoreRing score={sc} sz={38}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{flex:1,fontSize:10,color:"var(--text-sub)",background:stg?stg.color+"08":"var(--inp)",border:"1px solid "+(stg?stg.color+"12":"var(--inp-border)"),borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:5}}><I n="zap" sz={12} c={stg?stg.color:"var(--text-muted)"}/>{NEXT_ACT[x.currentStage]}</div>
          </div>
          {x.phone&&<div style={{fontSize:10,color:"var(--text-muted)",marginTop:8,display:"flex",alignItems:"center",gap:5}}><I n="phone" sz={12} c="var(--text-muted)"/>{fmtPhone(x.phone)}</div>}
        </div>;
      })}
      {assigned.length===0&&<div style={{background:"var(--card)",borderRadius:17,padding:32,textAlign:"center",color:"var(--text-muted)",gridColumn:"1/-1"}}>{tm?"No pending contacts for "+tm.name:"Select a team member"}</div>}
    </div>}
  </div>;
}

/* ══════ QUICK ENTRY (dynamic fields) ══════ */
function QuickEntry(p){
  var fields=p.config.formFields||DEFAULT_FIELDS;
  var enabled=fields.filter(function(f){return f.enabled});
  var empty={};enabled.forEach(function(f){empty[f.key]=f.type==="checkbox"?false:f.key==="currentStage"?"first-visit":""});
  var [f,setF]=useState({...empty});var [count,setCount]=useState(0);var [flash,setFlash]=useState(false);var [recent,setRecent]=useState([]);var firstRef=useRef();
  var sub=function(){if(!f.firstName||!f.firstName.trim())return;var person={...f,id:uid(),stages:{[f.currentStage||"first-visit"]:{date:new Date().toISOString(),completed:true}},notes:[],checkIns:[],lastContactDate:null,createdAt:new Date().toISOString(),assignedTo:f.assignedTo||null,followUps:[],customFields:{}};enabled.forEach(function(fd){if(fd.type==="dropdown"||fd.type==="checkbox"){person.customFields[fd.key]=f[fd.key]}});p.onAdd(person);setRecent(function(prev){return[person].concat(prev).slice(0,20)});setF({...empty});setCount(function(c){return c+1});setFlash(true);setTimeout(function(){setFlash(false)},1200);if(firstRef.current)firstRef.current.focus()};

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:19}}>
      <div><h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8}}><I n="card" sz={22} c="var(--primary)"/>Quick Entry</h2><p style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>Rapid connection card entry</p></div>
      {count>0&&<div style={{background:flash?"linear-gradient(135deg,#34D399,#10B981)":"var(--inp)",color:flash?"#fff":"var(--text-sub)",padding:"6px 16px",borderRadius:12,fontSize:12,fontWeight:700,transition:"all 0.3s"}}>{count} added</div>}
    </div>
    <div className="weavr-qe-layout" style={{display:"flex",gap:16,alignItems:"flex-start"}}>
      <div style={{flex:1,background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          {enabled.map(function(fd,i){
            if(fd.key==="currentStage")return <div key={fd.key}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{fd.label}{fd.required?" *":""}</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f.currentStage||"first-visit"} onChange={function(e){setF({...f,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>;
            if(fd.type==="dropdown")return <div key={fd.key}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{fd.label}</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f[fd.key]||""} onChange={function(e){var nf={...f};nf[fd.key]=e.target.value;setF(nf)}}><option value="">Select...</option>{(fd.options||[]).map(function(o){return <option key={o} value={o}>{o}</option>})}</select></div>;
            if(fd.type==="checkbox")return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 0"}}><input type="checkbox" checked={!!f[fd.key]} onChange={function(e){var nf={...f};nf[fd.key]=e.target.checked;setF(nf)}} style={{width:18,height:18,accentColor:"var(--primary)"}}/><span style={{fontSize:11,color:"var(--text)"}}>{fd.label}</span></div>;
            return <div key={fd.key}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{fd.label}{fd.required?" *":""}</div><input ref={i===0?firstRef:undefined} style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,boxSizing:"border-box",outline:"none"}} value={fd.key==="phone"?fmtPhone(f[fd.key]||""):(f[fd.key]||"")} onChange={function(e){var nf={...f};nf[fd.key]=fd.key==="phone"?e.target.value.replace(/\D/g,"").slice(0,10):e.target.value;setF(nf)}} placeholder={fd.label} onKeyDown={function(e){if(e.key==="Enter")sub()}}/></div>;
          })}
          {p.teams.length>0&&<div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Assign To</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f.assignedTo||""} onChange={function(e){setF({...f,assignedTo:e.target.value})}}><option value="">Unassigned</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}><Btn icon="plus" label="Add & Next (Enter)" onClick={sub} sx={{flex:1,justifyContent:"center",padding:"11px 14px"}}/><Btn label="Clear" v="ghost" onClick={function(){setF({...empty})}}/></div>
      </div>
      {recent.length>0&&<div className="weavr-qe-recent" style={{width:320,flexShrink:0}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Just Added ({recent.length})</div>
        <div style={{background:"var(--card)",borderRadius:12,padding:"6px",maxHeight:425,overflowY:"auto",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
          {recent.map(function(x,i){var stg=STAGES.find(function(s){return s.key===x.currentStage});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:i===0?"var(--primary)06":"transparent",borderBottom:i<recent.length-1?"1px solid var(--divider)":"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:stg?stg.color:"#ccc",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div>
              <div style={{fontSize:9,color:"var(--text-muted)"}}>{stg?stg.label:"?"}{x.phone?" \u00B7 "+fmtPhone(x.phone):""}</div>
            </div>
            <div style={{fontSize:9,color:"var(--text-muted)"}}>{fmtS(x.createdAt)}</div>
          </div>})}
        </div>
      </div>}
    </div>
  </div>;
}

/* ══════ BULK MESSAGE ══════ */
function BulkMessage(p){
  var [stage,setStage]=useState("first-visit");var [copied,setCopied]=useState("");
  var filtered=p.people.filter(function(x){return x.currentStage===stage&&x.phone});
  var stg=STAGES.find(function(s){return s.key===stage});
  var tpl=p.templates[stage]||DEFAULT_TPL[stage];
  var msgs=filtered.map(function(x){return{person:x,text:tpl.replace("{firstName}",x.firstName).replace("{lastName}",x.lastName)}});
  var doCopy=function(text,id){copyText(text,function(ok){if(ok){setCopied(id);setTimeout(function(){setCopied("")},2000)}})};
  var copyAll=function(){var txt=msgs.map(function(m){return m.person.firstName+" "+m.person.lastName+" ("+m.person.phone+"):\n"+m.text}).join("\n\n---\n\n");doCopy(txt,"all")};

  return <div>
    <h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8,marginBottom:3}}><I n="send" sz={22} c="var(--primary)"/>Bulk Message</h2>
    <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:19}}>Personalized messages for everyone in a stage. Copy individual messages or use the SMS link to open your messaging app.</p>
    <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>{STAGES.map(function(s){var ct=p.people.filter(function(x){return x.currentStage===s.key&&x.phone}).length;return <button key={s.key} onClick={function(){setStage(s.key);setCopied("")}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:10,border:stage===s.key?"2px solid "+s.color:"2px solid transparent",background:stage===s.key?"var(--card)":"var(--inp)",fontSize:10,fontWeight:600,color:stage===s.key?s.color:"var(--text-sub)",cursor:"pointer"}}><Dot color={s.color} sz={6}/>{s.label} ({ct})</button>})}</div>
    <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
        <div><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{stg?stg.label:""} Messages</h3><p style={{fontSize:10,color:"var(--text-muted)"}}>{filtered.length} people with phone numbers</p></div>
        <Btn icon="copy" label={copied==="all"?"Copied!":"Copy All"} v={copied==="all"?"green":"ghost"} onClick={copyAll}/>
      </div>
      {msgs.length===0?<div style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No people with phone numbers in this stage</div>:
      <div style={{maxHeight:425,overflowY:"auto"}}>{msgs.map(function(m,i){return <div key={m.person.id} style={{padding:"11px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{m.person.firstName} {m.person.lastName} <span style={{fontWeight:400,color:"var(--text-muted)"}}>{fmtPhone(m.person.phone)}</span></div>
          <div style={{display:"flex",gap:5}}>
            <Btn icon="copy" label={copied===m.person.id?"Copied":"Copy"} v={copied===m.person.id?"green":"ghost"} sx={{padding:"3px 8px",fontSize:9}} onClick={function(){doCopy(m.text,m.person.id)}}/>
            <a href={smsUrl(m.person.phone,m.text)} target="_top" style={{textDecoration:"none",padding:"3px 8px",borderRadius:7,background:"linear-gradient(135deg,#67E8F9,#06B6D4)",color:"#fff",fontSize:9,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}><I n="send" sz={11} c="#fff"/>SMS</a>
          </div>
        </div>
        <div style={{background:"var(--inp)",borderRadius:8,padding:"8px 11px",fontSize:11,color:"var(--text-sub)",lineHeight:1.6,border:"1px solid var(--divider)"}}>{m.text}</div>
      </div>})}</div>}
    </div>
  </div>;
}

/* ══════ REPORTS ══════ */
function Reports(p){
  var people=p.people,teams=p.teams,total=people.length;
  var [widgets,setWidgets]=useState(["kpis","distribution","velocity","dropoff","team"]);
  var allWidgets=[
    {key:"kpis",label:"KPI Cards"},
    {key:"distribution",label:"Engagement Distribution"},
    {key:"velocity",label:"Stage Velocity"},
    {key:"dropoff",label:"Drop-off Analysis"},
    {key:"team",label:"Team Performance"},
    {key:"weekly",label:"Weekly Summary"},
    {key:"recent",label:"Recent Check-ins"},
    {key:"stale",label:"Stale Contacts"}
  ];
  if(!total)return <div style={{textAlign:"center",padding:64,color:"var(--text-muted)"}}><I n="chart" sz={32} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:10}}>Add people to see reports</div></div>;
  var buckets=[{label:"Highly Engaged",min:75,max:100,color:"#10B981"},{label:"Engaged",min:50,max:74,color:"#06B6D4"},{label:"At Risk",min:30,max:49,color:"#F59E0B"},{label:"Disengaging",min:0,max:29,color:"#EF4444"}];
  var scoreDist=buckets.map(function(b){return{...b,count:people.filter(function(x){var sc=calcScore(x);return sc>=b.min&&sc<=b.max}).length}});
  var maxB=Math.max.apply(null,scoreDist.map(function(b){return b.count}).concat([1]));
  var stageStats=STAGES.map(function(s){var inS=people.filter(function(x){return x.currentStage===s.key});var avg=inS.length>0?Math.round(inS.reduce(function(sum,x){var dt=x.stages&&x.stages[s.key]?x.stages[s.key].date:x.createdAt;return sum+(ago(dt)||0)},0)/inS.length):0;return{...s,count:inS.length,avgDays:avg}});
  var teamStats=teams.map(function(t){var asgn=people.filter(function(x){return x.assignedTo===t.id});var avgSc=asgn.length>0?Math.round(asgn.reduce(function(s,x){return s+calcScore(x)},0)/asgn.length):0;var fu=asgn.filter(function(x){var d=ago(x.lastContactDate);return d!==null&&d<=3}).length;return{...t,assigned:asgn.length,avgScore:avgSc,followedUp:fu}});
  var needFollow=people.filter(function(x){var d=ago(x.lastContactDate);return d===null||d>3}).length;
  var avgScore=Math.round(people.reduce(function(s,x){return s+calcScore(x)},0)/total);
  var added7=people.filter(function(x){return ago(x.createdAt)<=7}).length;
  var stale=people.filter(function(x){var d=ago(x.lastContactDate);return d===null||d>14}).sort(function(a,b){return(ago(a.lastContactDate)||999)-(ago(b.lastContactDate)||999)*-1});
  var recentCI=[];people.forEach(function(x){(x.checkIns||[]).forEach(function(c){if(ago(c.date)<=7)recentCI.push({...c,person:x})})});recentCI.sort(function(a,b){return new Date(b.date)-new Date(a.date)});

  var toggleWidget=function(key){setWidgets(function(prev){return prev.includes(key)?prev.filter(function(w){return w!==key}):prev.concat([key])})};

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
      <h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8}}><I n="chart" sz={22} c="var(--primary)"/>Reports</h2>
    </div>
    <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:13}}>Toggle widgets to customize your dashboard</p>
    <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>{allWidgets.map(function(w){var on=widgets.includes(w.key);return <button key={w.key} onClick={function(){toggleWidget(w.key)}} style={{padding:"5px 10px",borderRadius:8,border:on?"2px solid var(--primary)":"2px solid var(--inp-border)",background:on?"var(--primary)08":"var(--inp)",fontSize:9,fontWeight:600,color:on?"var(--primary)":"var(--text-muted)",cursor:"pointer"}}>{w.label}</button>})}</div>

    {widgets.includes("kpis")&&<div className="weavr-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:16}}>{[{l:"Total People",v:total,i:"users",c:"var(--primary)",bg:"var(--primary)"},{l:"Added (7d)",v:added7,i:"plus",c:"#10B981",bg:"#10B981"},{l:"Need Follow-Up",v:needFollow,i:"flag",c:"#EF4444",bg:"#EF4444"},{l:"Avg Score",v:avgScore,i:"target",c:"#06B6D4",bg:"#06B6D4"}].map(function(k){return <div key={k.l} style={{background:k.bg+"0A",borderRadius:17,padding:"19px",position:"relative",overflow:"hidden",border:"1px solid "+k.bg+"15"}}><div style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:10,background:k.bg+"12",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={18} c={k.c}/></div><div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:k.c,marginBottom:8}}>{k.l}</div><div style={{fontSize:25,fontWeight:800,color:"var(--text)",lineHeight:1}}>{k.v}</div></div>})}</div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {widgets.includes("distribution")&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Engagement Distribution</h3>{scoreDist.map(function(b){return <div key={b.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:50,fontSize:16,fontWeight:700,color:b.color,textAlign:"right"}}>{b.count}</div><div style={{flex:1}}><div style={{height:28,background:"var(--divider)",borderRadius:7,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(b.count/maxB*100,3)+"%",background:b.color,borderRadius:7}}/></div><div style={{fontSize:9,color:"var(--text-muted)",marginTop:2}}>{b.label}</div></div></div>})}</div>}

      {widgets.includes("velocity")&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Stage Velocity</h3>{stageStats.map(function(s){return <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Dot color={s.color} sz={8}/><div style={{flex:1,fontSize:11,fontWeight:500,color:"var(--text-sub)"}}>{s.label}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{s.count}</div><div style={{width:60,textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{s.avgDays}</span><span style={{fontSize:9,color:"var(--text-muted)"}}>d</span></div></div>})}</div>}

      {widgets.includes("team")&&teamStats.length>0&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",gridColumn:widgets.includes("recent")||widgets.includes("stale")?"auto":"span 2"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Team Performance</h3>{teamStats.map(function(t){var rate=t.assigned>0?Math.round(t.followedUp/t.assigned*100):0;return <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",background:"var(--inp)",borderRadius:10,marginBottom:5}}><div style={{width:36,height:36,borderRadius:8,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{t.assigned} assigned - {rate}% followed up</div></div><ScoreRing score={t.avgScore} sz={36}/></div>})}</div>}

      {widgets.includes("recent")&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Recent Check-ins (7d)</h3>{recentCI.length===0?<div style={{color:"var(--text-muted)",padding:"16px 0",textAlign:"center",fontSize:11}}>No recent check-ins</div>:<div style={{maxHeight:255,overflowY:"auto"}}>{recentCI.slice(0,15).map(function(c,i){var ct=(p.config.checkInTypes||DEFAULT_CI).find(function(t){return t.key===c.type});return <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><I n={ct?ct.icon:"msg"} sz={12} c={ct?ct.color:"var(--text-muted)"}/><div style={{flex:1,fontSize:10,color:"var(--text-sub)"}}>{c.person.firstName} {c.person.lastName} - {ct?ct.label:c.type}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{fmtS(c.date)}</div></div>})}</div>}</div>}

      {widgets.includes("stale")&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Stale Contacts (14d+)</h3>{stale.length===0?<div style={{color:"var(--text-muted)",padding:"16px 0",textAlign:"center",fontSize:11}}>No stale contacts</div>:<div style={{maxHeight:255,overflowY:"auto"}}>{stale.slice(0,15).map(function(x,i){var d=ago(x.lastContactDate);var stg=STAGES.find(function(s){return s.key===x.currentStage});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><Dot color={stg?stg.color:"#ccc"} sz={8}/><div style={{flex:1,fontSize:10,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><span style={{fontSize:9,fontWeight:600,color:"#EF4444"}}>{d===null?"Never":d+"d"}</span></div>})}</div>}</div>}

      {widgets.includes("dropoff")&&(function(){var linearS=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});var drops=linearS.map(function(s,i){var inStage=people.filter(function(x){return x.currentStage===s.key});var stalled=inStage.filter(function(x){var stDate=x.stages&&x.stages[s.key]?x.stages[s.key].date:x.createdAt;return ago(stDate)>14});var pct=inStage.length>0?Math.round(stalled.length/inStage.length*100):0;return{...s,total:inStage.length,stalled:stalled.length,pct:pct}});var maxDrop=Math.max.apply(null,drops.map(function(d){return d.total}).concat([1]));return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>Drop-off Analysis</h3><p style={{fontSize:9,color:"var(--text-muted)",marginBottom:11}}>Where people stall (14+ days in stage)</p>{drops.map(function(d){return <div key={d.key} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><Dot color={d.color} sz={7}/><span style={{fontSize:10,fontWeight:500,color:"var(--text)",flex:1}}>{d.label}</span><span style={{fontSize:9,color:d.pct>50?"#EF4444":d.pct>25?"#F59E0B":"var(--text-muted)",fontWeight:600}}>{d.stalled}/{d.total} stalled ({d.pct}%)</span></div><div style={{height:6,background:"var(--divider)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:d.pct>50?"#EF4444":d.pct>25?"#F59E0B":"#10B981",width:Math.max(d.total/maxDrop*100,3)+"%",position:"relative"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:d.pct+"%",background:"rgba(239,68,68,0.4)",borderRadius:"0 3px 3px 0"}}/></div></div></div>})}</div>})()}

      {widgets.includes("weekly")&&(function(){var w7=people.filter(function(x){return ago(x.createdAt)<=7}).length;var fu7=0;var adv7=0;var fc7=people.filter(function(x){return x.fullyConnected&&ago(x.fullyConnectedDate)<=7}).length;people.forEach(function(x){(x.checkIns||[]).forEach(function(c){if(ago(c.date)<=7)fu7++});STAGES.forEach(function(s){if(s.key!=="first-visit"&&x.stages&&x.stages[s.key]&&ago(x.stages[s.key].date)<=7)adv7++})});return <div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>This Week</h3><div className="weavr-weekly-summary-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{[{l:"New People",v:w7,c:"#10B981",i:"plus"},{l:"Follow-ups Done",v:fu7,c:"var(--primary)",i:"check"},{l:"Stage Advances",v:adv7,c:"#06B6D4",i:"up"},{l:"Fully Connected",v:fc7,c:"#F59E0B",i:"target"}].map(function(k){return <div key={k.l} style={{background:k.c+"08",borderRadius:12,padding:"13px 14px",display:"flex",alignItems:"center",gap:10,border:"1px solid "+k.c+"12"}}><div style={{width:40,height:40,borderRadius:10,background:k.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={17} c={k.c}/></div><div><div style={{fontSize:19,fontWeight:800,color:"var(--text)"}}>{k.v}</div><div style={{fontSize:9,color:"var(--text-muted)",fontWeight:600}}>{k.l}</div></div></div>})}</div></div>})()}
    </div>
  </div>;
}

/* ══════ FULLY CONNECTED ══════ */
function FullyConnected(p){
  var [fcView,setFcView]=useState("grid");var [fcSort,setFcSort]=useState("newest");
  var connected=sortPeople(p.people.filter(function(x){return x.fullyConnected}),fcSort);
  return <div>
    <div className="weavr-fc-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
      <div style={{textAlign:"left"}}>
        <h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",display:"flex",alignItems:"center",gap:8}}>{"⭐"} Fully Connected</h2>
        <p style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>{connected.length} people in both a BGroup and on the ATeam</p>
      </div>
      <div style={{display:"flex",gap:3,background:"var(--inp)",borderRadius:8,padding:2}}>
        {["grid","list"].map(function(v){return <button key={v} onClick={function(){setFcView(v)}} style={{padding:"5px 10px",borderRadius:7,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",background:fcView===v?"var(--card)":"transparent",color:fcView===v?"var(--text)":"var(--text-muted)",boxShadow:fcView===v?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{v==="grid"?"Grid":"List"}</button>})}
      </div>
    </div>
    <div style={{marginBottom:13}}><SortBar value={fcSort} onChange={setFcSort}/></div>
    {connected.length===0?<div style={{background:"var(--card)",borderRadius:19,padding:38,textAlign:"center",color:"var(--text-muted)",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}><div style={{fontSize:12,fontWeight:600}}>No one fully connected yet</div><p style={{fontSize:10,marginTop:5}}>When someone joins both a BGroup and the ATeam, they'll appear here.</p></div>:
    fcView==="list"?<div style={{background:"var(--card)",borderRadius:19,overflow:"hidden",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      {connected.map(function(x,i){var ns=(x.milestones||{})["next-steps"]||{};var sc=calcScore(x);return <div key={x.id} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 16px",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><div style={{width:36,height:36,borderRadius:8,background:scoreColor(sc)+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:scoreColor(sc)}}>{(x.firstName||"?").charAt(0)}{(x.lastName||"").charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:9,color:"var(--text-muted)",display:"flex",gap:7,marginTop:2}}><span style={{color:"#EC4899"}}>{ns.bGroupLeader||"BGroup"}</span><span style={{color:"#34D399"}}>{ns.aTeamArea||"ATeam"}</span></div></div><ScoreRing score={sc} sz={32}/><div style={{fontSize:9,color:"var(--text-muted)"}}>{fmt(x.fullyConnectedDate)}</div></div>})}
    </div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:15}}>
      {connected.map(function(x){
        var ns=(x.milestones||{})["next-steps"]||{};var sc=calcScore(x);
        return <div key={x.id} style={{background:"var(--card)",borderRadius:19,padding:"19px",cursor:"pointer",boxShadow:"var(--card-shadow)",border:"1px solid #F59E0B20",transition:"all 0.2s"}} onClick={function(){p.onPerson(x)}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="#F59E0B40"}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="#F59E0B20"}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}>
            <div style={{width:44,height:44,borderRadius:12,background:"#F59E0B10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#F59E0B"}}>{(x.firstName||"?").charAt(0)}{(x.lastName||"").charAt(0)}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{fmt(x.fullyConnectedDate)}</div></div>
            <ScoreRing score={sc} sz={36}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"#EC489908",borderRadius:10,padding:"8px 11px",border:"1px solid #EC489912"}}><div style={{fontSize:8,fontWeight:700,color:"#EC4899",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>BGroup</div><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{ns.bGroupLeader||"Connected"}</div></div>
            <div style={{flex:1,background:"#34D39908",borderRadius:10,padding:"8px 11px",border:"1px solid #34D39912"}}><div style={{fontSize:8,fontWeight:700,color:"#34D399",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>ATeam</div><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{ns.aTeamArea||"Serving"}</div></div>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

/* ══════ SETTINGS ══════ */
function Settings(p){
  var [tab,setTab]=useState("teams");
  var [ek,setEk]=useState(null);var [et,setEt]=useState("");var [saved,setSaved]=useState(false);
  var [newTeam,setNewTeam]=useState({name:"",role:""});
  var [newRule,setNewRule]=useState({trigger:"days-no-contact",days:7,stage:"",action:"notify",enabled:true});
  var [newCI,setNewCI]=useState({label:"",color:"#7C3AED",icon:"msg"});
  var [newField,setNewField]=useState({label:"",type:"text",required:false,optionsStr:""});
  var [emailEk,setEmailEk]=useState(null);var [emailEt,setEmailEt]=useState("");var [emailSaved,setEmailSaved]=useState(false);
  var config=p.config;var ciTypes=config.checkInTypes||DEFAULT_CI;var formFields=config.formFields||DEFAULT_FIELDS;
  var emailTpls=config.emailTemplates||{};
  var goTpl=function(k){setEk(k);setEt(p.templates[k]||"");setSaved(false)};
  var saveTpl=function(){p.setTemplates(function(prev){return{...prev,[ek]:et}});setSaved(true);setTimeout(function(){setSaved(false)},2500)};
  var goEmailTpl=function(k){setEmailEk(k);setEmailEt(emailTpls[k]||"");setEmailSaved(false)};
  var saveEmailTpl=function(){var ne={...emailTpls};ne[emailEk]=emailEt;p.setConfig({...config,emailTemplates:ne});setEmailSaved(true);setTimeout(function(){setEmailSaved(false)},2500)};
  var tabs=[{key:"teams",label:"Teams",icon:"users"},{key:"templates",label:"Text Templates",icon:"msg"},{key:"email-tpl",label:"Email Templates",icon:"mail"},{key:"sequences",label:"Sequences",icon:"clock"},{key:"automation",label:"Automation",icon:"zap"},{key:"checkins",label:"Check-ins",icon:"check"},{key:"forms",label:"Form Fields",icon:"card"},{key:"visual",label:"Visual",icon:"palette"},{key:"data",label:"Data",icon:"dl"}];

  return <div>
    <h2 style={{fontSize:17,fontWeight:800,color:"var(--text)",marginBottom:16}}>Settings</h2>
    <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>{tabs.map(function(t){return <button key={t.key} onClick={function(){setTab(t.key)}} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 11px",borderRadius:8,border:tab===t.key?"2px solid var(--primary)":"2px solid transparent",background:tab===t.key?"var(--primary)08":"var(--inp)",fontSize:10,fontWeight:600,color:tab===t.key?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}><I n={t.icon} sz={13} c={tab===t.key?"var(--primary)":"var(--text-muted)"}/>{t.label}</button>})}</div>

    {tab==="teams"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Team Members</h3>
      <div style={{display:"flex",gap:8,marginBottom:13}}><input style={{flex:1,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,outline:"none",boxSizing:"border-box"}} placeholder="Name" value={newTeam.name} onChange={function(e){setNewTeam({...newTeam,name:e.target.value})}}/><input style={{width:180,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,outline:"none",boxSizing:"border-box"}} placeholder="Role" value={newTeam.role} onChange={function(e){setNewTeam({...newTeam,role:e.target.value})}}/><Btn label="Add" onClick={function(){if(!newTeam.name.trim())return;p.setTeams(function(prev){return prev.concat([{id:uid(),name:newTeam.name.trim(),role:newTeam.role.trim(),color:TC[prev.length%TC.length]}])});setNewTeam({name:"",role:""})}}/></div>
      {p.teams.map(function(t){var ct=p.people.filter(function(x){return x.assignedTo===t.id}).length;return <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"var(--inp)",borderRadius:10,marginBottom:5}}><div style={{width:36,height:36,borderRadius:8,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{t.role||"Team Member"} - {ct} assigned</div></div><button onClick={function(){p.setTeams(function(prev){return prev.filter(function(x){return x.id!==t.id})})}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}><I n="trash" sz={14} c="#EF4444"/></button></div>})}
      {p.teams.length===0&&<div style={{color:"var(--text-muted)",fontSize:11,padding:"16px 0",textAlign:"center"}}>No team members yet</div>}
    </div>}

    {tab==="templates"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Message Templates</h3>
      <div style={{display:"flex",gap:16}}><div style={{width:180,flexShrink:0}}>{STAGES.map(function(s){return <button key={s.key} onClick={function(){goTpl(s.key)}} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",borderRadius:10,border:"none",fontSize:11,fontWeight:ek===s.key?600:500,background:ek===s.key?"var(--primary)08":"transparent",color:ek===s.key?"var(--primary)":"var(--text-sub)",textAlign:"left",marginBottom:2,cursor:"pointer"}}><Dot color={s.color} sz={7}/>{s.label}</button>})}</div>
      <div style={{flex:1}}>{ek?(function(){var stg=STAGES.find(function(s){return s.key===ek});return <div><div style={{fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:8,display:"flex",alignItems:"center",gap:7}}><Dot color={stg?stg.color:"#ccc"} sz={9}/>{stg?stg.label:""} Template</div><textarea value={et} onChange={function(e){setEt(e.target.value);setSaved(false)}} style={{width:"100%",minHeight:100,padding:13,borderRadius:12,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12,lineHeight:1.7,resize:"vertical",boxSizing:"border-box",outline:"none"}}/><div style={{display:"flex",gap:7,marginTop:8,alignItems:"center"}}><Btn label="Save" onClick={saveTpl}/>{saved&&<span style={{fontSize:10,color:"#10B981",fontWeight:600}}>Saved!</span>}</div></div>})():<div style={{color:"var(--text-muted)",fontSize:12,padding:"32px 0",textAlign:"center"}}>Select a stage</div>}</div></div>
    </div>}

    {tab==="email-tpl"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>Email Templates</h3>
      <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:13}}>{"Email templates per stage. Use {firstName} and {lastName} as placeholders. Subject and body."}</p>
      <div style={{display:"flex",gap:16}}>
        <div style={{width:180,flexShrink:0}}>{STAGES.map(function(s){return <button key={s.key} onClick={function(){goEmailTpl(s.key)}} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",borderRadius:10,border:"none",fontSize:11,fontWeight:emailEk===s.key?600:500,background:emailEk===s.key?"var(--primary)08":"transparent",color:emailEk===s.key?"var(--primary)":"var(--text-sub)",textAlign:"left",marginBottom:2,cursor:"pointer"}}><Dot color={s.color} sz={7}/>{s.label}</button>})}</div>
        <div style={{flex:1}}>{emailEk?(function(){var stg=STAGES.find(function(s){return s.key===emailEk});var subKey=emailEk+"_subject";var curSubject=(config.emailSubjects||{})[emailEk]||"Following up - "+((stg?stg.label:""));return <div>
          <div style={{fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:8,display:"flex",alignItems:"center",gap:7}}><Dot color={stg?stg.color:"#ccc"} sz={9}/>{stg?stg.label:""} Email</div>
          <div style={{marginBottom:8}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:3}}>Subject Line</div><input style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,boxSizing:"border-box",outline:"none"}} value={curSubject} onChange={function(e){var ns={...(config.emailSubjects||{})};ns[emailEk]=e.target.value;p.setConfig({...config,emailSubjects:ns})}}/></div>
          <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:3}}>Body</div>
          <textarea value={emailEt} onChange={function(e){setEmailEt(e.target.value);setEmailSaved(false)}} style={{width:"100%",minHeight:120,padding:13,borderRadius:12,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12,lineHeight:1.7,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
          <div style={{display:"flex",gap:7,marginTop:8,alignItems:"center"}}><Btn label="Save" onClick={saveEmailTpl}/>{emailSaved&&<span style={{fontSize:10,color:"#10B981",fontWeight:600}}>Saved!</span>}</div>
        </div>})():<div style={{color:"var(--text-muted)",fontSize:12,padding:"32px 0",textAlign:"center"}}>Select a stage to edit its email template</div>}</div>
      </div>
    </div>}

    {tab==="sequences"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>Message Sequences</h3>
      <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:13}}>Pre-built drip sequences per stage. Each step has suggested timing you can customize.</p>
      {(function(){var seqs=config.sequences||{};var selSeqStage=ek||"first-visit";var stg=STAGES.find(function(s){return s.key===selSeqStage});var stageSeq=seqs[selSeqStage]||[{day:1,type:"text",message:"Hey {firstName}, it was great having you! How was your experience?"},{day:3,type:"text",message:"Hey {firstName}, just checking in! Would love to connect this week."},{day:7,type:"email",message:"Hi {firstName}, we'd love to see you again. Is there anything we can help with?"}];var updateSeq=function(newSeq){var ns={...seqs};ns[selSeqStage]=newSeq;p.setConfig({...config,sequences:ns})};return <div style={{display:"flex",gap:16}}>
        <div style={{width:180,flexShrink:0}}>{STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"}).map(function(s){return <button key={s.key} onClick={function(){setEk(s.key)}} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",borderRadius:10,border:"none",fontSize:11,fontWeight:selSeqStage===s.key?600:500,background:selSeqStage===s.key?"var(--primary)08":"transparent",color:selSeqStage===s.key?"var(--primary)":"var(--text-sub)",textAlign:"left",marginBottom:2,cursor:"pointer"}}><Dot color={s.color} sz={7}/>{s.label}</button>})}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:11,display:"flex",alignItems:"center",gap:7}}><Dot color={stg?stg.color:"#ccc"} sz={9}/>{stg?stg.label:""} Sequence</div>
          {stageSeq.map(function(step,i){return <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
            <div style={{width:48,textAlign:"center",flexShrink:0}}><div style={{fontSize:14,fontWeight:700,color:"var(--primary)"}}>{step.day}</div><div style={{fontSize:8,color:"var(--text-muted)",fontWeight:600}}>DAY</div></div>
            <div style={{flex:1,background:"var(--inp)",borderRadius:10,padding:"8px 11px"}}>
              <div style={{display:"flex",gap:5,marginBottom:5}}>
                <select value={step.type} onChange={function(e){var ns=stageSeq.slice();ns[i]={...ns[i],type:e.target.value};updateSeq(ns)}} style={{padding:"3px 6px",borderRadius:5,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:9,cursor:"pointer"}}><option value="text">Text</option><option value="email">Email</option></select>
                <input type="number" value={step.day} onChange={function(e){var ns=stageSeq.slice();ns[i]={...ns[i],day:parseInt(e.target.value)||1};updateSeq(ns)}} style={{width:50,padding:"3px 6px",borderRadius:5,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:9,textAlign:"center"}} min="1"/>
                <div style={{flex:1}}/>
                <button onClick={function(){var ns=stageSeq.filter(function(_,j){return j!==i});updateSeq(ns)}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><I n="x" sz={12} c="#EF4444"/></button>
              </div>
              <textarea value={step.message} onChange={function(e){var ns=stageSeq.slice();ns[i]={...ns[i],message:e.target.value};updateSeq(ns)}} style={{width:"100%",minHeight:48,padding:"6px 8px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,lineHeight:1.5,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
            </div>
          </div>})}
          <button onClick={function(){var ns=stageSeq.concat([{day:stageSeq.length>0?stageSeq[stageSeq.length-1].day+3:1,type:"text",message:""}]);updateSeq(ns)}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,border:"2px dashed var(--inp-border)",background:"transparent",color:"var(--text-muted)",fontSize:10,fontWeight:600,cursor:"pointer",width:"100%",justifyContent:"center"}}><I n="plus" sz={12} c="var(--text-muted)"/>Add Step</button>
        </div>
      </div>})()}
    </div>}

    {tab==="automation"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>Automation Rules</h3>
      <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:13}}>Create custom rules to automate follow-up workflows</p>
      <div style={{background:"var(--inp)",borderRadius:12,padding:13,marginBottom:13}}>
        <div style={{display:"flex",gap:8,alignItems:"end",flexWrap:"wrap"}}>
          <div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>When</div><select style={{width:200,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:11,cursor:"pointer"}} value={newRule.trigger} onChange={function(e){setNewRule({...newRule,trigger:e.target.value})}}><option value="days-no-contact">Days without contact</option><option value="stage-reached">Stage is reached</option><option value="score-below">Score drops below</option><option value="check-in-type">Check-in type logged</option></select></div>
          {(newRule.trigger==="days-no-contact"||newRule.trigger==="score-below")&&<div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{newRule.trigger==="days-no-contact"?"Days":"Score"}</div><input type="number" style={{width:80,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:11,boxSizing:"border-box"}} value={newRule.days} onChange={function(e){setNewRule({...newRule,days:parseInt(e.target.value)||0})}}/></div>}
          {newRule.trigger==="stage-reached"&&<div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Stage</div><select style={{width:160,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:11,cursor:"pointer"}} value={newRule.stage} onChange={function(e){setNewRule({...newRule,stage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>}
          <div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Then</div><select style={{width:200,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:11,cursor:"pointer"}} value={newRule.action} onChange={function(e){setNewRule({...newRule,action:e.target.value})}}><option value="notify">Add reminder note</option><option value="escalate">Flag for escalation</option><option value="advance">Auto-advance stage</option><option value="assign">Auto-assign to team</option></select></div>
          <Btn label="Add Rule" onClick={function(){p.setRules(function(prev){return prev.concat([{...newRule,id:uid()}])})}}/>
        </div>
      </div>
      {p.rules.map(function(r){var desc="";if(r.trigger==="days-no-contact")desc="No contact for "+r.days+"d";else if(r.trigger==="stage-reached"){var stg=STAGES.find(function(s){return s.key===r.stage});desc=(stg?stg.label:r.stage)+" reached"}else if(r.trigger==="score-below")desc="Score below "+r.days;else desc="Check-in logged";var act=r.action==="escalate"?"Escalate":r.action==="advance"?"Auto-advance":r.action==="assign"?"Auto-assign":"Add reminder";return <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"var(--inp)",borderRadius:10,marginBottom:5}}><I n="zap" sz={16} c={r.enabled?"var(--primary)":"var(--text-muted)"}/><div style={{flex:1,fontSize:11,fontWeight:500,color:r.enabled?"var(--text)":"var(--text-muted)"}}>{desc} \u2192 {act}</div><button onClick={function(){p.setRules(function(prev){return prev.map(function(x){return x.id===r.id?{...x,enabled:!x.enabled}:x})})}} style={{background:"none",border:"none",padding:3,cursor:"pointer",fontSize:9,fontWeight:600,color:r.enabled?"#10B981":"var(--text-muted)"}}>{r.enabled?"Active":"Off"}</button><button onClick={function(){p.setRules(function(prev){return prev.filter(function(x){return x.id!==r.id})})}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}><I n="trash" sz={14} c="#EF4444"/></button></div>})}
      {p.rules.length===0&&<div style={{color:"var(--text-muted)",fontSize:11,padding:"16px 0",textAlign:"center"}}>No automation rules yet</div>}
    </div>}

    {tab==="checkins"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Check-In Types</h3>
      <div style={{display:"flex",gap:8,marginBottom:13}}>
        <input style={{flex:1,padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,outline:"none",boxSizing:"border-box"}} placeholder="Label (e.g. Home Visit)" value={newCI.label} onChange={function(e){setNewCI({...newCI,label:e.target.value})}}/>
        <input type="color" value={newCI.color} onChange={function(e){setNewCI({...newCI,color:e.target.value})}} style={{width:44,height:40,borderRadius:8,border:"1px solid var(--inp-border)",cursor:"pointer",padding:2}}/>
        <Btn label="Add" onClick={function(){if(!newCI.label.trim())return;var nTypes=ciTypes.concat([{key:uid(),label:newCI.label.trim(),icon:"check",color:newCI.color}]);p.setConfig({...config,checkInTypes:nTypes});setNewCI({label:"",color:"#7C3AED",icon:"msg"})}}/>
      </div>
      {ciTypes.map(function(ct){return <div key={ct.key} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 11px",background:"var(--inp)",borderRadius:8,marginBottom:3}}><div style={{width:8,height:8,borderRadius:"50%",background:ct.color}}/><div style={{flex:1,fontSize:11,color:"var(--text)"}}>{ct.label}</div><button onClick={function(){var nTypes=ciTypes.filter(function(x){return x.key!==ct.key});p.setConfig({...config,checkInTypes:nTypes})}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}><I n="x" sz={12} c="#EF4444"/></button></div>})}
    </div>}

    {tab==="forms"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>Form Fields</h3>
      <p style={{fontSize:10,color:"var(--text-muted)",marginBottom:13}}>Fully customize the fields shown in Quick Entry and Add Person forms. Drag to reorder, toggle visibility, or add new custom fields.</p>
      <div style={{background:"var(--inp)",borderRadius:12,padding:13,marginBottom:13}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Add New Field</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"end"}}>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:3}}>Label</div><input style={{width:"100%",padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,boxSizing:"border-box",outline:"none"}} value={newField.label} onChange={function(e){setNewField({...newField,label:e.target.value})}} placeholder="e.g. Marital Status"/></div>
          <div style={{width:130}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:3}}>Type</div><select style={{width:"100%",padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,cursor:"pointer"}} value={newField.type} onChange={function(e){setNewField({...newField,type:e.target.value})}}><option value="text">Text</option><option value="dropdown">Dropdown</option><option value="checkbox">Checkbox</option></select></div>
          {newField.type==="dropdown"&&<div style={{flex:1,minWidth:200}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:3}}>Options (comma separated)</div><input style={{width:"100%",padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,boxSizing:"border-box",outline:"none"}} value={newField.optionsStr||""} onChange={function(e){setNewField({...newField,optionsStr:e.target.value})}} placeholder="Option 1, Option 2, Option 3"/></div>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 0"}}><input type="checkbox" checked={newField.required} onChange={function(){setNewField({...newField,required:!newField.required})}} style={{width:14,height:14,accentColor:"var(--primary)"}}/><span style={{fontSize:9,color:"var(--text-muted)"}}>Required</span></div>
          <Btn label="Add Field" onClick={function(){if(!newField.label.trim())return;var opts=newField.type==="dropdown"&&newField.optionsStr?(newField.optionsStr).split(",").map(function(o){return o.trim()}).filter(function(o){return o}):undefined;var nf={key:"custom_"+uid(),label:newField.label.trim(),type:newField.type,required:newField.required,enabled:true};if(opts)nf.options=opts;p.setConfig({...config,formFields:formFields.concat([nf])});setNewField({label:"",type:"text",required:false,optionsStr:""})}} sx={{padding:"6px 13px",fontSize:10}}/>
        </div>
      </div>
      {formFields.map(function(fd,idx){return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:"var(--inp)",borderRadius:8,marginBottom:3}}>
        <input type="checkbox" checked={fd.enabled} onChange={function(){var nFields=formFields.map(function(f){return f.key===fd.key?{...f,enabled:!f.enabled}:f});p.setConfig({...config,formFields:nFields})}} style={{width:16,height:16,accentColor:"var(--primary)",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:11,fontWeight:500,color:fd.enabled?"var(--text)":"var(--text-muted)"}}>{fd.label}</span>
            <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"var(--primary)10",color:"var(--primary)",fontWeight:600}}>{fd.type}</span>
            {fd.required&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#EF444415",color:"#EF4444",fontWeight:600}}>required</span>}
          </div>
          {fd.options&&<div style={{fontSize:9,color:"var(--text-muted)",marginTop:2}}>{fd.options.join(", ")}</div>}
        </div>
        {idx>0&&<button onClick={function(){var nf=[].concat(formFields);var temp=nf[idx];nf[idx]=nf[idx-1];nf[idx-1]=temp;p.setConfig({...config,formFields:nf})}} style={{background:"none",border:"none",padding:2,cursor:"pointer",fontSize:9,color:"var(--text-muted)"}}>{"\u25B2"}</button>}
        {idx<formFields.length-1&&<button onClick={function(){var nf=[].concat(formFields);var temp=nf[idx];nf[idx]=nf[idx+1];nf[idx+1]=temp;p.setConfig({...config,formFields:nf})}} style={{background:"none",border:"none",padding:2,cursor:"pointer",fontSize:9,color:"var(--text-muted)"}}>{"\u25BC"}</button>}
        {fd.key.startsWith("custom_")&&<button onClick={function(){p.setConfig({...config,formFields:formFields.filter(function(f){return f.key!==fd.key})})}} style={{background:"none",border:"none",padding:3,cursor:"pointer"}}><I n="trash" sz={13} c="#EF4444"/></button>}
      </div>})}
    </div>}

    {tab==="visual"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Visual Settings</h3>
      <div style={{marginBottom:19}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Theme Mode</div>
        <div style={{display:"flex",gap:8}}>
          {[{k:"light",label:"Light",bg:"#F0F2F5",fg:"#1E1B4B"},{k:"dark",label:"Dark",bg:"#1E1B4B",fg:"#F1F5F9"},{k:"mono",label:"Simple",bg:"#F8F9FA",fg:"#212529"}].map(function(m){return <button key={m.k} onClick={function(){p.setConfig({...config,theme:m.k})}} style={{flex:1,padding:"13px",borderRadius:12,border:(config.theme||"light")===m.k?"2px solid var(--primary)":"2px solid var(--inp-border)",background:m.bg,cursor:"pointer",textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:m.fg}}>{m.label}</div><div style={{fontSize:8,color:m.fg,opacity:0.5,marginTop:2}}>{m.k==="mono"?"Clean & minimal":m.k==="dark"?"Rich & immersive":"Bright & airy"}</div></button>})}
        </div>
      </div>
      {(config.theme||"light")!=="mono"&&<div>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Color Scheme</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {Object.keys(COLORWAYS).filter(function(k){return k!=="mono"}).map(function(cwk){var c=COLORWAYS[cwk];return <button key={cwk} onClick={function(){p.setConfig({...config,colorway:cwk})}} style={{padding:"13px 10px",borderRadius:12,border:(config.colorway||"purple")===cwk?"2px solid "+c.primary:"2px solid var(--inp-border)",background:"var(--inp)",cursor:"pointer",textAlign:"center"}}><div style={{width:32,height:32,borderRadius:8,background:c.primaryGrad,margin:"0 auto 8px"}}/><div style={{fontSize:10,fontWeight:600,color:"var(--text)",textTransform:"capitalize"}}>{cwk}</div></button>})}
        </div>
      </div>}
    </div>}

    {tab==="data"&&<div style={{background:"var(--card)",borderRadius:19,padding:"21px 22px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
      <h3 style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:13}}>Data Management</h3>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Btn label="Export All" icon="dl" v="ghost" onClick={function(){csvExport(["First Name","Last Name","Phone","Email","Stage","Score"],p.people.map(function(x){return[x.firstName,x.lastName,x.phone,x.email,x.currentStage,calcScore(x)]}),"ce-backup.csv")}}/>
        <Btn label={"Wipe All ("+p.people.length+")"} v="red" onClick={function(){if(confirm("Delete everything?")){p.setPeople([]);p.setTeams([]);p.setRules([])}}}/>
      </div>
    </div>}
  </div>;
}

/* ══════ PERSON PANEL ══════ */
function Panel(p){
  var person=p.person,teams=p.teams,templates=p.templates;
  var [edit,setEdit]=useState(false);var [form,setForm]=useState({...person});
  var [note,setNote]=useState("");var [msg,setMsg]=useState(false);var [ciNote,setCiNote]=useState("");
  var [showCal,setShowCal]=useState(false);var [fuType,setFuType]=useState("remind");var [fuDate,setFuDate]=useState("");
  var [copied,setCopied]=useState(false);var [justFollowed,setJustFollowed]=useState(false);var [contactOpen,setContactOpen]=useState(null);var [showFollowUp,setShowFollowUp]=useState(false);
  var stg=STAGES.find(function(s){return s.key===person.currentStage});
  var idx=SIDX[person.currentStage];var d=ago(person.lastContactDate);
  var stColor=stg?stg.color:"#9CA3AF";var stLabel=stg?stg.label:"Unknown";
  var score=calcScore(person);var tm=teams.find(function(t){return t.id===person.assignedTo});
  var ciTypes=p.config.checkInTypes||DEFAULT_CI;

  var exportReport=function(){var lines=[];lines.push("WEAVR CONNECT - PERSON REPORT");lines.push("Generated: "+new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}));lines.push("==================================================");lines.push("");lines.push("NAME: "+person.firstName+" "+(person.lastName||""));lines.push("PHONE: "+(person.phone?fmtPhone(person.phone):"N/A"));lines.push("EMAIL: "+(person.email||"N/A"));lines.push("STAGE: "+stLabel);lines.push("SCORE: "+score+"/100 ("+scoreLabel(score)+")");lines.push("ASSIGNED TO: "+(tm?tm.name:"Unassigned"));lines.push("ADDED: "+(person.createdAt?fmt(person.createdAt):"Unknown"));lines.push("LAST CONTACT: "+(person.lastContactDate?fmt(person.lastContactDate):"Never"));lines.push("");lines.push("-- CONNECT STATUS --");var hasBGx=person.stages&&person.stages.bgroup&&person.stages.bgroup.completed;var hasATx=person.stages&&person.stages.ateam&&person.stages.ateam.completed;lines.push("BGroup: "+(hasBGx?"Yes":"No"));lines.push("ATeam: "+(hasATx?"Yes":"No"));lines.push("Fully Connected: "+(person.fullyConnected?"Yes - "+fmt(person.fullyConnectedDate):"No"));lines.push("");if((person.checkIns||[]).length>0){lines.push("-- FOLLOW-UP HISTORY --");(person.checkIns||[]).slice().reverse().forEach(function(c){var ct=ciTypes.find(function(t){return t.key===c.type});lines.push(fmtS(c.date)+" - "+(ct?ct.label:c.type)+(c.loggedBy?" (by "+c.loggedBy+")":"")+(c.note&&c.note!=="Followed up"?" - "+c.note:""))});lines.push("")}if((person.notes||[]).length>0){lines.push("-- NOTES --");(person.notes||[]).slice().reverse().forEach(function(n){lines.push(fmt(n.date)+": "+n.text)});lines.push("")}lines.push("-- END OF REPORT --");var text=lines.join("\n");copyText(text,function(ok){if(ok){setCopied(true);setTimeout(function(){setCopied(false)},2000)}});var w=window.open("","_blank");if(w){w.document.write("<pre style='font-family:monospace;font-size:13px;padding:20px;white-space:pre-wrap'>"+text.replace(/</g,"&lt;")+"</pre>");w.document.title=person.firstName+" "+(person.lastName||"")+" - Weavr Report"}};

  var linearStages=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});
  var linIdx=linearStages.findIndex(function(s){return s.key===person.currentStage});
  var adv=function(){if(linIdx<linearStages.length-1){var nk=linearStages[linIdx+1].key;p.onUpdate({...person,currentStage:nk,stages:{...person.stages,[nk]:{date:new Date().toISOString(),completed:true}}})}};
  var stepBack=function(){if(linIdx>0){var pk=linearStages[linIdx-1].key;p.onUpdate({...person,currentStage:pk})}};
  var done=function(){p.onUpdate({...person,lastContactDate:new Date().toISOString(),checkIns:[...(person.checkIns||[]),{type:"conversation",note:"Followed up",date:new Date().toISOString()}]})};
  var sEdit=function(){p.onUpdate({...form});setEdit(false)};
  var gMsg=function(){var t=templates[person.currentStage]||DEFAULT_TPL[person.currentStage];return t.replace("{firstName}",person.firstName).replace("{lastName}",person.lastName)};
  var addCI=function(type){p.onUpdate({...person,checkIns:[...(person.checkIns||[]),{type:type,note:ciNote,date:new Date().toISOString(),loggedBy:p.userName||"Staff"}],lastContactDate:new Date().toISOString()});setCiNote("");setJustFollowed(true);setTimeout(function(){setShowFollowUp(false);setJustFollowed(false)},800)};
  var sNote=function(){if(!note.trim())return;p.onUpdate({...person,notes:[...(person.notes||[]),{text:note,date:new Date().toISOString()}]});setNote("")};
  var addFollowUp=function(){if(!fuDate)return;var fu={date:fuDate,type:fuType,completed:false,id:uid()};p.onUpdate({...person,followUps:[...(person.followUps||[]),fu]});setShowCal(false);setFuDate("")};
  var completeFollowUp=function(fid){p.onUpdate({...person,followUps:(person.followUps||[]).map(function(f){return f.id===fid?{...f,completed:true}:f})})};
  var doDelete=function(){p.onDelete(person.id);p.onClose()};

  return <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",justifyContent:"flex-end"}} onClick={p.onClose}><div className="weavr-panel" style={{width:560,maxWidth:"100vw",height:"100vh",background:"var(--card-solid)",display:"flex",flexDirection:"column",animation:"panelSlide 0.4s cubic-bezier(0.22,1,0.36,1)",overflowY:"auto",boxShadow:"-12px 0 48px rgba(0,0,0,0.12)"}} onClick={function(e){e.stopPropagation()}}>
    <div className="weavr-panel-header" style={{padding:"19px 19px 16px",background:"var(--hero)",position:"relative"}}>
      <button style={{position:"absolute",top:12,left:10,background:"none",border:"none",borderRadius:5,width:20,height:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,opacity:0.4,transition:"opacity 0.15s"}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.4"}} onClick={p.onClose}><I n="x" sz={11} c="rgba(255,255,255,0.8)"/></button>
      <div style={{display:"flex",gap:13,alignItems:"center",paddingLeft:16}}>
        <div style={{width:56,height:56,borderRadius:15,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0,backdropFilter:"blur(4px)"}}>{(person.firstName||"?").charAt(0)}{(person.lastName||"").charAt(0)}</div>
        <div style={{flex:1}}>
          <h2 style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>{person.firstName} {person.lastName}</h2>
          <div style={{display:"flex",alignItems:"center",gap:7,marginTop:3}}><span style={{fontSize:9,fontWeight:700,color:stColor,background:stColor+"25",padding:"2px 6px",borderRadius:5}}>{stLabel}</span>{tm&&<span style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>Assigned to <span style={{color:tm.color,fontWeight:600}}>{tm.name}</span></span>}</div>
        </div>
        <div style={{textAlign:"center"}}><RingMini value={score} max={100} color={scoreColor(score)} sz={52}/><div style={{fontSize:8,color:"rgba(255,255,255,0.45)",marginTop:3,fontWeight:600}}>{scoreLabel(score)}</div></div>
      </div>
    </div>
    <div style={{padding:"10px 19px",background:"var(--primary)05",borderBottom:"1px solid var(--divider)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:10,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:5}}><I n="zap" sz={13} c={stColor}/><b style={{color:"var(--text)"}}>Next:</b>{NEXT_ACT[person.currentStage]}</div>
      <div style={{fontSize:9,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:10}}><span>{d===null?"Never contacted":"Last: "+fmtS(person.lastContactDate)}</span>{(function(){var stDate=person.stages&&person.stages[person.currentStage]?person.stages[person.currentStage].date:person.createdAt;var dys=ago(stDate);if(dys===null)return null;return <span style={{color:dys>14?"#EF4444":dys>7?"#F59E0B":"var(--text-muted)"}}>{dys}d in {stLabel}</span>})()}</div>
    </div>
    <div className="weavr-panel-actions" style={{padding:"10px 19px",borderBottom:"1px solid var(--divider)",background:"var(--card-solid)",position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
        <Btn icon="check" label={justFollowed?"Logged!":"Followed Up"} onClick={function(){if(justFollowed)return;setShowFollowUp(!showFollowUp)}} v={justFollowed?"green":"green"} sx={{padding:"6px 11px",fontSize:9}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid var(--inp-border)"}}>
          {linIdx>0&&<button onClick={stepBack} style={{display:"inline-flex",alignItems:"center",padding:"6px 8px",cursor:"pointer",border:"none",background:"var(--inp)",color:"var(--text-sub)",borderRight:"1px solid var(--inp-border)"}} title="Step Back"><span style={{transform:"rotate(180deg)",display:"inline-flex"}}><I n="up" sz={12} c="var(--text-sub)"/></span></button>}
          {linIdx<linearStages.length-1&&<button onClick={adv} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"6px 10px",cursor:"pointer",border:"none",background:"var(--primary)",color:"#fff",fontSize:9,fontWeight:600}}><I n="up" sz={12} c="#fff"/>Advance</button>}
        </div>
        <Btn icon="msg" label="Text" onClick={function(){setContactOpen("text")}} sx={{padding:"6px 11px",fontSize:9}}/>
        <Btn icon="mail" label="Email" onClick={function(){setContactOpen("email")}} v="ghost" sx={{padding:"6px 11px",fontSize:9,opacity:person.email?1:0.4}}/>
        <Btn icon="cal" label="" onClick={function(){setShowCal(!showCal)}} v="ghost" sx={{padding:"6px 8px"}}/>
        <Btn icon="edit" label="" onClick={function(){setEdit(!edit)}} v="ghost" sx={{padding:"6px 8px"}}/>
        <Btn icon="dl" label="" onClick={exportReport} v="ghost" sx={{padding:"6px 8px"}}/>
        <button onClick={function(){if(confirm("Delete "+person.firstName+"?")){p.onDelete(person.id);p.onClose()}}} style={{display:"inline-flex",alignItems:"center",padding:"6px 8px",borderRadius:10,cursor:"pointer",background:"#FEF2F2",color:"#EF4444",border:"1px solid #FECACA"}}><I n="trash" sz={12} c="#EF4444"/></button>
      </div>
    </div>
    <div className="weavr-panel-body" style={{padding:"16px 19px",overflowY:"auto",flex:1}}>
      {(function(){var lastCI=(person.checkIns||[]).slice().reverse().find(function(c){return c.note&&c.note!=="Followed up"});if(!lastCI)return null;var ct=(ciTypes||[]).find(function(t){return t.key===lastCI.type});return <div style={{background:"var(--inp)",borderRadius:8,padding:"6px 10px",marginBottom:11,display:"flex",alignItems:"center",gap:7,fontSize:9}}><I n="msg" sz={12} c={ct?ct.color:"var(--text-muted)"}/><span style={{color:"var(--text-muted)"}}>Last:</span><span style={{color:"var(--text-sub)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lastCI.note}</span><span style={{color:"var(--text-muted)",flexShrink:0}}>{fmtS(lastCI.date)}</span></div>})()}

      {contactOpen&&<ContactAction person={person} message={gMsg()} email={emailFor(person,p.config)} onClose={function(){setContactOpen(null)}}/>}

      <Reveal open={showCal}><div style={{background:"var(--card)",borderRadius:12,padding:"11px 14px",marginBottom:13,boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
        <div style={{fontSize:10,fontWeight:700,color:"var(--text)",marginBottom:8}}>Schedule Follow-Up</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {[{key:"remind",label:"Remind Me"},{key:"text",label:"Auto-Send Text"},{key:"email",label:"Auto-Send Email"}].map(function(t){return <button key={t.key} onClick={function(){setFuType(t.key)}} style={{padding:"5px 10px",borderRadius:7,border:fuType===t.key?"2px solid var(--primary)":"2px solid var(--inp-border)",background:fuType===t.key?"var(--primary)08":"var(--inp)",fontSize:9,fontWeight:600,color:fuType===t.key?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}>{t.label}</button>})}
        </div>
        {(function(){var sug=FU_SUGGEST[person.currentStage];if(!sug)return null;var sugDate=new Date();sugDate.setDate(sugDate.getDate()+sug.days);var sugStr=sugDate.toISOString().split("T")[0];return <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"6px 10px",background:"var(--primary)06",borderRadius:8,border:"1px solid var(--primary)15"}}><I n="zap" sz={12} c="var(--primary)"/><span style={{fontSize:9,color:"var(--text-sub)"}}>Suggested: <b style={{color:"var(--primary)"}}>{sug.label}</b> for {stLabel}</span><button onClick={function(){setFuDate(sugStr)}} style={{marginLeft:"auto",padding:"2px 8px",borderRadius:5,background:"var(--primary)",color:"#fff",border:"none",fontSize:9,fontWeight:600,cursor:"pointer"}}>Use</button></div>})()}
        <MiniCal selected={fuDate} onSelect={setFuDate}/>
        {fuDate&&<div style={{marginTop:10,display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:10,color:"var(--text-sub)"}}>Selected: <b style={{color:"var(--text)"}}>{fmt(fuDate)}</b></span><Btn label="Confirm" v="green" sx={{padding:"5px 11px",fontSize:9}} onClick={addFollowUp}/></div>}
      </div></Reveal>

      {(person.followUps||[]).filter(function(f){return!f.completed}).length>0&&<div style={{marginBottom:13}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Scheduled Follow-Ups</div>
        {(person.followUps||[]).filter(function(f){return!f.completed}).map(function(f){var isPast=new Date(f.date)<new Date();return <div key={f.id} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",background:isPast?"#FEF2F220":"var(--inp)",borderRadius:8,marginBottom:3,border:isPast?"1px solid #FECACA":"1px solid var(--inp-border)"}}>
          <I n={f.type==="remind"?"clock":f.type==="text"?"phone":"mail"} sz={14} c={isPast?"#EF4444":"var(--primary)"}/>
          <div style={{flex:1,fontSize:10,color:"var(--text)"}}>{fmt(f.date)} - {f.type==="remind"?"Reminder":f.type==="text"?"Auto Text":"Auto Email"}{isPast?" (overdue)":""}</div>
          <button onClick={function(){completeFollowUp(f.id)}} style={{background:"none",border:"none",cursor:"pointer"}}><I n="check" sz={14} c="#10B981"/></button>
        </div>})}
      </div>}

      <Reveal open={showFollowUp}><div style={{marginBottom:13}}>
        <div style={{background:"var(--card)",borderRadius:12,padding:"11px 13px",border:"1px solid var(--primary)20",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
          <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Log Follow-Up</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {ciTypes.map(function(ct){return <button key={ct.key} onClick={function(){addCI(ct.key)}} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 11px",borderRadius:8,border:"none",background:ct.color+"12",fontSize:10,fontWeight:600,color:ct.color,cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={function(e){e.currentTarget.style.background=ct.color+"25"}} onMouseLeave={function(e){e.currentTarget.style.background=ct.color+"12"}}><I n={ct.icon||"check"} sz={12} c={ct.color}/>{ct.label}</button>})}
          </div>
          <input style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:10,boxSizing:"border-box",outline:"none"}} placeholder="Add a note..." value={ciNote} onChange={function(e){setCiNote(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter"&&ciNote.trim())addCI("conversation")}}/>
        </div>
      </div></Reveal>

      {(person.checkIns||[]).length>0&&<div style={{marginBottom:13}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Follow-Up History</div>
        <div style={{position:"relative",paddingLeft:16}}>
          <div style={{position:"absolute",left:5,top:4,bottom:4,width:2,background:"var(--divider)",borderRadius:1}}/>
          {(person.checkIns||[]).slice().reverse().slice(0,10).map(function(c,i){var ct=ciTypes.find(function(t){return t.key===c.type});var origIdx=(person.checkIns||[]).length-1-i;return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",position:"relative",animation:i===0&&justFollowed?"gentleFade 0.4s ease":"none"}}>
            <div style={{position:"absolute",left:-14,top:10,width:10,height:10,borderRadius:"50%",background:ct?ct.color:"var(--text-muted)",border:"2px solid var(--card-solid)",zIndex:1}}/>
            <div style={{flex:1,marginLeft:3}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                <span style={{fontSize:10,fontWeight:600,color:ct?ct.color:"var(--text-sub)"}}>{ct?ct.label:c.type}</span>
                <span style={{fontSize:9,color:"var(--text-muted)"}}>{fmtS(c.date)}</span>
                {c.loggedBy&&<span style={{fontSize:8,color:"var(--text-muted)",background:"var(--inp)",padding:"1px 5px",borderRadius:3}}>by {c.loggedBy}</span>}
                <button onClick={function(){var nci=(person.checkIns||[]).filter(function(_,j){return j!==origIdx});p.onUpdate({...person,checkIns:nci})}} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",padding:2,opacity:0.3,display:"flex"}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.3"}}><I n="x" sz={10} c="#EF4444"/></button>
              </div>
              {c.note&&c.note!=="Followed up"&&<div style={{fontSize:9,color:"var(--text-sub)",lineHeight:1.4}}>{c.note}</div>}
            </div>
          </div>})}
        </div>
      </div>}

      {!edit&&<div style={{marginBottom:13}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Contact</div>
        <div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px",display:"flex",flexDirection:"column",gap:7,boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
          {person.phone&&<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{color:"var(--text)",fontSize:11,display:"flex",alignItems:"center",gap:8,fontWeight:500,flex:1}}><div style={{width:28,height:28,borderRadius:7,background:"var(--primary)15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="phone" sz={12} c="var(--primary)"/></div>{fmtPhone(person.phone)}</div><button onClick={function(){setContactOpen("text")}} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:7,background:"#06B6D415",fontSize:9,fontWeight:600,color:"#06B6D4",border:"none",cursor:"pointer"}}>iMessage</button></div>}
          {person.email&&<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{color:"var(--text)",fontSize:11,display:"flex",alignItems:"center",gap:8,fontWeight:500,flex:1}}><div style={{width:28,height:28,borderRadius:7,background:"#10B98115",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="mail" sz={12} c="#10B981"/></div>{person.email}</div><button onClick={function(){setContactOpen("email")}} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:7,background:"#F59E0B15",fontSize:9,fontWeight:600,color:"#F59E0B",border:"none",cursor:"pointer"}}>Send Email</button></div>}
          {person.serviceAttended&&<div style={{fontSize:11,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:7,background:"#F59E0B15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="home" sz={12} c="#D97706"/></div>{person.serviceAttended}</div>}
        </div>
      </div>}

      <Reveal open={edit}><div style={{background:"var(--card)",borderRadius:12,padding:"11px 14px",marginBottom:13,boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="First Name" value={form.firstName} onChange={function(v){setForm({...form,firstName:v})}}/>
          <Field label="Last Name" value={form.lastName} onChange={function(v){setForm({...form,lastName:v})}}/>
          <Field label="Phone" value={form.phone||""} onChange={function(v){setForm({...form,phone:v})}}/>
          <Field label="Email" value={form.email||""} onChange={function(v){setForm({...form,email:v})}}/>
          <div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Stage</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={form.currentStage} onChange={function(e){setForm({...form,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>
          <Field label="Service" value={form.serviceAttended||""} onChange={function(v){setForm({...form,serviceAttended:v})}}/>
          {teams.length>0&&<div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Assigned To</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={form.assignedTo||""} onChange={function(e){setForm({...form,assignedTo:e.target.value||null})}}><option value="">Unassigned</option>{teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
        </div>
        <div style={{display:"flex",gap:7,marginTop:11}}>
          <Btn label="Save" onClick={sEdit} v="green"/><Btn label="Cancel" onClick={function(){setEdit(false)}} v="ghost"/>
          <div style={{flex:1}}/>
          <button onClick={function(){if(confirm("Permanently delete "+person.firstName+" "+person.lastName+"?"))doDelete()}} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer",background:"linear-gradient(135deg,#FEE2E2,#FECACA)",color:"#EF4444",border:"none"}}><I n="trash" sz={14} c="#EF4444"/>Delete</button>
        </div>
      </div></Reveal>

      <div style={{marginBottom:13}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Journey</div>
        <div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>
          {STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"}).map(function(s,i,arr){var dn=person.stages&&person.stages[s.key]&&person.stages[s.key].completed;var cur=person.currentStage===s.key;var dt=person.stages&&person.stages[s.key]?person.stages[s.key].date:null;return <div key={s.key}><div style={{display:"flex",alignItems:"center",gap:11,padding:"5px 0",opacity:dn||cur?1:0.3}}><div style={{width:12,height:12,borderRadius:"50%",flexShrink:0,background:dn||cur?s.grad:"var(--divider)"}}/><div style={{flex:1,fontSize:10,fontWeight:600,color:dn||cur?"var(--text)":"var(--text-muted)"}}>{s.label}{cur&&<span style={{fontSize:8,fontWeight:700,color:stColor,marginLeft:5,background:"var(--primary)10",padding:"2px 5px",borderRadius:3}}>CURRENT</span>}</div><div style={{fontSize:9,color:"var(--text-muted)"}}>{dt?fmtS(dt):""}</div></div>{i<arr.length-1&&<div style={{marginLeft:4,width:2,height:6,background:dn?s.color:"var(--divider)"}}/>}</div>})}
        </div>
      </div>
      {(function(){var ms=(person.milestones||{})[person.currentStage]||{};var upMs=function(data){var allMs={...(person.milestones||{})};allMs[person.currentStage]={...ms,...data};p.onUpdate({...person,milestones:allMs})};
        if(person.currentStage==="salvation")return <div style={{marginBottom:13}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Salvation Details</div><div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px"}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:3}}>Date Saved</div><input type="date" value={ms.dateSaved||""} onChange={function(e){upMs({dateSaved:e.target.value})}} style={{padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:10}}/></div></div>;
        if(person.currentStage==="baptism")return <div style={{marginBottom:13}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Baptism Details</div><div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px"}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:3}}>Date Baptized</div><input type="date" value={ms.dateBaptized||""} onChange={function(e){upMs({dateBaptized:e.target.value})}} style={{padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:10}}/></div></div>;
        if(person.currentStage==="next-steps")return <div style={{marginBottom:13}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Next Steps Progress</div><div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px"}}>{[{k:"textSent",l:"Text/Email Sent"},{k:"registered",l:"Registered"},{k:"attended",l:"Attended"}].map(function(item){return <div key={item.k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><input type="checkbox" checked={!!ms[item.k]} onChange={function(){var nd={};nd[item.k]=!ms[item.k];if(!ms[item.k])nd[item.k+"Date"]=new Date().toISOString().split("T")[0];upMs(nd)}} style={{width:16,height:16,accentColor:"#FBBF24"}}/><span style={{fontSize:10,color:"var(--text)",flex:1}}>{item.l}</span>{ms[item.k]&&<input type="date" value={ms[item.k+"Date"]||""} onChange={function(e){var nd={};nd[item.k+"Date"]=e.target.value;upMs(nd)}} style={{padding:"3px 6px",borderRadius:5,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:9,width:130}}/>}</div>})}</div></div>;
        return null})()}
      {(function(){var nsMs=(person.milestones||{})["next-steps"]||{};var bgMs=(person.milestones||{}).bgroup||{};var atMs=(person.milestones||{}).ateam||{};var hasBG=person.stages&&person.stages.bgroup&&person.stages.bgroup.completed;var hasAT=person.stages&&person.stages.ateam&&person.stages.ateam.completed;
        var toggleBG=function(){var newStages={...person.stages};if(hasBG){delete newStages.bgroup}else{newStages.bgroup={date:new Date().toISOString(),completed:true}}p.onUpdate({...person,stages:newStages})};
        var toggleAT=function(){var newStages={...person.stages};if(hasAT){delete newStages.ateam}else{newStages.ateam={date:new Date().toISOString(),completed:true}}p.onUpdate({...person,stages:newStages})};
        var saveBGLeader=function(v){var allMs={...(person.milestones||{})};allMs.bgroup={...(allMs.bgroup||{}),bGroupLeader:v};allMs["next-steps"]={...(allMs["next-steps"]||{}),bGroupLeader:v};p.onUpdate({...person,milestones:allMs})};
        var saveATArea=function(v){var allMs={...(person.milestones||{})};allMs.ateam={...(allMs.ateam||{}),aTeamArea:v};allMs["next-steps"]={...(allMs["next-steps"]||{}),aTeamArea:v};p.onUpdate({...person,milestones:allMs})};
        return <div style={{marginBottom:13}}>
          <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Connect Status</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={toggleBG} style={{flex:1,padding:"11px 13px",borderRadius:12,border:hasBG?"2px solid #EC4899":"2px dashed var(--inp-border)",background:hasBG?"#EC489910":"var(--inp)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:hasBG?8:0}}>
                <div style={{width:20,height:20,borderRadius:5,background:hasBG?"#EC4899":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{hasBG&&<I n="check" sz={12} c="#fff"/>}</div>
                <span style={{fontSize:11,fontWeight:600,color:hasBG?"#EC4899":"var(--text-muted)"}}>BGroup</span>
                {hasBG&&<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:"auto"}}>{fmtS(person.stages.bgroup.date)}</span>}
              </div>
              {hasBG&&<div onClick={function(e){e.stopPropagation()}} style={{marginTop:3}}><input style={{width:"100%",padding:"5px 8px",borderRadius:7,border:"1px solid #EC489930",background:"var(--card)",color:"var(--text)",fontSize:9,boxSizing:"border-box",outline:"none"}} placeholder="Group Leader" value={nsMs.bGroupLeader||bgMs.bGroupLeader||""} onChange={function(e){saveBGLeader(e.target.value)}}/></div>}
            </button>
            <button onClick={toggleAT} style={{flex:1,padding:"11px 13px",borderRadius:12,border:hasAT?"2px solid #34D399":"2px dashed var(--inp-border)",background:hasAT?"#34D39910":"var(--inp)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:hasAT?8:0}}>
                <div style={{width:20,height:20,borderRadius:5,background:hasAT?"#34D399":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{hasAT&&<I n="check" sz={12} c="#fff"/>}</div>
                <span style={{fontSize:11,fontWeight:600,color:hasAT?"#34D399":"var(--text-muted)"}}>ATeam</span>
                {hasAT&&<span style={{fontSize:9,color:"var(--text-muted)",marginLeft:"auto"}}>{fmtS(person.stages.ateam.date)}</span>}
              </div>
              {hasAT&&<div onClick={function(e){e.stopPropagation()}} style={{marginTop:3}}><select style={{width:"100%",padding:"5px 8px",borderRadius:7,border:"1px solid #34D39930",background:"var(--card)",color:"var(--text)",fontSize:9,cursor:"pointer"}} value={nsMs.aTeamArea||atMs.aTeamArea||""} onChange={function(e){saveATArea(e.target.value)}}><option value="">Select Area...</option>{["Worship","Production","Kids","Youth","Hospitality","Creative","Admin","Outreach"].map(function(a){return <option key={a} value={a}>{a}</option>})}</select></div>}
            </button>
          </div>
          {hasBG&&hasAT&&!person.fullyConnected&&<button onClick={function(){p.onUpdate({...person,fullyConnected:true,fullyConnectedDate:new Date().toISOString()})}} style={{width:"100%",marginTop:10,padding:"13px 16px",borderRadius:12,border:"2px solid #F59E0B",background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onMouseEnter={function(e){e.currentTarget.style.background="linear-gradient(135deg,#F59E0B,#FBBF24)";e.currentTarget.style.color="#fff"}} onMouseLeave={function(e){e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7,#FDE68A)";e.currentTarget.style.color="#92400E"}}><span style={{fontSize:16}}>{"⭐"}</span><div style={{textAlign:"left"}}><div style={{fontSize:12,fontWeight:700,color:"inherit"}}>Mark as Fully Connected</div><div style={{fontSize:9,fontWeight:500,opacity:0.7}}>In a BGroup and on the ATeam</div></div></button>}
          {person.fullyConnected&&<div style={{marginTop:10,background:"linear-gradient(135deg,#F59E0B10,#FBBF2410)",border:"2px solid #F59E0B30",borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{"⭐"}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#F59E0B"}}>Fully Connected</div><div style={{fontSize:9,color:"var(--text-muted)"}}>Completed {fmt(person.fullyConnectedDate)}</div></div></div>}
        </div>})()}
      {(function(){var entries=[];var allMs=person.milestones||{};var stages=person.stages||{};STAGES.forEach(function(s){var stData=stages[s.key];var ms=allMs[s.key]||{};if(!stData||!stData.completed)return;if(s.key==="salvation"&&ms.dateSaved)entries.push({date:ms.dateSaved,label:"Saved",color:s.color,bold:true});if(s.key==="baptism"&&ms.dateBaptized)entries.push({date:ms.dateBaptized,label:"Baptized",color:s.color,bold:true});if(s.key==="next-steps"&&ms.attended)entries.push({date:ms.attendedDate||stData.date,label:"Next Steps: Attended",color:s.color,bold:false});if(s.key==="bgroup")entries.push({date:stData.date,label:"Joined BGroup"+(((allMs["next-steps"]||{}).bGroupLeader||ms.bGroupLeader)?" \u2014 "+((allMs["next-steps"]||{}).bGroupLeader||ms.bGroupLeader):""),color:s.color,bold:true});if(s.key==="ateam")entries.push({date:stData.date,label:"Joined ATeam"+(((allMs["next-steps"]||{}).aTeamArea||ms.aTeamArea)?" \u2014 "+((allMs["next-steps"]||{}).aTeamArea||ms.aTeamArea):""),color:s.color,bold:true})});if(person.fullyConnected)entries.push({date:person.fullyConnectedDate||new Date().toISOString(),label:"\u2B50 Fully Connected",color:"#F59E0B",bold:true});entries.sort(function(a,b){return new Date(a.date)-new Date(b.date)});if(entries.length===0)return null;var jDur=person.fullyConnected&&entries.length>=2?Math.round((new Date(entries[entries.length-1].date)-new Date(person.createdAt))/864e5):null;return <div style={{marginBottom:13}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Timeline</div><div style={{background:"var(--card)",borderRadius:12,padding:"10px 13px",boxShadow:"var(--card-shadow)",border:"1px solid var(--divider)"}}>{entries.map(function(e,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><div style={{width:8,height:8,borderRadius:"50%",background:e.color,marginTop:4,flexShrink:0}}/><div style={{flex:1,fontSize:10,fontWeight:e.bold?600:400,color:e.bold?"var(--text)":"var(--text-sub)"}}>{e.label}</div><div style={{fontSize:9,color:"var(--text-muted)",flexShrink:0}}>{fmtS(e.date)}</div></div>})}{jDur!==null&&<div style={{borderTop:"1px solid var(--divider)",paddingTop:8,marginTop:3,fontSize:9,color:"#F59E0B",fontWeight:600,textAlign:"center"}}>Journey: {jDur} days from First Visit to Fully Connected</div>}</div></div>})()}

      <div>
        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Notes</div>
        <div style={{display:"flex",gap:5,marginBottom:8}}><input style={{flex:1,padding:"6px 10px",borderRadius:7,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:10,boxSizing:"border-box",outline:"none"}} placeholder="Add a note..." value={note} onChange={function(e){setNote(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")sNote()}}/><Btn label="Save" onClick={sNote} v="ghost" sx={{padding:"6px 10px",fontSize:9}}/></div>
        {(person.notes||[]).slice().reverse().map(function(n,i){var origIdx=(person.notes||[]).length-1-i;return <div key={i} style={{borderTop:"1px solid var(--divider)",padding:"6px 0",display:"flex",alignItems:"flex-start",gap:7}}><div style={{flex:1}}><div style={{fontSize:9,color:"var(--text-muted)",marginBottom:2}}>{fmt(n.date)}</div><div style={{fontSize:10,color:"var(--text-sub)",lineHeight:1.6}}>{n.text}</div></div><button onClick={function(){var nn=(person.notes||[]).filter(function(_,j){return j!==origIdx});p.onUpdate({...person,notes:nn})}} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:0.3,display:"flex",flexShrink:0,marginTop:2}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.3"}}><I n="x" sz={10} c="#EF4444"/></button></div>})}
      </div>
    </div>
  </div></div>;
}

/* ══════ MODALS ══════ */
function AddModal(p){
  var fields=p.config.formFields||DEFAULT_FIELDS;var enabled=fields.filter(function(f){return f.enabled});
  var empty={};enabled.forEach(function(f){empty[f.key]=f.type==="checkbox"?false:f.key==="currentStage"?"first-visit":""});
  var [f,setF]=useState({...empty,assignedTo:""});
  var sub=function(){if(!f.firstName||!f.firstName.trim())return;p.onAdd({...f,id:uid(),stages:{[f.currentStage||"first-visit"]:{date:new Date().toISOString(),completed:true}},notes:[],checkIns:[],followUps:[],lastContactDate:null,createdAt:new Date().toISOString(),assignedTo:f.assignedTo||null,customFields:{}});p.onClose()};
  return <Modal title="Add Person" onClose={p.onClose}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
      {enabled.map(function(fd){
        if(fd.key==="currentStage")return <div key={fd.key}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{fd.label}</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f.currentStage||"first-visit"} onChange={function(e){setF({...f,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>;
        if(fd.type==="dropdown")return <div key={fd.key}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>{fd.label}</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f[fd.key]||""} onChange={function(e){var nf={...f};nf[fd.key]=e.target.value;setF(nf)}}><option value="">Select...</option>{(fd.options||[]).map(function(o){return <option key={o} value={o}>{o}</option>})}</select></div>;
        if(fd.type==="checkbox")return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 0"}}><input type="checkbox" checked={!!f[fd.key]} onChange={function(e){var nf={...f};nf[fd.key]=e.target.checked;setF(nf)}} style={{width:18,height:18,accentColor:"var(--primary)"}}/><span style={{fontSize:11,color:"var(--text)"}}>{fd.label}</span></div>;
        return <Field key={fd.key} label={fd.label+(fd.required?" *":"")} value={fd.key==="phone"?fmtPhone(f[fd.key]||""):(f[fd.key]||"")} onChange={function(v){var nf={...f};nf[fd.key]=fd.key==="phone"?v.replace(/\D/g,"").slice(0,10):v;setF(nf)}} placeholder={fd.label}/>;
      })}
      {p.teams.length>0&&<div style={{gridColumn:"span 2"}}><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:5}}>Assign To</div><select style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,cursor:"pointer",boxSizing:"border-box"}} value={f.assignedTo} onChange={function(e){setF({...f,assignedTo:e.target.value})}}><option value="">Unassigned</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
    </div>
    <Btn label="Add to Pipeline" onClick={sub} sx={{width:"100%",marginTop:16,justifyContent:"center"}}/>
  </Modal>;
}

function ImportModal(p){
  var [csv,setCsv]=useState("");var [pv,setPv]=useState([]);var [mp,setMp]=useState({});var ref=useRef();
  var FLD=["firstName","lastName","phone","email","currentStage","serviceAttended"];
  var LBL={firstName:"First Name",lastName:"Last Name",phone:"Phone",email:"Email",currentStage:"Stage",serviceAttended:"Service"};
  var proc=function(t){setCsv(t);var ls=t.trim().split("\n");if(ls.length<2)return;var hd=csvParse(ls[0]);var am={};hd.forEach(function(h,i){var mapped=classifyHeader(h);if(mapped)am[i]=mapped});setMp(am);setPv(ls.slice(1,5).map(function(l){var c=csvParse(l);var o={};Object.entries(am).forEach(function(pair){o[pair[1]]=c[parseInt(pair[0])]||""});return o}))};
  var run=function(){var ls=csv.trim().split("\n");if(ls.length<2)return;var sm={};STAGES.forEach(function(s){sm[s.label.toLowerCase()]=s.key;sm[s.key]=s.key});sm["first visit"]="first-visit";sm["guest"]="first-visit";sm["nextsteps"]="next-steps";sm["b group"]="bgroup";sm["a team"]="ateam";var ppl=ls.slice(1).map(function(l){var c=csvParse(l);var o={};Object.entries(mp).forEach(function(pair){o[pair[1]]=c[parseInt(pair[0])]||""});var stg2=sm[(o.currentStage||"").toLowerCase().trim()]||"first-visit";return{id:uid(),firstName:(o.firstName||"").trim(),lastName:(o.lastName||"").trim(),phone:(o.phone||"").trim(),email:(o.email||"").trim(),currentStage:stg2,serviceAttended:(o.serviceAttended||"").trim(),stages:{[stg2]:{date:new Date().toISOString(),completed:true}},notes:[],checkIns:[],followUps:[],lastContactDate:null,createdAt:new Date().toISOString(),assignedTo:null,customFields:{}}}).filter(function(x){return x.firstName});p.onImport(ppl);p.onClose()};
  return <Modal title="Import CSV" onClose={p.onClose} wide>
    <input type="file" accept=".csv,.txt" ref={ref} style={{display:"none"}} onChange={function(e){var file=e.target.files[0];if(file){var r=new FileReader();r.onload=function(ev){proc(ev.target.result)};r.readAsText(file)}}}/>
    <button onClick={function(){ref.current.click()}} style={{width:"100%",padding:22,borderRadius:17,border:"2px dashed var(--inp-border)",background:"var(--inp)",color:"var(--text-muted)",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:10}}>Choose CSV file</button>
    <textarea style={{width:"100%",minHeight:80,padding:11,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text-sub)",fontFamily:"monospace",fontSize:10,resize:"vertical",boxSizing:"border-box",outline:"none"}} placeholder="Or paste CSV here..." value={csv} onChange={function(e){proc(e.target.value)}}/>
    {pv.length>0&&<div style={{marginTop:11,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}><thead><tr>{FLD.map(function(fld){return <th key={fld} style={{padding:"6px 8px",fontSize:9,fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",textAlign:"left",borderBottom:"1px solid var(--divider)",background:"var(--th-bg)"}}>{LBL[fld]}</th>})}</tr></thead><tbody>{pv.map(function(r,i){return <tr key={i}>{FLD.map(function(fld){return <td key={fld} style={{padding:"5px 8px",fontSize:10,color:"var(--text-sub)",borderBottom:"1px solid var(--divider)"}}>{r[fld]||"\u2014"}</td>})}</tr>})}</tbody></table></div>}
    <Btn label="Import" onClick={run} sx={{width:"100%",marginTop:11,justifyContent:"center"}}/>
  </Modal>;
}

/* ══════ APP SHELL ══════ */
function AppMain(p){
  var [people,setPeople]=useState([]);var [tpl,setTpl]=useState(DEFAULT_TPL);var [teams,setTeams]=useState([]);var [rules,setRules]=useState([]);
  var [config,setConfig]=useState({theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS});
  var [view,setView]=useState("overview");var [sf,setSf]=useState(null);var [sel,setSel]=useState(null);var [add,setAdd]=useState(false);var [imp,setImp]=useState(false);var [search,setSearch]=useState("");var [ready,setReady]=useState(false);var [contactTarget,setContactTarget]=useState(null);
  var [sbCollapsed,setSbCollapsed]=useState(false);var [toolDrop,setToolDrop]=useState(false);

  useEffect(function(){Promise.all([db.get("ce5-people",[]),db.get("ce5-tpl",DEFAULT_TPL),db.get("ce5-teams",[]),db.get("ce5-rules",[]),db.get("ce5-config",{theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS})]).then(function(res){setPeople(res[0]);setTpl({...DEFAULT_TPL,...res[1]});setTeams(res[2]);setRules(res[3]);setConfig({theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS,...res[4]});setReady(true)}).catch(function(){setReady(true)})},[]);
  useEffect(function(){if(!document.querySelector('meta[name="viewport"]')){var m=document.createElement("meta");m.name="viewport";m.content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";document.head.appendChild(m)}if(!document.querySelector('link[href*="Nunito"]')){var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap";document.head.appendChild(l)}},[]);
  useEffect(function(){if(ready)db.set("ce5-people",people)},[people,ready]);
  useEffect(function(){if(ready)db.set("ce5-tpl",tpl)},[tpl,ready]);
  useEffect(function(){if(ready)db.set("ce5-teams",teams)},[teams,ready]);
  useEffect(function(){if(ready)db.set("ce5-rules",rules)},[rules,ready]);
  useEffect(function(){if(ready)db.set("ce5-config",config)},[config,ready]);

  /* Run automation */
  useEffect(function(){if(!ready||rules.length===0||people.length===0)return;var changed=false;var updated=people.map(function(x){var np={...x};rules.filter(function(r){return r.enabled}).forEach(function(r){if(r.trigger==="days-no-contact"){var d=ago(x.lastContactDate);if(d===null||d>=r.days){if(r.action==="notify"){var already=(x.notes||[]).some(function(n){return n.text.includes("[AUTO]")&&ago(n.date)<=1});if(!already){np={...np,notes:[...(np.notes||[]),{text:"[AUTO] No contact for "+(d||"?")+" days",date:new Date().toISOString()}]};changed=true}}}}});return np});if(changed)setPeople(updated)},[ready,rules]);

  var nav=function(v,s){setView(v);setSf(s||null);setSel(null);setSearch("")};
  window.__ceNav=nav;
  var isMono=config.theme==="mono";
  var theme=isMono?THEMES.mono:THEMES[config.theme||"light"];var cw=isMono?COLORWAYS.mono:COLORWAYS[config.colorway||"purple"];
  var isDark=config.theme==="dark";
  var cssVars={"--bg":isDark?cw.darkBg:theme.bg,"--card":isDark?cw.darkCard:theme.card,"--card-solid":isDark?cw.darkSolid:isMono?"#fff":"#fff","--card-border":isDark?theme.cardBorder:isMono?theme.cardBorder:"none","--card-shadow":isDark?"0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)":isMono?"0 1px 3px rgba(0,0,0,0.06)":"0 1px 8px rgba(0,0,0,0.04)","--text":theme.text,"--text-sub":theme.textSub,"--text-muted":theme.textMuted,"--inp":theme.inp,"--inp-border":theme.inpBorder,"--divider":theme.divider,"--hover":theme.hover,"--th-bg":theme.thBg,"--primary":isMono?"#495057":cw.primary,"--primary-grad":isMono?"linear-gradient(135deg,#6C757D,#495057)":cw.primaryGrad,"--accent":cw.accent,"--sidebar":isMono?cw.sidebar:cw.sidebar,"--logo":isMono?"linear-gradient(135deg,#6C757D,#495057)":cw.logo,"--hero":isDark?cw.darkHero:cw.hero,"--sb-text":isMono?"#212529":"#fff","--sb-muted":isMono?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.45)","--sb-active":isMono?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.12)","--sb-divider":isMono?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.06)"};

  var countForStage=function(key){
    if(key==="bgroup")return people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length;
    if(key==="ateam")return people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length;
    if(key==="fully-connected")return people.filter(function(x){return x.fullyConnected}).length;
    return people.filter(function(x){return x.currentStage===key}).length;
  };
  var sideItems=[{key:"overview",icon:"home",label:"Overview",vw:"overview"},{key:"all",icon:"users",label:"All People",vw:"people"},{type:"divider"}].concat(STAGES.map(function(s){return{key:s.key,label:s.label,color:s.color,vw:"people",sf:s.key}})).concat([{key:"fully-connected",label:"Fully Connected",color:"#F59E0B",icon:"target",vw:"connected"},{type:"divider"},{key:"assigned",icon:"card",label:"Assigned Cards",vw:"assigned"},{key:"quick",icon:"plus",label:"Quick Entry",vw:"quick"},{key:"bulk",icon:"send",label:"Bulk Message",vw:"bulk"},{key:"reports",icon:"chart",label:"Reports",vw:"reports"},{type:"divider"},{key:"settings",icon:"gear",label:"Settings",vw:"settings"}]);
  var activeKey=view==="overview"?"overview":view==="settings"?"settings":view==="quick"?"quick":view==="bulk"?"bulk":view==="reports"?"reports":view==="assigned"?"assigned":view==="connected"?"fully-connected":(sf||"all");

  return <div style={{display:"flex",height:"100vh",fontFamily:"'Nunito',sans-serif",background:"var(--bg)",color:"var(--text)",...cssVars}}>
    <style>{["@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap');","*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;font-family:'Nunito',sans-serif !important}","::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#64748B;border-radius:3px}","@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}","@keyframes panelSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}","@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}","@keyframes revealDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}","@keyframes revealUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-12px)}}","@keyframes gentleFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}","@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}","@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}","@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(60px) rotate(360deg);opacity:0}}",".score-ring-pulse{animation:pulse 2s ease-in-out infinite}",".shimmer-btn{background-size:200% 100%;animation:shimmer 2s ease infinite}","input:focus,textarea:focus,select:focus{outline:none;border-color:var(--primary) !important;box-shadow:0 0 0 3px var(--primary)20 !important}","button{cursor:pointer;font-family:'Nunito',sans-serif !important}button:active{transform:scale(0.97)}",".weavr-widget-wrap:hover .weavr-widget-ctrl{opacity:1 !important}","@media(max-width:768px){.weavr-sidebar{display:none !important}.weavr-collapse-btn{display:none !important}.weavr-mobile-nav{display:flex !important}.weavr-main{margin-left:0 !important}.weavr-main-header{padding:12px 14px !important}.weavr-main-header>div:first-child{display:none !important}.weavr-main-content{padding:0 14px 100px !important}.weavr-pipeline-hero{padding:20px 16px !important;border-radius:16px !important;margin-bottom:16px !important}.weavr-pipeline-grid{grid-template-columns:repeat(3,1fr) !important;gap:6px !important}.weavr-pipeline-grid>div{padding:12px 6px !important}.weavr-pipeline-grid>div>div:first-child{font-size:20px !important}.weavr-kpi-grid{grid-template-columns:repeat(2,1fr) !important}.weavr-kpi-grid>div{padding:16px !important}.weavr-kpi-grid>div>div:last-child{font-size:24px !important}.weavr-card-grid{grid-template-columns:1fr !important}.weavr-panel{width:100vw !important;max-width:100vw !important;border-radius:0 !important}.weavr-panel-header{padding:16px 16px 14px !important}.weavr-panel-actions{padding:10px 16px !important}.weavr-panel-actions>div{gap:4px !important}.weavr-panel-body{padding:14px 16px !important}.weavr-qe-layout{flex-direction:column !important}.weavr-qe-recent{width:100% !important}.weavr-next-up{flex-direction:column !important}.weavr-next-up>div:first-child{padding:16px !important;gap:12px !important}.weavr-next-up>div:first-child>div:last-child{display:none !important}.weavr-ws-grid{grid-template-columns:repeat(2,1fr) !important}.weavr-ws-input{grid-template-columns:repeat(2,1fr) !important}.weavr-widget-picker{grid-template-columns:repeat(2,1fr) !important}.weavr-sort-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap !important}.weavr-ac-header{flex-direction:column !important;align-items:flex-start !important;gap:10px !important}.weavr-ac-header>div:last-child{width:100% !important}.weavr-ac-teams{overflow-x:auto !important;-webkit-overflow-scrolling:touch !important;flex-wrap:nowrap !important;padding-bottom:4px}.weavr-fc-header{flex-direction:column !important;align-items:flex-start !important;gap:8px !important}table{display:block;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch}.weavr-stats-compare{flex-direction:column !important;align-items:flex-start !important;gap:6px !important}.weavr-ov-grid{grid-template-columns:1fr !important;gap:14px !important}.weavr-login-split{flex-direction:column !important}.weavr-login-left{display:none !important}.weavr-login-right{width:100% !important;min-height:100vh !important;justify-content:center !important;border-left:none !important;padding:40px 24px !important}.weavr-login-right h2{font-size:24px !important}.weavr-login-mobile-logo{display:flex !important}.weavr-portal-grid{grid-template-columns:repeat(2,1fr) !important;gap:12px !important}.weavr-portal-header{padding:20px 0 !important}.weavr-portal-hero{padding:32px 0 40px !important}.weavr-portal-hero h1{font-size:26px !important}.weavr-portal-card{padding:20px 16px !important}.weavr-modal-inner{width:95vw !important;max-width:95vw !important;padding:20px !important;margin:0 !important;border-radius:16px !important}.weavr-modal-inner h3{font-size:17px !important}}","@media(max-width:480px){.weavr-pipeline-grid{grid-template-columns:repeat(2,1fr) !important}.weavr-kpi-grid{grid-template-columns:1fr !important}.weavr-main-header{flex-wrap:wrap !important;gap:8px !important}.weavr-ws-grid{grid-template-columns:1fr 1fr !important}.weavr-ws-input{grid-template-columns:1fr 1fr !important}.weavr-portal-grid{grid-template-columns:1fr !important}.weavr-weekly-summary-grid{grid-template-columns:1fr !important}.weavr-login-right{padding:32px 20px !important}}"].join("\n")}</style>
    <aside className="weavr-sidebar" style={{width:sbCollapsed?60:220,background:"var(--sidebar)",display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",position:"sticky",top:0,transition:"width 0.25s cubic-bezier(0.22,1,0.36,1)",overflow:"visible",zIndex:60}}>
      <div style={{padding:sbCollapsed?"14px 0":"14px 14px",borderBottom:"1px solid var(--sb-divider)",display:"flex",alignItems:"center",justifyContent:sbCollapsed?"center":"flex-start",gap:sbCollapsed?0:10,minHeight:56,position:"relative",zIndex:80}}>
        <div style={{position:"relative",width:sbCollapsed?"auto":"100%"}}>
          <button onClick={function(){setToolDrop(!toolDrop)}} style={{display:"flex",alignItems:"center",gap:sbCollapsed?0:10,background:"none",border:"none",cursor:"pointer",padding:0,width:sbCollapsed?"auto":"100%"}}>
            <div style={{width:36,height:36,borderRadius:9,background:"var(--logo)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><WeavrLogo sz={20}/></div>
            {!sbCollapsed&&<div style={{flex:1,display:"flex",alignItems:"center",gap:5}}><div style={{fontSize:13,fontWeight:800,color:"var(--sb-text)",letterSpacing:"0.12em"}}>WEAVR</div><span style={{fontSize:8,fontWeight:600,color:"var(--sb-muted)",background:"var(--sb-active)",padding:"2px 5px",borderRadius:3,letterSpacing:"0.04em"}}>Connect</span></div>}
            {!sbCollapsed&&<span style={{fontSize:8,color:"var(--sb-muted)",opacity:0.5,transform:toolDrop?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",display:"inline-flex"}}>{"▾"}</span>}
          </button>
          {toolDrop&&<div style={{position:"absolute",top:"100%",left:sbCollapsed?-18:-18,right:sbCollapsed?"auto":-18,width:sbCollapsed?72:"auto",marginTop:1,background:isDark?"#1A1744":"#2E2A8A",borderRadius:"0 0 14px 14px",padding:sbCollapsed?"6px 4px":"6px 8px",zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,0.3)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            {TOOLS.map(function(t){var isCurrent=t.key==="connect";return <button key={t.key} onClick={t.ready?function(){setToolDrop(false);if(!isCurrent)alert("Coming soon: Weavr "+t.name)}:undefined} style={{display:"flex",alignItems:"center",justifyContent:sbCollapsed?"center":"flex-start",gap:sbCollapsed?0:8,width:"100%",padding:sbCollapsed?"6px 0":"6px 8px",borderRadius:7,border:"none",background:isCurrent?"rgba(255,255,255,0.08)":"transparent",cursor:t.ready?"pointer":"default",opacity:t.ready?1:0.6,textAlign:"left",transition:"all 0.15s"}} onMouseEnter={t.ready?function(e){if(!isCurrent)e.currentTarget.style.background="rgba(255,255,255,0.06)"}:undefined} onMouseLeave={t.ready?function(e){if(!isCurrent)e.currentTarget.style.background="transparent"}:undefined}>
              <div style={{width:22,height:22,borderRadius:5,background:isCurrent?t.color:t.color+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n={t.icon} sz={10} c={isCurrent?"#fff":t.color}/></div>
              {!sbCollapsed&&<span style={{flex:1,fontSize:9,fontWeight:isCurrent?600:400,color:isCurrent?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)"}}>{t.name}</span>}
              {!sbCollapsed&&isCurrent&&<div style={{width:4,height:4,borderRadius:"50%",background:"#10B981"}}/>}
            </button>})}
            <button onClick={function(){setToolDrop(false);p.onBackToPortal()}} style={{display:"flex",alignItems:"center",justifyContent:sbCollapsed?"center":"flex-start",gap:sbCollapsed?0:8,width:"100%",padding:sbCollapsed?"6px 0":"6px 8px",borderRadius:7,border:"none",background:"transparent",cursor:"pointer",textAlign:"left",marginTop:2,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:8}}><I n="home" sz={10} c="rgba(255,255,255,0.35)"/>{!sbCollapsed&&<span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>Portal</span>}</button>
          </div>}
        </div>
      </div>
      <nav style={{flex:1,padding:sbCollapsed?"8px 6px":"8px 10px",overflowY:"auto",overflowX:"hidden"}}>{sideItems.map(function(item,i){if(item.type==="divider")return <div key={"d"+i} style={{height:1,background:"var(--sb-divider)",margin:sbCollapsed?"4px 4px":"5px 10px"}}/>;var active=activeKey===item.key;return <button key={item.key} onClick={function(){nav(item.vw,item.sf)}} onMouseEnter={function(e){if(!active)e.currentTarget.style.background="var(--sb-active)"}} onMouseLeave={function(e){if(!active)e.currentTarget.style.background="transparent"}} style={{display:"flex",alignItems:"center",justifyContent:sbCollapsed?"center":"flex-start",gap:sbCollapsed?0:10,width:"100%",padding:sbCollapsed?"7px 0":"7px 12px",borderRadius:8,border:"none",fontSize:11,fontWeight:active?600:500,background:active?"var(--sb-active)":"transparent",color:active?"var(--sb-text)":"var(--sb-muted)",textAlign:"left",marginBottom:1,transition:"all 0.15s"}}>{item.icon?<I n={item.icon} sz={16} c={active?"var(--sb-text)":"var(--sb-muted)"}/>:<span style={{width:8,height:8,borderRadius:"50%",background:item.color,display:"inline-block"}}/>}{!sbCollapsed&&<span style={{flex:1}}>{item.label}</span>}{!sbCollapsed&&item.color&&<span style={{fontSize:9,fontWeight:600,color:"var(--sb-muted)",opacity:0.7}}>{countForStage(item.key)}</span>}</button>})}</nav>
      <div style={{padding:sbCollapsed?"6px 6px 10px":"8px 10px 12px",borderTop:"1px solid var(--sb-divider)"}}>
        {!sbCollapsed&&<button style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"none",background:"var(--sb-active)",color:"var(--sb-text)",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all 0.15s"}} onClick={function(){setAdd(true)}}><I n="plus" sz={13} c="var(--sb-text)"/>Add Person</button>}
        {sbCollapsed&&<button style={{width:"100%",padding:"7px 0",borderRadius:8,border:"none",background:"var(--sb-active)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setAdd(true)}} title="Add Person"><I n="plus" sz={14} c="var(--sb-text)"/></button>}
        {!sbCollapsed&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3,marginTop:6}}>
          <div style={{textAlign:"center",padding:"4px 0",background:"var(--sb-active)",borderRadius:6}}><div style={{fontSize:12,fontWeight:700,color:"var(--sb-text)"}}>{people.length}</div><div style={{fontSize:7,color:"var(--sb-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>Tracked</div></div>
          <div style={{textAlign:"center",padding:"4px 0",background:"#F59E0B08",borderRadius:6}}><div style={{fontSize:12,fontWeight:700,color:"#F59E0B"}}>{people.filter(function(x){return x.fullyConnected}).length}</div><div style={{fontSize:7,color:"var(--sb-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>Connected</div></div>
          <div style={{textAlign:"center",padding:"4px 0",background:"#EF444408",borderRadius:6}}><div style={{fontSize:12,fontWeight:700,color:"#EF4444"}}>{people.filter(function(x){return!x.fullyConnected&&(ago(x.lastContactDate)===null||ago(x.lastContactDate)>3)}).length}</div><div style={{fontSize:7,color:"var(--sb-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>Overdue</div></div>
        </div>}
      </div>
      <button className="weavr-collapse-btn" onClick={function(){setSbCollapsed(!sbCollapsed)}} style={{position:"absolute",top:"50%",right:-12,transform:"translateY(-50%)",width:24,height:24,borderRadius:"50%",border:"1px solid var(--divider)",background:"var(--card-solid)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",zIndex:70,transition:"all 0.15s"}} onMouseEnter={function(e){e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.15)"}} onMouseLeave={function(e){e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.1)"}}><span style={{fontSize:9,color:"var(--text-muted)",transform:sbCollapsed?"rotate(180deg)":"rotate(0)",display:"inline-flex",transition:"transform 0.25s"}}>{"◂"}</span></button>
    </aside>
    <main style={{flex:1,overflowY:"auto",minHeight:"100vh"}}>
      <div className="weavr-main-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 32px",borderBottom:"1px solid var(--divider)",position:"sticky",top:0,background:isDark?cw.darkSolid+"F0":isMono?"rgba(248,249,250,0.97)":"rgba(245,246,250,0.97)",zIndex:50,backdropFilter:"blur(16px)"}}>
        <div style={{fontSize:11,color:"var(--text-sub)",fontWeight:500}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",background:"var(--inp)",borderRadius:12,border:"1px solid var(--inp-border)",padding:"0 11px",transition:"all 0.2s"}}><I n="search" sz={15} c="var(--text-muted)"/><input value={search} onChange={function(e){setSearch(e.target.value)}} placeholder="Search people..." style={{width:search?200:150,padding:"8px 8px",borderRadius:12,border:"none",background:"transparent",color:"var(--text)",fontSize:11,outline:"none",boxSizing:"border-box",transition:"width 0.3s"}}/>{search&&<button onClick={function(){setSearch("")}} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}><I n="x" sz={13} c="var(--text-muted)"/></button>}</div>
          <button onClick={function(){var next=config.theme==="light"?"dark":config.theme==="dark"?"mono":"light";setConfig({...config,theme:next})}} style={{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",cursor:"pointer"}} title={config.theme==="light"?"Dark Mode":config.theme==="dark"?"Simple Mode":"Light Mode"}><I n={config.theme==="mono"?"eye":"sun"} sz={16} c="var(--text-muted)"/></button>
          <button onClick={function(){setImp(true)}} style={{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",cursor:"pointer"}} title="Import"><I n="upload" sz={16} c="var(--text-muted)"/></button>
        </div>
      </div>
      <div className="weavr-main-content" style={{padding:"19px 32px 32px",animation:"fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)"}}>
        {(function(){var sq=search.toLowerCase().trim();var fp=sq?people.filter(function(x){return(x.firstName+" "+(x.lastName||"")).toLowerCase().includes(sq)||(x.phone||"").includes(sq)||(x.email||"").toLowerCase().includes(sq)}):people;return !ready?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,color:"var(--text-muted)"}}><div style={{fontWeight:600}}>Loading...</div></div>
        :search.trim()&&view!=="settings"?<PeopleView people={fp} teams={teams} stageFilter={null} search={search} setSearch={setSearch} onPerson={setSel} onImport={function(){setImp(true)}} onDelete={function(id){setPeople(function(prev){return prev.filter(function(x){return x.id!==id})})}}/>
        :view==="overview"?<Overview people={fp} teams={teams} onPerson={setSel} navTo={nav} onAdd={function(){setAdd(true)}} onImport={function(){setImp(true)}} templates={tpl} config={config} setConfig={setConfig} onContact={setContactTarget}/>
        :view==="settings"?<Settings templates={tpl} setTemplates={setTpl} people={people} setPeople={setPeople} teams={teams} setTeams={setTeams} rules={rules} setRules={setRules} config={config} setConfig={setConfig}/>
        :view==="quick"?<QuickEntry onAdd={function(x){setPeople(function(prev){return[...prev,x]})}} teams={teams} config={config}/>
        :view==="bulk"?<BulkMessage people={fp} templates={tpl}/>
        :view==="reports"?<Reports people={fp} teams={teams} config={config} onPerson={setSel}/>
        :view==="assigned"?<AssignedCards people={fp} teams={teams} onPerson={setSel} templates={tpl} config={config} onContact={setContactTarget} onUpdate={function(u){setPeople(function(prev){return prev.map(function(x){return x.id===u.id?u:x})})}}/>
        :view==="connected"?<FullyConnected people={fp} onPerson={setSel}/>
        :<PeopleView people={fp} teams={teams} stageFilter={sf} search={search} setSearch={setSearch} onPerson={setSel} onImport={function(){setImp(true)}} onDelete={function(id){setPeople(function(prev){return prev.filter(function(x){return x.id!==id})})}}/>})()}
      </div>
    </main>
    <div className="weavr-mobile-nav" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:isDark?cw.darkSolid:"#fff",borderTop:"1px solid var(--divider)",padding:"6px 0 env(safe-area-inset-bottom,6px)",zIndex:100,justifyContent:"space-around"}}>
      {[{k:"overview",i:"home",l:"Home"},{k:"people",i:"users",l:"People"},{k:"quick-entry",i:"plus",l:"Add"},{k:"assigned",i:"card",l:"Cards"},{k:"settings",i:"gear",l:"Settings"}].map(function(t){var active=view===t.k||(t.k==="people"&&view==="people");return <button key={t.k} onClick={function(){nav(t.k,t.k==="people"?"all":null)}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",padding:"3px 10px",fontSize:9,fontWeight:active?700:500,color:active?"var(--primary)":"var(--text-muted)"}}><I n={t.i} sz={20} c={active?"var(--primary)":"var(--text-muted)"}/>{t.l}</button>})}
    </div>
    {sel&&<Panel person={sel} teams={teams} templates={tpl} config={config} userName={p.userName||"Staff"} onClose={function(){setSel(null)}} onUpdate={function(u){setPeople(function(prev){return prev.map(function(x){return x.id===u.id?u:x})});setSel(u)}} onDelete={function(id){setPeople(function(prev){return prev.filter(function(x){return x.id!==id})});setSel(null)}}/> }
    {add&&<AddModal onClose={function(){setAdd(false)}} onAdd={function(x){setPeople(function(prev){return[...prev,x]})}} teams={teams} config={config}/>}
    {imp&&<ImportModal onClose={function(){setImp(false)}} onImport={function(arr){setPeople(function(prev){return[...prev,...arr]})}}/>}
    {contactTarget&&<ContactAction person={contactTarget} message={tplFor(contactTarget,tpl)} email={emailFor(contactTarget,config)} onClose={function(){setContactTarget(null)}}/>}
  </div>;
}

/* ══════ PORTAL LAUNCHER ══════ */
var TOOLS=[
  {key:"connect",name:"Connect",desc:"Visitor-to-member pipeline",icon:"users",color:"#7C3AED",grad:"linear-gradient(135deg,#7C3AED,#6D28D9)",ready:true},
  {key:"care",name:"Care",desc:"Pastoral care & appointments",icon:"heart",color:"#EC4899",grad:"linear-gradient(135deg,#EC4899,#DB2777)",ready:false},
  {key:"serve",name:"Serve",desc:"Volunteer team management",icon:"zap",color:"#10B981",grad:"linear-gradient(135deg,#34D399,#059669)",ready:false},
  {key:"sections",name:"Sections",desc:"Section pastor dashboard",icon:"flag",color:"#06B6D4",grad:"linear-gradient(135deg,#67E8F9,#0891B2)",ready:false},
  {key:"hub",name:"Hub",desc:"SOPs, handbooks & resources",icon:"dl",color:"#F59E0B",grad:"linear-gradient(135deg,#FBBF24,#D97706)",ready:false},
  {key:"groups",name:"Groups",desc:"Small group management",icon:"home",color:"#6366F1",grad:"linear-gradient(135deg,#818CF8,#6366F1)",ready:false},
  {key:"nextsteps",name:"Next Steps",desc:"Growth pathway tracking",icon:"target",color:"#14B8A6",grad:"linear-gradient(135deg,#5EEAD4,#14B8A6)",ready:false},
  {key:"pulse",name:"Pulse",desc:"Church health analytics",icon:"chart",color:"#EF4444",grad:"linear-gradient(135deg,#FCA5A5,#EF4444)",ready:false}
];

/* ══════ WEAVR LOGO ══════ */
var WeavrLogo=function(p){var sz=p.sz||20;return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2C7 2 7 7 12 12C17 17 17 22 17 22" stroke={p.c||"#fff"} strokeWidth="2.5" strokeLinecap="round"/><path d="M12 2C12 2 12 7 12 12C12 17 12 22 12 22" stroke={p.c||"#fff"} strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/><path d="M17 2C17 2 17 7 12 12C7 17 7 22 7 22" stroke={p.c||"#fff"} strokeWidth="2.5" strokeLinecap="round" opacity="0.35"/></svg>};

function Portal(p){
  return <div style={{height:"100vh",background:"linear-gradient(145deg,#3730A3 0%,#4338CA 25%,#3B35B0 50%,#2E2A8A 75%,#252262 100%)",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden",animation:"portalFadeIn 0.4s ease",display:"flex",flexDirection:"column"}}>
    <style>{"@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap');*{font-family:'Nunito',sans-serif !important}"}</style>

    <div style={{maxWidth:1000,margin:"0 auto",padding:"0 22px",width:"100%",display:"flex",flexDirection:"column",flex:1}}>
      <div className="weavr-portal-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",animation:"loginSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#7C3AED,#06B6D4)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(124,58,237,0.3)"}}><WeavrLogo sz={22}/></div>
          <div style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:"0.12em"}}>WEAVR</div>
        </div>
        <button onClick={p.onLogout} style={{padding:"7px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",fontSize:10,fontWeight:600,cursor:"pointer",backdropFilter:"blur(8px)",transition:"all 0.2s"}} onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.12)"}} onMouseLeave={function(e){e.currentTarget.style.background="rgba(255,255,255,0.06)"}}>Sign Out</button>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div className="weavr-portal-hero" style={{textAlign:"center",padding:"0 0 24px"}}>
          <h1 style={{fontSize:28,fontWeight:800,color:"#fff",lineHeight:1.2,marginBottom:8,letterSpacing:"-0.01em",animation:"loginSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both"}}>Ministry Tools That Keep<br/>Your Church Connected</h1>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",maxWidth:480,margin:"0 auto",lineHeight:1.6,animation:"loginSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both"}}>Everything your team needs to track, connect, and care for every person who walks through your doors.</p>
        </div>

        <div className="weavr-portal-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {TOOLS.map(function(t,idx){var isActive=t.ready;var delay=(0.4+idx*0.08)+"s";return <div key={t.key} className="weavr-portal-card" onClick={isActive?function(){p.onTool(t.key)}:undefined} style={{background:isActive?t.grad:"rgba(255,255,255,0.04)",borderRadius:14,padding:"18px 16px",cursor:isActive?"pointer":"default",border:isActive?"none":"1px solid rgba(255,255,255,0.06)",transition:"all 0.3s ease",opacity:isActive?1:0.55,position:"relative",overflow:"hidden",animation:"portalCardDrop 0.5s cubic-bezier(0.22,1,0.36,1) "+delay+" both"}} onMouseEnter={isActive?function(e){e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 16px 48px "+t.color+"50"}:function(e){e.currentTarget.style.background="rgba(255,255,255,0.07)"}} onMouseLeave={isActive?function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}:function(e){e.currentTarget.style.background="rgba(255,255,255,0.04)"}}>
              <div style={{width:38,height:38,borderRadius:10,background:isActive?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,backdropFilter:"blur(4px)"}}><I n={t.icon} sz={18} c="#fff"/></div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Weavr {t.name}</div>
              <div style={{fontSize:10,color:isActive?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)",lineHeight:1.5,marginBottom:10}}>{t.desc}</div>
              {isActive?<div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.9)"}}><span>Launch</span><span style={{fontSize:13}}>{"→"}</span></div>:<div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Coming Soon</div>}
            </div>})}
        </div>
      </div>

      <div style={{textAlign:"center",padding:"16px 0",flexShrink:0}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <WeavrLogo sz={12} c="rgba(255,255,255,0.3)"/>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontWeight:600}}>Weavr Platform v2.0</span>
        </div>
      </div>
    </div>
  </div>;
}

export default function App(){
  var [authed,setAuthed]=useState(false);var [activeTool,setActiveTool]=useState(null);
  var [user,setUser]=useState("");var [pass,setPass]=useState("");var [confirmPass,setConfirmPass]=useState("");var [err,setErr]=useState("");
  var [authTab,setAuthTab]=useState("signin");var [authAnim,setAuthAnim]=useState(false);
  var doLogin=function(){if(!user.trim()||!pass.trim()){setErr("Please fill in all fields");return}setAuthAnim(true);setTimeout(function(){setAuthed(true);setErr("")},600)};
  var doSignup=function(){if(!user.trim()||!pass.trim()){setErr("Please fill in all fields");return}if(pass!==confirmPass){setErr("Passwords don't match");return}setAuthAnim(true);setTimeout(function(){setAuthed(true);setErr("")},600)};

  if(activeTool==="connect") return <AppMain onBackToPortal={function(){setActiveTool(null)}} userName={user}/>;

  return <div style={{position:"relative",minHeight:"100vh",fontFamily:"'Nunito',sans-serif",background:"#252262"}}>
    <style>{"@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap');*{font-family:'Nunito',sans-serif !important}html,body{background:#252262;margin:0;padding:0}@keyframes authFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes authFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.95) translateY(-16px)}}@keyframes loginSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes loginCardPop{from{opacity:0;transform:scale(0.9) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes portalFadeIn{from{opacity:0}to{opacity:1}}@keyframes portalCardDrop{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}"}</style>

    {authed&&<Portal onTool={setActiveTool} onLogout={function(){setAuthed(false);setActiveTool(null);setUser("");setPass("");setConfirmPass("");setAuthTab("signin");setAuthAnim(false)}}/>}

    {!authed&&<div style={{position:"fixed",inset:0,zIndex:300,display:"flex"}} className="weavr-login-split">
      <div className="weavr-login-left" style={{flex:1,background:"linear-gradient(145deg,#3730A3 0%,#4338CA 25%,#3B35B0 50%,#2E2A8A 75%,#252262 100%)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 45px",position:"relative",overflow:"hidden"}}>

        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:45,animation:"loginSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both"}}>
            <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#7C3AED,#06B6D4)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(124,58,237,0.3)"}}><WeavrLogo sz={26}/></div>
            <div style={{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:"0.12em"}}>WEAVR</div>
          </div>

          <h1 style={{fontSize:36,fontWeight:800,color:"#fff",lineHeight:1.1,marginBottom:16,letterSpacing:"-0.02em",animation:"loginSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both"}}>The engine<br/>behind healthy<br/>churches.</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.8,maxWidth:420,marginBottom:38,animation:"loginSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both"}}>Track every connection. Equip every team. Never let anyone slip through the cracks.</p>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,maxWidth:500}}>
            {[{icon:"users",n:"Pipeline",d:"6-stage journey",c:"#A78BFA",delay:"0.3s"},{icon:"zap",n:"Scoring",d:"Auto-prioritize",c:"#22D3EE",delay:"0.35s"},{icon:"chart",n:"Analytics",d:"Growth trends",c:"#34D399",delay:"0.4s"},{icon:"send",n:"Messaging",d:"Text & email",c:"#FBBF24",delay:"0.45s"},{icon:"cal",n:"Follow-Ups",d:"Smart scheduling",c:"#F472B6",delay:"0.5s"},{icon:"target",n:"Milestones",d:"Track every step",c:"#FB923C",delay:"0.55s"}].map(function(f){return <div key={f.n} style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:"16px 11px",border:"1px solid rgba(255,255,255,0.08)",textAlign:"center",cursor:"default",transition:"all 0.25s",animation:"loginCardPop 0.5s cubic-bezier(0.22,1,0.36,1) "+f.delay+" both"}} onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor=f.c+"40";e.currentTarget.style.boxShadow="0 0 24px "+f.c+"20";e.currentTarget.style.transform="translateY(-3px)"}} onMouseLeave={function(e){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)"}}><div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><I n={f.icon} sz={17} c={f.c}/></div><div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>{f.n}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{f.d}</div></div>})}
          </div>
        </div>
      </div>

      <div className="weavr-login-right" style={{width:400,flexShrink:0,background:"linear-gradient(180deg,#252262 0%,#1E1B4B 100%)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 42px"}}>
        <div style={{animation:authAnim?"authFadeOut 0.5s ease forwards":"authFadeIn 0.6s ease 0.3s both"}}>
          <div className="weavr-login-mobile-logo" style={{display:"none",alignItems:"center",gap:10,marginBottom:26}}><div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#06B6D4)",display:"flex",alignItems:"center",justifyContent:"center"}}><WeavrLogo sz={22}/></div><div style={{fontSize:16,fontWeight:800,color:"#fff",letterSpacing:"0.12em"}}>WEAVR</div></div>
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:25,fontWeight:800,color:"#fff",marginBottom:6,animation:"loginSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both"}}>{authTab==="signin"?"Welcome back.":"Get started."}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",animation:"loginSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.5s both"}}>{authTab==="signin"?"Sign in to your church dashboard":"Create your Weavr account"}</p>
          </div>

          <div style={{display:"flex",gap:0,marginBottom:26,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:2}}>
            {["signin","signup"].map(function(t){var active=authTab===t;return <button key={t} onClick={function(){setAuthTab(t);setErr("")}} style={{flex:1,padding:"8px",borderRadius:8,border:"none",fontSize:11,fontWeight:active?700:500,color:active?"#fff":"rgba(255,255,255,0.3)",background:active?"rgba(124,58,237,0.4)":"transparent",cursor:"pointer",transition:"all 0.2s"}}>{t==="signin"?"Sign In":"Sign Up"}</button>})}
          </div>

          <div style={{marginBottom:18}}>
            <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.25)",marginBottom:6}}>Username</div>
            <input style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:12,boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}} value={user} onChange={function(e){setUser(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter"){if(authTab==="signin")doLogin();else doSignup()}}} placeholder="Enter your username" autoFocus onFocus={function(e){e.currentTarget.style.borderColor="rgba(139,92,246,0.5)"}} onBlur={function(e){e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}/>
          </div>

          <div style={{marginBottom:authTab==="signup"?22:32}}>
            <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.25)",marginBottom:6}}>Password</div>
            <input type="password" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:12,boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}} value={pass} onChange={function(e){setPass(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter"&&authTab==="signin")doLogin()}} placeholder="Enter password" onFocus={function(e){e.currentTarget.style.borderColor="rgba(139,92,246,0.5)"}} onBlur={function(e){e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}/>
          </div>

          {authTab==="signup"&&<div style={{marginBottom:26}}>
            <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.25)",marginBottom:6}}>Confirm Password</div>
            <input type="password" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:12,boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}} value={confirmPass} onChange={function(e){setConfirmPass(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doSignup()}} placeholder="Confirm password" onFocus={function(e){e.currentTarget.style.borderColor="rgba(139,92,246,0.5)"}} onBlur={function(e){e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}/>
          </div>}

          {err&&<div style={{fontSize:10,color:"#FCA5A5",marginBottom:13,textAlign:"center",background:"rgba(239,68,68,0.08)",padding:"8px 11px",borderRadius:10,border:"1px solid rgba(239,68,68,0.15)"}}>{err}</div>}

          <button onClick={authTab==="signin"?doLogin:doSignup} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:"0 4px 20px rgba(124,58,237,0.3)"}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(124,58,237,0.5)"}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 20px rgba(124,58,237,0.3)"}}>{authTab==="signin"?"Sign In":"Create Account"}</button>

          <div style={{textAlign:"center",marginTop:22}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.12)"}}>Weavr Platform v2.0</span>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}
