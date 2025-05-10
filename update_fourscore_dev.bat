set host=192.168.0.84
set username=root
set source=C:\Users\John\Desktop\Programming\WebDev\jgw-personal-website-v2

cd "%source%"
scp -rp blog.css blog.html blog.js index.css index.html main.html site.css asset/* %username%@%host%:/srv/JGWPersonalWebsiteStatic/