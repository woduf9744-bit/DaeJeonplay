import { useEffect, useMemo, useRef, useState } from "react";
import { animate as animeAnimate, stagger } from "animejs";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
 ArrowUpRight, ArrowRight, Award, Bookmark, BookmarkCheck, Camera, Check,
 ChevronDown, ChevronLeft, ChevronRight, Compass, ExternalLink, Footprints,
 Heart, Landmark, MapPin, Menu, Navigation, Play, Route, Search, Share2,
 SlidersHorizontal, Sparkles, Telescope, Ticket, UtensilsCrossed, X, CalendarDays,
 Clock3, Map, Lock, Leaf, ShieldCheck, CircleHelp
} from "lucide-react";
import GrowthCharts from "./components/GrowthCharts";
import placesRaw from "./data/places.json";
import festivalsRaw from "./data/festivals.json";
import photos from "./data/photos.json";
import {
 CATEGORIES, getBadges, getLevel, getPartial, getTotals, readProgress,
 selectRoute, type Category, type Place, type Festival, type Progress
} from "./lib/game";

const PLACES = placesRaw as Place[];
const FESTIVALS = festivalsRaw as Festival[];
const PHOTOS = photos as Record<string, { url:string;label:string;credit:string;source:string }>;
const TABS = [
 { id:"discover", label:"장소 탐험" }, {id:"planner",label:"코스 만들기"},
 {id:"festival",label:"대전의 축제"}, {id:"profile",label:"나의 도감"}
] as const;
type Tab = typeof TABS[number]["id"];
type Selected = {kind:"place"; data:Place}|{kind:"festival";data:Festival};
const ICONS:Record<Category,typeof Compass>={food:UtensilsCrossed,explore:Footprints,culture:Landmark,experience:Camera,science:Telescope};
const MAIN_IMAGE=PHOTOS.lake?.url || "";

function formatted(x:number){return x.toLocaleString("ko-KR");}
function festivalStatus(f:Festival){const today = new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Seoul"});return today<f.start?"예정":today>f.end?"지난 축제":"진행 중";}
function useAnimatedCount(value:number){const ref=useRef<HTMLSpanElement>(null);const previous=useRef(0);const reduced=useReducedMotion();useEffect(()=>{if(!ref.current)return;if(reduced){ref.current.textContent=formatted(value);previous.current=value;return;}const proxy={n:previous.current};const ctl=animeAnimate(proxy,{n:value,duration:680,ease:"outCubic",onUpdate:()=>{if(ref.current)ref.current.textContent=formatted(Math.round(proxy.n))}});previous.current=value;return()=>ctl.pause();},[value,reduced]);return ref;}
function Count({value}:{value:number}){const ref=useAnimatedCount(value);return <span ref={ref}>{formatted(value)}</span>;}
function Photo({photoKey,alt,className}:{photoKey:string;alt:string;className?:string}){const pic=PHOTOS[photoKey];const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[photoKey]);return <div className={`photo-frame ${className||""}`}>
 {pic&&!failed?<img src={pic.url} alt={alt} loading="lazy" onError={()=>setFailed(true)}/>:<div className="photo-fallback"><MapPin size={29}/><span>대전의 새로운 발견</span></div>}
 <span className="photo-credit">{pic?.label?.includes("실제")?"지역 사진":"이미지 참고"}</span>
 </div>}
function Brand({compact=false}:{compact?:boolean}){return <div className={`brand ${compact?"compact":""}`}><span className="brand-icon" aria-hidden="true"><Compass size={22} strokeWidth={2.4}/></span><span className="brand-word">대전<span>플레이</span><small>DAEJEON PLAY</small></span></div>}
function CategoryMark({cat}:{cat:Category}){const I=ICONS[cat];return <span className="cat-mark" style={{background:CATEGORIES[cat].light,color:CATEGORIES[cat].color}}><I size={16}/>{CATEGORIES[cat].name}</span>}
function placePhotos(p:Place){const list=[p.img];if(p.img==="lake")list.push("lake2");if(p.img==="lake2")list.push("lake");if(["mountain","hill","forest"].includes(p.img))list.push("mountain","forest");if(p.cat==="food")list.push("noodle","soup");if(p.cat==="culture")list.push("oldtown","culture");if(p.cat==="science")list.push("science","museum");return [...new Set(list)].filter(k=>PHOTOS[k]);}
function BadgePill({label}:{label:string}){return <span className="badge-pill">{label}</span>}

