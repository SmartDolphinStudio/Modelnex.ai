export function safeChatRead(key:string){try{return localStorage.getItem(key)}catch{return null}}
// Versioned, bounded browser-only chat storage. Legacy unscoped data is not imported.
export function chatKey(kind:'sessions'|'usage'){return `mn-chat-v4:${encodeURIComponent(safeChatRead('mn-user-id')||'guest')}:${kind}`}
export function validSessions(value:unknown):boolean {
 if(!Array.isArray(value)||value.length<1||value.length>100)return false;
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max;
 return value.every(s=>s&&typeof s==='object'&&text(s.id,160)&&text(s.title,500)&&text(s.updatedAt,64)&&Number.isFinite(Date.parse(s.updatedAt))&&(s.pinned===undefined||typeof s.pinned==='boolean')&&Array.isArray(s.messages)&&s.messages.length<=500&&s.messages.every((m:any)=>m&&text(m.id,160)&&['user','assistant'].includes(m.role)&&text(m.content,64000)&&text(m.timestamp,64)&&Number.isFinite(Date.parse(m.timestamp))&&(m.attachmentName===undefined||text(m.attachmentName,500))));
}
export function saveChat(key:string,value:unknown){try{const raw=JSON.stringify({version:4,data:value});if(raw.length>2_000_000)return false;localStorage.setItem(key,raw);return true}catch{return false}}
export function clearChatStorage(){try{for(const key of Object.keys(localStorage))if(key.startsWith('mn-chat-v4:')||key.startsWith('smart-dolphin-chat-sessions-')||key==='smart-dolphin-usage-v1')localStorage.removeItem(key)}catch{/* Memory state is discarded by full navigation on logout. */}}
