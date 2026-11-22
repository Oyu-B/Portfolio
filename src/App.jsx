import { useEffect, useMemo, useState } from 'react'
import AgenticFactory3D from '@/components/ui/agentic-factory-3d'
import './App.css'

const content = {
  en: {
    nav: ['Introduction', 'About me', 'Skills', 'Projects', 'Contact'],
    cv: 'Download CV',
    aboutEyebrow: '01 / ABOUT ME', aboutTitle: <>Curious mind.<br /><span>Practical</span> builder.</>,
    aboutP1: 'I am a third-year information systems student who enjoys connecting technology with real needs. I build useful projects while developing my skills in web development, networking and quality management.',
    aboutP2: 'Each project lets me practice a different part of the process, from understanding requirements to building, configuring and checking a solution.',
    explore: 'Explore selected work',
    skillsEyebrow: '02 / SKILLS', tools: 'TOOLS AND FOCUS', skillsTitle: <>Skills I use to<br /><span>make things work.</span></>,
    skillsDescription: 'From interfaces to network configuration, I am building a practical toolkit through coursework and hands-on projects.',
    workEyebrow: '03 / PROJECTS', all: 'All work', filters: ['Web development', 'Networking', 'Quality management'],
    workTitle: <>Ideas into <span>working</span> things.</>,
    workDescription: <>Web, networking and quality work<br />from coursework and practice.</>,
    contactEyebrow: '04 / CONTACT', contactKicker: 'OPEN TO PROJECTS AND OPPORTUNITIES',
    contactTitle: <>Let's make<br />something<span>.</span></>,
    contactDescription: 'For a project, internship or just to say hello, send me a note.', sayHello: 'Say hello',
    email: 'EMAIL', github: 'GITHUB', viewProfile: 'View profile', footerBack: 'Back to top',
    footerLine: 'PERSONAL PORTFOLIO.', modalBrowse: 'Browse projects', modalEmail: 'Send an email', close: 'Close project details',
    stationIntro: 'Introduction', stationAbout: 'About Koji', stationSkills: 'Skills and toolkit', stationProjects: 'Selected projects', stationContact: 'Get in touch',
    stationTypes: ['PORTFOLIO / PROFILE', 'ABOUT / PROFILE', 'SKILLS / TOOLKIT', 'PROJECTS / PORTFOLIO', 'CONTACT / COLLABORATION'],
    stationDetails: [
      'Welcome to my portfolio. I am Koji, a third-year information systems student who learns by building practical projects.',
      'I am interested in building useful web experiences and reliable systems. I learn by turning coursework into practical projects.',
      'My current toolkit brings together web development, networking, systems analysis and software quality management.',
      'A selection of coursework and practical work across web development, networking and quality management.',
      'Have a project, internship or collaboration in mind? I would be glad to hear from you.',
    ],
    projects: [
      { title: 'Shop.mn', category: 'Web development', type: 'WEB / REACT', description: 'A responsive shopping experience with product discovery, filters and a working cart concept.', detail: 'A responsive e-commerce concept focused on clear product discovery, useful filters and a straightforward shopping flow.' },
      { title: 'Connected LAN', category: 'Networking', type: 'SYSTEMS / PACKET TRACER', description: 'A multi-router network using DHCP and EIGRP to connect local networks and verify end-to-end access.', detail: 'Designed and configured a routed LAN topology. DHCP assigns addresses, EIGRP exchanges routes, and ping checks confirm connectivity between PCs.' },
      { title: 'EventSnap', category: 'Quality management', type: 'QUALITY / WEB APP', description: 'A quality management plan covering requirements, assurance, testing and accessibility.', detail: 'A web application quality plan with measurable acceptance criteria, quality assurance activities and practical security and accessibility references.' },
    ],
  },
  mn: {
    nav: ['Танилцуулга', 'Миний тухай', 'Ур чадвар', 'Төслүүд', 'Холбоо барих'],
    cv: 'CV татах',
    aboutEyebrow: '01 / МИНИЙ ТУХАЙ', aboutTitle: <>Сониуч сэтгэл.<br /><span>Бодит</span> шийдэл.</>,
    aboutP1: 'Би мэдээллийн системийн чиглэлээр суралцдаг 3-р курсийн оюутан. Технологийг бодит хэрэгцээтэй холбох сонирхолтой бөгөөд вэб хөгжүүлэлт, сүлжээ, чанарын удирдлагын мэдлэгээ төсөл дээр хэрэгжүүлж байна.',
    aboutP2: 'Төсөл бүр шаардлага тодорхойлохоос эхлээд шийдэл бүтээх, тохируулах, шалгах хүртэлх ажлын үе шатуудыг практикт турших боломж олгодог.',
    explore: 'Төслүүдтэй танилцах',
    skillsEyebrow: '02 / УР ЧАДВАР', tools: 'АШИГЛАДАГ ХЭРЭГСЭЛ, ЧИГЛЭЛ', skillsTitle: <>Ажил хэрэг болгох<br /><span>ур чадварууд.</span></>,
    skillsDescription: 'Хичээл болон бие даасан төслөөрөө дамжуулан интерфэйс хөгжүүлэлтээс сүлжээний тохиргоо хүртэлх практик ур чадвараа хөгжүүлж байна.',
    workEyebrow: '03 / ТӨСЛҮҮД', all: 'Бүгд', filters: ['Вэб хөгжүүлэлт', 'Сүлжээ', 'Чанарын удирдлага'],
    workTitle: <>Санааг <span>ажил хэрэг</span> болгоё.</>,
    workDescription: <>Хичээл болон дадлагын хүрээнд хийсэн<br />вэб, сүлжээ, чанарын ажлууд.</>,
    contactEyebrow: '04 / ХОЛБОО БАРИХ', contactKicker: 'ТӨСӨЛ, БОЛОМЖИД НЭЭЛТТЭЙ',
    contactTitle: <>Хамтдаа<br />бүтээе<span>.</span></>,
    contactDescription: 'Төсөл, дадлага эсвэл мэнд мэдэхээр холбогдох бол надад бичээрэй.', sayHello: 'Зурвас бичих',
    email: 'И-МЭЙЛ', github: 'GITHUB', viewProfile: 'Профайл үзэх', footerBack: 'Дээш буцах',
    footerLine: 'ХУВИЙН ПОРТФОЛИО.', modalBrowse: 'Төслүүд үзэх', modalEmail: 'И-мэйл бичих', close: 'Дэлгэрэнгүйг хаах',
    stationIntro: 'Танилцуулга', stationAbout: 'Кожигийн тухай', stationSkills: 'Ур чадвар, хэрэгслүүд', stationProjects: 'Сонгосон төслүүд', stationContact: 'Холбоо барих',
    stationTypes: ['ПОРТФОЛИО / ТАНИЛЦУУЛГА', 'ТАНИЛЦУУЛГА / ПРОФАЙЛ', 'УР ЧАДВАР / ХЭРЭГСЭЛ', 'ТӨСЛҮҮД / ПОРТФОЛИО', 'ХОЛБОО / ХАМТЫН АЖИЛЛАГАА'],
    stationDetails: [
      'Миний портфолиод тавтай морил. Би Кожи, мэдээллийн системийн чиглэлээр суралцдаг 3-р курсийн оюутан бөгөөд бодит төсөл хийж суралцдаг.',
      'Хэрэгтэй вэб бүтээгдэхүүн болон найдвартай систем бүтээх сонирхолтой. Хичээлээр сурсан зүйлээ төсөл болгон хэрэгжүүлж байна.',
      'Миний одоогийн ур чадварт вэб хөгжүүлэлт, сүлжээ, системийн шинжилгээ, програм хангамжийн чанарын удирдлага багтана.',
      'Вэб хөгжүүлэлт, сүлжээ, чанарын удирдлагын чиглэлээр хийсэн хичээлийн болон дадлагын ажлуудын сонголт.',
      'Төсөл, дадлага эсвэл хамтын ажиллагааны санал байвал надтай холбогдоорой.',
    ],
    projects: [
      { title: 'Shop.mn', category: 'Вэб хөгжүүлэлт', type: 'ВЭБ / REACT', description: 'Бараа хайх, шүүх болон сагсны үндсэн боломж бүхий, бүх дэлгэцэд тохирох худалдааны вэбийн загвар.', detail: 'Бараа олоход хялбар, хэрэгтэй шүүлтүүртэй, ойлгомжтой худалдан авалтын урсгал бүхий цахим худалдааны концепц.' },
      { title: 'Connected LAN', category: 'Сүлжээ', type: 'СҮЛЖЭЭ / PACKET TRACER', description: 'DHCP болон EIGRP ашиглан дотоод сүлжээнүүдийг холбож, төгсгөлийн холболтыг шалгасан олон чиглүүлэгчтэй сүлжээ.', detail: 'Чиглүүлэлттэй LAN топологи зохион байгуулж тохируулсан. DHCP хаяг олгож, EIGRP чиглүүлэлтийн мэдээлэл солилцон, ping-ээр компьютеруудын холболтыг шалгасан.' },
      { title: 'EventSnap', category: 'Чанарын удирдлага', type: 'ЧАНАР / ВЭБ АПП', description: 'Шаардлага, чанарын баталгаа, туршилт болон хүртээмжийг хамарсан чанарын төлөвлөгөө.', detail: 'Вэб аппын чанарын төлөвлөгөө. Хүлээн авах хэмжүүр, чанарын баталгааны ажилбар, аюулгүй байдал болон хүртээмжийн эх сурвалжуудыг багтаасан.' },
    ],
  },
}