function PlaceCard({p,onOpen,onSave,saved,small=false}:{p:Place;onOpen:()=>void;onSave:()=>void;saved:boolean;small?:boolean}){
 return <motion.article layout whileHover={{y:-5}} transition={{duration:.22}} className={`place-card ${small?"place-small":""}`}>
 <button className="place-picture" type="button" onClick={onOpen} aria-label={`${p.name} 자세히 보기`}>
   <Photo photoKey={p.img} alt={`${p.name} 장소/주변 분위기 참고 이미지`}/>
   <span className="place-xp">+{p.xp} XP</span>
 </button>
 <div className="place-body"><div className="place-meta"><CategoryMark cat={p.cat}/><span>{p.district}</span></div>
  <button className="place-name" onClick={onOpen}>{p.name}<ArrowUpRight size={17}/></button>
  <p>{p.desc}</p><div className="place-bottom"><span><Clock3 size={14}/>{p.mins}분 예상 활동</span>
  <motion.button whileTap={{scale:.85}} className={`bookmark ${saved?"is-saved":""}`} onClick={onSave} title={saved?"찜 해제":"찜하기"} aria-label={saved?`${p.name} 찜 해제`:`${p.name} 찜하기`}>{saved?<BookmarkCheck size={18}/>:<Bookmark size={18}/>}</motion.button></div></div>
 </motion.article>
}

function Header({tab,setTab,openMenu,setOpenMenu}:{tab:Tab;setTab:(next:Tab)=>void;openMenu:boolean;setOpenMenu:(b:boolean)=>void}){
 return <header className="site-header"><div className="container header-inner"><button className="brand-button" type="button" onClick={()=>setTab("discover")} aria-label="대전플레이 홈"><Brand/></button>
 <nav className="desktop-nav" aria-label="주 메뉴">{TABS.map(item=><button key={item.id} onClick={()=>setTab(item.id)} className={`nav-link ${tab===item.id?"active":""}`}>{tab===item.id&&<motion.span layoutId="nav-active" className="nav-indicator" transition={{type:"spring",stiffness:400,damping:35}}/>}<span>{item.label}</span></button>)}</nav>
 <button className="header-cta" onClick={()=>setTab("planner")}>오늘의 탐험 <ArrowUpRight size={17}/></button>
 <motion.button whileTap={{scale:.94}} className="mobile-toggle" onClick={()=>setOpenMenu(!openMenu)} aria-label="메뉴 열기" aria-expanded={openMenu}>{openMenu?<X size={23}/>:<Menu size={23}/>}</motion.button></div>
 <AnimatePresence>{openMenu&&<motion.nav className="mobile-nav" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} aria-label="모바일 메뉴">{TABS.map(item=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>{setTab(item.id);setOpenMenu(false);}}>{item.label}<ArrowUpRight size={16}/></button>)}</motion.nav>}</AnimatePresence>
 </header>
}

function Hero({goPlanner,goExplore,totalXp,doneCount}:{goPlanner:()=>void;goExplore:()=>void;totalXp:number;doneCount:number}){
 return <section className="hero container"><div className="hero-copy"><div className="hero-kicker"><span className="kicker-square"/> EVERY STREET, A NEW STORY <span className="small-divider"/> 대전 로컬 탐험</div>
 <h1 className="hero-title"><span className="hero-line">익숙한 도시에서,</span><span className="hero-line highlight">처음 만나는 대전.</span></h1>
 <p className="hero-sub">골목의 간판 하나, 산책길의 풍경 하나.<br/>발견한 만큼 쌓이는 나만의 대전 탐험 기록.</p>
 <div className="hero-buttons"><motion.button whileHover={{scale:1.035}} whileTap={{scale:.97}} className="btn btn-primary" onClick={goPlanner}>나만의 코스 만들기 <ArrowRight size={18}/></motion.button><motion.button whileTap={{scale:.97}} className="btn btn-outline" onClick={goExplore}>장소 둘러보기 <ChevronDown size={18}/></motion.button></div>
 <div className="hero-facts"><span><Check size={15}/>지출 없이도 즐기는 미션</span><span><Check size={15}/>5개 분야별 레벨업</span></div>
 </div><div className="hero-art"><div className="hero-image"><Photo photoKey="lake" alt="대청댐과 호수 풍경"/><div className="hero-image-overlay"><span>DAEJEON SCENE / 001</span><strong>대청호에서 발견한 하루</strong><small>발견의 즐거움은 가까운 곳에도 있어.</small></div></div><motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.65}} className="floating-stamp"><span>MY ADVENTURE</span><b><Count value={totalXp}/><small> XP</small></b><span>{doneCount}곳의 기억</span></motion.div><div className="art-sub">대전의 오늘을 기록하다 <span>36° 21′ N</span></div></div></section>
}

