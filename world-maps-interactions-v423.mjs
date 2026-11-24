/* Pure, additive interactions for World Maps 4.2.3. Schema 1 remains unchanged. */
export const RESIZE_STEP = 1.2;
export function resizeAnnotation(obj, direction) {
  const factor=direction==='enlarge'?RESIZE_STEP:1/RESIZE_STEP;
  const prop=obj.kind==='stamp'?'scale':obj.kind==='text'?'fontSize':obj.kind==='stroke'?'width':null;
  const round=n=>Math.round(n*1e9)/1e9;
  if(obj.kind==='shape') { obj.w=round(obj.w*factor);obj.h=round(obj.h*factor);return; }
  if(prop){const fallback={scale:1,fontSize:30,width:3}[prop];obj[prop]=round(Math.max(.01,Math.min(10000,(obj[prop]||fallback)*factor)));}
}
export function copyAnnotation(obj, newId, offset=30) {
  const next=structuredClone(obj);
  next.id=newId;
  // A copy is independent; source provenance must not trigger cross-map duplicate suppression.
  next.source=null;
  if(next.kind==='stroke')next.points=(next.points||[]).map(([x,y])=>[x+offset,y+offset]);
  else {next.x=(next.x||0)+offset;next.y=(next.y||0)+offset;}
  return next;
}
