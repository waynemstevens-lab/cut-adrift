import sys, re, pathlib, importlib.util, html
repo=pathlib.Path(sys.argv[1]); spec=importlib.util.spec_from_file_location('f',sys.argv[2]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
title=sys.argv[3]; slugmode=sys.argv[4]  # 'dirs' or 'files'
CC={'NZ':r'(^|-)nz(-|$)|mytrove|redundancy-calculator|^index$','AU':r'(^|-)au(-|$)','UK':r'(^|-)uk(-|$)|tell-us-once|redundancy-calculator','IE':r'(^|-)ie(-|$)|ireland|redundancy-calculator','CA':r'(^|-)ca(-|$)|canada','US':r'(^|-)us(-|$)'}
pages=sorted(repo.glob('Public/*/index.html')) if slugmode=='dirs' else sorted(repo.glob('Public/*.html'))
texts={p:p.read_text(encoding='utf-8') for p in pages}
worker=(repo/'worker.js').read_text(encoding='utf-8').split('\n')
def slug(p): return p.parent.name if slugmode=='dirs' else p.stem
out=[f"# {title} — facts register","",
"Every time-sensitive figure the site and its tool depend on. The weekly check works through this list: verify each **current value** against the **official source**, fix every location listed, then update this file.","",
"Locations are found by the search pattern shown; after editing, regenerate or re-search to catch new mentions. Phone numbers marked *rare* only need a spot check.","",
"Key change dates: NZ 1 April (benefits) and 1 July (ACC); AU 20 March, 1 July, 20 September; UK early April; IE 1 January and the October Budget; CA 1 January and July; US 1 January and 1 October.",""]
cur=None
for (cc,topic,val,pat,src,when) in m.FACTS:
    if cc!=cur: out+=["",f"## {cc}",""]; cur=cc
    rx=re.compile(pat)
    locs=[slug(p) for p,t in texts.items() if re.search(CC[cc],slug(p)) and rx.search(t)]
    wl=[str(i) for i,l in enumerate(worker,1) if rx.search(l)]
    out.append(f"### {topic}")
    out.append(f"- **Current value:** {val}")
    out.append(f"- **Official source:** {src}")
    out.append(f"- **Changes:** {when}")
    out.append(f"- **Search pattern:** `{pat}`")
    out.append(f"- **Pages:** {', '.join(locs) if locs else '—'}")
    out.append(f"- **worker.js lines:** {', '.join(wl[:12]) if wl else '—'}{' …' if len(wl)>12 else ''}")
    out.append("")
(repo/'FACTS.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
print(len(m.FACTS),'facts')
