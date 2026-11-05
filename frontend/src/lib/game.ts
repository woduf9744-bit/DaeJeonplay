export type Category = "food" | "explore" | "culture" | "experience" | "science";
export const CATEGORIES: Record<Category,{name:string; short:string;color:string;light:string}> = {
  food:{name:"맛집", short:"먹고", color:"#ED975D", light:"#FFF0E4"},
  explore:{name:"탐험",short:"걷고",color:"#56A17C",light:"#E5F4EB"},
  culture:{name:"문화",short:"알고",color:"#9C83D4",light:"#F0EBFB"},
  experience:{name:"체험",short:"만들고",color:"#6D9FBC",light:"#E7F3F9"},
  science:{name:"과학",short:"궁금해하고",color:"#D8AA4B",light:"#FCF4DE"}
};
export type Place = { id:string; name:string; cat:Category; sub:string; region:string; district:string; zone:string; img:string; xp:number; mins:number; indoor:boolean; drive:boolean; tags:string[]; desc:string;mission:string;query:string;source:string;tip:string };
export type Festival = {id:string;name:string;cat:Category;xp:number;month:string; start:string;end:string;dateLabel:string;location:string;summary:string;mission:string;source:string;notice?:string;extraSource?:string};
export type Progress = { done:string[]; favourites:string[]; notes:Record<string,string>; };
export const EMPTY_PROGRESS:Progress = {done:[],favourites:[],notes:{}};
export function readProgress():Progress {try {const raw=JSON.parse(localStorage.getItem('daejeonplay-animated-progress')||'null') as Partial<Progress>|null; return {done:Array.isArray(raw?.done)?raw.done:[],favourites:Array.isArray(raw?.favourites)?raw.favourites:[],notes:raw?.notes&&typeof raw.notes==='object'?raw.notes:{}};}catch{return EMPTY_PROGRESS;}}
export function getTotals(done:string[], places:Place[], festivals:Festival[]){const totals:Record<Category,number>={food:0,explore:0,culture:0,experience:0,science:0};for(const id of done){const p=places.find(place=>place.id===id)||festivals.find(f=>f.id===id);if(p&&p.cat in totals) totals[p.cat]+=p.xp;}return totals;}
export function getLevel(xp:number){return 1+Math.floor(Math.max(0,xp)/100)}
export function getPartial(xp:number){return Math.max(0,xp)%100}
export function getBadges(done:string[],places:Place[],festivals:Festival[]){const cat=(id:string)=>places.find(p=>p.id===id)?.cat||festivals.find(f=>f.id===id)?.cat;
const types=new Set(done.map(cat));return [
{label:'첫 발걸음',detail:'첫 퀘스트 완료',hit:done.length>=1},
{label:'골목 미식가',detail:'맛집 3곳 발견',hit:done.filter(id=>cat(id)==='food').length>=3},
{label:'길 위의 발견자',detail:'탐험 3곳 완료',hit:done.filter(id=>cat(id)==='explore').length>=3},
{label:'도시 이야기꾼',detail:'문화 2곳 완료',hit:done.filter(id=>cat(id)==='culture').length>=2},
{label:'과학 탐구자',detail:'과학 2곳 완료',hit:done.filter(id=>cat(id)==='science').length>=2},
{label:'대전의 다섯 빛',detail:'5개 분야 모두 탐험',hit:types.size>=5},
];}
export function selectRoute(places:Place[],opts:{theme:Category|'all';mins:number;wantIndoor:boolean;done:string[]}){
const candidates=places.filter(p=>!opts.done.includes(p.id) && (!opts.wantIndoor||p.indoor));
const order=[...candidates].sort((a,b)=>{
 const as=(opts.theme==='all'?0:a.cat===opts.theme?100:-20)+(a.tags.includes('골목 탐색')?18:0)+Math.max(0,70-a.mins)/5;
 const bs=(opts.theme==='all'?0:b.cat===opts.theme?100:-20)+(b.tags.includes('골목 탐색')?18:0)+Math.max(0,70-b.mins)/5;
 return bs-as;
});
const result:Place[]=[];let remaining=opts.mins;
for(const p of order){if(result.length>=3)break;if(p.mins+15<=remaining){result.push(p);remaining-=p.mins+15;}}
if(!result.length && order.length)result.push(order[0]);
return result;
}
