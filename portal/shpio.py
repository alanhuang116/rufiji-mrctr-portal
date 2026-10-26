"""Minimal shapefile (.shp/.dbf) reader — no GDAL needed."""
import struct
def read_dbf(path, enc="latin-1"):
    with open(path,"rb") as f:
        hdr=f.read(32); n=struct.unpack("<I",hdr[4:8])[0]; hl=struct.unpack("<H",hdr[8:10])[0]; rl=struct.unpack("<H",hdr[10:12])[0]
        fields=[]
        while True:
            fd=f.read(32)
            if fd[0]==0x0D: break
            fields.append((fd[:11].split(b"\x00")[0].decode(enc),chr(fd[11]),fd[16],fd[17]))
        f.seek(hl); rows=[]
        for _ in range(n):
            rec=f.read(rl)
            if not rec or rec[0:1]==b"*": continue
            pos=1; row={}
            for name,typ,ln,dec in fields:
                raw=rec[pos:pos+ln].decode(enc,"replace").strip(); pos+=ln
                if typ in "NF":
                    try: row[name]=float(raw) if raw else None
                    except ValueError: row[name]=None
                else: row[name]=raw
            rows.append(row)
    return fields, rows
def read_shp(path):
    shapes=[]; data=open(path,"rb").read(); pos=100
    while pos < len(data):
        _, clen = struct.unpack(">2i", data[pos:pos+8]); pos+=8
        c=data[pos:pos+clen*2]; pos+=clen*2
        st=struct.unpack("<i",c[:4])[0]
        if st==0: shapes.append(None); continue
        if st in (1,11,21): shapes.append(("Point",list(struct.unpack("<2d",c[4:20])))); continue
        box=struct.unpack("<4d",c[4:36]); np_,npt=struct.unpack("<2i",c[36:44])
        parts=list(struct.unpack(f"<{np_}i",c[44:44+4*np_])); o=44+4*np_
        pts=struct.unpack(f"<{2*npt}d",c[o:o+16*npt]); pts=[(pts[2*i],pts[2*i+1]) for i in range(npt)]
        rings=[pts[parts[i]:(parts[i+1] if i+1<len(parts) else npt)] for i in range(np_)]
        shapes.append(("Polygon",rings,box))
    return shapes
