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
  light:{bg:"linear-gradient(145deg,#F0F2F5,#E8EAF0,#F0ECF5)",card:"rgba(255,255,255,0.9)",cardBorder:"none",text:"#1E1B4B",textSub:"#6B7280",textMuted:"#9CA3AF",inp:"#FAFAFA",inpBorder:"#E5E7EB",divider:"#F3F4F6",hover:"rgba(124,58,237,0.02)",thBg:"#FAFAFA"},
  dark:{bg:"linear-gradient(145deg,#0F172A,#1E1B4B,#0F172A)",card:"rgba(30,27,75,0.6)",cardBorder:"1px solid rgba(255,255,255,0.08)",text:"#F1F5F9",textSub:"#94A3B8",textMuted:"#64748B",inp:"rgba(255,255,255,0.06)",inpBorder:"rgba(255,255,255,0.1)",divider:"rgba(255,255,255,0.06)",hover:"rgba(255,255,255,0.03)",thBg:"rgba(255,255,255,0.03)"}
};
var COLORWAYS={
  purple:{primary:"#7C3AED",primaryGrad:"linear-gradient(135deg,#7C3AED,#6D28D9)",accent:"#A78BFA",sidebar:"linear-gradient(180deg,#312E81,#1E1B4B 60%,#0F172A)",logo:"linear-gradient(135deg,#7C3AED,#06B6D4)"},
  teal:{primary:"#0891B2",primaryGrad:"linear-gradient(135deg,#06B6D4,#0891B2)",accent:"#67E8F9",sidebar:"linear-gradient(180deg,#164E63,#0E3A4F 60%,#0A2533)",logo:"linear-gradient(135deg,#06B6D4,#10B981)"},
  rose:{primary:"#E11D48",primaryGrad:"linear-gradient(135deg,#FB7185,#E11D48)",accent:"#FDA4AF",sidebar:"linear-gradient(180deg,#4C0519,#3B0412 60%,#1C0208)",logo:"linear-gradient(135deg,#E11D48,#F59E0B)"},
  emerald:{primary:"#059669",primaryGrad:"linear-gradient(135deg,#34D399,#059669)",accent:"#6EE7B7",sidebar:"linear-gradient(180deg,#064E3B,#022C22 60%,#011A14)",logo:"linear-gradient(135deg,#059669,#06B6D4)"}
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
    {person.phone&&<div style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Phone</div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--inp)",borderRadius:12,padding:"12px 16px"}}>
        <I n="phone" sz={16} c="var(--primary)"/>
        <span style={{flex:1,fontSize:16,fontWeight:600,color:"var(--text)",letterSpacing:"0.02em"}}>{person.phone}</span>
        <button onClick={function(){doCopy(person.phone,"phone")}} style={{padding:"6px 14px",borderRadius:8,background:copied==="phone"?"#10B981":"var(--primary)",color:"#fff",border:"none",fontSize:11,fontWeight:600,cursor:"pointer"}}>{copied==="phone"?"Copied!":"Copy #"}</button>
      </div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <a href={smsUrl(person.phone,msg)} target="_top" style={{flex:1,textDecoration:"none",padding:"10px",borderRadius:10,background:"#06B6D410",border:"1px solid #06B6D425",textAlign:"center",fontSize:12,fontWeight:600,color:"#06B6D4",display:"block"}}>Open in Messages</a>
        <a href={telUrl(person.phone)} target="_top" style={{flex:1,textDecoration:"none",padding:"10px",borderRadius:10,background:"var(--primary)10",border:"1px solid var(--primary)25",textAlign:"center",fontSize:12,fontWeight:600,color:"var(--primary)",display:"block"}}>Call</a>
      </div>
    </div>}
    {msg&&<div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)"}}>Text Message</div>
        <button onClick={function(){doCopy(msg,"msg")}} style={{padding:"4px 12px",borderRadius:6,background:copied==="msg"?"#10B981":"var(--inp)",color:copied==="msg"?"#fff":"var(--text-sub)",border:"1px solid var(--inp-border)",fontSize:10,fontWeight:600,cursor:"pointer"}}>{copied==="msg"?"Copied!":"Copy"}</button>
      </div>
      <div style={{background:"var(--inp)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"var(--text)",lineHeight:1.7,border:"1px solid var(--inp-border)"}}>{msg}</div>
    </div>}
    {person.email&&<div>
      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Email</div>
      <div style={{background:"var(--inp)",borderRadius:12,padding:"12px 16px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><I n="mail" sz={14} c="#10B981"/><span style={{fontSize:14,fontWeight:600,color:"var(--text)",flex:1}}>{person.email}</span><button onClick={function(){doCopy(person.email,"email")}} style={{padding:"4px 10px",borderRadius:6,background:copied==="email"?"#10B981":"var(--card)",color:copied==="email"?"#fff":"var(--text-sub)",border:"1px solid var(--inp-border)",fontSize:10,fontWeight:600,cursor:"pointer"}}>{copied==="email"?"Copied!":"Copy"}</button></div>
        {em.subj&&<div style={{marginBottom:6}}><div style={{fontSize:9,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase"}}>Subject</div><div style={{fontSize:12,color:"var(--text)",marginTop:2}}>{em.subj}</div></div>}
        {em.body&&<div><div style={{fontSize:9,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase"}}>Body</div><div style={{fontSize:12,color:"var(--text-sub)",marginTop:2,lineHeight:1.6}}>{em.body}</div></div>}
      </div>
      <div style={{display:"flex",gap:6}}>
        <a href={mailUrl(person.email,em.subj||"",em.body||"")} target="_top" style={{flex:1,textDecoration:"none",padding:"10px",borderRadius:10,background:"#10B98110",border:"1px solid #10B98125",textAlign:"center",fontSize:12,fontWeight:600,color:"#10B981",display:"block"}}>Open in Mail</a>
        <button onClick={function(){doCopy((em.subj?"Subject: "+em.subj+"\n\n":"")+em.body,"ebody")}} style={{flex:1,padding:"10px",borderRadius:10,background:"var(--inp)",border:"1px solid var(--inp-border)",fontSize:12,fontWeight:600,color:"var(--text-sub)",cursor:"pointer"}}>{copied==="ebody"?"Copied!":"Copy All"}</button>
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
var db={async get(k,fb){try{var r=await window.storage.get(k);return r?JSON.parse(r.value):fb}catch(e){return fb}},async set(k,v){try{await window.storage.set(k,JSON.stringify(v))}catch(e){}}};

/* ══════ ICONS ══════ */
var I=function(props){var n=props.n,size=props.sz||18,col=props.c||"currentColor";var paths={home:<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeWidth="1.5" strokeLinejoin="round"/>,users:<g><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5"/></g>,plus:<path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round"/>,upload:<g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5" strokeLinecap="round"/><polyline points="17 8 12 3 7 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" strokeLinecap="round"/></g>,search:<g><circle cx="11" cy="11" r="8" strokeWidth="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="1.5" strokeLinecap="round"/></g>,x:<g><line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round"/></g>,check:<polyline points="20 6 9 17 4 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,up:<polyline points="18 15 12 9 6 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,msg:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="1.5" strokeLinejoin="round"/>,edit:<g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="1.5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="1.5"/></g>,trash:<g><polyline points="3 6 5 6 21 6" strokeWidth="1.5"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="1.5" strokeLinecap="round"/></g>,gear:<g><circle cx="12" cy="12" r="3" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="1.5"/></g>,dl:<g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5"/><polyline points="7 10 12 15 17 10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeWidth="1.5" strokeLinecap="round"/></g>,phone:<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeWidth="1.5"/>,mail:<g><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" strokeWidth="1.5"/></g>,copy:<g><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="1.5"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="1.5"/></g>,flag:<g><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" strokeWidth="1.5"/><line x1="4" y1="22" x2="4" y2="15" strokeWidth="1.5"/></g>,zap:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="1.5" strokeLinejoin="round"/>,chart:<path d="M18 20V10M12 20V4M6 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,send:<g><line x1="22" y1="2" x2="11" y2="13" strokeWidth="1.5"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="1.5" strokeLinejoin="round"/></g>,card:<g><rect x="2" y="3" width="20" height="18" rx="2" strokeWidth="1.5"/><line x1="2" y1="9" x2="22" y2="9" strokeWidth="1.5"/></g>,sun:<g><circle cx="12" cy="12" r="5" strokeWidth="1.5"/><line x1="12" y1="1" x2="12" y2="3" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="23" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="12" x2="3" y2="12" strokeWidth="1.5" strokeLinecap="round"/><line x1="21" y1="12" x2="23" y2="12" strokeWidth="1.5" strokeLinecap="round"/></g>,target:<g><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" strokeWidth="1.5"/></g>,cal:<g><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5"/></g>,clock:<g><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><polyline points="12 6 12 12 16 14" strokeWidth="1.5" strokeLinecap="round"/></g>,eye:<g><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" strokeWidth="1.5"/></g>,palette:<g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.21-1.01-.55-1.37-.33-.35-.55-.83-.55-1.37 0-1.1.9-2 2-2h2.36C19.86 15.26 22 13.13 22 10.5 22 5.81 17.52 2 12 2z" strokeWidth="1.5"/><circle cx="7.5" cy="11.5" r="1.5" fill={col} strokeWidth="0"/><circle cx="10.5" cy="7.5" r="1.5" fill={col} strokeWidth="0"/><circle cx="15.5" cy="7.5" r="1.5" fill={col} strokeWidth="0"/></g>};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={col} xmlns="http://www.w3.org/2000/svg">{paths[n]}</svg>};

/* ══════ SMALL COMPONENTS ══════ */
function RingMini(p){var size=p.sz||52,sw=4,r=(size-sw)/2,circ=2*Math.PI*r,pct=p.max>0?Math.min(p.value/p.max,1):0;return <div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{position:"absolute",transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={p.color} strokeWidth={sw} strokeDasharray={String(circ)} strokeDashoffset={String(circ*(1-pct))} strokeLinecap="round"/></svg><span style={{position:"relative",fontSize:size>40?16:12,fontWeight:700,color:"#fff"}}>{p.value}</span></div>}
function ScoreRing(p){var size=p.sz||40,sw=3.5,r=(size-sw)/2,circ=2*Math.PI*r,col=scoreColor(p.score);return <div style={{position:"relative",width:size,height:size,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{position:"absolute",transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" style={{opacity:0.1}} strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={String(circ)} strokeDashoffset={String(circ*(1-p.score/100))} strokeLinecap="round"/></svg><span style={{position:"relative",fontSize:11,fontWeight:700,color:col}}>{p.score}</span></div>}
var Dot=function(p){var s=p.sz||8;return <span style={{width:s,height:s,borderRadius:"50%",background:p.color||"#ccc",display:"inline-block",flexShrink:0}}/>};

function Btn(p){var v=p.v||"default";return <button style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",border:"none",background:v==="ghost"?"var(--card)":"var(--primary-grad)",color:v==="ghost"?"var(--text-sub)":v==="red"?"#EF4444":"#fff",boxShadow:v==="ghost"?"inset 0 0 0 1px var(--inp-border)":v==="red"?"none":"0 4px 14px var(--primary)25",...(v==="red"?{background:"linear-gradient(135deg,#FEE2E2,#FECACA)"}:v==="green"?{background:"linear-gradient(135deg,#34D399,#10B981)"}:v==="teal"?{background:"linear-gradient(135deg,#67E8F9,#06B6D4)"}:{}),...p.sx}} onClick={p.onClick}>{p.icon && <I n={p.icon} sz={14}/>}{p.label}</button>}

function Field(p){return <div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{p.label}</div><input style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,boxSizing:"border-box",outline:"none"}} value={p.value} onChange={function(e){p.onChange(e.target.value)}} autoFocus={p.autoFocus} placeholder={p.placeholder}/></div>}

function Modal(p){return <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={p.onClose}><div style={{background:"var(--card-solid)",borderRadius:22,padding:28,width:p.wide?680:480,maxWidth:"92vw",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}} onClick={function(e){e.stopPropagation()}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{fontSize:19,fontWeight:700,color:"var(--text)"}}>{p.title}</h3><button style={{background:"var(--inp)",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={p.onClose}><I n="x" sz={16} c="var(--text-muted)"/></button></div>{p.children}</div></div>}

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

  return <div style={{background:"var(--card)",borderRadius:16,padding:16,border:"1px solid var(--inp-border)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <button onClick={prev} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:18}}>{"\u2039"}</button>
      <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{monthName}</span>
      <button onClick={next} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:18}}>{"\u203A"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
      {["S","M","T","W","T","F","S"].map(function(d,i){return <div key={i} style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",padding:4}}>{d}</div>})}
      {cells.map(function(day,i){
        if(!day)return <div key={"e"+i}/>;
        var dt=new Date(year,month,day);dt.setHours(0,0,0,0);
        var isToday=dt.getTime()===today.getTime();
        var isSel=selD&&dt.getTime()===selD.getTime();
        var isPast=dt<today;
        return <button key={i} disabled={isPast} onClick={function(){p.onSelect(dt.toISOString().split("T")[0])}} style={{width:32,height:32,borderRadius:10,border:"none",fontSize:12,fontWeight:isSel?700:isToday?600:400,background:isSel?"var(--primary)":isToday?"var(--primary)15":"transparent",color:isSel?"#fff":isPast?"var(--text-muted)":"var(--text)",cursor:isPast?"default":"pointer",opacity:isPast?0.4:1}}>{day}</button>;
      })}
    </div>
  </div>;
}

/* ══════ OVERVIEW ══════ */
function Overview(p){
  var people=p.people,teams=p.teams,total=people.length;
  var [mmlOpen,setMmlOpen]=useState(false);
  var mx=Math.max.apply(null,STAGES.map(function(s){return people.filter(function(x){return x.currentStage===s.key}).length}).concat([1]));
  var mml=people.filter(function(x){return!x.fullyConnected}).map(function(x){var sc=calcScore(x),d=ago(x.lastContactDate),pri=100-sc;if(d===null)pri+=30;else if(d>7)pri+=20;else if(d>3)pri+=10;if((SIDX[x.currentStage]||0)<=1)pri+=10;return{...x,engScore:sc,priority:pri}}).sort(function(a,b){return b.priority-a.priority}).slice(0,10);

  if(!total)return <div style={{textAlign:"center",padding:"100px 20px"}}><div style={{width:80,height:80,borderRadius:24,background:"var(--primary-grad)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}><I n="users" sz={32} c="#fff"/></div><h2 style={{fontSize:26,fontWeight:700,color:"var(--text)",marginBottom:10}}>Welcome to Connection Engine</h2><p style={{fontSize:15,color:"var(--text-muted)",maxWidth:400,margin:"0 auto 32px",lineHeight:1.8}}>Start tracking your church's connection journey.</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn icon="plus" label="Add Person" onClick={p.onAdd}/><Btn icon="upload" label="Import CSV" onClick={p.onImport} v="ghost"/></div></div>;

  return <div>
    <div style={{background:"var(--sidebar)",borderRadius:24,padding:"28px 32px",marginBottom:24,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.15)"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.05)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1}}>
        <h2 style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:4}}>Engagement Pipeline</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:24}}>{total} people tracked</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14}}>{STAGES.map(function(s,i){var ct=s.key==="bgroup"?people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length:s.key==="ateam"?people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length:people.filter(function(x){return x.currentStage===s.key}).length;var prev=i>0?people.filter(function(x){return x.currentStage===STAGES[i-1].key}).length:total;var conv=i>0&&prev>0?Math.round(ct/prev*100):null;return <div key={s.key} style={{background:"rgba(255,255,255,0.06)",borderRadius:16,padding:"16px 10px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}} onClick={function(){p.navTo("people",s.key)}} onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.12)"}} onMouseLeave={function(e){e.currentTarget.style.background="rgba(255,255,255,0.06)"}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><RingMini value={ct} max={mx} color={s.color} sz={48}/></div><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>{s.label}</div>{conv!==null&&<div style={{fontSize:10,fontWeight:600,color:s.color,marginTop:3}}>{conv}%</div>}</div>})}</div>
      </div>
    </div>

    {(function(){var top1=mml[0];if(!top1)return null;var stg=STAGES.find(function(s){return s.key===top1.currentStage});var d=ago(top1.lastContactDate);var tm=teams.find(function(t){return t.id===top1.assignedTo});return <div style={{display:"flex",gap:14,marginBottom:24}}>
      <div style={{flex:1,background:"var(--card)",borderRadius:18,padding:"20px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:16,cursor:"pointer"}} onClick={function(){p.onPerson(top1)}}>
        <div style={{width:48,height:48,borderRadius:14,background:stg?stg.grad:"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n="zap" sz={20} c="#fff"/></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--primary)",marginBottom:3}}>Next Up</div>
          <div style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>{top1.firstName} {top1.lastName}</div>
          <div style={{fontSize:11,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:8,marginTop:2}}><span style={{color:stg?stg.color:"#999",fontWeight:600}}>{stg?stg.label:"?"}</span><span>{d===null?"Never contacted":d+"d ago"}</span>{tm&&<span style={{color:tm.color}}>{tm.name}</span>}</div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          {top1.phone&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:36,height:36,borderRadius:10,background:"#06B6D415",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}><I n="msg" sz={15} c="#06B6D4"/></button>}
          {top1.phone&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:36,height:36,borderRadius:10,background:"var(--primary)15",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}><I n="phone" sz={15} c="var(--primary)"/></button>}
          {top1.email&&<button onClick={function(e){e.stopPropagation();p.onContact(top1)}} style={{width:36,height:36,borderRadius:10,background:"#10B98115",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}><I n="mail" sz={15} c="#10B981"/></button>}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[{l:"New This Week",v:people.filter(function(x){return ago(x.createdAt)<=7}).length,c:"#10B981"},{l:"Need Follow-Up",v:people.filter(function(x){return!x.fullyConnected&&(ago(x.lastContactDate)===null||ago(x.lastContactDate)>3)}).length,c:"#EF4444"},{l:"Fully Connected",v:people.filter(function(x){return x.fullyConnected}).length,c:"#F59E0B"}].map(function(k){return <div key={k.l} style={{background:"var(--card)",borderRadius:12,padding:"10px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 6px rgba(0,0,0,0.03)",minWidth:170}}><div style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:10,fontWeight:600,color:"var(--text-muted)",lineHeight:1.3}}>{k.l}</div></div>})}
      </div>
    </div>})()}

    {mml.length>0&&<div style={{background:"var(--card)",borderRadius:18,padding:"16px 24px",marginBottom:24,borderLeft:"4px solid var(--primary)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <button onClick={function(){setMmlOpen(!mmlOpen)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,background:"none",border:"none",padding:"4px 0",cursor:"pointer",textAlign:"left"}}>
        <I n="sun" sz={18} c="#F59E0B"/>
        <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",flex:1}}>Monday Morning List</h3>
        <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:600,background:"var(--inp)",padding:"3px 10px",borderRadius:8}}>{mml.length}</span>
        <span style={{fontSize:14,color:"var(--text-muted)",transform:mmlOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>{"\u25BE"}</span>
      </button>
      {mmlOpen&&<div style={{marginTop:12}}>
        {mml.map(function(x,i){var stg=STAGES.find(function(s){return s.key===x.currentStage});var d=ago(x.lastContactDate);var tm=teams.find(function(t){return t.id===x.assignedTo});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><div style={{width:28,height:28,borderRadius:10,background:"var(--sidebar)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:11,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:8,marginTop:2}}><span style={{color:stg?stg.color:"#999",fontWeight:600}}>{stg?stg.label:"?"}</span><span>{d===null?"Never":d+"d ago"}</span>{tm&&<span style={{color:tm.color}}>{tm.name}</span>}</div></div><ScoreRing score={x.engScore} sz={36}/><div style={{fontSize:11,color:"var(--text-muted)",width:90,textAlign:"right"}}>{NEXT_ACT[x.currentStage]}</div></div>})}
      </div>}
    </div>}

    <div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:20}}>Engagement Funnel</h3>
      {STAGES.map(function(s){var ct=s.key==="bgroup"?people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length:s.key==="ateam"?people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length:people.filter(function(x){return x.currentStage===s.key}).length;return <div key={s.key} style={{display:"flex",alignItems:"center",gap:16,marginBottom:10,cursor:"pointer"}} onClick={function(){p.navTo("people",s.key)}}><div style={{width:85,fontSize:12,fontWeight:600,color:"var(--text-sub)",textAlign:"right",flexShrink:0}}>{s.label}</div><div style={{flex:1,height:32,background:"var(--divider)",borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(ct/mx*100,5)+"%",background:s.grad,borderRadius:10,display:"flex",alignItems:"center",paddingLeft:14,transition:"width 1s ease"}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{ct}</span></div></div></div>})}
      {(function(){var fc=people.filter(function(x){return x.fullyConnected}).length;if(fc===0)return null;return <div style={{display:"flex",alignItems:"center",gap:16,marginTop:4,cursor:"pointer",padding:"6px 0",borderTop:"1px solid var(--divider)"}} onClick={function(){p.navTo("connected")}}><div style={{width:85,fontSize:12,fontWeight:700,color:"#F59E0B",textAlign:"right",flexShrink:0}}>Connected</div><div style={{flex:1,height:32,background:"var(--divider)",borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(fc/mx*100,5)+"%",background:"linear-gradient(135deg,#F59E0B,#FBBF24)",borderRadius:10,display:"flex",alignItems:"center",paddingLeft:14}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{fc}</span></div></div></div>})()}
    </div>
  </div>;
}

/* ══════ PEOPLE TABLE ══════ */
function PeopleView(p){
  var stObj=p.stageFilter?STAGES.find(function(s){return s.key===p.stageFilter}):null;var [teamF,setTeamF]=useState("");
  var fil=p.people.filter(function(x){
    if(!p.stageFilter)return true;
    if(p.stageFilter==="bgroup")return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed;
    if(p.stageFilter==="ateam")return x.stages&&x.stages.ateam&&x.stages.ateam.completed;
    return x.currentStage===p.stageFilter;
  }).filter(function(x){return !teamF||x.assignedTo===teamF||(teamF==="none"&&!x.assignedTo)}).filter(function(x){if(!p.search)return true;var q=p.search.toLowerCase();return(x.firstName+" "+x.lastName).toLowerCase().includes(q)||(x.phone||"").includes(q)||(x.email||"").toLowerCase().includes(q)}).sort(function(a,b){return a.firstName.localeCompare(b.firstName)});
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:10}}>{stObj&&<Dot color={stObj.color} sz={10}/>}{stObj?stObj.label:"All People"}</h2><p style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>{fil.length} people</p></div>
      <div style={{display:"flex",gap:8}}>{p.teams.length>0&&<select style={{padding:"8px 12px",fontSize:12,borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",cursor:"pointer"}} value={teamF} onChange={function(e){setTeamF(e.target.value)}}><option value="">All Members</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}<option value="none">Unassigned</option></select>}<Btn icon="upload" label="Import" onClick={p.onImport} v="ghost"/></div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--card)",borderRadius:16,padding:"0 18px",marginBottom:16,border:"1px solid var(--inp-border)"}}><I n="search" sz={16} c="var(--text-muted)"/><input style={{flex:1,padding:"13px 0",border:"none",background:"transparent",color:"var(--text)",fontSize:14,outline:"none"}} placeholder="Search..." value={p.search} onChange={function(e){p.setSearch(e.target.value)}}/>{p.search&&<button style={{background:"none",border:"none",padding:4,cursor:"pointer"}} onClick={function(){p.setSearch("")}}><I n="x" sz={14} c="var(--text-muted)"/></button>}</div>
    <div style={{background:"var(--card)",borderRadius:18,padding:0,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Name","Stage","Score","Assigned","Status","Contact","Next",""].map(function(h){return <th key={h||"act"} style={{padding:"10px 14px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--text-muted)",textAlign:"left",borderBottom:"1px solid var(--divider)",background:"var(--th-bg)",width:h===""?40:"auto"}}>{h}</th>})}</tr></thead>
      <tbody>{fil.map(function(x){var s=STAGES.find(function(st){return st.key===x.currentStage});var d=ago(x.lastContactDate);var urg=d===null||d>3;var sc=calcScore(x);var tm=p.teams.find(function(t){return t.id===x.assignedTo});return <tr key={x.id} style={{cursor:"pointer"}} onMouseEnter={function(e){e.currentTarget.style.background="var(--hover)"}} onMouseLeave={function(e){e.currentTarget.style.background=""}}>
        <td style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:"var(--text)",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{x.firstName} {x.lastName}</td>
        <td style={{padding:"12px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:s?s.color:"#999"}}><Dot color={s?s.color:"#ccc"} sz={6}/>{s?s.label:"?"}</span></td>
        <td style={{padding:"12px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}><ScoreRing score={sc} sz={32}/></td>
        <td style={{padding:"12px 14px",fontSize:12,borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{tm?<span style={{color:tm.color,fontWeight:600}}>{tm.name}</span>:<span style={{color:"var(--text-muted)"}}>-</span>}</td>
        <td style={{padding:"12px 14px",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{urg?<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"#FEF2F2",color:"#EF4444"}}>Follow Up</span>:<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"#ECFDF5",color:"#10B981"}}>On Track</span>}</td>
        <td style={{padding:"12px 14px",fontSize:12,color:"var(--text-muted)",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{x.lastContactDate?fmtS(x.lastContactDate):"Never"}</td>
        <td style={{padding:"12px 14px",fontSize:12,color:"var(--text-sub)",borderBottom:"1px solid var(--divider)"}} onClick={function(){p.onPerson(x)}}>{NEXT_ACT[x.currentStage]}</td>
        <td style={{padding:"12px 14px",borderBottom:"1px solid var(--divider)",textAlign:"center"}}><button onClick={function(e){e.stopPropagation();if(confirm("Delete "+x.firstName+" "+x.lastName+"?"))p.onDelete(x.id)}} style={{background:"none",border:"none",padding:4,cursor:"pointer",opacity:0.4}} onMouseEnter={function(e){e.currentTarget.style.opacity="1"}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.4"}}><I n="trash" sz={14} c="#EF4444"/></button></td>
      </tr>})}</tbody></table>
      {fil.length===0&&<div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}><I n="users" sz={28} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:10}}>No people found</div></div>}
    </div>
  </div>;
}

/* ══════ ASSIGNED CARDS ══════ */
function AssignedCards(p){
  var [selTeam,setSelTeam]=useState(p.teams.length>0?p.teams[0].id:"");
  var [workMode,setWorkMode]=useState(false);
  var [workIdx,setWorkIdx]=useState(0);
  var [workNote,setWorkNote]=useState("");
  var [workFlash,setWorkFlash]=useState("");
  var tm=p.teams.find(function(t){return t.id===selTeam});
  var assigned=p.people.filter(function(x){return x.assignedTo===selTeam&&!x.fullyConnected}).sort(function(a,b){return calcScore(a)-calcScore(b)});
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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:10}}><I n="card" sz={22} c="var(--primary)"/>Assigned Cards</h2><p style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>View and work contacts by team member</p></div>
      <button onClick={function(){setWorkMode(!workMode);setWorkIdx(0);setWorkFlash("")}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:12,border:workMode?"2px solid var(--primary)":"2px solid var(--inp-border)",background:workMode?"var(--primary)08":"var(--inp)",fontSize:12,fontWeight:600,color:workMode?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}><I n="zap" sz={14} c={workMode?"var(--primary)":"var(--text-muted)"}/>{workMode?"Grid View":"Work Mode"}</button>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {p.teams.map(function(t){var ct=p.people.filter(function(x){return x.assignedTo===t.id&&!x.fullyConnected}).length;return <button key={t.id} onClick={function(){setSelTeam(t.id);setWorkIdx(0)}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:12,border:selTeam===t.id?"2px solid "+t.color:"2px solid transparent",background:selTeam===t.id?"var(--card)":"var(--inp)",fontSize:12,fontWeight:600,color:selTeam===t.id?t.color:"var(--text-sub)",cursor:"pointer"}}><div style={{width:24,height:24,borderRadius:8,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div>{t.name} ({ct})</button>})}
    </div>
    {p.teams.length===0?<div style={{background:"var(--card)",borderRadius:18,padding:40,textAlign:"center",color:"var(--text-muted)"}}><I n="users" sz={28} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:10}}>Add team members in Settings first</div></div>:
    workMode&&workPerson?<div style={{background:"var(--card)",borderRadius:22,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
      <div style={{background:workStg?workStg.grad:"var(--sidebar)",padding:"24px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
        <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:600,marginBottom:4}}>{workIdx+1} of {assigned.length}</div>
            <div style={{fontSize:24,fontWeight:700,color:"#fff"}}>{workPerson.firstName} {workPerson.lastName}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4,display:"flex",alignItems:"center",gap:8}}><span>{workStg?workStg.label:"?"}</span><span>{workD===null?"Never contacted":workD+"d ago"}</span></div>
          </div>
          <RingMini value={workScore} max={100} color={scoreColor(workScore)} sz={56}/>
        </div>
      </div>
      <div style={{padding:"20px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {workPerson.phone&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"8px 16px",borderRadius:10,background:"#06B6D410",fontSize:12,fontWeight:600,color:"#06B6D4",display:"flex",alignItems:"center",gap:5,border:"1px solid #06B6D425",cursor:"pointer"}}><I n="msg" sz={13} c="#06B6D4"/>Text</button>}
          {workPerson.phone&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"8px 16px",borderRadius:10,background:"var(--primary)10",fontSize:12,fontWeight:600,color:"var(--primary)",display:"flex",alignItems:"center",gap:5,border:"1px solid var(--primary)25",cursor:"pointer"}}><I n="phone" sz={13} c="var(--primary)"/>Call</button>}
          {workPerson.email&&<button onClick={function(){p.onContact(workPerson)}} style={{padding:"8px 16px",borderRadius:10,background:"#10B98110",fontSize:12,fontWeight:600,color:"#10B981",display:"flex",alignItems:"center",gap:5,border:"1px solid #10B98125",cursor:"pointer"}}><I n="mail" sz={13} c="#10B981"/>Email</button>}
          <div style={{flex:1}}/>
          <button onClick={function(){p.onPerson(workPerson)}} style={{padding:"6px 12px",borderRadius:10,background:"var(--inp)",border:"1px solid var(--inp-border)",fontSize:11,fontWeight:600,color:"var(--text-sub)",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><I n="eye" sz={12} c="var(--text-muted)"/>Full Profile</button>
        </div>
        <div style={{background:"var(--inp)",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:8}}><I n="zap" sz={14} c={workStg?workStg.color:"var(--text-muted)"}/><b style={{color:"var(--text)"}}>Next:</b>{NEXT_ACT[workPerson.currentStage]}</div>
        {workPerson.currentStage==="salvation"&&<div style={{background:"var(--inp)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,fontWeight:600,color:"var(--text-muted)"}}>Date Saved</span><input type="date" value={workMs.dateSaved||""} onChange={function(e){workUpMs({dateSaved:e.target.value})}} style={{padding:"6px 10px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12}}/></div>}
        {workPerson.currentStage==="baptism"&&<div style={{background:"var(--inp)",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,fontWeight:600,color:"var(--text-muted)"}}>Date Baptized</span><input type="date" value={workMs.dateBaptized||""} onChange={function(e){workUpMs({dateBaptized:e.target.value})}} style={{padding:"6px 10px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12}}/></div>}
        {workPerson.currentStage==="next-steps"&&<div style={{background:"var(--inp)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
          {[{k:"textSent",l:"Text/Email Sent"},{k:"registered",l:"Registered"},{k:"attended",l:"Attended"}].map(function(item){return <div key={item.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><input type="checkbox" checked={!!workMs[item.k]} onChange={function(){var nd={};nd[item.k]=!workMs[item.k];if(!workMs[item.k])nd[item.k+"Date"]=new Date().toISOString().split("T")[0];workUpMs(nd)}} style={{width:15,height:15,accentColor:"#FBBF24"}}/><span style={{fontSize:11,color:"var(--text)",flex:1}}>{item.l}</span>{workMs[item.k]&&<input type="date" value={workMs[item.k+"Date"]||""} onChange={function(e){var nd={};nd[item.k+"Date"]=e.target.value;workUpMs(nd)}} style={{padding:"3px 6px",borderRadius:6,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:10,width:120}}/>}</div>})}
        </div>}
        {(function(){var wHasBG=workPerson.stages&&workPerson.stages.bgroup&&workPerson.stages.bgroup.completed;var wHasAT=workPerson.stages&&workPerson.stages.ateam&&workPerson.stages.ateam.completed;var wToggleBG=function(){var ns={...workPerson.stages};var nc=workPerson.currentStage;if(wHasBG){delete ns.bgroup;nc=ns.ateam&&ns.ateam.completed?"ateam":"next-steps"}else{ns.bgroup={date:new Date().toISOString(),completed:true};if(SIDX.bgroup>SIDX[nc])nc="bgroup"}p.onUpdate({...workPerson,stages:ns,currentStage:nc})};var wToggleAT=function(){var ns={...workPerson.stages};var nc=workPerson.currentStage;if(wHasAT){delete ns.ateam;nc=ns.bgroup&&ns.bgroup.completed?"bgroup":"next-steps"}else{ns.ateam={date:new Date().toISOString(),completed:true};if(SIDX.ateam>SIDX[nc])nc="ateam"}p.onUpdate({...workPerson,stages:ns,currentStage:nc})};return <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:8}}>
            <button onClick={wToggleBG} style={{flex:1,padding:"10px 14px",borderRadius:10,border:wHasBG?"2px solid #EC4899":"2px dashed var(--inp-border)",background:wHasBG?"#EC489908":"var(--inp)",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,borderRadius:5,background:wHasBG?"#EC4899":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{wHasBG&&<I n="check" sz={10} c="#fff"/>}</div><span style={{fontSize:12,fontWeight:600,color:wHasBG?"#EC4899":"var(--text-muted)"}}>BGroup</span></button>
            <button onClick={wToggleAT} style={{flex:1,padding:"10px 14px",borderRadius:10,border:wHasAT?"2px solid #34D399":"2px dashed var(--inp-border)",background:wHasAT?"#34D39908":"var(--inp)",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,borderRadius:5,background:wHasAT?"#34D399":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{wHasAT&&<I n="check" sz={10} c="#fff"/>}</div><span style={{fontSize:12,fontWeight:600,color:wHasAT?"#34D399":"var(--text-muted)"}}>ATeam</span></button>
          </div>
          {wHasBG&&wHasAT&&!workPerson.fullyConnected&&<button onClick={function(){p.onUpdate({...workPerson,fullyConnected:true,fullyConnectedDate:new Date().toISOString()});setWorkFlash("Fully Connected!");setTimeout(function(){setWorkFlash("");if(workIdx<assigned.length-1)setWorkIdx(workIdx+1)},1500)}} style={{width:"100%",marginTop:8,padding:"12px 16px",borderRadius:10,border:"2px solid #F59E0B",background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13,fontWeight:700,color:"#92400E"}} onMouseEnter={function(e){e.currentTarget.style.background="linear-gradient(135deg,#F59E0B,#FBBF24)";e.currentTarget.style.color="#fff"}} onMouseLeave={function(e){e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7,#FDE68A)";e.currentTarget.style.color="#92400E"}}>{"⭐"} Mark Fully Connected</button>}
          {workPerson.fullyConnected&&<div style={{marginTop:8,background:"#F59E0B10",border:"1px solid #F59E0B30",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:"#F59E0B"}}>{"⭐"} Fully Connected</div>}
        </div>})()}
        <div style={{display:"flex",gap:8,marginBottom:14}}><input style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12,outline:"none",boxSizing:"border-box"}} placeholder="Add a note..." value={workNote} onChange={function(e){setWorkNote(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")workFollowUp()}}/></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn icon="check" label={workFlash||"Followed Up"} v="green" onClick={workFollowUp} sx={{padding:"10px 20px",fontSize:13}}/>
          {workLinIdx>0&&<button onClick={workStepBack} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"10px 14px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text-sub)"}}><span style={{transform:"rotate(180deg)",display:"inline-block"}}><I n="up" sz={13}/></span>Back</button>}
          {workLinIdx<3&&<Btn icon="up" label="Advance" onClick={workAdvance} sx={{padding:"10px 16px",fontSize:13}}/>}
          <div style={{flex:1}}/>
          <button onClick={workPrev} disabled={workIdx===0} style={{width:40,height:40,borderRadius:12,border:"1px solid var(--inp-border)",background:"var(--card)",cursor:workIdx===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:workIdx===0?0.3:1}}><span style={{transform:"rotate(180deg)",display:"inline-flex"}}><I n="up" sz={16} c="var(--text-sub)"/></span></button>
          <button onClick={workNext} disabled={workIdx>=assigned.length-1} style={{width:40,height:40,borderRadius:12,border:"1px solid var(--inp-border)",background:"var(--card)",cursor:workIdx>=assigned.length-1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:workIdx>=assigned.length-1?0.3:1}}><I n="up" sz={16} c="var(--text-sub)"/></button>
        </div>
      </div>
    </div>:
    workMode&&!workPerson?<div style={{background:"var(--card)",borderRadius:18,padding:48,textAlign:"center",color:"var(--text-muted)"}}><I n="check" sz={32} c="#10B981"/><div style={{fontWeight:600,marginTop:12,color:"#10B981"}}>All caught up!</div><div style={{fontSize:12,marginTop:4}}>No pending contacts for {tm?tm.name:"this team"}</div></div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
      {assigned.map(function(x){
        var stg=STAGES.find(function(s){return s.key===x.currentStage});var sc=calcScore(x);var d=ago(x.lastContactDate);
        return <div key={x.id} style={{background:"var(--card)",borderRadius:16,padding:"18px 20px",cursor:"pointer",borderLeft:"4px solid "+(stg?stg.color:"#ccc"),boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}} onClick={function(){p.onPerson(x)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><div style={{fontSize:11,color:stg?stg.color:"var(--text-muted)",fontWeight:600,marginTop:2}}>{stg?stg.label:"?"}</div></div>
            <ScoreRing score={sc} sz={36}/>
          </div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:8}}>{d===null?"Never contacted":"Last contact "+d+"d ago"}</div>
          <div style={{fontSize:11,color:"var(--text-sub)",background:"var(--inp)",borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:6}}><I n="zap" sz={12} c={stg?stg.color:"var(--text-muted)"}/>{NEXT_ACT[x.currentStage]}</div>
          {x.phone&&<div style={{fontSize:12,color:"var(--text-muted)",marginTop:8}}>{x.phone}</div>}
        </div>;
      })}
      {assigned.length===0&&<div style={{background:"var(--card)",borderRadius:16,padding:40,textAlign:"center",color:"var(--text-muted)",gridColumn:"1/-1"}}>{tm?"No pending contacts for "+tm.name:"Select a team member"}</div>}
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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div><h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:10}}><I n="card" sz={22} c="var(--primary)"/>Quick Entry</h2><p style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>Rapid connection card entry</p></div>
      {count>0&&<div style={{background:flash?"linear-gradient(135deg,#34D399,#10B981)":"var(--inp)",color:flash?"#fff":"var(--text-sub)",padding:"8px 20px",borderRadius:14,fontSize:14,fontWeight:700,transition:"all 0.3s"}}>{count} added</div>}
    </div>
    <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
      <div style={{flex:1,background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {enabled.map(function(fd,i){
            if(fd.key==="currentStage")return <div key={fd.key}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{fd.label}{fd.required?" *":""}</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f.currentStage||"first-visit"} onChange={function(e){setF({...f,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>;
            if(fd.type==="dropdown")return <div key={fd.key}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{fd.label}</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f[fd.key]||""} onChange={function(e){var nf={...f};nf[fd.key]=e.target.value;setF(nf)}}><option value="">Select...</option>{(fd.options||[]).map(function(o){return <option key={o} value={o}>{o}</option>})}</select></div>;
            if(fd.type==="checkbox")return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0"}}><input type="checkbox" checked={!!f[fd.key]} onChange={function(e){var nf={...f};nf[fd.key]=e.target.checked;setF(nf)}} style={{width:18,height:18,accentColor:"var(--primary)"}}/><span style={{fontSize:13,color:"var(--text)"}}>{fd.label}</span></div>;
            return <div key={fd.key}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{fd.label}{fd.required?" *":""}</div><input ref={i===0?firstRef:undefined} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,boxSizing:"border-box",outline:"none"}} value={f[fd.key]||""} onChange={function(e){var nf={...f};nf[fd.key]=e.target.value;setF(nf)}} placeholder={fd.label} onKeyDown={function(e){if(e.key==="Enter")sub()}}/></div>;
          })}
          {p.teams.length>0&&<div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Assign To</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f.assignedTo||""} onChange={function(e){setF({...f,assignedTo:e.target.value})}}><option value="">Unassigned</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}><Btn icon="plus" label="Add & Next (Enter)" onClick={sub} sx={{flex:1,justifyContent:"center",padding:"14px 18px"}}/><Btn label="Clear" v="ghost" onClick={function(){setF({...empty})}}/></div>
      </div>
      {recent.length>0&&<div style={{width:320,flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Just Added ({recent.length})</div>
        <div style={{background:"var(--card)",borderRadius:14,padding:"8px",maxHeight:500,overflowY:"auto",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
          {recent.map(function(x,i){var stg=STAGES.find(function(s){return s.key===x.currentStage});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:i===0?"var(--primary)06":"transparent",borderBottom:i<recent.length-1?"1px solid var(--divider)":"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:stg?stg.color:"#ccc",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{x.firstName} {x.lastName}</div>
              <div style={{fontSize:10,color:"var(--text-muted)"}}>{stg?stg.label:"?"}{x.phone?" \u00B7 "+x.phone:""}</div>
            </div>
            <div style={{fontSize:10,color:"var(--text-muted)"}}>{fmtS(x.createdAt)}</div>
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
    <h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:10,marginBottom:4}}><I n="send" sz={22} c="var(--primary)"/>Bulk Message</h2>
    <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:24}}>Personalized messages for everyone in a stage. Copy individual messages or use the SMS link to open your messaging app.</p>
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>{STAGES.map(function(s){var ct=p.people.filter(function(x){return x.currentStage===s.key&&x.phone}).length;return <button key={s.key} onClick={function(){setStage(s.key);setCopied("")}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:12,border:stage===s.key?"2px solid "+s.color:"2px solid transparent",background:stage===s.key?"var(--card)":"var(--inp)",fontSize:12,fontWeight:600,color:stage===s.key?s.color:"var(--text-sub)",cursor:"pointer"}}><Dot color={s.color} sz={6}/>{s.label} ({ct})</button>})}</div>
    <div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>{stg?stg.label:""} Messages</h3><p style={{fontSize:12,color:"var(--text-muted)"}}>{filtered.length} people with phone numbers</p></div>
        <Btn icon="copy" label={copied==="all"?"Copied!":"Copy All"} v={copied==="all"?"green":"ghost"} onClick={copyAll}/>
      </div>
      {msgs.length===0?<div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>No people with phone numbers in this stage</div>:
      <div style={{maxHeight:500,overflowY:"auto"}}>{msgs.map(function(m,i){return <div key={m.person.id} style={{padding:"14px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{m.person.firstName} {m.person.lastName} <span style={{fontWeight:400,color:"var(--text-muted)"}}>{m.person.phone}</span></div>
          <div style={{display:"flex",gap:6}}>
            <Btn icon="copy" label={copied===m.person.id?"Copied":"Copy"} v={copied===m.person.id?"green":"ghost"} sx={{padding:"4px 10px",fontSize:11}} onClick={function(){doCopy(m.text,m.person.id)}}/>
            <a href={smsUrl(m.person.phone,m.text)} target="_top" style={{textDecoration:"none",padding:"4px 10px",borderRadius:8,background:"linear-gradient(135deg,#67E8F9,#06B6D4)",color:"#fff",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><I n="send" sz={11} c="#fff"/>SMS</a>
          </div>
        </div>
        <div style={{background:"var(--inp)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--text-sub)",lineHeight:1.6,border:"1px solid var(--divider)"}}>{m.text}</div>
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
  if(!total)return <div style={{textAlign:"center",padding:80,color:"var(--text-muted)"}}><I n="chart" sz={32} c="var(--text-muted)"/><div style={{fontWeight:600,marginTop:12}}>Add people to see reports</div></div>;
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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:10}}><I n="chart" sz={22} c="var(--primary)"/>Reports</h2>
    </div>
    <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>Toggle widgets to customize your dashboard</p>
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>{allWidgets.map(function(w){var on=widgets.includes(w.key);return <button key={w.key} onClick={function(){toggleWidget(w.key)}} style={{padding:"6px 12px",borderRadius:10,border:on?"2px solid var(--primary)":"2px solid var(--inp-border)",background:on?"var(--primary)08":"var(--inp)",fontSize:11,fontWeight:600,color:on?"var(--primary)":"var(--text-muted)",cursor:"pointer"}}>{w.label}</button>})}</div>

    {widgets.includes("kpis")&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>{[{l:"Total People",v:total,i:"users",c:"var(--primary)"},{l:"Added (7d)",v:added7,i:"plus",c:"#10B981"},{l:"Need Follow-Up",v:needFollow,i:"flag",c:"#EF4444"},{l:"Avg Score",v:avgScore,i:"target",c:"#06B6D4"}].map(function(k){return <div key={k.l} style={{background:"var(--card)",borderRadius:16,padding:"20px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}><div style={{width:44,height:44,borderRadius:14,background:k.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={20} c={k.c}/></div><div><div style={{fontSize:24,fontWeight:700,color:"var(--text)"}}>{k.v}</div><div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600}}>{k.l}</div></div></div>})}</div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      {widgets.includes("distribution")&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Engagement Distribution</h3>{scoreDist.map(function(b){return <div key={b.label} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><div style={{width:50,fontSize:20,fontWeight:700,color:b.color,textAlign:"right"}}>{b.count}</div><div style={{flex:1}}><div style={{height:28,background:"var(--divider)",borderRadius:8,overflow:"hidden"}}><div style={{height:"100%",width:Math.max(b.count/maxB*100,3)+"%",background:b.color,borderRadius:8}}/></div><div style={{fontSize:10,color:"var(--text-muted)",marginTop:3}}>{b.label}</div></div></div>})}</div>}

      {widgets.includes("velocity")&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Stage Velocity</h3>{stageStats.map(function(s){return <div key={s.key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><Dot color={s.color} sz={8}/><div style={{flex:1,fontSize:13,fontWeight:500,color:"var(--text-sub)"}}>{s.label}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>{s.count}</div><div style={{width:60,textAlign:"right"}}><span style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>{s.avgDays}</span><span style={{fontSize:11,color:"var(--text-muted)"}}>d</span></div></div>})}</div>}

      {widgets.includes("team")&&teamStats.length>0&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)",gridColumn:widgets.includes("recent")||widgets.includes("stale")?"auto":"span 2"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Team Performance</h3>{teamStats.map(function(t){var rate=t.assigned>0?Math.round(t.followedUp/t.assigned*100):0;return <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--inp)",borderRadius:12,marginBottom:6}}><div style={{width:36,height:36,borderRadius:10,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>{t.assigned} assigned - {rate}% followed up</div></div><ScoreRing score={t.avgScore} sz={36}/></div>})}</div>}

      {widgets.includes("recent")&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Recent Check-ins (7d)</h3>{recentCI.length===0?<div style={{color:"var(--text-muted)",padding:"20px 0",textAlign:"center",fontSize:13}}>No recent check-ins</div>:<div style={{maxHeight:300,overflowY:"auto"}}>{recentCI.slice(0,15).map(function(c,i){var ct=(p.config.checkInTypes||DEFAULT_CI).find(function(t){return t.key===c.type});return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><I n={ct?ct.icon:"msg"} sz={12} c={ct?ct.color:"var(--text-muted)"}/><div style={{flex:1,fontSize:12,color:"var(--text-sub)"}}>{c.person.firstName} {c.person.lastName} - {ct?ct.label:c.type}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>{fmtS(c.date)}</div></div>})}</div>}</div>}

      {widgets.includes("stale")&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Stale Contacts (14d+)</h3>{stale.length===0?<div style={{color:"var(--text-muted)",padding:"20px 0",textAlign:"center",fontSize:13}}>No stale contacts</div>:<div style={{maxHeight:300,overflowY:"auto"}}>{stale.slice(0,15).map(function(x,i){var d=ago(x.lastContactDate);var stg=STAGES.find(function(s){return s.key===x.currentStage});return <div key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?"1px solid var(--divider)":"none",cursor:"pointer"}} onClick={function(){p.onPerson(x)}}><Dot color={stg?stg.color:"#ccc"} sz={8}/><div style={{flex:1,fontSize:12,color:"var(--text)"}}>{x.firstName} {x.lastName}</div><span style={{fontSize:11,fontWeight:600,color:"#EF4444"}}>{d===null?"Never":d+"d"}</span></div>})}</div>}</div>}

      {widgets.includes("dropoff")&&(function(){var linearS=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});var drops=linearS.map(function(s,i){var inStage=people.filter(function(x){return x.currentStage===s.key});var stalled=inStage.filter(function(x){var stDate=x.stages&&x.stages[s.key]?x.stages[s.key].date:x.createdAt;return ago(stDate)>14});var pct=inStage.length>0?Math.round(stalled.length/inStage.length*100):0;return{...s,total:inStage.length,stalled:stalled.length,pct:pct}});var maxDrop=Math.max.apply(null,drops.map(function(d){return d.total}).concat([1]));return <div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4}}>Drop-off Analysis</h3><p style={{fontSize:11,color:"var(--text-muted)",marginBottom:14}}>Where people stall (14+ days in stage)</p>{drops.map(function(d){return <div key={d.key} style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><Dot color={d.color} sz={7}/><span style={{fontSize:12,fontWeight:500,color:"var(--text)",flex:1}}>{d.label}</span><span style={{fontSize:11,color:d.pct>50?"#EF4444":d.pct>25?"#F59E0B":"var(--text-muted)",fontWeight:600}}>{d.stalled}/{d.total} stalled ({d.pct}%)</span></div><div style={{height:6,background:"var(--divider)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:d.pct>50?"#EF4444":d.pct>25?"#F59E0B":"#10B981",width:Math.max(d.total/maxDrop*100,3)+"%",position:"relative"}}><div style={{position:"absolute",right:0,top:0,height:"100%",width:d.pct+"%",background:"rgba(239,68,68,0.4)",borderRadius:"0 3px 3px 0"}}/></div></div></div>})}</div>})()}

      {widgets.includes("weekly")&&(function(){var w7=people.filter(function(x){return ago(x.createdAt)<=7}).length;var fu7=0;var adv7=0;var fc7=people.filter(function(x){return x.fullyConnected&&ago(x.fullyConnectedDate)<=7}).length;people.forEach(function(x){(x.checkIns||[]).forEach(function(c){if(ago(c.date)<=7)fu7++});STAGES.forEach(function(s){if(s.key!=="first-visit"&&x.stages&&x.stages[s.key]&&ago(x.stages[s.key].date)<=7)adv7++})});return <div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:14}}>This Week</h3><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{[{l:"New People",v:w7,c:"#10B981",i:"plus"},{l:"Follow-ups Done",v:fu7,c:"var(--primary)",i:"check"},{l:"Stage Advances",v:adv7,c:"#06B6D4",i:"up"},{l:"Fully Connected",v:fc7,c:"#F59E0B",i:"target"}].map(function(k){return <div key={k.l} style={{background:"var(--inp)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:k.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={k.i} sz={16} c={k.c}/></div><div><div style={{fontSize:20,fontWeight:700,color:"var(--text)"}}>{k.v}</div><div style={{fontSize:10,color:"var(--text-muted)",fontWeight:600}}>{k.l}</div></div></div>})}</div></div>})()}
    </div>
  </div>;
}

/* ══════ FULLY CONNECTED ══════ */
function FullyConnected(p){
  var connected=p.people.filter(function(x){return x.fullyConnected});
  return <div>
    <div style={{textAlign:"center",marginBottom:28}}>
      <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(135deg,#F59E0B,#FBBF24)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(245,158,11,0.3)",fontSize:28}}>&#11088;</div>
      <h2 style={{fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:4}}>Fully Connected</h2>
      <p style={{fontSize:13,color:"var(--text-muted)"}}>{connected.length} people in both a BGroup and on the ATeam</p>
    </div>
    {connected.length===0?<div style={{background:"var(--card)",borderRadius:18,padding:48,textAlign:"center",color:"var(--text-muted)",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}><div style={{fontSize:15,fontWeight:600}}>No one fully connected yet</div><p style={{fontSize:12,marginTop:6}}>When someone joins both a BGroup and the ATeam through Next Steps, they'll appear here.</p></div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
      {connected.map(function(x){
        var ns=(x.milestones||{})["next-steps"]||{};var stg=STAGES.find(function(s){return s.key===x.currentStage});var sc=calcScore(x);
        return <div key={x.id} style={{background:"var(--card)",borderRadius:18,padding:"20px 24px",cursor:"pointer",boxShadow:"0 2px 16px rgba(0,0,0,0.04)",border:"2px solid #F59E0B30",position:"relative",overflow:"hidden"}} onClick={function(){p.onPerson(x)}}>
          <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:"#F59E0B08",borderRadius:"0 0 0 60px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>{x.firstName} {x.lastName}</div>
              <div style={{fontSize:11,color:stg?stg.color:"var(--text-muted)",fontWeight:600,marginTop:2}}>{stg?stg.label:"?"}</div>
            </div>
            <ScoreRing score={sc} sz={38}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"#EC489910",borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#EC4899",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>BGroup</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{ns.bGroupLeader||"Connected"}</div>
            </div>
            <div style={{flex:1,background:"#34D39910",borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#34D399",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>ATeam</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{ns.aTeamArea||"Serving"}</div>
            </div>
          </div>
          {x.phone&&<div style={{fontSize:11,color:"var(--text-muted)",marginTop:8}}>{x.phone}</div>}
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
  var tabs=[{key:"teams",label:"Teams",icon:"users"},{key:"templates",label:"Text Templates",icon:"msg"},{key:"email-tpl",label:"Email Templates",icon:"mail"},{key:"automation",label:"Automation",icon:"zap"},{key:"checkins",label:"Check-ins",icon:"check"},{key:"forms",label:"Form Fields",icon:"card"},{key:"visual",label:"Visual",icon:"palette"},{key:"data",label:"Data",icon:"dl"}];

  return <div>
    <h2 style={{fontSize:21,fontWeight:700,color:"var(--text)",marginBottom:20}}>Settings</h2>
    <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>{tabs.map(function(t){return <button key={t.key} onClick={function(){setTab(t.key)}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,border:tab===t.key?"2px solid var(--primary)":"2px solid transparent",background:tab===t.key?"var(--primary)08":"var(--inp)",fontSize:12,fontWeight:600,color:tab===t.key?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}><I n={t.icon} sz={13} c={tab===t.key?"var(--primary)":"var(--text-muted)"}/>{t.label}</button>})}</div>

    {tab==="teams"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Team Members</h3>
      <div style={{display:"flex",gap:10,marginBottom:16}}><input style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Name" value={newTeam.name} onChange={function(e){setNewTeam({...newTeam,name:e.target.value})}}/><input style={{width:180,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Role" value={newTeam.role} onChange={function(e){setNewTeam({...newTeam,role:e.target.value})}}/><Btn label="Add" onClick={function(){if(!newTeam.name.trim())return;p.setTeams(function(prev){return prev.concat([{id:uid(),name:newTeam.name.trim(),role:newTeam.role.trim(),color:TC[prev.length%TC.length]}])});setNewTeam({name:"",role:""})}}/></div>
      {p.teams.map(function(t){var ct=p.people.filter(function(x){return x.assignedTo===t.id}).length;return <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--inp)",borderRadius:12,marginBottom:6}}><div style={{width:36,height:36,borderRadius:10,background:t.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:t.color}}>{t.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>{t.role||"Team Member"} - {ct} assigned</div></div><button onClick={function(){p.setTeams(function(prev){return prev.filter(function(x){return x.id!==t.id})})}} style={{background:"none",border:"none",padding:4,cursor:"pointer"}}><I n="trash" sz={14} c="#EF4444"/></button></div>})}
      {p.teams.length===0&&<div style={{color:"var(--text-muted)",fontSize:13,padding:"20px 0",textAlign:"center"}}>No team members yet</div>}
    </div>}

    {tab==="templates"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Message Templates</h3>
      <div style={{display:"flex",gap:20}}><div style={{width:180,flexShrink:0}}>{STAGES.map(function(s){return <button key={s.key} onClick={function(){goTpl(s.key)}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",borderRadius:12,border:"none",fontSize:13,fontWeight:ek===s.key?600:500,background:ek===s.key?"var(--primary)08":"transparent",color:ek===s.key?"var(--primary)":"var(--text-sub)",textAlign:"left",marginBottom:2,cursor:"pointer"}}><Dot color={s.color} sz={7}/>{s.label}</button>})}</div>
      <div style={{flex:1}}>{ek?(function(){var stg=STAGES.find(function(s){return s.key===ek});return <div><div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><Dot color={stg?stg.color:"#ccc"} sz={9}/>{stg?stg.label:""} Template</div><textarea value={et} onChange={function(e){setEt(e.target.value);setSaved(false)}} style={{width:"100%",minHeight:100,padding:16,borderRadius:14,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:14,lineHeight:1.7,resize:"vertical",boxSizing:"border-box",outline:"none"}}/><div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}><Btn label="Save" onClick={saveTpl}/>{saved&&<span style={{fontSize:12,color:"#10B981",fontWeight:600}}>Saved!</span>}</div></div>})():<div style={{color:"var(--text-muted)",fontSize:14,padding:"40px 0",textAlign:"center"}}>Select a stage</div>}</div></div>
    </div>}

    {tab==="email-tpl"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4}}>Email Templates</h3>
      <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>{"Email templates per stage. Use {firstName} and {lastName} as placeholders. Subject and body."}</p>
      <div style={{display:"flex",gap:20}}>
        <div style={{width:180,flexShrink:0}}>{STAGES.map(function(s){return <button key={s.key} onClick={function(){goEmailTpl(s.key)}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",borderRadius:12,border:"none",fontSize:13,fontWeight:emailEk===s.key?600:500,background:emailEk===s.key?"var(--primary)08":"transparent",color:emailEk===s.key?"var(--primary)":"var(--text-sub)",textAlign:"left",marginBottom:2,cursor:"pointer"}}><Dot color={s.color} sz={7}/>{s.label}</button>})}</div>
        <div style={{flex:1}}>{emailEk?(function(){var stg=STAGES.find(function(s){return s.key===emailEk});var subKey=emailEk+"_subject";var curSubject=(config.emailSubjects||{})[emailEk]||"Following up - "+((stg?stg.label:""));return <div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><Dot color={stg?stg.color:"#ccc"} sz={9}/>{stg?stg.label:""} Email</div>
          <div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:4}}>Subject Line</div><input style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,boxSizing:"border-box",outline:"none"}} value={curSubject} onChange={function(e){var ns={...(config.emailSubjects||{})};ns[emailEk]=e.target.value;p.setConfig({...config,emailSubjects:ns})}}/></div>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:4}}>Body</div>
          <textarea value={emailEt} onChange={function(e){setEmailEt(e.target.value);setEmailSaved(false)}} style={{width:"100%",minHeight:120,padding:16,borderRadius:14,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:14,lineHeight:1.7,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
          <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}><Btn label="Save" onClick={saveEmailTpl}/>{emailSaved&&<span style={{fontSize:12,color:"#10B981",fontWeight:600}}>Saved!</span>}</div>
        </div>})():<div style={{color:"var(--text-muted)",fontSize:14,padding:"40px 0",textAlign:"center"}}>Select a stage to edit its email template</div>}</div>
      </div>
    </div>}

    {tab==="automation"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4}}>Automation Rules</h3>
      <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>Create custom rules to automate follow-up workflows</p>
      <div style={{background:"var(--inp)",borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{display:"flex",gap:10,alignItems:"end",flexWrap:"wrap"}}>
          <div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>When</div><select style={{width:200,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:13,cursor:"pointer"}} value={newRule.trigger} onChange={function(e){setNewRule({...newRule,trigger:e.target.value})}}><option value="days-no-contact">Days without contact</option><option value="stage-reached">Stage is reached</option><option value="score-below">Score drops below</option><option value="check-in-type">Check-in type logged</option></select></div>
          {(newRule.trigger==="days-no-contact"||newRule.trigger==="score-below")&&<div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{newRule.trigger==="days-no-contact"?"Days":"Score"}</div><input type="number" style={{width:80,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:13,boxSizing:"border-box"}} value={newRule.days} onChange={function(e){setNewRule({...newRule,days:parseInt(e.target.value)||0})}}/></div>}
          {newRule.trigger==="stage-reached"&&<div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Stage</div><select style={{width:160,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:13,cursor:"pointer"}} value={newRule.stage} onChange={function(e){setNewRule({...newRule,stage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>}
          <div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Then</div><select style={{width:200,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:13,cursor:"pointer"}} value={newRule.action} onChange={function(e){setNewRule({...newRule,action:e.target.value})}}><option value="notify">Add reminder note</option><option value="escalate">Flag for escalation</option><option value="advance">Auto-advance stage</option><option value="assign">Auto-assign to team</option></select></div>
          <Btn label="Add Rule" onClick={function(){p.setRules(function(prev){return prev.concat([{...newRule,id:uid()}])})}}/>
        </div>
      </div>
      {p.rules.map(function(r){var desc="";if(r.trigger==="days-no-contact")desc="No contact for "+r.days+"d";else if(r.trigger==="stage-reached"){var stg=STAGES.find(function(s){return s.key===r.stage});desc=(stg?stg.label:r.stage)+" reached"}else if(r.trigger==="score-below")desc="Score below "+r.days;else desc="Check-in logged";var act=r.action==="escalate"?"Escalate":r.action==="advance"?"Auto-advance":r.action==="assign"?"Auto-assign":"Add reminder";return <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--inp)",borderRadius:12,marginBottom:6}}><I n="zap" sz={16} c={r.enabled?"var(--primary)":"var(--text-muted)"}/><div style={{flex:1,fontSize:13,fontWeight:500,color:r.enabled?"var(--text)":"var(--text-muted)"}}>{desc} \u2192 {act}</div><button onClick={function(){p.setRules(function(prev){return prev.map(function(x){return x.id===r.id?{...x,enabled:!x.enabled}:x})})}} style={{background:"none",border:"none",padding:4,cursor:"pointer",fontSize:11,fontWeight:600,color:r.enabled?"#10B981":"var(--text-muted)"}}>{r.enabled?"Active":"Off"}</button><button onClick={function(){p.setRules(function(prev){return prev.filter(function(x){return x.id!==r.id})})}} style={{background:"none",border:"none",padding:4,cursor:"pointer"}}><I n="trash" sz={14} c="#EF4444"/></button></div>})}
      {p.rules.length===0&&<div style={{color:"var(--text-muted)",fontSize:13,padding:"20px 0",textAlign:"center"}}>No automation rules yet</div>}
    </div>}

    {tab==="checkins"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Check-In Types</h3>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <input style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,outline:"none",boxSizing:"border-box"}} placeholder="Label (e.g. Home Visit)" value={newCI.label} onChange={function(e){setNewCI({...newCI,label:e.target.value})}}/>
        <input type="color" value={newCI.color} onChange={function(e){setNewCI({...newCI,color:e.target.value})}} style={{width:44,height:40,borderRadius:10,border:"1px solid var(--inp-border)",cursor:"pointer",padding:2}}/>
        <Btn label="Add" onClick={function(){if(!newCI.label.trim())return;var nTypes=ciTypes.concat([{key:uid(),label:newCI.label.trim(),icon:"check",color:newCI.color}]);p.setConfig({...config,checkInTypes:nTypes});setNewCI({label:"",color:"#7C3AED",icon:"msg"})}}/>
      </div>
      {ciTypes.map(function(ct){return <div key={ct.key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:"var(--inp)",borderRadius:10,marginBottom:4}}><div style={{width:8,height:8,borderRadius:"50%",background:ct.color}}/><div style={{flex:1,fontSize:13,color:"var(--text)"}}>{ct.label}</div><button onClick={function(){var nTypes=ciTypes.filter(function(x){return x.key!==ct.key});p.setConfig({...config,checkInTypes:nTypes})}} style={{background:"none",border:"none",padding:4,cursor:"pointer"}}><I n="x" sz={12} c="#EF4444"/></button></div>})}
    </div>}

    {tab==="forms"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4}}>Form Fields</h3>
      <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>Fully customize the fields shown in Quick Entry and Add Person forms. Drag to reorder, toggle visibility, or add new custom fields.</p>
      <div style={{background:"var(--inp)",borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Add New Field</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"end"}}>
          <div style={{flex:1,minWidth:140}}><div style={{fontSize:10,color:"var(--text-muted)",marginBottom:4}}>Label</div><input style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12,boxSizing:"border-box",outline:"none"}} value={newField.label} onChange={function(e){setNewField({...newField,label:e.target.value})}} placeholder="e.g. Marital Status"/></div>
          <div style={{width:130}}><div style={{fontSize:10,color:"var(--text-muted)",marginBottom:4}}>Type</div><select style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12,cursor:"pointer"}} value={newField.type} onChange={function(e){setNewField({...newField,type:e.target.value})}}><option value="text">Text</option><option value="dropdown">Dropdown</option><option value="checkbox">Checkbox</option></select></div>
          {newField.type==="dropdown"&&<div style={{flex:1,minWidth:200}}><div style={{fontSize:10,color:"var(--text-muted)",marginBottom:4}}>Options (comma separated)</div><input style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text)",fontSize:12,boxSizing:"border-box",outline:"none"}} value={newField.optionsStr||""} onChange={function(e){setNewField({...newField,optionsStr:e.target.value})}} placeholder="Option 1, Option 2, Option 3"/></div>}
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 0"}}><input type="checkbox" checked={newField.required} onChange={function(){setNewField({...newField,required:!newField.required})}} style={{width:14,height:14,accentColor:"var(--primary)"}}/><span style={{fontSize:11,color:"var(--text-muted)"}}>Required</span></div>
          <Btn label="Add Field" onClick={function(){if(!newField.label.trim())return;var opts=newField.type==="dropdown"&&newField.optionsStr?(newField.optionsStr).split(",").map(function(o){return o.trim()}).filter(function(o){return o}):undefined;var nf={key:"custom_"+uid(),label:newField.label.trim(),type:newField.type,required:newField.required,enabled:true};if(opts)nf.options=opts;p.setConfig({...config,formFields:formFields.concat([nf])});setNewField({label:"",type:"text",required:false,optionsStr:""})}} sx={{padding:"8px 16px",fontSize:12}}/>
        </div>
      </div>
      {formFields.map(function(fd,idx){return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--inp)",borderRadius:10,marginBottom:4}}>
        <input type="checkbox" checked={fd.enabled} onChange={function(){var nFields=formFields.map(function(f){return f.key===fd.key?{...f,enabled:!f.enabled}:f});p.setConfig({...config,formFields:nFields})}} style={{width:16,height:16,accentColor:"var(--primary)",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:500,color:fd.enabled?"var(--text)":"var(--text-muted)"}}>{fd.label}</span>
            <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"var(--primary)10",color:"var(--primary)",fontWeight:600}}>{fd.type}</span>
            {fd.required&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"#EF444415",color:"#EF4444",fontWeight:600}}>required</span>}
          </div>
          {fd.options&&<div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>{fd.options.join(", ")}</div>}
        </div>
        {idx>0&&<button onClick={function(){var nf=[].concat(formFields);var temp=nf[idx];nf[idx]=nf[idx-1];nf[idx-1]=temp;p.setConfig({...config,formFields:nf})}} style={{background:"none",border:"none",padding:2,cursor:"pointer",fontSize:10,color:"var(--text-muted)"}}>{"\u25B2"}</button>}
        {idx<formFields.length-1&&<button onClick={function(){var nf=[].concat(formFields);var temp=nf[idx];nf[idx]=nf[idx+1];nf[idx+1]=temp;p.setConfig({...config,formFields:nf})}} style={{background:"none",border:"none",padding:2,cursor:"pointer",fontSize:10,color:"var(--text-muted)"}}>{"\u25BC"}</button>}
        {fd.key.startsWith("custom_")&&<button onClick={function(){p.setConfig({...config,formFields:formFields.filter(function(f){return f.key!==fd.key})})}} style={{background:"none",border:"none",padding:4,cursor:"pointer"}}><I n="trash" sz={13} c="#EF4444"/></button>}
      </div>})}
    </div>}

    {tab==="visual"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Visual Settings</h3>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:10}}>Theme Mode</div>
        <div style={{display:"flex",gap:10}}>
          {["light","dark"].map(function(m){return <button key={m} onClick={function(){p.setConfig({...config,theme:m})}} style={{flex:1,padding:"16px",borderRadius:14,border:(config.theme||"light")===m?"2px solid var(--primary)":"2px solid var(--inp-border)",background:m==="light"?"#F0F2F5":"#1E1B4B",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:m==="light"?"#1E1B4B":"#F1F5F9",textTransform:"capitalize"}}>{m}</div></button>})}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:10}}>Color Scheme</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {Object.keys(COLORWAYS).map(function(cw){var c=COLORWAYS[cw];return <button key={cw} onClick={function(){p.setConfig({...config,colorway:cw})}} style={{padding:"16px 12px",borderRadius:14,border:(config.colorway||"purple")===cw?"2px solid "+c.primary:"2px solid var(--inp-border)",background:"var(--inp)",cursor:"pointer",textAlign:"center"}}><div style={{width:32,height:32,borderRadius:10,background:c.primaryGrad,margin:"0 auto 8px"}}/><div style={{fontSize:12,fontWeight:600,color:"var(--text)",textTransform:"capitalize"}}>{cw}</div></button>})}
        </div>
      </div>
    </div>}

    {tab==="data"&&<div style={{background:"var(--card)",borderRadius:18,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.04)"}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16}}>Data Management</h3>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
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
  var [copied,setCopied]=useState(false);var [justFollowed,setJustFollowed]=useState(false);var [contactOpen,setContactOpen]=useState(null);
  var stg=STAGES.find(function(s){return s.key===person.currentStage});
  var idx=SIDX[person.currentStage];var d=ago(person.lastContactDate);
  var stColor=stg?stg.color:"#9CA3AF";var stLabel=stg?stg.label:"Unknown";
  var score=calcScore(person);var tm=teams.find(function(t){return t.id===person.assignedTo});
  var ciTypes=p.config.checkInTypes||DEFAULT_CI;

  var linearStages=STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"});
  var linIdx=linearStages.findIndex(function(s){return s.key===person.currentStage});
  var adv=function(){if(linIdx<linearStages.length-1){var nk=linearStages[linIdx+1].key;p.onUpdate({...person,currentStage:nk,stages:{...person.stages,[nk]:{date:new Date().toISOString(),completed:true}}})}};
  var stepBack=function(){if(linIdx>0){var pk=linearStages[linIdx-1].key;p.onUpdate({...person,currentStage:pk})}};
  var done=function(){p.onUpdate({...person,lastContactDate:new Date().toISOString(),checkIns:[...(person.checkIns||[]),{type:"conversation",note:"Followed up",date:new Date().toISOString()}]})};
  var sEdit=function(){p.onUpdate({...form});setEdit(false)};
  var gMsg=function(){var t=templates[person.currentStage]||DEFAULT_TPL[person.currentStage];return t.replace("{firstName}",person.firstName).replace("{lastName}",person.lastName)};
  var addCI=function(type){p.onUpdate({...person,checkIns:[...(person.checkIns||[]),{type:type,note:ciNote,date:new Date().toISOString()}],lastContactDate:new Date().toISOString()});setCiNote("")};
  var sNote=function(){if(!note.trim())return;p.onUpdate({...person,notes:[...(person.notes||[]),{text:note,date:new Date().toISOString()}]});setNote("")};
  var addFollowUp=function(){if(!fuDate)return;var fu={date:fuDate,type:fuType,completed:false,id:uid()};p.onUpdate({...person,followUps:[...(person.followUps||[]),fu]});setShowCal(false);setFuDate("")};
  var completeFollowUp=function(fid){p.onUpdate({...person,followUps:(person.followUps||[]).map(function(f){return f.id===fid?{...f,completed:true}:f})})};
  var doDelete=function(){p.onDelete(person.id);p.onClose()};

  return <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",zIndex:200,display:"flex",justifyContent:"flex-end"}} onClick={p.onClose}><div style={{width:520,maxWidth:"92vw",height:"100vh",background:"var(--card-solid)",display:"flex",flexDirection:"column",animation:"slideIn 0.35s ease",overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,0.1)"}} onClick={function(e){e.stopPropagation()}}>
    <div style={{padding:"24px 28px",background:"var(--sidebar)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.05)",pointerEvents:"none"}}/>
      <button style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={p.onClose}><I n="x" sz={16} c="rgba(255,255,255,0.7)"/></button>
      <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Dot color={stColor} sz={9}/><span style={{fontSize:11,fontWeight:700,color:stColor,textTransform:"uppercase",letterSpacing:"0.06em"}}>{stLabel}</span></div>
          <h2 style={{fontSize:22,fontWeight:700,color:"#fff"}}>{person.firstName} {person.lastName}</h2>
          {tm&&<div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:4}}>Assigned to <span style={{color:tm.color,fontWeight:600}}>{tm.name}</span></div>}
        </div>
        <div style={{textAlign:"center"}}><RingMini value={score} max={100} color={scoreColor(score)} sz={50}/><div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:4,fontWeight:600}}>{scoreLabel(score)}</div></div>
      </div>
    </div>
    <div style={{padding:"10px 28px",background:"var(--primary)08",borderBottom:"1px solid var(--divider)",display:"flex",justifyContent:"space-between"}}>
      <div style={{fontSize:12,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:6}}><I n="zap" sz={13} c={stColor}/><b style={{color:"var(--text)"}}>Next:</b>{NEXT_ACT[person.currentStage]}</div>
      <div style={{fontSize:11,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:12}}><span>{d===null?"Never contacted":"Last: "+fmtS(person.lastContactDate)}</span>{(function(){var stDate=person.stages&&person.stages[person.currentStage]?person.stages[person.currentStage].date:person.createdAt;var dys=ago(stDate);if(dys===null)return null;return <span style={{color:dys>14?"#EF4444":dys>7?"#F59E0B":"var(--text-muted)"}}>{dys}d in {stLabel}</span>})()}</div>
    </div>
    <div style={{padding:"0 28px",borderBottom:"1px solid var(--divider)",background:"var(--card-solid)",position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"12px 0"}}>
        <Btn icon="check" label={justFollowed?"Logged!":"Followed Up"} onClick={function(){done();setJustFollowed(true);setTimeout(function(){setJustFollowed(false)},2000)}} v={justFollowed?"green":"green"} sx={{padding:"7px 14px",fontSize:12}}/>
        {linIdx>0&&<button onClick={stepBack} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"7px 12px",borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid var(--inp-border)",background:"var(--card)",color:"var(--text-sub)"}}><span style={{transform:"rotate(180deg)",display:"inline-block"}}><I n="up" sz={13}/></span>Back</button>}
        {linIdx<linearStages.length-1&&<Btn icon="up" label="Advance" onClick={adv} sx={{padding:"7px 14px",fontSize:12}}/>}
        <Btn icon="msg" label="Text" onClick={function(){setContactOpen("text")}} sx={{padding:"7px 14px",fontSize:12}}/>
        <Btn icon="mail" label="Email" onClick={function(){setContactOpen("email")}} v="ghost" sx={{padding:"7px 14px",fontSize:12,opacity:person.email?1:0.4}}/>
        <div style={{flex:1}}/>
        <Btn icon="cal" label="" onClick={function(){setShowCal(!showCal)}} v="ghost" sx={{padding:"7px 10px",fontSize:12}}/>
        <Btn icon="edit" label="" onClick={function(){setEdit(!edit)}} v="ghost" sx={{padding:"7px 10px",fontSize:12}}/>
        <button onClick={function(){if(confirm("Delete "+person.firstName+"?")){p.onDelete(person.id);p.onClose()}}} style={{display:"inline-flex",alignItems:"center",padding:"7px 10px",borderRadius:10,fontSize:12,cursor:"pointer",background:"transparent",color:"#EF4444",border:"1px solid #FECACA"}}><I n="trash" sz={13} c="#EF4444"/></button>
      </div>
    </div>
    <div style={{padding:"18px 28px",overflowY:"auto",flex:1}}>

      {contactOpen&&<ContactAction person={person} message={gMsg()} email={emailFor(person,p.config)} onClose={function(){setContactOpen(null)}}/>}

      {showCal&&<div style={{background:"var(--card)",borderRadius:14,padding:"14px 18px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:10}}>Schedule Follow-Up</div>
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          {[{key:"remind",label:"Remind Me"},{key:"text",label:"Auto-Send Text"},{key:"email",label:"Auto-Send Email"}].map(function(t){return <button key={t.key} onClick={function(){setFuType(t.key)}} style={{padding:"6px 12px",borderRadius:8,border:fuType===t.key?"2px solid var(--primary)":"2px solid var(--inp-border)",background:fuType===t.key?"var(--primary)08":"var(--inp)",fontSize:11,fontWeight:600,color:fuType===t.key?"var(--primary)":"var(--text-sub)",cursor:"pointer"}}>{t.label}</button>})}
        </div>
        {(function(){var sug=FU_SUGGEST[person.currentStage];if(!sug)return null;var sugDate=new Date();sugDate.setDate(sugDate.getDate()+sug.days);var sugStr=sugDate.toISOString().split("T")[0];return <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"8px 12px",background:"var(--primary)06",borderRadius:10,border:"1px solid var(--primary)15"}}><I n="zap" sz={12} c="var(--primary)"/><span style={{fontSize:11,color:"var(--text-sub)"}}>Suggested: <b style={{color:"var(--primary)"}}>{sug.label}</b> for {stLabel}</span><button onClick={function(){setFuDate(sugStr)}} style={{marginLeft:"auto",padding:"3px 10px",borderRadius:6,background:"var(--primary)",color:"#fff",border:"none",fontSize:10,fontWeight:600,cursor:"pointer"}}>Use</button></div>})()}
        <MiniCal selected={fuDate} onSelect={setFuDate}/>
        {fuDate&&<div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"var(--text-sub)"}}>Selected: <b style={{color:"var(--text)"}}>{fmt(fuDate)}</b></span><Btn label="Confirm" v="green" sx={{padding:"6px 14px",fontSize:11}} onClick={addFollowUp}/></div>}
      </div>}

      {(person.followUps||[]).filter(function(f){return!f.completed}).length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Scheduled Follow-Ups</div>
        {(person.followUps||[]).filter(function(f){return!f.completed}).map(function(f){var isPast=new Date(f.date)<new Date();return <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:isPast?"#FEF2F220":"var(--inp)",borderRadius:10,marginBottom:4,border:isPast?"1px solid #FECACA":"1px solid var(--inp-border)"}}>
          <I n={f.type==="remind"?"clock":f.type==="text"?"phone":"mail"} sz={14} c={isPast?"#EF4444":"var(--primary)"}/>
          <div style={{flex:1,fontSize:12,color:"var(--text)"}}>{fmt(f.date)} - {f.type==="remind"?"Reminder":f.type==="text"?"Auto Text":"Auto Email"}{isPast?" (overdue)":""}</div>
          <button onClick={function(){completeFollowUp(f.id)}} style={{background:"none",border:"none",cursor:"pointer"}}><I n="check" sz={14} c="#10B981"/></button>
        </div>})}
      </div>}

      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Log Check-In</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
          {ciTypes.map(function(ct){return <button key={ct.key} onClick={function(){addCI(ct.key)}} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--card)",fontSize:11,fontWeight:600,color:ct.color,cursor:"pointer"}}><I n={ct.icon||"check"} sz={11} c={ct.color}/>{ct.label}</button>})}
        </div>
        <input style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12,boxSizing:"border-box",outline:"none"}} placeholder="Optional note..." value={ciNote} onChange={function(e){setCiNote(e.target.value)}}/>
      </div>

      {(person.checkIns||[]).length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Check-In History</div>
        <div style={{background:"var(--card)",borderRadius:14,padding:"10px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
          {(person.checkIns||[]).slice().reverse().slice(0,8).map(function(c,i){var ct=ciTypes.find(function(t){return t.key===c.type});return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><I n={ct?ct.icon||"check":"msg"} sz={11} c={ct?ct.color:"var(--text-muted)"}/><div style={{flex:1,fontSize:11,color:"var(--text-sub)"}}>{ct?ct.label:c.type}{c.note?" - "+c.note:""}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>{fmtS(c.date)}</div></div>})}
        </div>
      </div>}

      {!edit&&<div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Contact</div>
        <div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
          {person.phone&&<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{color:"var(--text)",fontSize:13,display:"flex",alignItems:"center",gap:10,fontWeight:500,flex:1}}><div style={{width:28,height:28,borderRadius:8,background:"var(--primary)15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="phone" sz={12} c="var(--primary)"/></div>{person.phone}</div><button onClick={function(){setContactOpen("text")}} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,background:"#06B6D415",fontSize:11,fontWeight:600,color:"#06B6D4",border:"none",cursor:"pointer"}}>iMessage</button></div>}
          {person.email&&<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{color:"var(--text)",fontSize:13,display:"flex",alignItems:"center",gap:10,fontWeight:500,flex:1}}><div style={{width:28,height:28,borderRadius:8,background:"#10B98115",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="mail" sz={12} c="#10B981"/></div>{person.email}</div><button onClick={function(){setContactOpen("email")}} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,background:"#F59E0B15",fontSize:11,fontWeight:600,color:"#F59E0B",border:"none",cursor:"pointer"}}>Send Email</button></div>}
          {person.serviceAttended&&<div style={{fontSize:13,color:"var(--text-sub)",display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:8,background:"#F59E0B15",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="home" sz={12} c="#D97706"/></div>{person.serviceAttended}</div>}
        </div>
      </div>}

      {edit&&<div style={{background:"var(--card)",borderRadius:14,padding:"14px 18px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="First Name" value={form.firstName} onChange={function(v){setForm({...form,firstName:v})}}/>
          <Field label="Last Name" value={form.lastName} onChange={function(v){setForm({...form,lastName:v})}}/>
          <Field label="Phone" value={form.phone||""} onChange={function(v){setForm({...form,phone:v})}}/>
          <Field label="Email" value={form.email||""} onChange={function(v){setForm({...form,email:v})}}/>
          <div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Stage</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={form.currentStage} onChange={function(e){setForm({...form,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>
          <Field label="Service" value={form.serviceAttended||""} onChange={function(v){setForm({...form,serviceAttended:v})}}/>
          {teams.length>0&&<div><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Assigned To</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={form.assignedTo||""} onChange={function(e){setForm({...form,assignedTo:e.target.value||null})}}><option value="">Unassigned</option>{teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <Btn label="Save" onClick={sEdit} v="green"/><Btn label="Cancel" onClick={function(){setEdit(false)}} v="ghost"/>
          <div style={{flex:1}}/>
          <button onClick={function(){if(confirm("Permanently delete "+person.firstName+" "+person.lastName+"?"))doDelete()}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:"linear-gradient(135deg,#FEE2E2,#FECACA)",color:"#EF4444",border:"none"}}><I n="trash" sz={14} c="#EF4444"/>Delete</button>
        </div>
      </div>}

      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Journey</div>
        <div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
          {STAGES.filter(function(s){return s.key!=="bgroup"&&s.key!=="ateam"}).map(function(s,i,arr){var dn=person.stages&&person.stages[s.key]&&person.stages[s.key].completed;var cur=person.currentStage===s.key;var dt=person.stages&&person.stages[s.key]?person.stages[s.key].date:null;return <div key={s.key}><div style={{display:"flex",alignItems:"center",gap:14,padding:"6px 0",opacity:dn||cur?1:0.3}}><div style={{width:12,height:12,borderRadius:"50%",flexShrink:0,background:dn||cur?s.grad:"var(--divider)"}}/><div style={{flex:1,fontSize:12,fontWeight:600,color:dn||cur?"var(--text)":"var(--text-muted)"}}>{s.label}{cur&&<span style={{fontSize:9,fontWeight:700,color:stColor,marginLeft:6,background:"var(--primary)10",padding:"2px 6px",borderRadius:4}}>CURRENT</span>}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>{dt?fmtS(dt):""}</div></div>{i<arr.length-1&&<div style={{marginLeft:5,width:2,height:6,background:dn?s.color:"var(--divider)"}}/>}</div>})}
        </div>
      </div>
      {(function(){var ms=(person.milestones||{})[person.currentStage]||{};var upMs=function(data){var allMs={...(person.milestones||{})};allMs[person.currentStage]={...ms,...data};p.onUpdate({...person,milestones:allMs})};
        if(person.currentStage==="salvation")return <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Salvation Details</div><div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px"}}><div style={{fontSize:11,color:"var(--text-muted)",marginBottom:4}}>Date Saved</div><input type="date" value={ms.dateSaved||""} onChange={function(e){upMs({dateSaved:e.target.value})}} style={{padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12}}/></div></div>;
        if(person.currentStage==="baptism")return <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Baptism Details</div><div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px"}}><div style={{fontSize:11,color:"var(--text-muted)",marginBottom:4}}>Date Baptized</div><input type="date" value={ms.dateBaptized||""} onChange={function(e){upMs({dateBaptized:e.target.value})}} style={{padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12}}/></div></div>;
        if(person.currentStage==="next-steps")return <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Next Steps Progress</div><div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px"}}>{[{k:"textSent",l:"Text/Email Sent"},{k:"registered",l:"Registered"},{k:"attended",l:"Attended"}].map(function(item){return <div key={item.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><input type="checkbox" checked={!!ms[item.k]} onChange={function(){var nd={};nd[item.k]=!ms[item.k];if(!ms[item.k])nd[item.k+"Date"]=new Date().toISOString().split("T")[0];upMs(nd)}} style={{width:16,height:16,accentColor:"#FBBF24"}}/><span style={{fontSize:12,color:"var(--text)",flex:1}}>{item.l}</span>{ms[item.k]&&<input type="date" value={ms[item.k+"Date"]||""} onChange={function(e){var nd={};nd[item.k+"Date"]=e.target.value;upMs(nd)}} style={{padding:"4px 8px",borderRadius:6,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:11,width:130}}/>}</div>})}</div></div>;
        return null})()}
      {(function(){var nsMs=(person.milestones||{})["next-steps"]||{};var bgMs=(person.milestones||{}).bgroup||{};var atMs=(person.milestones||{}).ateam||{};var hasBG=person.stages&&person.stages.bgroup&&person.stages.bgroup.completed;var hasAT=person.stages&&person.stages.ateam&&person.stages.ateam.completed;
        var toggleBG=function(){var newStages={...person.stages};var newCurrent=person.currentStage;if(hasBG){delete newStages.bgroup;var atDone=newStages.ateam&&newStages.ateam.completed;newCurrent=atDone?"ateam":"next-steps"}else{newStages.bgroup={date:new Date().toISOString(),completed:true};if(SIDX.bgroup>SIDX[newCurrent])newCurrent="bgroup"}p.onUpdate({...person,stages:newStages,currentStage:newCurrent})};
        var toggleAT=function(){var newStages={...person.stages};var newCurrent=person.currentStage;if(hasAT){delete newStages.ateam;var bgDone=newStages.bgroup&&newStages.bgroup.completed;newCurrent=bgDone?"bgroup":"next-steps"}else{newStages.ateam={date:new Date().toISOString(),completed:true};if(SIDX.ateam>SIDX[newCurrent])newCurrent="ateam"}p.onUpdate({...person,stages:newStages,currentStage:newCurrent})};
        var saveBGLeader=function(v){var allMs={...(person.milestones||{})};allMs.bgroup={...(allMs.bgroup||{}),bGroupLeader:v};allMs["next-steps"]={...(allMs["next-steps"]||{}),bGroupLeader:v};p.onUpdate({...person,milestones:allMs})};
        var saveATArea=function(v){var allMs={...(person.milestones||{})};allMs.ateam={...(allMs.ateam||{}),aTeamArea:v};allMs["next-steps"]={...(allMs["next-steps"]||{}),aTeamArea:v};p.onUpdate({...person,milestones:allMs})};
        return <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:8}}>Plug-In Status</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={toggleBG} style={{flex:1,padding:"14px 16px",borderRadius:14,border:hasBG?"2px solid #EC4899":"2px dashed var(--inp-border)",background:hasBG?"#EC489910":"var(--inp)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:hasBG?8:0}}>
                <div style={{width:20,height:20,borderRadius:6,background:hasBG?"#EC4899":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{hasBG&&<I n="check" sz={12} c="#fff"/>}</div>
                <span style={{fontSize:13,fontWeight:600,color:hasBG?"#EC4899":"var(--text-muted)"}}>BGroup</span>
                {hasBG&&<span style={{fontSize:10,color:"var(--text-muted)",marginLeft:"auto"}}>{fmtS(person.stages.bgroup.date)}</span>}
              </div>
              {hasBG&&<div onClick={function(e){e.stopPropagation()}} style={{marginTop:4}}><input style={{width:"100%",padding:"6px 10px",borderRadius:8,border:"1px solid #EC489930",background:"var(--card)",color:"var(--text)",fontSize:11,boxSizing:"border-box",outline:"none"}} placeholder="Group Leader" value={nsMs.bGroupLeader||bgMs.bGroupLeader||""} onChange={function(e){saveBGLeader(e.target.value)}}/></div>}
            </button>
            <button onClick={toggleAT} style={{flex:1,padding:"14px 16px",borderRadius:14,border:hasAT?"2px solid #34D399":"2px dashed var(--inp-border)",background:hasAT?"#34D39910":"var(--inp)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:hasAT?8:0}}>
                <div style={{width:20,height:20,borderRadius:6,background:hasAT?"#34D399":"var(--divider)",display:"flex",alignItems:"center",justifyContent:"center"}}>{hasAT&&<I n="check" sz={12} c="#fff"/>}</div>
                <span style={{fontSize:13,fontWeight:600,color:hasAT?"#34D399":"var(--text-muted)"}}>ATeam</span>
                {hasAT&&<span style={{fontSize:10,color:"var(--text-muted)",marginLeft:"auto"}}>{fmtS(person.stages.ateam.date)}</span>}
              </div>
              {hasAT&&<div onClick={function(e){e.stopPropagation()}} style={{marginTop:4}}><select style={{width:"100%",padding:"6px 10px",borderRadius:8,border:"1px solid #34D39930",background:"var(--card)",color:"var(--text)",fontSize:11,cursor:"pointer"}} value={nsMs.aTeamArea||atMs.aTeamArea||""} onChange={function(e){saveATArea(e.target.value)}}><option value="">Select Area...</option>{["Worship","Production","Kids","Youth","Hospitality","Creative","Admin","Outreach"].map(function(a){return <option key={a} value={a}>{a}</option>})}</select></div>}
            </button>
          </div>
          {hasBG&&hasAT&&!person.fullyConnected&&<button onClick={function(){p.onUpdate({...person,fullyConnected:true,fullyConnectedDate:new Date().toISOString()})}} style={{width:"100%",marginTop:12,padding:"16px 20px",borderRadius:14,border:"2px solid #F59E0B",background:"linear-gradient(135deg,#FEF3C7,#FDE68A)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}} onMouseEnter={function(e){e.currentTarget.style.background="linear-gradient(135deg,#F59E0B,#FBBF24)";e.currentTarget.style.color="#fff"}} onMouseLeave={function(e){e.currentTarget.style.background="linear-gradient(135deg,#FEF3C7,#FDE68A)";e.currentTarget.style.color="#92400E"}}><span style={{fontSize:20}}>{"⭐"}</span><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:700,color:"inherit"}}>Mark as Fully Connected</div><div style={{fontSize:11,fontWeight:500,opacity:0.7}}>In a BGroup and on the ATeam</div></div></button>}
          {person.fullyConnected&&<div style={{marginTop:12,background:"linear-gradient(135deg,#F59E0B10,#FBBF2410)",border:"2px solid #F59E0B30",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>{"⭐"}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#F59E0B"}}>Fully Connected</div><div style={{fontSize:11,color:"var(--text-muted)"}}>Completed {fmt(person.fullyConnectedDate)}</div></div></div>}
        </div>})()}
      {(function(){var entries=[];var allMs=person.milestones||{};var stages=person.stages||{};STAGES.forEach(function(s){var stData=stages[s.key];var ms=allMs[s.key]||{};if(!stData||!stData.completed)return;if(s.key==="salvation"&&ms.dateSaved)entries.push({date:ms.dateSaved,label:"Saved",color:s.color,bold:true});if(s.key==="baptism"&&ms.dateBaptized)entries.push({date:ms.dateBaptized,label:"Baptized",color:s.color,bold:true});if(s.key==="next-steps"&&ms.attended)entries.push({date:ms.attendedDate||stData.date,label:"Next Steps: Attended",color:s.color,bold:false});if(s.key==="bgroup")entries.push({date:stData.date,label:"Joined BGroup"+(((allMs["next-steps"]||{}).bGroupLeader||ms.bGroupLeader)?" \u2014 "+((allMs["next-steps"]||{}).bGroupLeader||ms.bGroupLeader):""),color:s.color,bold:true});if(s.key==="ateam")entries.push({date:stData.date,label:"Joined ATeam"+(((allMs["next-steps"]||{}).aTeamArea||ms.aTeamArea)?" \u2014 "+((allMs["next-steps"]||{}).aTeamArea||ms.aTeamArea):""),color:s.color,bold:true})});if(person.fullyConnected)entries.push({date:person.fullyConnectedDate||new Date().toISOString(),label:"\u2B50 Fully Connected",color:"#F59E0B",bold:true});entries.sort(function(a,b){return new Date(a.date)-new Date(b.date)});if(entries.length===0)return null;var jDur=person.fullyConnected&&entries.length>=2?Math.round((new Date(entries[entries.length-1].date)-new Date(person.createdAt))/864e5):null;return <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Timeline</div><div style={{background:"var(--card)",borderRadius:14,padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>{entries.map(function(e,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderTop:i>0?"1px solid var(--divider)":"none"}}><div style={{width:8,height:8,borderRadius:"50%",background:e.color,marginTop:5,flexShrink:0}}/><div style={{flex:1,fontSize:12,fontWeight:e.bold?600:400,color:e.bold?"var(--text)":"var(--text-sub)"}}>{e.label}</div><div style={{fontSize:10,color:"var(--text-muted)",flexShrink:0}}>{fmtS(e.date)}</div></div>})}{jDur!==null&&<div style={{borderTop:"1px solid var(--divider)",paddingTop:8,marginTop:4,fontSize:11,color:"#F59E0B",fontWeight:600,textAlign:"center"}}>Journey: {jDur} days from First Visit to Fully Connected</div>}</div></div>})()}

      <div>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Notes</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}><input style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:12,boxSizing:"border-box",outline:"none"}} placeholder="Add a note..." value={note} onChange={function(e){setNote(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")sNote()}}/><Btn label="Save" onClick={sNote} v="ghost" sx={{padding:"7px 12px",fontSize:11}}/></div>
        {(person.notes||[]).slice().reverse().map(function(n,i){return <div key={i} style={{borderTop:"1px solid var(--divider)",padding:"8px 0"}}><div style={{fontSize:10,color:"var(--text-muted)",marginBottom:2}}>{fmt(n.date)}</div><div style={{fontSize:12,color:"var(--text-sub)",lineHeight:1.6}}>{n.text}</div></div>})}
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
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {enabled.map(function(fd){
        if(fd.key==="currentStage")return <div key={fd.key}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{fd.label}</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f.currentStage||"first-visit"} onChange={function(e){setF({...f,currentStage:e.target.value})}}>{STAGES.map(function(s){return <option key={s.key} value={s.key}>{s.label}</option>})}</select></div>;
        if(fd.type==="dropdown")return <div key={fd.key}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>{fd.label}</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f[fd.key]||""} onChange={function(e){var nf={...f};nf[fd.key]=e.target.value;setF(nf)}}><option value="">Select...</option>{(fd.options||[]).map(function(o){return <option key={o} value={o}>{o}</option>})}</select></div>;
        if(fd.type==="checkbox")return <div key={fd.key} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0"}}><input type="checkbox" checked={!!f[fd.key]} onChange={function(e){var nf={...f};nf[fd.key]=e.target.checked;setF(nf)}} style={{width:18,height:18,accentColor:"var(--primary)"}}/><span style={{fontSize:13,color:"var(--text)"}}>{fd.label}</span></div>;
        return <Field key={fd.key} label={fd.label+(fd.required?" *":"")} value={f[fd.key]||""} onChange={function(v){var nf={...f};nf[fd.key]=v;setF(nf)}} placeholder={fd.label}/>;
      })}
      {p.teams.length>0&&<div style={{gridColumn:"span 2"}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",marginBottom:6}}>Assign To</div><select style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text)",fontSize:13,cursor:"pointer",boxSizing:"border-box"}} value={f.assignedTo} onChange={function(e){setF({...f,assignedTo:e.target.value})}}><option value="">Unassigned</option>{p.teams.map(function(t){return <option key={t.id} value={t.id}>{t.name}</option>})}</select></div>}
    </div>
    <Btn label="Add to Pipeline" onClick={sub} sx={{width:"100%",marginTop:20,justifyContent:"center"}}/>
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
    <button onClick={function(){ref.current.click()}} style={{width:"100%",padding:28,borderRadius:16,border:"2px dashed var(--inp-border)",background:"var(--inp)",color:"var(--text-muted)",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:12}}>Choose CSV file</button>
    <textarea style={{width:"100%",minHeight:80,padding:14,borderRadius:12,border:"1px solid var(--inp-border)",background:"var(--inp)",color:"var(--text-sub)",fontFamily:"monospace",fontSize:12,resize:"vertical",boxSizing:"border-box",outline:"none"}} placeholder="Or paste CSV here..." value={csv} onChange={function(e){proc(e.target.value)}}/>
    {pv.length>0&&<div style={{marginTop:14,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{FLD.map(function(fld){return <th key={fld} style={{padding:"8px 10px",fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",textAlign:"left",borderBottom:"1px solid var(--divider)",background:"var(--th-bg)"}}>{LBL[fld]}</th>})}</tr></thead><tbody>{pv.map(function(r,i){return <tr key={i}>{FLD.map(function(fld){return <td key={fld} style={{padding:"6px 10px",fontSize:12,color:"var(--text-sub)",borderBottom:"1px solid var(--divider)"}}>{r[fld]||"\u2014"}</td>})}</tr>})}</tbody></table></div>}
    <Btn label="Import" onClick={run} sx={{width:"100%",marginTop:14,justifyContent:"center"}}/>
  </Modal>;
}

/* ══════ APP SHELL ══════ */
export default function App(){
  var [people,setPeople]=useState([]);var [tpl,setTpl]=useState(DEFAULT_TPL);var [teams,setTeams]=useState([]);var [rules,setRules]=useState([]);
  var [config,setConfig]=useState({theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS});
  var [view,setView]=useState("overview");var [sf,setSf]=useState(null);var [sel,setSel]=useState(null);var [add,setAdd]=useState(false);var [imp,setImp]=useState(false);var [search,setSearch]=useState("");var [ready,setReady]=useState(false);var [contactTarget,setContactTarget]=useState(null);

  useEffect(function(){Promise.all([db.get("ce5-people",[]),db.get("ce5-tpl",DEFAULT_TPL),db.get("ce5-teams",[]),db.get("ce5-rules",[]),db.get("ce5-config",{theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS})]).then(function(res){setPeople(res[0]);setTpl({...DEFAULT_TPL,...res[1]});setTeams(res[2]);setRules(res[3]);setConfig({theme:"light",colorway:"purple",checkInTypes:DEFAULT_CI,formFields:DEFAULT_FIELDS,...res[4]});setReady(true)})},[]);
  useEffect(function(){if(ready)db.set("ce5-people",people)},[people,ready]);
  useEffect(function(){if(ready)db.set("ce5-tpl",tpl)},[tpl,ready]);
  useEffect(function(){if(ready)db.set("ce5-teams",teams)},[teams,ready]);
  useEffect(function(){if(ready)db.set("ce5-rules",rules)},[rules,ready]);
  useEffect(function(){if(ready)db.set("ce5-config",config)},[config,ready]);

  /* Run automation */
  useEffect(function(){if(!ready||rules.length===0||people.length===0)return;var changed=false;var updated=people.map(function(x){var np={...x};rules.filter(function(r){return r.enabled}).forEach(function(r){if(r.trigger==="days-no-contact"){var d=ago(x.lastContactDate);if(d===null||d>=r.days){if(r.action==="notify"){var already=(x.notes||[]).some(function(n){return n.text.includes("[AUTO]")&&ago(n.date)<=1});if(!already){np={...np,notes:[...(np.notes||[]),{text:"[AUTO] No contact for "+(d||"?")+" days",date:new Date().toISOString()}]};changed=true}}}}});return np});if(changed)setPeople(updated)},[ready,rules]);

  var nav=function(v,s){setView(v);setSf(s||null);setSel(null);setSearch("")};
  window.__ceNav=nav;
  var theme=THEMES[config.theme||"light"];var cw=COLORWAYS[config.colorway||"purple"];
  var cssVars={"--bg":theme.bg,"--card":theme.card,"--card-solid":config.theme==="dark"?"#1E1B4B":"#fff","--card-border":theme.cardBorder,"--text":theme.text,"--text-sub":theme.textSub,"--text-muted":theme.textMuted,"--inp":theme.inp,"--inp-border":theme.inpBorder,"--divider":theme.divider,"--hover":theme.hover,"--th-bg":theme.thBg,"--primary":cw.primary,"--primary-grad":cw.primaryGrad,"--accent":cw.accent,"--sidebar":cw.sidebar,"--logo":cw.logo};

  var countForStage=function(key){
    if(key==="bgroup")return people.filter(function(x){return x.stages&&x.stages.bgroup&&x.stages.bgroup.completed}).length;
    if(key==="ateam")return people.filter(function(x){return x.stages&&x.stages.ateam&&x.stages.ateam.completed}).length;
    if(key==="fully-connected")return people.filter(function(x){return x.fullyConnected}).length;
    return people.filter(function(x){return x.currentStage===key}).length;
  };
  var sideItems=[{key:"overview",icon:"home",label:"Overview",vw:"overview"},{key:"all",icon:"users",label:"All People",vw:"people"},{type:"divider"}].concat(STAGES.map(function(s){return{key:s.key,label:s.label,color:s.color,vw:"people",sf:s.key}})).concat([{key:"fully-connected",label:"Fully Connected",color:"#F59E0B",icon:"target",vw:"connected"},{type:"divider"},{key:"assigned",icon:"card",label:"Assigned Cards",vw:"assigned"},{key:"quick",icon:"plus",label:"Quick Entry",vw:"quick"},{key:"bulk",icon:"send",label:"Bulk Message",vw:"bulk"},{key:"reports",icon:"chart",label:"Reports",vw:"reports"},{type:"divider"},{key:"settings",icon:"gear",label:"Settings",vw:"settings"}]);
  var activeKey=view==="overview"?"overview":view==="settings"?"settings":view==="quick"?"quick":view==="bulk"?"bulk":view==="reports"?"reports":view==="assigned"?"assigned":view==="connected"?"fully-connected":(sf||"all");

  return <div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans',sans-serif",background:"var(--bg)",color:"var(--text)",...cssVars}}>
    <style>{["@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');","*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}","::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#64748B;border-radius:3px}","@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}","@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}","input:focus,textarea:focus,select:focus{outline:none;border-color:var(--primary) !important;box-shadow:0 0 0 3px var(--primary)20 !important}","button{cursor:pointer;font-family:'DM Sans',sans-serif}button:active{transform:scale(0.97)}"].join("\n")}</style>
    <aside style={{width:240,background:"var(--sidebar)",display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",position:"sticky",top:0,boxShadow:"4px 0 24px rgba(0,0,0,0.1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"22px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{width:38,height:38,borderRadius:12,background:"var(--logo)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
        <div><div style={{fontSize:15,fontWeight:700,color:"#fff",lineHeight:1.2}}>Connection</div><div style={{fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.5)",letterSpacing:"0.04em"}}>ENGINE</div></div>
      </div>
      <nav style={{flex:1,padding:"10px 12px",overflowY:"auto"}}>{sideItems.map(function(item,i){if(item.type==="divider")return <div key={"d"+i} style={{height:1,background:"rgba(255,255,255,0.06)",margin:"8px 12px"}}/>;var active=activeKey===item.key;return <button key={item.key} onClick={function(){nav(item.vw,item.sf)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:10,border:"none",fontSize:12,fontWeight:active?600:500,background:active?"rgba(255,255,255,0.12)":"transparent",color:active?"#fff":"rgba(255,255,255,0.45)",textAlign:"left",marginBottom:1}}>{item.icon?<I n={item.icon} sz={15} c={active?"#fff":"rgba(255,255,255,0.35)"}/>:<span style={{width:7,height:7,borderRadius:"50%",background:item.color,display:"inline-block"}}/>}<span style={{flex:1}}>{item.label}</span>{item.color&&<span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)"}}>{countForStage(item.key)}</span>}</button>})}</nav>
      <div style={{padding:"12px"}}>
        <button style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"none",background:"rgba(255,255,255,0.12)",color:"#fff",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={function(){setAdd(true)}}><I n="plus" sz={14} c="#fff"/>Add Person</button>
        <div style={{marginTop:10,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,display:"flex",justifyContent:"space-between"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>{people.length}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontWeight:600}}>Tracked</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"#F59E0B"}}>{people.filter(function(x){return x.fullyConnected}).length}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontWeight:600}}>Connected</div></div>
          <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:"#EF4444"}}>{people.filter(function(x){return!x.fullyConnected&&(ago(x.lastContactDate)===null||ago(x.lastContactDate)>3)}).length}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontWeight:600}}>Overdue</div></div>
        </div>
      </div>
    </aside>
    <main style={{flex:1,overflowY:"auto",minHeight:"100vh"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 32px",borderBottom:"1px solid var(--divider)",marginBottom:24,position:"sticky",top:0,background:config.theme==="dark"?"rgba(15,23,42,0.92)":"rgba(240,242,245,0.92)",zIndex:50}}>
        <div style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
        <Btn icon="upload" label="Import" onClick={function(){setImp(true)}} v="ghost" sx={{padding:"7px 14px",fontSize:12}}/>
      </div>
      <div style={{padding:"0 32px 32px",animation:"fadeUp 0.4s ease"}}>
        {!ready?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,color:"var(--text-muted)"}}><div style={{fontWeight:600}}>Loading...</div></div>
        :view==="overview"?<Overview people={people} teams={teams} onPerson={setSel} navTo={nav} onAdd={function(){setAdd(true)}} onImport={function(){setImp(true)}} templates={tpl} config={config} onContact={setContactTarget}/>
        :view==="settings"?<Settings templates={tpl} setTemplates={setTpl} people={people} setPeople={setPeople} teams={teams} setTeams={setTeams} rules={rules} setRules={setRules} config={config} setConfig={setConfig}/>
        :view==="quick"?<QuickEntry onAdd={function(x){setPeople(function(prev){return[...prev,x]})}} teams={teams} config={config}/>
        :view==="bulk"?<BulkMessage people={people} templates={tpl}/>
        :view==="reports"?<Reports people={people} teams={teams} config={config} onPerson={setSel}/>
        :view==="assigned"?<AssignedCards people={people} teams={teams} onPerson={setSel} templates={tpl} config={config} onContact={setContactTarget} onUpdate={function(u){setPeople(function(prev){return prev.map(function(x){return x.id===u.id?u:x})})}}/>
        :view==="connected"?<FullyConnected people={people} onPerson={setSel}/>
        :<PeopleView people={people} teams={teams} stageFilter={sf} search={search} setSearch={setSearch} onPerson={setSel} onImport={function(){setImp(true)}} onDelete={function(id){setPeople(function(prev){return prev.filter(function(x){return x.id!==id})})}}/>}
      </div>
    </main>
    {sel&&<Panel person={sel} teams={teams} templates={tpl} config={config} onClose={function(){setSel(null)}} onUpdate={function(u){setPeople(function(prev){return prev.map(function(x){return x.id===u.id?u:x})});setSel(u)}} onDelete={function(id){setPeople(function(prev){return prev.filter(function(x){return x.id!==id})});setSel(null)}}/> }
    {add&&<AddModal onClose={function(){setAdd(false)}} onAdd={function(x){setPeople(function(prev){return[...prev,x]})}} teams={teams} config={config}/>}
    {imp&&<ImportModal onClose={function(){setImp(false)}} onImport={function(arr){setPeople(function(prev){return[...prev,...arr]})}}/>}
    {contactTarget&&<ContactAction person={contactTarget} message={tplFor(contactTarget,tpl)} email={emailFor(contactTarget,config)} onClose={function(){setContactTarget(null)}}/>}
  </div>;
}
