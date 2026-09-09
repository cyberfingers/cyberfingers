"""Build the public career resume. Requires ReportLab; contains public content only."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public' / 'assets' / 'david-britton-resume.pdf'
NAVY = colors.HexColor('#071426')
BLUE = colors.HexColor('#2153A4')
INK = colors.HexColor('#243043')
MUTED = colors.HexColor('#506077')
STYLES = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=28, leading=31, textColor=NAVY, spaceAfter=7),
    'subtitle': ParagraphStyle('subtitle', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=BLUE, spaceAfter=8),
    'links': ParagraphStyle('links', fontName='Helvetica', fontSize=9.4, leading=13, textColor=MUTED, spaceAfter=18),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=10.3, leading=14.4, textColor=INK, spaceAfter=8),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=BLUE, spaceBefore=13, spaceAfter=8, keepWithNext=True),
    'job': ParagraphStyle('job', fontName='Helvetica-Bold', fontSize=12, leading=15.5, textColor=NAVY, spaceBefore=7, spaceAfter=3, keepWithNext=True),
    'role': ParagraphStyle('role', fontName='Helvetica', fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=7, keepWithNext=True),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=10.3, leading=14.4, textColor=INK, leftIndent=10, firstLineIndent=-10, spaceAfter=6),
}
story = []
def p(text, style='body'):
    story.append(Paragraph(text, STYLES[style]))
def bullet(text):
    p('-  ' + text, 'bullet')
def job(company, dates, role):
    p(company, 'job')
    p(role + '  |  ' + dates, 'role')
def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#DCE3EE'))
    canvas.line(48, 42, 564, 42)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(48, 28, 'David Britton  |  Technical SEO & Search Strategy')
    canvas.drawRightString(564, 28, f'{doc.page} / 2')
    canvas.setFillColor(BLUE)
    canvas.rect(48, 750, 38, 3, fill=1, stroke=0)
    canvas.restoreState()

p('DAVID BRITTON', 'name')
p('TECHNICAL SEO  /  SEARCH STRATEGY  /  APPLIED AI', 'subtitle')
p('<link href="https://cyberfingers.net/" color="#2153A4">cyberfingers.net</link>  |  <link href="https://www.linkedin.com/in/cyberfingers/" color="#2153A4">linkedin.com/in/cyberfingers</link>', 'links')
p('Technical SEO professional with experience across national home search, rentals, mortgage content, brokerage websites and ecommerce. Combines hands-on publishing, enterprise data analysis and AI-assisted workflows to investigate problems and deliver practical improvements. Works across content, product and engineering to make complex findings understandable and actionable.')
p('RECENT EXPERIENCE', 'section')
job('Redfin', 'Aug 2025 - Present', 'Technical SEO Analyst')
bullet('Investigate duplicate property pages and indexing patterns using Snowflake, Google Search Console and crawl data. Compare search performance across groups of pages and turn findings into recommendations for engineering review.')
bullet('Onboarded Botify for recurring cloud crawls, page segmentation and enterprise monitoring. Partnered on completed navigation and footer fixes that removed unnecessary redirects.')
bullet('Developed AI-assisted browser workflows to collect exact Search Console sitemap counts, save progress and produce structured records for analysis with Snowflake. Validate samples against source reports.')
bullet('Devised property-video feasibility research and directed Codex browser searches. Compared findings with Nozzle data to assess search opportunities and inform a proposed video strategy.')
job('Rocket', 'Nov 2021 - Aug 2025', 'Technical SEO Analyst')
p('Rocket Homes, followed by a six-month Rocket transition assignment including Rocket Mortgage work.', 'role')
bullet('Developed Rocket.com\'s robots.txt strategy to block crawling by default and allow approved URL patterns. Supported migration redirects, canonical rules and technical QA. Andrew Prince presented the team\'s approach at SEO Week 2025 in New York City.')
bullet('Helped rebuild the ForSaleByOwner Learning Center with content, product, design and engineering. Organized legacy articles, co-created AI-assisted summaries and coordinated WordPress updates. Reporting showed higher peak search clicks and impressions after the broader relaunch.')
bullet('Co-developed prompts and human quality checks for Local Insights, an AI-assisted city-content program that replaced a paid content service. Helped define reusable content plans for state mortgage-rate pages.')
bullet('Wrote requirements for recurring listing-count updates so internal links and sitemaps better reflected inventory. Partnered with engineering through implementation and advanced Bing IndexNow adoption.')

story.append(PageBreak())
p('DAVID BRITTON / EXPERIENCE & CREDENTIALS', 'subtitle')
p('EARLIER EXPERIENCE', 'section')
job('Cyber Fingers', '2020 - 2021', 'Website and IT Consultant')
p('Rebuilt a business owner\'s WordPress ecommerce website, migrated existing content and provided order-processing training. Worked directly with the owner to support online and direct sales.')
job('Gaston J. Glock Style LP', '2018 - 2020', 'SEO and Marketing Consultant | In-house role')
p('Prepared product metadata and Magento catalog imports for English and German storefronts. Partnered with the owner and developers to bring handcrafted products previously sold at shows into online sales.')
job('Harry Norman, Realtors / Jenny Pruitt & Associates', '2008 - 2018', 'Website Administrator | HomeServices of America organization')
p('Managed website, intranet and mobile-app operations for a large brokerage. Supported migrations with SQL exports and quality checks. Translated lead-routing needs into business rules and Power BI maps for the Internet Lead Team.')
job('RE/MAX of Buckhead/Brookhaven', '2006 - 2008', 'Information Technology Management')
p('Supported agents and staff, coordinated web-hosting and vendors, and checked listing uploads to RE/MAX and MLS systems. Built a foundation in real estate data and communication with nontechnical users.')
p('APPLIED AI & CROSS-TEAM CONTRIBUTIONS', 'section')
bullet('Progressed from AI-assisted article summaries to reusable content workflows, ChatGPT Projects and Codex browser agents. Use ChatGPT and Claude to help investigate SQL, code and documentation; verify findings before turning them into recommendations.')
bullet('Used AI-assisted Python and Puppeteer for website QA and log analysis. Created an API-based tool to restore ticket visibility after a Jira migration.')
bullet('Partnered with accessibility colleagues on Hack Week image-description work and explored AI photo evaluation. Recognized as a Rocket Hack Week Innovation category winner in 2024; participated in company-sponsored volunteering.')
p('TOOLS & CREDENTIALS', 'section')
p('<b>Search and data:</b> Botify, Screaming Frog, Google Search Console, Snowflake / SQL, Nozzle, Datadog, Splunk and Power BI.<br/><b>AI and delivery:</b> ChatGPT Projects, Codex, Claude, AI-assisted Python, Playwright, Puppeteer, WordPress, Magento, Jira and Confluence.')
p('<b>Certifications:</b> Botify Pro and Expert.<br/><b>Education:</b> Humboldt State University - BS, Oceanography; BA, Geology.')

doc = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=48, leftMargin=48,
    topMargin=53, bottomMargin=54, title='David Britton - Technical SEO and Search Strategy',
    author='David Britton', subject='Professional experience and selected contributions',
    creator='David Britton', pageCompression=1)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