function HomeStats({progress,totalXp}:{progress:Progress;totalXp:number}){return <section className="container stat-strip"><div><strong>21<span>곳</span></strong><small>직접 골라 담은 장소</small></div><div><strong>05<span>개</span></strong><small>서로 다른 탐험 레벨</small></div><div><strong><Count value={progress.done.length}/><span>개</span></strong><small>내가 완료한 퀘스트</small></div><div><strong><Count value={totalXp}/><span>XP</span></strong><small>지금까지 쌓인 경험</small></div></section>}

function Discover({progress,onOpen,onSave,filter,setFilter,search,setSearch}:{progress:Progress;onOpen:(p:Place)=>void;onSave:(id:string)=>void;filter:Category|'all';setFilter:(f:Category|'all')=>void;search:string;setSearch:(s:string)=>void}){
 const [showAll,setShowAll]=useState(false);
 const items=PLACES.filter(p=>(filter==="all"||p.cat===filter)&&[p.name,p.district,p.sub,...p.tags].join(" ").toLocaleLowerCase().includes(search.toLocaleLowerCase()));
 return <section className="container section-space" id="discover"><div className="section-heading"><div><span className="eyebrow">01 / FIND YOUR PLACE</span><h2>오늘, 어디를 발견할까?</h2><p>대전의 골목부터 숲길과 과학 공간까지. 가벼운 사진 미션으로 시작해 봐.</p></div><BadgePill label={`현재 ${items.length}곳`}/></div>
 <div className="filter-bar"><div className="filter-row"><motion.button whileTap={{scale:.95}} onClick={()=>{setFilter("all");setShowAll(false)}} className={`filter-chip ${filter==="all"?"active":""}`}>전체</motion.button>{(Object.keys(CATEGORIES) as Category[]).map(id=><motion.button whileTap={{scale:.95}} key={id} onClick={()=>{setFilter(id);setShowAll(false)}} className={`filter-chip ${filter===id?"active":""}`}>{CATEGORIES[id].name}</motion.button>)}</div><label className="searchbar"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="장소·동네 검색" aria-label="장소 검색"/></label></div>
 {items.length?<div className="place-grid">{items.slice(0,showAll?items.length:6).map(p=><PlaceCard key={p.id} p={p} onOpen={()=>onOpen(p)} saved={progress.favourites.includes(p.id)} onSave={()=>onSave(p.id)}/>)}</div>:<div className="empty-state">조건에 맞는 장소가 없어요. 검색어 또는 카테고리를 바꿔보세요.</div>}
 {!showAll&&items.length>6&&<div className="center-actions"><button className="btn btn-more" onClick={()=>setShowAll(true)}>더 많은 대전 발견하기 <ArrowRight size={16}/></button></div>}
 </section>
}

function StoryStrip({open}:{open:(p:Place)=>void}){const picks=[PLACES.find(p=>p.id==="soje"),PLACES.find(p=>p.id==="daechung1"),PLACES.find(p=>p.id==="geology")].filter(Boolean) as Place[];return <section className="story-band"><div className="container"><div className="section-heading light"><div><span className="eyebrow">DAEJEON, BEYOND THE OBVIOUS</span><h2>대전은 생각보다 다채로워.</h2><p>소제동의 오래된 시간, 대청호의 바람, 과학도시의 호기심까지.</p></div></div><div className="story-grid">{picks.map((p,i)=><motion.button whileHover={{y:-5}} className="story-tile" onClick={()=>open(p)} key={p.id}><Photo photoKey={p.img} alt={`${p.name} 장소 관련 사진`}/><span className="story-index">0{i+1} / DISCOVER</span><span className="story-details"><small>{p.district}</small><strong>{p.name}</strong><span>{p.desc}</span></span><ArrowUpRight className="story-arrow" size={22}/></motion.button>)}</div></div></section>}

