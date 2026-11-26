"""Builds the downloadable Sharm guide PDFs (IT/EN/DE) into public/guida.
Run from this folder after `npm i @fontsource/cormorant-garamond @fontsource/inter` and `pip install playwright`:
    python3 build.py
Texts live in content.py.
"""
import asyncio, base64, html, sys
from pathlib import Path
from playwright.async_api import async_playwright
from content import IT, EN, DE

HERE = Path(__file__).parent
FONTS = HERE / "node_modules/@fontsource"
POSTER = HERE.parent.parent / "public/video/oasi-mare-poster.jpg"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else HERE.parent.parent / "public/guida")
OUT.mkdir(parents=True, exist_ok=True)

def b64(p): return base64.b64encode(Path(p).read_bytes()).decode()
def font(family, file, weight, style):
    return f"@font-face{{font-family:'{family}';src:url(data:font/woff2;base64,{b64(file)}) format('woff2');font-weight:{weight};font-style:{style};}}"
FACES = "".join([
    font("Cormorant", FONTS / "cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", 500, "normal"),
    font("Cormorant", FONTS / "cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2", 500, "italic"),
    font("Cormorant", FONTS / "cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2", 600, "normal"),
    font("Inter", FONTS / "inter/files/inter-latin-400-normal.woff2", 400, "normal"),
    font("Inter", FONTS / "inter/files/inter-latin-600-normal.woff2", 600, "normal"),
])
SCARAB = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="24" cy="7" r="4"/><path d="M24 11v29"/><ellipse cx="24" cy="27" rx="11" ry="14"/><path d="M13 22 5 17M13 28H4M14 34l-7 6M35 22l8-5M35 28h9M34 34l7 6M21 4l-3-3M27 4l3-3"/></svg>'
e = html.escape

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; color: #2b2117; background: #f6ecdb; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 20mm 18mm 22mm; position: relative; page-break-after: always; overflow: hidden; }
.page:last-child { page-break-after: auto; }
.night { background: radial-gradient(80% 60% at 80% 0%, rgba(232,201,122,.16), transparent 60%), linear-gradient(180deg, #0d1b2a, #070d16); color: #f4ecdc; }
.sand { background: radial-gradient(90% 60% at 10% 0%, rgba(255,255,255,.7), transparent 60%), linear-gradient(180deg, #f6ecdb, #efe1c8); }
.sea { background: linear-gradient(180deg, #0a4a5a, #052c38); color: #eaf6f4; }
h1, h2, h3 { font-family: Cormorant, serif; font-weight: 500; line-height: 1.05; }
.eyebrow { font-size: 8.5pt; letter-spacing: .24em; text-transform: uppercase; color: #b77a1f; font-weight: 600; }
.night .eyebrow, .sea .eyebrow { color: #e8c97a; }
em { font-family: Cormorant, serif; font-style: italic; }
/* cover */
.cover { padding: 0; display: flex; flex-direction: column; }
.cover-img { height: 150mm; background-size: cover; background-position: center; position: relative; }
.cover-img::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,13,22,.15), rgba(7,13,22,.1) 50%, #0d1b2a); }
.cover-body { padding: 4mm 18mm 0; position: relative; margin-top: -26mm; z-index: 2; }
.cover h1 { font-size: 58pt; color: #fff6e6; margin-top: 6mm; }
.cover h1 em { color: #e8c97a; display: block; font-size: 30pt; margin-top: 4mm; }
.cover .note { margin-top: 10mm; font-family: Cormorant, serif; font-style: italic; font-size: 15pt; color: #c9b49a; max-width: 120mm; }
.cover .mark { width: 16mm; color: #e8c97a; margin-top: 14mm; }
.cover .bottom { position: absolute; left: 18mm; right: 18mm; bottom: 14mm; display: flex; justify-content: space-between; font-size: 8pt; letter-spacing: .18em; text-transform: uppercase; color: #c9b49a; }
/* text */
h2 { font-size: 32pt; margin: 3mm 0 5mm; }
p { font-size: 10.5pt; line-height: 1.65; }
.lead p { font-family: Cormorant, serif; font-size: 16pt; line-height: 1.45; margin-bottom: 4mm; }
.kit { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm 8mm; margin-top: 8mm; }
.kit div { border-top: 1px solid rgba(154,95,18,.3); padding-top: 3.5mm; }
.kit h3 { font-size: 15pt; margin-bottom: 1.5mm; color: #9a5f12; }
.kit p { font-size: 9.5pt; }
/* road */
.road { position: relative; margin-top: 6mm; padding-left: 16mm; }
.road::before { content: ""; position: absolute; left: 5.5mm; top: 4mm; bottom: 4mm; border-left: 1.4px dashed rgba(232,201,122,.55); }
.stop { position: relative; margin-bottom: 6.5mm; break-inside: avoid; }
.stop .num { position: absolute; left: -16mm; top: 0; width: 11mm; height: 11mm; border-radius: 50%; border: 1px solid #e8c97a; background: #0d1b2a; color: #e8c97a; display: grid; place-items: center; font-family: Cormorant, serif; font-size: 14pt; }
.stop h3 { font-size: 19pt; color: #fff6e6; }
.stop .when { font-size: 7.5pt; letter-spacing: .2em; text-transform: uppercase; color: #e8c97a; margin: 1mm 0 1.5mm; }
.stop p { font-size: 9.8pt; color: rgba(244,236,220,.86); }
.far { margin-top: 4mm; border: 1px solid rgba(232,201,122,.4); padding: 5mm 6mm; }
.far h3 { font-size: 17pt; color: #e8c97a; margin-bottom: 1.5mm; }
/* food */
.food { margin-top: 5mm; display: grid; grid-template-columns: 1fr 1fr; gap: 3.5mm 9mm; }
.food div { border-top: 1px solid rgba(154,95,18,.3); padding-top: 3mm; break-inside: avoid; }
.food h3 { font-size: 15.5pt; }
.food p { font-size: 9.4pt; color: #5b4a36; }
.mina { margin-top: 7mm; padding: 5.5mm 7mm; background: #0d1b2a; color: #f4ecdc; }
.mina h3 { font-size: 20pt; color: #e8c97a; margin-bottom: 2mm; }
.mina .link { margin-top: 3mm; font-size: 8.5pt; color: #e8c97a; letter-spacing: .02em; }
.end { margin-top: 6mm; text-align: center; }
.end .mark { width: 10mm; color: #9a5f12; margin: 0 auto 3mm; }
.end h3 { font-size: 22pt; }
.end p { font-family: Cormorant, serif; font-style: italic; font-size: 15pt; max-width: 140mm; margin: 2mm auto 0; }
.foot { position: absolute; left: 18mm; right: 18mm; bottom: 9mm; font-size: 7pt; line-height: 1.5; color: #8a7558; }
.night .foot, .sea .foot { color: rgba(244,236,220,.5); }
.pn { position: absolute; right: 18mm; top: 10mm; font-size: 7.5pt; letter-spacing: .2em; color: #b77a1f; }
.night .pn { color: #e8c97a; }
"""

def stops_html(stops, label, start):
    return "".join(f'<div class="stop"><span class="num">{i}</span><h3>{e(t)}</h3><p class="when">{e(label)} {i} · {e(w)}</p><p>{e(d)}</p></div>' for i, (t, w, d) in enumerate(stops, start))

def render(c):
    poster = b64(POSTER)
    s = c["stops"]
    pages = [
        f'''<section class="page night cover"><div class="cover-img" style="background-image:url(data:image/jpeg;base64,{poster})"></div>
        <div class="cover-body"><p class="eyebrow">{e(c["kicker"])}</p><h1>{e(c["title"])}<em>{e(c["subtitle"])}</em></h1><p class="note">{e(c["cover_note"])}</p><div class="mark">{SCARAB}</div></div>
        <div class="bottom"><span>Sharm el-Sheikh</span><span>oasidelfaraone.it</span></div></section>''',
        f'''<section class="page sand"><span class="pn">01</span><p class="eyebrow">{e(c["intro_title"])}</p><h2>{e(c["title"])}</h2>
        <div class="lead">{"".join(f"<p>{e(p)}</p>" for p in c["intro"])}</div>
        <p class="eyebrow" style="margin-top:8mm">{e(c["kit_title"])}</p>
        <div class="kit">{"".join(f'<div><h3>{e(t)}</h3><p>{e(d)}</p></div>' for t, d in c["kit"])}</div>
        <p class="foot">{e(c["footer"])}</p></section>''',
        f'''<section class="page night"><span class="pn">02</span><p class="eyebrow">{e(c["road_title"])}</p><h2>{e(c["road_intro"])}</h2>
        <div class="road">{stops_html(s[:5], c["stop_label"], 1)}</div><p class="foot">{e(c["footer"])}</p></section>''',
        f'''<section class="page night"><span class="pn">03</span><p class="eyebrow">{e(c["road_title"])}</p>
        <div class="road">{stops_html(s[5:], c["stop_label"], 6)}</div>
        <div class="far"><h3>{e(c["far_title"])}</h3><p>{e(c["far"])}</p></div><p class="foot">{e(c["footer"])}</p></section>''',
        f'''<section class="page sand"><span class="pn">04</span><p class="eyebrow">{e(c["food_title"])}</p><h2>{e(c["food_title"])}</h2><p>{e(c["food_intro"])}</p>
        <div class="food">{"".join(f'<div><h3>{e(t)}</h3><p>{e(d)}</p></div>' for t, d in c["food"])}</div>
        <div class="mina"><h3>{e(c["mina_title"])}</h3><p>{e(c["mina"])}</p><p class="link">{e(c["mina_link"])}</p></div>
        <div class="end"><div class="mark">{SCARAB}</div><h3>{e(c["end_title"])}</h3><p>{e(c["end"])}</p></div>
        <p class="foot">{e(c["footer"])}</p></section>''',
    ]
    return f'<!doctype html><html lang="{c["lang"]}"><head><meta charset="utf-8"><title>{e(c["title"])} · Oasi del Faraone</title><style>{FACES}{CSS}</style></head><body>{"".join(pages)}</body></html>'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        for c in (IT, EN, DE):
            doc = render(c)
            await pg.set_content(doc, wait_until="load")
            await pg.evaluate("document.fonts.ready")
            await pg.pdf(path=str(OUT / c["file"]), format="A4", print_background=True, prefer_css_page_size=True)
            print(c["file"], (OUT / c["file"]).stat().st_size // 1024, "KB")
        await b.close()
asyncio.run(main())
