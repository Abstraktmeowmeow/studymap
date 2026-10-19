import {collection,doc,addDoc,setDoc,updateDoc,deleteDoc,getDoc,getDocs,onSnapshot,query,where,writeBatch,serverTimestamp} from 'firebase/firestore';
import {db} from './firebase';
export const mapDoc=id=>doc(db,'maps',id);
export const nodeDoc=(id,nodeId)=>doc(db,'maps',id,'nodes',nodeId);
export const randomId=()=>crypto.randomUUID();
export const initialNodes=()=>[{id:randomId(),label:'Central Idea',parentId:null,x:0,y:0,color:'#6b5cff',notes:'',image:''}];
export async function newMap(uid,title='Untitled mind map',folderId='') {
 const m=doc(collection(db,'maps')); const batch=writeBatch(db);
 batch.set(m,{title:title.slice(0,120),owner:uid,folderId,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
 batch.set(doc(db,'maps',m.id,'members',uid),{role:'owner',joinedAt:serverTimestamp()});
 batch.set(doc(db,'users',uid,'mapIndex',m.id),{mapId:m.id,role:'owner',addedAt:serverTimestamp()});
 for(const n of initialNodes()) batch.set(nodeDoc(m.id,n.id),n);
 await batch.commit(); return m.id;
}
export async function renameMap(id,title){await updateDoc(mapDoc(id),{title:title.slice(0,120),updatedAt:serverTimestamp()})}
export function subscribeIndex(uid,cb,error){return onSnapshot(collection(db,'users',uid,'mapIndex'),s=>cb(s.docs.map(d=>d.data())),error)}
export function subscribeFolders(uid,cb,error){return onSnapshot(collection(db,'users',uid,'folders'),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),error)}
export async function addFolder(uid,name){return addDoc(collection(db,'users',uid,'folders'),{name:name.slice(0,80),createdAt:serverTimestamp()})}
export async function saveNode(id,n){await setDoc(nodeDoc(id,n.id),n)}
export async function eraseNode(id,nid){await deleteDoc(nodeDoc(id,nid))}
export async function createInvite(mapId,role='editor'){
 const id=randomId()+randomId();
 await setDoc(doc(db,'invites',id),{mapId,role,createdAt:serverTimestamp()});
 return `${location.origin}/?invite=${encodeURIComponent(id)}`;
}
export async function acceptInvite(uid,token){
 const invite=await getDoc(doc(db,'invites',token)); if(!invite.exists())throw Error('This invite is invalid or revoked');
 const {mapId,role}=invite.data(); const member=doc(db,'maps',mapId,'members',uid);
 await setDoc(member,{role,inviteId:token,joinedAt:serverTimestamp()});
 await setDoc(doc(db,'users',uid,'mapIndex',mapId),{mapId,role,addedAt:serverTimestamp()});
 return mapId;
}
export async function moveMap(id,folderId){await updateDoc(mapDoc(id),{folderId})}
export async function removeMapFromMine(uid,mapId,owner){
 if(owner===uid){
  // Each node, member and index is a distinct document. Deletion is deliberately not offered
  // until a secure server-side cascading deletion flow is configured.
  throw Error('Owner deletion is not yet enabled. Export your map; archival is planned.');
 }
 await deleteDoc(doc(db,'maps',mapId,'members',uid));
 await deleteDoc(doc(db,'users',uid,'mapIndex',mapId));
}
export {collection,doc,onSnapshot,query,where,getDoc,getDocs,writeBatch,serverTimestamp};