function Planner({progress,onOpen}:{progress:Progress;onOpen:(p:Place)=>void}){
 const [theme,setTheme]=useState<Category|'all'>("all");const [mins,setMins]=useState(180);const [indoor,setIndoor]=useState(false);const [route,setRoute]=useState<Place[]|null>(null);
 return <section className="container section-space" id="planner"><div className="section-heading"><div><span className="eyebrow">02 / YOUR NEXT QUEST</span><h2>지금의 나에게 맞는 코스</h2><p>시간과 관심사를 골라봐. 이미 갔던 곳은 추천에서 제외해 줄게.</p></div><BadgePill label="맞춤 추천 데모"/></div>
 <div className="planner-shell"><div className="planner-form"><span className="form-kicker">CREATE YOUR ROUTE</span><h3>어떤 하루가 좋아?</h3><p>취향에 따라 대전의 장소를 조합해 봐.</p>
 <label className="form-label">오늘 끌리는 분야</label><div className="choice-grid">{(['all',...Object.keys(CATEGORIES)] as (Category|'all')[]).map(id=><motion.button key={id} whileTap={{scale:.95}} className={`choice ${theme===id?"selected":""}`} onClick={()=>setTheme(id)}>{id==='all'?'골고루':CATEGORIES[id].name}</motion.button>)}</div>
 <label className="form-label" htmlFor="route-time">남은 시간</label><div className="choice-grid time-choices">{[60,120,180,240].map(v=><button id={v===mins?'route-time':undefined} key={v} className={`choice ${mins===v?"selected":""}`} onClick={()=>setMins(v)}>{v<60?v+'분':`${v/60}시간`}</button>)}</div>
 <label className="checkline"><input type="checkbox" checked={indoor} onChange={e=>setIndoor(e.target.checked)}/><span>실내 장소만 추천</span></label>
 <motion.button whileHover={{scale:1.015}} whileTap={{scale:.98}} className="btn btn-primary planner-submit" onClick={()=>setRoute(selectRoute(PLACES,{theme,mins,wantIndoor:indoor,done:progress.done}))}>코스 찾아보기 <ArrowRight size={18}/></motion.button>
 <p className="model-note"><ShieldCheck size={14}/> 현재는 규칙 기반 추천입니다. LLM·RAG 연결 예정.</p>
 </div><div className="planner-results"><div className="results-top"><span>YOUR ROUTE / DAEJEON</span><span>01—03</span></div>
 {route===null?<div className="results-placeholder"><Route size={58} strokeWidth={1.1}/><h3>동네를 새롭게 보는 방법</h3><p>조건을 선택하고 코스를 만들어 봐.<br/>발견한 만큼 새로운 퀘스트가 열릴 거야.</p><div className="route-dots"><i/><i/><i/></div></div>:route.length?<div className="route-list">{route.map((p,i)=><button key={p.id} onClick={()=>onOpen(p)} className="route-step"><span className="step-index">0{i+1}</span><Photo photoKey={p.img} alt={`${p.name} 사진`}/><div><small>{CATEGORIES[p.cat].name} · 약 {p.mins}분</small><strong>{p.name}</strong><span>{p.district}</span></div><ArrowUpRight size={17}/></button>)}<p className="route-hint">장소 체류 시간만 고려한 추천입니다. 실제 이동 시간·영업 여부는 지도에서 확인해 주세요.</p></div>:<div className="results-placeholder"><p>조건에 맞는 미방문 장소가 없습니다. 시간이나 실내 조건을 바꿔보세요.</p></div>}
 </div></div></section>
}

function Festivals({onOpen}:{onOpen:(f:Festival)=>void}){const entries=[...FESTIVALS].sort((a,b)=>a.start.localeCompare(b.start));return <section className="container section-space festivals" id="festival"><div className="section-heading"><div><span className="eyebrow">03 / SEASONAL DAEJEON</span><h2>축제가 되면, 도시가 달라져.</h2><p>대전의 이번 계절과 지난 기록까지. 날짜와 운영 여부는 출발 전에 다시 확인해.</p></div><BadgePill label="2026 공개 자료 기반"/></div>
 <div className="festival-list">{entries.map(f=><motion.button whileHover={{x:3}} key={f.id} className="festival-item" onClick={()=>onOpen(f)}><span className="festival-date"><CalendarDays size={17}/>{f.month}</span><div className="festival-info"><div><span className={`status ${festivalStatus(f)==='진행 중'?'ongoing':''}`}>{festivalStatus(f)}</span><small>{f.location}</small></div><strong>{f.name}</strong><p>{f.summary}</p></div><ArrowUpRight size={19}/></motion.button>)}</div><div className="notice-row"><CircleHelp size={16}/>축제 일정은 정적 데모 데이터예요. 공식 사이트에 표시된 일정과 현장 운영 여부를 꼭 재확인해 주세요.</div>
 </section>}

