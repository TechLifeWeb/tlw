(function(root){
'use strict';
const LABELS={progress:'next_action_in_progress',waiting:'next_action_waiting'};
function status(t){return t._done?'done':t.labels?.includes(LABELS.waiting)?'waiting':t.labels?.includes(LABELS.progress)?'progress':'todo';}
function labelsFor(t,state){const labels=(t.labels||[]).filter(x=>!Object.values(LABELS).includes(x));if(LABELS[state])labels.push(LABELS[state]);return labels;}
function day(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function age(at,now=Date.now()){return Math.max(0,Math.floor((now-Number(at))/86400000))||0;}
function visible(tasks,{project='',query='',filter='open',reviews={},today=day()}){return tasks.filter(t=>(!project||String(t.project_id)===project)&&(!query||(t.content+' '+(t.description||'')).toLowerCase().includes(query.toLowerCase()))&&(filter==='done'?t._done:!t._done&&(filter==='today'?t.due?.date?.slice(0,10)<=today:filter==='review'?age(reviews[t.id])>=7:true)));}
function sorted(tasks,sort){return [...tasks].sort((a,b)=>sort==='priority'?(b.priority-a.priority)||(a.due?.date||'9999').localeCompare(b.due?.date||'9999'):sort==='added'?(b.added_at||'').localeCompare(a.added_at||''):(a.due?.date||'9999').localeCompare(b.due?.date||'9999')||b.priority-a.priority);}
function editPatch(base,latest,input){const patch={};for(const key of ['content','description','priority']){if(input[key]!==base[key]){if(latest[key]!==base[key])throw Error('This task changed in Todoist while you were editing. Your draft is still here. Close and reopen it to compare before saving.');patch[key]=input[key];}}if(input.dueChanged){if(JSON.stringify(latest.due)!==JSON.stringify(base.due))throw Error('The schedule changed in Todoist. Close and reopen this task before changing its schedule.');patch.due_string=input.due.trim()||'no date';patch.due_lang='en';}return patch;}
async function allPages(get,path){const result=[],seen=new Set();let cursor='';do{const page=await get(path+'?limit=200'+(cursor?'&cursor='+encodeURIComponent(cursor):''));if(!Array.isArray(page?.results))throw Error('Unexpected Todoist response. Please refresh.');result.push(...page.results);cursor=page.next_cursor||'';if(cursor&&seen.has(cursor))throw Error('Todoist returned a repeated page. Please refresh.');seen.add(cursor);}while(cursor);return result;}
const api={LABELS,status,labelsFor,day,age,visible,sorted,editPatch,allPages};root.NextAction=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
