import {randomId} from './data';
// Safe migration path: the user supplies an outline or a StudyMap JSON file.
// A MindMeister share URL is saved as provenance; no cross-origin scraping is attempted.
export function parseOutline(text){
 const lines=text.split(/\r?\n/).filter(x=>x.trim()); if(!lines.length)throw Error('Paste some outline text first');
 if(lines.length>300)throw Error('Import up to 300 topics at a time');
 const out=[], stack=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i], indent=(line.match(/^\s*/)||[''])[0].replace(/\t/g,'  ').length;
  const label=line.trim().replace(/^(?:[-*•]\s*|\d+[.)]\s*)/,'').slice(0,140);
  if(!label)continue;
  while(stack.length&&stack.at(-1).indent>=indent)stack.pop();
  const parent=stack.at(-1);const depth=stack.length;
  const id=randomId();out.push({id,label,parentId:parent?.id||null,x:depth*245,y:i*85-(depth*25),color:depth===0?'#6b5cff':'#e7e2ff',notes:'',image:''});stack.push({id,indent});
 }
 return out;
}
export function parseJSON(text){
 const obj=JSON.parse(text);if(!Array.isArray(obj.nodes)||obj.nodes.length>1000)throw Error('Invalid StudyMap JSON');
 const ids=new Set();const nodes=obj.nodes.map((n,i)=>{
  const id=randomId();ids.add(n.id);return {...n,_old:n.id,id,x:Number(n.x)||0,y:Number(n.y)||0,label:String(n.label||'Topic').slice(0,140),notes:String(n.notes||'').slice(0,15000),image:String(n.image||'').slice(0,1000),color:String(n.color||'#e7e2ff').slice(0,30)};
 });
 const idsByOld=new Map(nodes.map(n=>[n._old,n.id]));return nodes.map(({_old,...n})=>({...n,parentId:idsByOld.get(n.parentId)||null}));
}