function Profile({progress,totalXp,totals,onOpen}:{progress:Progress;totalXp:number;totals:Record<Category,number>;onOpen:(p:Place)=>void}){const badges=getBadges(progress.done,PLACES,FESTIVALS);const savedPlaces=PLACES.filter(p=>progress.favourites.includes(p.id));const visited=PLACES.filter(p=>progress.done.includes(p.id));return <section className="container section-space profile" id="profile"><div className="section-heading"><div><span className="eyebrow">04 / MY ADVENTURE LOG</span><h2>나만의 대전 탐험 도감</h2><p>대전을 돌아다니며 얻은 발견과 경험치를 기록해.</p></div></div>
 <div className="profile-top"><div className="profile-stat"><span>MY TOTAL XP</span><strong><Count value={totalXp}/><em>XP</em></strong><p>{progress.done.length}개의 퀘스트가 기록되어 있어요.</p></div><div className="profile-status"><span className="profile-avatar"><Compass size={38}/></span><div><small>DAEJEON EXPLORER</small><strong>초보 도시 탐험가</strong><span>오늘의 작은 경험을 모으는 중</span></div></div></div>
 <GrowthCharts totals={totals}/>
 <div className="section-heading minor"><div><span className="eyebrow">COLLECTION</span><h2>나의 분야별 성장</h2></div></div><div className="level-grid">{(Object.keys(CATEGORIES) as Category[]).map(cat=>{const meta=CATEGORIES[cat];const I=ICONS[cat];const xp=totals[cat];return <div key={cat} className="level-box"><span style={{background:meta.light,color:meta.color}}><I size={18}/></span><div><strong>{meta.name} Lv.{getLevel(xp)}</strong><small>누적 {xp} XP</small><div className="level-progress"><i style={{width:`${getPartial(xp)}%`,background:meta.color}}/></div></div></div>})}</div>
 <div className="section-heading minor"><div><span className="eyebrow">ACHIEVEMENTS</span><h2>모은 업적</h2></div></div><div className="badge-grid">{badges.map(b=><div className={`achievement ${b.hit?'earned':''}`} key={b.label}><Award size={24}/><strong>{b.label}</strong><span>{b.detail}</span><small>{b.hit?'획득 완료':'아직 잠겨 있어요'}</small></div>)}</div>
 <div className="section-heading minor"><div><span className="eyebrow">MY PLACES</span><h2>찜한 곳과 방문한 곳</h2></div></div><div className="saved-lists"><section><h3><Bookmark size={18}/>찜한 곳 <span>{savedPlaces.length}</span></h3>{savedPlaces.length?savedPlaces.map(p=><button key={p.id} onClick={()=>onOpen(p)} className="saved-row">{p.name}<ArrowUpRight size={16}/></button>):<p className="muted">아직 찜한 장소가 없어요.</p>}</section><section><h3><Check size={18}/>완료한 곳 <span>{visited.length}</span></h3>{visited.length?visited.map(p=><button key={p.id} onClick={()=>onOpen(p)} className="saved-row">{p.name}<ArrowUpRight size={16}/></button>):<p className="muted">첫 퀘스트를 완료해 보세요.</p>}</section></div></section>}