const skills = ['React', 'JavaScript', 'HTML & CSS', 'Cisco Packet Tracer', 'Network configuration', 'Quality management']
const skillMn = ['React', 'JavaScript', 'HTML ба CSS', 'Cisco Packet Tracer', 'Сүлжээний тохиргоо', 'Чанарын удирдлага']
const contactEmail = 'your-email@example.com'
const githubProfile = 'https://github.com/your-username'
const categoryKeys = ['Web development', 'Networking', 'Quality management']

function App() {
  const [filter, setFilter] = useState('All work')
  const [selected, setSelected] = useState(null)
  const [language, setLanguage] = useState(() => localStorage.getItem('portfolio-language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'dark')
  const t = content[language] || content.en
  const visibleProjects = useMemo(() => t.projects.filter((project, index) => filter === 'All work' || categoryKeys[index] === filter), [filter, t.projects])

  useEffect(() => { localStorage.setItem('portfolio-language', language) }, [language])
  useEffect(() => { localStorage.setItem('portfolio-theme', theme) }, [theme])

  const stationDetails = {
    engine: { id: 'intro', title: t.stationIntro, type: t.stationTypes[0], detail: t.stationDetails[0], stack: ['Information systems', 'Portfolio 2026'] },
    admin: { id: 'about', title: t.stationAbout, type: t.stationTypes[1], detail: t.stationDetails[1], stack: (language === 'mn' ? skillMn : skills).slice(0, 4) },
    storefront: { id: 'skills', title: t.stationSkills, type: t.stationTypes[2], detail: t.stationDetails[2], stack: language === 'mn' ? skillMn : skills },
    cabinet: { id: 'projects', title: t.stationProjects, type: t.stationTypes[3], detail: t.stationDetails[3], stack: t.projects.map((project) => project.title) },
    cashdesk: { id: 'cashdesk', title: t.stationContact, type: t.stationTypes[4], detail: t.stationDetails[4], stack: [contactEmail] },
  }

  return (
    <div className="portfolio-app" data-theme={theme}>
      <main>
        <section id="home" className="factory-shell" aria-label={t.nav[0]}>
          <AgenticFactory3D height="100vh" language={language} onStation={(id) => setSelected(stationDetails[id])} />
          <div className="hero-welcome">
            <p className="eyebrow">{language === 'mn' ? 'САЙН УУ / HELLO' : 'HELLO / САЙН УУ'}</p>
            <h1>{language === 'mn' ? <>Сайн уу,<br />би Кожи. <span>Миний портфолиод тавтай морил!</span></> : <>Hello,<br />I'm Koji. <span>Welcome to my portfolio.</span></>}</h1>
            <p className="welcome-description">{language === 'mn' ? 'Мэдээллийн системийн оюутны хувьд хийж буй төслүүд, ур чадвар, суралцаж буй замналтай минь танилцаарай.' : 'Explore the projects, skills and learning journey I am building as an information systems student.'}</p>
            <a className="welcome-link" href="#about">{language === 'mn' ? 'Портфолиотой танилцах' : 'Explore my portfolio'} <span aria-hidden="true">↗</span></a>
          </div>
          <div className="portfolio-preferences" aria-label={language === 'mn' ? 'Хэл болон дэлгэцийн тохиргоо' : 'Display and language settings'}>
            <div className="language-switch" role="group" aria-label={language === 'mn' ? 'Хэл сонгох' : 'Choose language'}>
              <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => { setFilter('All work'); setLanguage('en') }} aria-pressed={language === 'en'}>EN</button>
              <button type="button" className={language === 'mn' ? 'selected' : ''} onClick={() => { setFilter('All work'); setLanguage('mn') }} aria-pressed={language === 'mn'}>MN</button>
            </div>
            <button className="theme-switch" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? (language === 'mn' ? 'Цайвар загвар руу шилжих' : 'Switch to light theme') : (language === 'mn' ? 'Бараан загвар руу шилжих' : 'Switch to dark theme')} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span><span>{theme === 'dark' ? (language === 'mn' ? 'Цагаан' : 'Light') : (language === 'mn' ? 'Хар' : 'Dark')}</span>
            </button>
          </div>
        </section>

        <section className="about section-pad" id="about" aria-labelledby="about-title">
          <div className="section-heading"><p className="eyebrow">{t.aboutEyebrow}</p><span className="heading-rule" /></div>
          <div className="about-layout">
            <h2 id="about-title">{t.aboutTitle}</h2>
            <div className="about-text"><p>{t.aboutP1}</p><p>{t.aboutP2}</p><a className="text-link" href="#work">{t.explore} <span>↗</span></a></div>
          </div>
        </section>

        <section className="skills-section section-pad" id="skills" aria-labelledby="skills-title">
          <div className="section-heading"><p className="eyebrow">{t.skillsEyebrow}</p><span className="heading-rule" /></div>
          <div className="skills-content"><div><p className="eyebrow">{t.tools}</p><h2 id="skills-title">{t.skillsTitle}</h2></div><div className="skills-copy"><p>{t.skillsDescription}</p><div className="skill-chips">{(language === 'mn' ? skillMn : skills).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div></div></div>
        </section>

        <section className="work section-pad" id="work" aria-labelledby="work-title">
          <div className="section-heading"><p className="eyebrow">{t.workEyebrow}</p><span className="heading-rule" /><span className="project-count">0{visibleProjects.length} {language === 'mn' ? 'БҮТЭЭЛ' : 'PROJECTS'}</span></div>
          <div className="work-heading"><h2 id="work-title">{t.workTitle}</h2><p>{t.workDescription}</p></div>
          <div className="filter-bar" aria-label={language === 'mn' ? 'Төслөөр шүүх' : 'Filter projects'}>
            {[t.all, ...t.filters].map((item, index) => <button className={(filter === (index === 0 ? 'All work' : categoryKeys[index - 1])) ? 'filter-chip active' : 'filter-chip'} key={item} type="button" onClick={() => setFilter(index === 0 ? 'All work' : categoryKeys[index - 1])} aria-pressed={filter === (index === 0 ? 'All work' : categoryKeys[index - 1])}>{item}</button>)}
          </div>
          <div className="project-grid">
            {visibleProjects.map((project) => (
              <button className="project-card" key={project.title} type="button" onClick={() => setSelected(project)} aria-label={`${project.title} ${language === 'mn' ? 'дэлгэрэнгүй нээх' : 'project details'}`}>
                <span className={`project-art ${['shop-art', 'network-art', 'event-art'][t.projects.indexOf(project)]}`} aria-hidden="true">
                  <span className="project-art-top"><span>KOJI / WORKS</span><span>0{t.projects.indexOf(project) + 1} - 03</span></span>
                  {project.title === 'Shop.mn' && <span className="shop-window"><span className="window-dots">● ● ●</span><span className="shop-title">find your<br /><b>everyday.</b></span><span className="shop-product"><i /><i /><i /></span><span className="shop-cta">EXPLORE GOODS ↗</span></span>}
                  {project.title === 'Connected LAN' && <span className="network-map"><i className="node node-a">R1</i><i className="node node-b">R2</i><i className="node node-c">LAN</i><i className="node node-d">LAN</i><i className="link link-a"/><i className="link link-b"/><i className="link link-c"/><i className="link link-d"/></span>}
                  {project.title === 'EventSnap' && <span className="event-board"><span className="event-date">Q / 01</span><span className="event-title">quality<br />in every<br /><b>detail.</b></span><span className="event-stamp">E</span><span className="event-lines" /></span>}
                  <span className="project-art-foot"><span>{project.type}</span><span className="art-open">↗</span></span>
                </span>
                <span className="project-info"><span><span className="project-no">0{t.projects.indexOf(project) + 1}</span><strong>{project.title}</strong></span><span className="project-category">{project.category}</span></span>
                <span className="project-description">{project.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
          <div className="contact-orbit" aria-hidden="true"><span>{language === 'mn' ? <>УТГАТАЙ ЗҮЙЛ<br />ХАМТДАА БҮТЭЭЕ</> : <>LET'S MAKE SOMETHING<br />THAT MATTERS</>}</span><i>✦</i></div>
          <div className="section-heading"><p className="eyebrow">{t.contactEyebrow}</p><span className="heading-rule" /></div>
          <div className="contact-copy"><p className="eyebrow contact-eyebrow">{t.contactKicker}</p><h2 id="contact-title">{t.contactTitle}</h2><p>{t.contactDescription}</p><a className="button button-primary contact-button" href={`mailto:${contactEmail}?subject=Portfolio%20inquiry`}>{t.sayHello} <span>↗</span></a>
            <div className="contact-links"><a href={`mailto:${contactEmail}`}><span>{t.email}</span>{contactEmail} ↗</a><a href={githubProfile} target="_blank" rel="noreferrer"><span>{t.github}</span>{t.viewProfile} ↗</a></div>
          </div>
          <div className="contact-bottom"><span>KOJI / PORTFOLIO 2026</span><a href="#home">{t.footerBack} ↑</a><span>{language === 'mn' ? 'СОНИУЧ СЭТГЭЛЭЭР.' : 'BUILT WITH CURIOSITY.'}</span></div>
        </section>
      </main>

      <footer className="site-footer"><span>© 2026 KOJI</span><span>{t.footerLine}</span><a href="#home">{t.footerBack} ↑</a></footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}>
        <section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" type="button" aria-label={t.close} onClick={() => setSelected(null)}>×</button>
          <p className="eyebrow">{selected.type || 'PORTFOLIO STATION'}</p><h2 id="modal-title">{selected.title}</h2><p>{selected.detail}</p>
          <div className="modal-stack">{(selected.stack || []).map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}</div>
          {selected.id === 'cashdesk' ? <a className="text-link" href={`mailto:${contactEmail}`}>{t.modalEmail} <span>↗</span></a> : <a className="text-link" href="#work" onClick={() => setSelected(null)}>{t.modalBrowse} <span>↗</span></a>}
        </section>
      </div>}
    </div>
  )
}

export default App