"""Browser QA for every generated page and the site's main interactions."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright
from content import PAGES
import json,tempfile,sys
ROOT=Path(__file__).resolve().parent.parent
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
shots=Path(tempfile.gettempdir())/'smart-taxbridge-pro-qa';shots.mkdir(exist_ok=True)
errors=[];failed=[];external=[]
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(7000)
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:failed.append((r.url,r.status)) if r.status>=400 else None)
  page.on('request',lambda r:external.append(r.url) if not r.url.startswith(base) and not r.url.startswith('blob:') else None)
  for width in ([] if '--interactions-only' in sys.argv else [1440,390]):
   page.set_viewport_size({'width':width,'height':1000 if width==1440 else 844})
   for n,(slug,data) in enumerate(PAGES.items()):
    url=base+'/'+slug+'/' if slug else base+'/'
    response=page.goto(url,wait_until='load');assert response.status==200,(slug,response.status)
    assert page.locator('h1').count()==1,slug
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),('Overflow',width,slug)
    assert page.locator('img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)'),('Broken image',slug)
    if slug in ['', 'personal-taxes/online','small-business-taxes','tax-tips','tax-tools/calculators/taxcaster','contact','resources/checklist','personal-taxes/compare/online']:
     page.screenshot(path=str(shots/(('home' if not slug else slug.replace('/','-'))+f'-{width}.png')),full_page=True)
    if (n+1)%25==0:print(f'Checked {n+1}/{len(PAGES)} pages at {width}px',flush=True)
   print(f'PASS all {len(PAGES)} pages at {width}px',flush=True)
  page.set_viewport_size({'width':1440,'height':1000});page.goto(base)
  page.get_by_role('button',name='Personal taxes',exact=True).click()
  assert page.get_by_role('link',name='Personal tax support Start with your situation').is_visible()
  page.keyboard.press('Escape');assert page.get_by_role('button',name='Personal taxes',exact=True).get_attribute('aria-expanded')=='false'
  page.get_by_role('button',name='Search the website').click();page.locator('#site-search').fill('contractor')
  page.locator('#search-results a').first.wait_for();assert 'contractor' in page.locator('#search-results').inner_text().lower()
  page.keyboard.press('Escape');assert not page.locator('#search-dialog').is_visible()
  page.locator('#situation').select_option('/small-business-taxes/');page.get_by_role('button',name='Find my starting point').click();page.wait_for_url('**/small-business-taxes/')
  page.goto(base+'/tax-tips/');page.get_by_role('button',name='Family',exact=True).click();assert page.locator('[data-category]:visible').count()==4
  page.locator('#resource-search').fill('zzzzz');assert page.locator('#filter-empty').is_visible()
  page.goto(base+'/resources/checklist/');page.locator('[data-checklist] input').first.check();assert page.locator('#check-progress').inner_text()=='1 of 12 items ready'
  with page.expect_download() as dl:page.locator('#download-checklist').click()
  assert '[x]' in Path(dl.value.path()).read_text(encoding='utf-8')
  page.locator('#reset-checklist').click();assert page.locator('#check-progress').inner_text()=='0 of 12 items ready'
  page.goto(base+'/tax-tools/calculators/taxcaster/');assert page.locator('#tax-result').inner_text()=='$2,029'
  page.locator('#income').fill('15750');page.locator('#withheld').fill('0');page.get_by_role('button',name='Update illustration').click();assert page.locator('#tax-result').inner_text()=='$0'
  page.locator('#income').fill('55000');page.get_by_role('button',name='Update illustration').click();assert page.locator('#tax-result-label').inner_text()=='Illustrative amount due'
  page.goto(base+'/tax-tools/calculators/self-employed/');assert page.locator('#expense-net').inner_text()=='$54,000';page.locator('#revenue').fill('5000');page.get_by_role('button',name='Update summary').click();assert page.locator('#expense-net').inner_text()=='-$1,000'
  page.goto(base+'/tax-tools/calculators/w4/');assert page.locator('#pay-income').inner_text()=='$65,000';page.locator('#periods').select_option('12');page.get_by_role('button',name='Annualize my figures').click();assert page.locator('#pay-income').inner_text()=='$30,000'
  page.goto(base+'/contact/');page.locator('#name').fill('Preview Visitor');page.locator('#email').fill('visitor@example.com');page.locator('#message').fill('I would like to discuss personal preparation.')
  with page.expect_download() as dl:page.get_by_role('button',name='Download inquiry draft').click()
  assert 'Preview Visitor' in Path(dl.value.path()).read_text(encoding='utf-8');assert 'Nothing has been sent' in page.locator('#contact-status').inner_text()
  page.set_viewport_size({'width':390,'height':844});page.goto(base);page.get_by_role('button',name='Open navigation').click();page.get_by_role('button',name='Resources',exact=True).click();page.get_by_role('link',name='Document checklist Get your records together').click();page.wait_for_url('**/resources/checklist/')
  for width in [360,768,900,1024]:
   page.set_viewport_size({'width':width,'height':900});page.goto(base);assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),width
  assert not errors,errors;assert not failed,failed;assert not external,external
  print('PASS: navigation, keyboard dismissal, search, finder, filters, calculators, checklist, downloads, mobile navigation, intermediate widths.',flush=True)
  print('Zero browser errors, missing assets, or third-party requests. Screenshots: '+str(shots),flush=True)
  browser.close()
finally:server.shutdown();server.server_close()