function DetailModal({selected,onClose,progress,onSave,onComplete,onNote}:{selected:Selected|null;onClose:()=>void;progress:Progress;onSave:(id:string)=>void;onComplete:(id:string,xp:number,cat:Category)=>void;onNote:(id:string,s:string)=>void}){
 const [photoIndex,setPhotoIndex]=useState(0);const [shot,setShot]=useState<string|null>(null);const [draft,setDraft]=useState("");
 useEffect(()=>{setPhotoIndex(0);setShot(null);setDraft(selected?progress.notes[selected.data.id]||"":"");},[selected?.data.id]);
 useEffect(()=>{if(!selected)return;const listener=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',listener);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',listener);document.body.style.overflow='';};},[selected,onClose]);
 if(!selected)return null;
 const isPlace=selected.kind==='place';const item=selected.data;const p=isPlace?selected.data as Place:null;const gallery=p?placePhotos(p):[];const photo=gallery[photoIndex]||"museum";const done=progress.done.includes(item.id);const saved=progress.favourites.includes(item.id);
 function upload(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return;if(file.size>8*1024*1024){alert('사진은 8MB 이하로 선택해 주세요.');return;}const fr=new FileReader();fr.onload=()=>setShot(String(fr.result));fr.readAsDataURL(file);}
 return <AnimatePresence><motion.div className="modal-layer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><motion.div role="dialog" aria-modal="true" aria-label={`${item.name} 상세 퀘스트`} className="detail-modal" initial={{opacity:0,y:25,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:22,scale:.98}} transition={{type:'spring',stiffness:270,damping:30}}>
 <div className="modal-pic">{p?<><Photo photoKey={photo} alt={`${p.name} 관련 이미지`}/>{gallery.length>1&&<><button className="slide-arrow left" aria-label="이전 사진" onClick={()=>setPhotoIndex((photoIndex+gallery.length-1)%gallery.length)}><ChevronLeft/></button><button className="slide-arrow right" aria-label="다음 사진" onClick={()=>setPhotoIndex((photoIndex+1)%gallery.length)}><ChevronRight/></button><span className="slide-count">{photoIndex+1} / {gallery.length}</span></>}</>:<div className="festival-visual"><Ticket size={55}/><b>FESTIVAL IN DAEJEON</b></div>}
 <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={19}/></button></div>
 <div className="modal-content"><span className="eyebrow">YOUR DAEJEON QUEST</span><div className="modal-title"><div><CategoryMark cat={item.cat}/><h2>{item.name}</h2><p>{p?p.district:(selected.data as Festival).location}</p></div><span className="modal-xp">+{item.xp} XP</span></div>
 <p className="modal-desc">{p?p.desc:(selected.data as Festival).summary}</p><div className="mission-box"><div><Camera size={18}/>이번 미션</div><p>{item.mission}</p><small>가볍게 방문하고 기록하는 미션 · 실제 위치/사진 인증은 준비 중</small></div>
 <div className="modal-inputs"><label className="upload-box"><Camera size={18}/>{shot?'사진 선택 완료':'사진 한 장 선택 (선택 사항)'}<input type="file" accept="image/*" onChange={upload} hidden/></label>{shot&&<img className="user-photo" alt="선택한 미션 사진" src={shot}/>}<label className="note-label">오늘 발견한 것 한 줄</label><textarea value={draft} maxLength={160} onChange={e=>setDraft(e.target.value)} placeholder="예: 생각보다 조용한 골목이었어."/><button className="note-save" onClick={()=>onNote(item.id,draft)}>기록 저장 <Check size={15}/></button></div>
 <div className="modal-actions"><motion.button whileTap={{scale:.96}} className={`btn ${done?'btn-muted':'btn-primary'}`} onClick={()=>onComplete(item.id,item.xp,item.cat)} disabled={done}>{done?<><Check size={17}/> 퀘스트 완료</>:<>체험 모드로 완료하기 <ArrowRight size={17}/></>}</motion.button>{isPlace?<button className="btn btn-outline" onClick={()=>onSave(item.id)}>{saved?<BookmarkCheck size={17}/>:<Bookmark size={17}/>} {saved?'찜 완료':'찜하기'}</button>:null}</div>
 <div className="modal-source"><span>정보·사진 출처 / 방문 전 확인</span><div><a href={item.source} target="_blank" rel="noopener noreferrer">공식·참고 출처 <ExternalLink size={13}/></a>{p&&<a href={`https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(p.query+' 간판 외관')}`} target="_blank" rel="noopener noreferrer">네이버 사진 검색 <ExternalLink size={13}/></a>}{p&&<a href={`https://map.naver.com/p/search/${encodeURIComponent(p.query)}`} target="_blank" rel="noopener noreferrer">지도에서 보기 <ExternalLink size={13}/></a>}</div>{p?<small>{PHOTOS[photo]?.label} · {PHOTOS[photo]?.credit}</small>:<small>일정과 참여 조건은 공식 안내에서 확인해 주세요.</small>}</div></div>
 </motion.div></motion.div></AnimatePresence>
}

