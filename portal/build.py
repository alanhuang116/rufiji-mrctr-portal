"""Assemble the single-file portal: portal/*.html + i18n.js + app.js + data.json -> ../index.html"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda f: open(os.path.join(HERE, f), encoding="utf-8").read()
head, body = rd("template_head.html"), rd("template_body.html")
data = rd("data.json").replace("</", "<\\/")
meta = ('<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="Bilingual (EN/中文) re-analysis of the 1,7-mRCTR malaria pilot in Rufiji, Tanzania, 2015–2018.">\n'
        '<meta property="og:title" content="1,7-mRCTR Evidence Portal">\n'
        '<meta property="og:description" content="Interactive re-analysis of the China–UK–Tanzania 1,7-mRCTR malaria pilot · 1,7-mRCTR 证据门户">\n'
        '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 30 30%27%3E%3Crect width=%2730%27 height=%2730%27 rx=%277%27 fill=%27%230b1e28%27/%3E%3Cpath d=%27M6 21 L11 14 L15 17 L20 8 L24 11%27 fill=%27none%27 stroke=%27%235598e7%27 stroke-width=%272.4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E">\n'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n')
html = ("<!doctype html>\n<html lang=\"en\">\n<head>\n" + meta + head + "\n</head>\n<body>\n" + body +
        '\n<script id="portal-data" type="application/json">' + data + "</script>\n"
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>\n<script>\n' + rd("i18n.js") + "\n" + rd("methods.js") + "\n</script>\n<script>\n" + rd("app.js") + "\n</script>\n</body>\n</html>\n")
open(os.path.join(HERE, "..", "index.html"), "w", encoding="utf-8").write(html)
print(len(html) // 1024, "KB written to index.html")