export default function App(){
 const [tab,setTab]=useState<Tab>('discover');const [openMenu,setOpenMenu]=useState(false);const [filter,setFilter]=useState<Category|'all'>('all');const [search,setSearch]=useState('');const [progress,setProgress]=useState<Progress>(()=>readProgress());const [selected,setSelected]=useState<Selected|null>(null);const [toast,setToast]=useState('');const reduced=useReducedMotion();
 const totals=useMemo(()=>getTotals(progress.done,PLACES,FESTIVALS),[progress.done]);const totalXp=Object.values(totals).reduce((a,b)=>a+b,0);
 useEffect(()=>{localStorage.setItem('daejeonplay-animated-progress',JSON.stringify(progress));},[progress]);
 useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(''),3200);return()=>window.clearTimeout(t);},[toast]);
 useEffect(()=>{if(reduced)return;const controller=animeAnimate('.hero-line',{opacity:[0,1],translateY:[24,0],duration:950,delay:stagger(150),ease:'outCubic'});animeAnimate('.brand-icon',{rotate:[-30,0],scale:[0.65,1],opacity:[0,1],duration:850,ease:'outBack'});return()=>controller.pause();},[reduced]);
 function switchTab(t:Tab){setTab(t);setOpenMenu(false);window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});}
 function save(id:string){setProgress(s=>({...s,favourites:s.favourites.includes(id)?s.favourites.filter(a=>a!==id):[...s.favourites,id]}));}
 function complete(id:string,xp:number,cat:Category){if(progress.done.includes(id))return;setProgress(s=>({...s,done:[...s.done,id]}));setToast(`${CATEGORIES[cat].name} 경험치 +${xp} XP 획득!`);}
 function note(id:string,t:string){setProgress(s=>({...s,notes:{...s.notes,[id]:t.trim()}}));setToast('발견 노트를 저장했어.');}
 const onOpen=(p:Place)=>setSelected({kind:'place',data:p});
 return <><Header tab={tab} setTab={switchTab} openMenu={openMenu} setOpenMenu={setOpenMenu}/>
 <main>{tab==='discover'&&<><Hero totalXp={totalXp} doneCount={progress.done.length} goPlanner={()=>switchTab('planner')} goExplore={()=>document.getElementById('discover')?.scrollIntoView({behavior:reduced?'instant':'smooth'})}/><HomeStats progress={progress} totalXp={totalXp}/><Discover progress={progress} onOpen={onOpen} onSave={save} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch}/><StoryStrip open={onOpen}/><section className="container closing-cta"><div><span>YOUR CITY. YOUR STORY.</span><h2>대전은, 갈수록 재밌어.</h2><p>익숙한 동네에서 새로운 장소를 발견해 봐.</p></div><button className="btn btn-primary" onClick={()=>switchTab('planner')}>코스 만들기 <ArrowRight size={18}/></button></section></>}
 {tab==='planner'&&<><div className="subpage-intro container"><span>CURATED FOR YOU</span><h1>오늘의 대전을 고르다.</h1><p>분위기와 시간에 맞는 동네 퀘스트를 추천받아 봐.</p></div><Planner progress={progress} onOpen={onOpen}/></>}
 {tab==='festival'&&<><div className="subpage-intro container festival-intro"><span>ANOTHER SIDE OF DAEJEON</span><h1>계절마다 새로운 대전.</h1><p>축제가 있는 거리도 대전의 작은 모험이야.</p></div><Festivals onOpen={f=>setSelected({kind:'festival',data:f})}/></>}
 {tab==='profile'&&<><div className="subpage-intro container"><span>MY LOCAL ADVENTURE</span><h1>모든 경험이 나의 레벨.</h1><p>탐험의 기록을 조금씩 모아보자.</p></div><Profile progress={progress} totalXp={totalXp} totals={totals} onOpen={onOpen}/></>}
 </main>
 <footer className="footer"><div className="container footer-inner"><Brand compact/><span>대전 로컬 장소를 발견하는 게임형 탐험 서비스 · 포트폴리오 프로토타입</span><small>© 2026 DaejeonPlay · 현재 추천은 규칙 기반 데모입니다. 사진별 출처와 이용 조건을 확인해 주세요.</small></div></footer>
 <DetailModal selected={selected} progress={progress} onClose={()=>setSelected(null)} onSave={save} onComplete={complete} onNote={note}/>
 <AnimatePresence>{toast&&<motion.div role="status" className="toast" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}><Award size={18}/>{toast}</motion.div>}</AnimatePresence>
 </>
}
