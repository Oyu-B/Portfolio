import { useEffect, useMemo, useRef, useState } from 'react'
import AgenticFactory3D from '@/components/ui/agentic-factory-3d'
import profileImage from './assets/oyu-profile.png'
import './App.css'
import {
  categoryKeys,
  content,
  contactEmail,
  githubProfile,
  phoneNumber,
  personalSkillMn,
  personalSkills,
  professionalSkillMn,
  professionalSkills,
  skillMn,
  skills,
  stationOrder,
} from './data/portfolio-content.jsx'

const projectArtClasses = ['shop-art', 'event-art', 'game-art']
const projectNarratives = {
  en: [
    {
      overview: 'A furniture storefront concept designed to present products in a clear, easy-to-browse online shop layout.',
      highlights: ['A visual identity shaped around furniture', 'A product-focused storefront design', 'Built with JavaScript, TypeScript, HTML and CSS'],
    },
    {
      overview: 'A digital museum website created for the University of Finance and Economics’ Department of Information Systems Management and Technology.',
      highlights: ['A web presentation for the ISMD department', 'Information arranged in a digital museum format', 'Built with JavaScript, HTML and CSS'],
    },
    {
      overview: 'A small interactive browser game based on catching falling stars, built as a TypeScript and JavaScript project.',
      highlights: ['A star-catching game concept', 'Interactive play built for the browser', 'Built with TypeScript and JavaScript'],
    },
  ],
  mn: [
    {
      overview: 'Тавилгын бүтээгдэхүүнийг цахим дэлгүүрийн загвараар танилцуулах вэб төсөл. Бүтээгдэхүүнийг ойлгомжтой, эмх цэгцтэй харуулахад төвлөрсөн.',
      highlights: ['Тавилгад тохирсон өнгө, дүрслэл', 'Бүтээгдэхүүнийг онцолсон дэлгүүрийн нүүр загвар', 'JavaScript, TypeScript, HTML, CSS ашигласан'],
    },
    {
      overview: 'СЭЗИС-ийн Мэдээллийн системийн менежмент, технологийн тэнхимд зориулсан цахим музейн вэб хуудас. Мэдээллийг эмхэлж, ойлгомжтой хүргэхэд чиглэсэн.',
      highlights: ['Тэнхимийн мэдээллийг цахимаар танилцуулсан', 'Музейн хэлбэрийн вэб зохиомж', 'JavaScript, HTML, CSS ашигласан'],
    },
    {
      overview: 'Од барих тоглоомын санаанд суурилсан интерактив веб тоглоом. JavaScript, TypeScript ашиглан тоглоомын үйлдлийг хэрэгжүүлсэн.',
      highlights: ['Од барих тоглоомын санаа', 'Хөтөч дээр тоглох интерактив хэлбэр', 'TypeScript, JavaScript ашигласан'],
    },
  ],
}

function ProjectArtwork({ project, index, language, large = false }) {
  return (
    <span className={`project-art ${projectArtClasses[index]}${large ? ' project-art-large' : ''}`} aria-hidden="true">
      <span className="project-art-top">
        <span>{language === 'mn' ? 'ОЮ / БҮТЭЭЛ' : 'OYU / WORKS'}</span>
        <span>0{index + 1} — 03</span>
      </span>
      {index === 0 && (
        <span className="shop-window">
          <span className="window-dots">&#8226; &#8226; &#8226;</span>
          <span className="shop-title">{language === 'mn' ? <>тавилгын<br /><b>онлайн дэлгүүр.</b></> : <>furniture<br /><b>online shop.</b></>}</span>
          <span className="shop-product"><i /><i /><i /></span>
          <span className="shop-cta">{language === 'mn' ? 'ТАВИЛГЫН ЦАХИМ ХУДАЛДАА' : 'FURNITURE ONLINE SHOP'}</span>
        </span>
      )}
      {index === 1 && (
        <span className="event-board ismd-board">
          <span className="event-date">UFE / ISMD</span>
          <span className="event-title">{language === 'mn' ? <>цахим<br />мэдээллийн<br /><b>танилцуулга.</b></> : <>digital<br />department<br /><b>website.</b></>}</span>
          <span className="event-stamp">U</span>
          <span className="event-lines" />
        </span>
      )}
      {index === 2 && (
        <span className="catcher-game">
          <i className="game-star star-one">&#10022;</i>
          <i className="game-star star-two">&#10022;</i>
          <i className="game-star star-three">&#10022;</i>
          <b className="game-basket">OYU</b>
        </span>
      )}
      <span className="project-art-foot"><span>{project.type}</span><span className="art-open">↗</span></span>
    </span>
  )
}

function App() {
  // Page state: filters, selected details, language, and visual theme.
  const [filter, setFilter] = useState('All work')
  const [selected, setSelected] = useState(null)
  const [stationIndex, setStationIndex] = useState(null)
  const [language, setLanguage] = useState(() => localStorage.getItem('portfolio-language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'dark')
  const tourTimer = useRef(null)
  const t = content[language] || content.en
  const visibleProjects = useMemo(
    () =>
      t.projects.filter(
        (project, index) => filter === 'All work' || categoryKeys[index] === filter,
      ),
    [filter, t.projects],
  )

  // Keep the selected settings between visits and update browser metadata.
  useEffect(() => {
    localStorage.setItem('portfolio-language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title = language === 'mn' ? 'Оюу | Портфолио' : 'Oyu | Portfolio'
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      language === 'mn'
        ? 'Оюугийн портфолио: танилцуулга, ур чадвар, бүтээлүүд болон холбоо барих мэдээлэл.'
        : 'Oyu\'s portfolio: introduction, skills, selected projects and contact information.',
    )
  }, [language])

  // Connect each 3D stop to the matching portfolio information.
  const stationDetails = {
    engine: {
      id: 'intro',
      title: t.stationIntro,
      type: t.stationTypes[0],
      detail: t.stationDetails[0],
      stack: language === 'mn' ? ['Мэдээллийн систем', 'СЭЗИС'] : ['Information systems', 'UFE'],
      image: profileImage,
      imageAlt: language === 'mn' ? 'Оюу мэндчилж буй зураг' : 'Oyu waving hello',
    },
    admin: {
      id: 'about',
      title: t.stationAbout,
      type: t.stationTypes[1],
      detail: t.stationDetails[1],
      stack: (language === 'mn' ? skillMn : skills).slice(0, 4),
    },
    storefront: {
      id: 'skills',
      title: t.stationSkills,
      type: t.stationTypes[2],
      detail: t.stationDetails[2],
      stack: language === 'mn' ? skillMn : skills,
    },
    cabinet: {
      id: 'projects',
      title: t.stationProjects,
      type: t.stationTypes[3],
      detail: t.stationDetails[3],
      stack: t.projects.map((project) => project.title),
    },
    cashdesk: {
      id: 'cashdesk',
      title: t.stationContact,
      type: t.stationTypes[4],
      detail: t.stationDetails[4],
      stack: [contactEmail],
    },
  }

  // Station click and guided-tour navigation.
  function openStation(id) {
    const index = stationOrder.indexOf(id)
    if (index < 0) return
    window.clearTimeout(tourTimer.current)
    setStationIndex(index)
    setSelected(stationDetails[id])
    window.__machine?.pause()
  }

  function startTour() {
    const firstId = stationOrder[0]
    if (!firstId) return
    window.clearTimeout(tourTimer.current)
    setStationIndex(0)
    setSelected(null)
    window.__machine?.setMode('stations')
    window.__machine?.focusStation(firstId)
    window.__machine?.pause()
    tourTimer.current = window.setTimeout(() => {
      setSelected(stationDetails[firstId])
    }, 1200)
  }

  function continueTour() {
    if (stationIndex === null) return
    const nextIndex = stationIndex + 1
    const nextId = stationOrder[nextIndex]
    setSelected(null)
    if (!nextId) {
      window.__machine?.setCamera('overview')
      setStationIndex(null)
      return
    }

    window.__machine?.travelToStation(nextId)
    tourTimer.current = window.setTimeout(() => {
      setStationIndex(nextIndex)
      setSelected(stationDetails[nextId])
    }, 2350)
  }

  function browseProject(direction) {
    if (!selected?.category) return
    const index = (selected.projectIndex + direction + t.projects.length) % t.projects.length
    setSelected({ ...t.projects[index], ...projectNarratives[language][index], projectIndex: index })
  }

  useEffect(
    () => () => window.clearTimeout(tourTimer.current),
    [],
  )

  // Page sections: 3D landing, profile, skills, projects, and contact.
  return (
    <div className="portfolio-app" data-theme={theme}>
      <main>
        <section id="home" className="factory-shell" aria-label={t.nav[0]}>
          <AgenticFactory3D height="100%" language={language} onStation={openStation} onTourStart={startTour} />
          <div className="portfolio-preferences" aria-label={language === 'mn' ? 'Хэл болон дэлгэцийн тохиргоо' : 'Display and language settings'}>
            <div className="language-switch" role="group" aria-label={language === 'mn' ? 'Хэл сонгох' : 'Choose language'}>
              <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => { setFilter('All work'); setLanguage('en') }} aria-pressed={language === 'en'}>{language === 'mn' ? 'АНГЛИ' : 'EN'}</button>
              <button type="button" className={language === 'mn' ? 'selected' : ''} onClick={() => { setFilter('All work'); setLanguage('mn') }} aria-pressed={language === 'mn'}>{language === 'mn' ? 'МОНГОЛ' : 'MN'}</button>
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
            <div className="about-text">
              <p>{t.aboutP1}</p>
              <div className="about-info-block">
                <h3>{language === 'mn' ? 'Миний давуу тал' : 'My strengths'}</h3>
                <p>{t.aboutP2}</p>
              </div>
              <div className="about-info-block education-note">
                <h3>{language === 'mn' ? 'Боловсрол' : 'Education'}</h3>
                <p>{t.education.replace(/^(Боловсрол: |Education: )/, '')}</p>
              </div>
              <div className="achievement-list">
                <h3>{t.achievementsTitle}</h3>
                <ul>{t.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
              </div>
              <a className="text-link" href="#work">{t.explore} <span>&#8599;</span></a>
            </div>
          </div>
        </section>

        <section className="skills-section section-pad" id="skills" aria-labelledby="skills-title">
          <div className="section-heading"><p className="eyebrow">{t.skillsEyebrow}</p><span className="heading-rule" /></div>
          <div className="skills-content"><div><p className="eyebrow">{t.tools}</p><h2 id="skills-title">{t.skillsTitle}</h2></div><div className="skills-copy"><p>{t.skillsDescription}</p><div className="skill-groups"><div className="skill-group"><h3>{t.professionalSkillsTitle}</h3><div className="skill-chips">{(language === 'mn' ? professionalSkillMn : professionalSkills).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div></div><div className="skill-group"><h3>{t.personalSkillsTitle}</h3><div className="skill-chips">{(language === 'mn' ? personalSkillMn : personalSkills).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div></div></div></div></div>
        </section>

        <section className="work section-pad" id="work" aria-labelledby="work-title">
          <div className="section-heading"><p className="eyebrow">{t.workEyebrow}</p><span className="heading-rule" /><span className="project-count">0{visibleProjects.length} {language === 'mn' ? 'БҮТЭЭЛ' : 'PROJECTS'}</span></div>
          <div className="work-heading"><h2 id="work-title">{t.workTitle}</h2><p>{t.workDescription}</p></div>
          <div className="filter-bar" aria-label={language === 'mn' ? 'Төслөөр шүүх' : 'Filter projects'}>
            {[t.all, ...t.filters].map((item, index) => <button className={(filter === (index === 0 ? 'All work' : categoryKeys[index - 1])) ? 'filter-chip active' : 'filter-chip'} key={item} type="button" onClick={() => setFilter(index === 0 ? 'All work' : categoryKeys[index - 1])} aria-pressed={filter === (index === 0 ? 'All work' : categoryKeys[index - 1])}>{item}</button>)}
          </div>
          <div className="project-grid">
            {visibleProjects.map((project) => {
              const projectIndex = t.projects.indexOf(project)
              const narrative = projectNarratives[language][projectIndex]
              return (
              <button className="project-card" key={project.title} type="button" onClick={() => setSelected({ ...project, ...projectNarratives[language][projectIndex], projectIndex })} aria-label={`${project.title} ${language === 'mn' ? 'дэлгэрэнгүй нээх' : 'project details'}`}>
                <span className={`project-art ${['shop-art', 'event-art', 'game-art'][t.projects.indexOf(project)]}`} aria-hidden="true">
                  <span className="project-art-top"><span>{language === 'mn' ? 'ОЮУ / БҮТЭЭЛ' : 'OYU / WORKS'}</span><span>0{t.projects.indexOf(project) + 1} - 03</span></span>
                  {t.projects.indexOf(project) === 0 && <span className="shop-window"><span className="window-dots">&#8226; &#8226; &#8226;</span><span className="shop-title">{language === 'mn' ? <>Тавилгын<br /><b>онлайн дэлгүүр.</b></> : <>furniture<br /><b>online shop.</b></>}</span><span className="shop-product"><i /><i /><i /></span><span className="shop-cta">{language === 'mn' ? 'Тавилгын дэлгүүртэй танилцах' : 'EXPLORE FURNITURE'}</span></span>}
                  {t.projects.indexOf(project) === 1 && <span className="event-board ismd-board"><span className="event-date">{language === 'mn' ? 'СЭЗИС / МСМТ' : 'UFE / ISMD'}</span><span className="event-title">{language === 'mn' ? <>цахим<br />музейн<br /><b>вэбсайт.</b></> : <>digital<br />museum<br /><b>website.</b></>}</span><span className="event-stamp">U</span><span className="event-lines" /></span>}
                  {t.projects.indexOf(project) === 2 && <span className="catcher-game"><i className="game-star star-one">&#10022;</i><i className="game-star star-two">&#10022;</i><i className="game-star star-three">&#10022;</i><b className="game-basket">OYU</b></span>}
                  <span className="project-art-foot"><span>{project.type}</span><span className="art-open">↗</span></span>
                </span>
                <span className="project-info"><span><span className="project-no">0{t.projects.indexOf(project) + 1}</span><strong>{project.title}</strong></span><span className="project-category">{project.category}</span></span>
                <span className="project-description">{project.description}</span>
                <span className="project-card-details">
                  <span className="project-card-detail-label">{language === 'mn' ? 'ТӨСЛИЙН ДЭЛГЭРЭНГҮЙ' : 'PROJECT OVERVIEW'}</span>
                  <span className="project-card-overview">{narrative.overview}</span>
                  <span className="project-card-detail-label">{language === 'mn' ? 'ОНЦЛОГ' : 'HIGHLIGHTS'}</span>
                  <span className="project-card-highlights">{narrative.highlights.map((item) => <span key={item}>{item}</span>)}</span>
                  <span className="project-card-detail-label">{language === 'mn' ? 'АШИГЛАСАН ТЕХНОЛОГИ' : 'BUILT WITH'}</span>
                  <span className="project-card-stack">{project.stack.map((technology) => <span className="skill-chip" key={technology}>{technology}</span>)}</span>
                </span>
                  <span className="project-card-cta">{language === 'mn' ? 'Дэлгэрэнгүй үзэх' : 'Explore project'} <span aria-hidden="true">↗</span></span>
              </button>
              )
            })}
          </div>
        </section>

        <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
          <div className="contact-orbit" aria-hidden="true"><span>{language === 'mn' ? <>УТГАТАЙ ЗҮЙЛ<br />ХАМТДАА БҮТЭЭЕ</> : <>LET'S MAKE SOMETHING<br />THAT MATTERS</>}</span><i>✦</i></div>
          <div className="section-heading"><p className="eyebrow">{t.contactEyebrow}</p><span className="heading-rule" /></div>
          <div className="contact-copy"><p className="eyebrow contact-eyebrow">{t.contactKicker}</p><h2 id="contact-title">{t.contactTitle}</h2><p>{t.contactDescription}</p><a className="button button-primary contact-button" href={`mailto:${contactEmail}?subject=Portfolio%20inquiry`}>{t.sayHello} <span>↗</span></a>
            <div className="contact-links"><a href={`mailto:${contactEmail}`}><span>{t.email}</span>{contactEmail}</a><a href={`tel:${phoneNumber}`}><span>{t.phone}</span>{phoneNumber}</a><a href={githubProfile} target="_blank" rel="noreferrer"><span>{t.github}</span>{t.viewProfile}</a></div>
          </div>
          <div className="contact-bottom"><span>{language === 'mn' ? 'ОЮУ / ПОРТФОЛИО 2026' : 'OYU / PORTFOLIO 2026'}</span><a href="#home">{t.footerBack} &#8593;</a><span>{language === 'mn' ? 'ШИНЭ ЗҮЙЛД СУРАЛЦАГЧ.' : 'ALWAYS LEARNING.'}</span></div>
        </section>
      </main>

      <footer className="site-footer"><span>&copy; 2026 {language === 'mn' ? 'ОЮУ' : 'OYU'}</span><span>{t.footerLine}</span><a href="#home">{t.footerBack} &#8593;</a></footer>

      {selected && <div className={`modal-backdrop${stationIndex !== null ? ' station-backdrop' : ''}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelected(null); if (stationIndex !== null) { setStationIndex(null); window.__machine?.setCamera('overview') } } }}>
        <section className={`project-modal${stationIndex !== null ? ' station-page' : ''}${selected.image ? ' station-page-intro' : ''}${selected.category ? ' project-detail-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" type="button" aria-label={t.close} onClick={() => { setSelected(null); setStationIndex(null); window.__machine?.setCamera('overview') }}>×</button>
          {selected.category ? (
            <div className="project-detail-layout">
              <div className="project-detail-visual">
                <ProjectArtwork project={selected} index={selected.projectIndex} language={language} large />
                <span className="project-detail-counter">{String(selected.projectIndex + 1).padStart(2, '0')} <i>/ {String(t.projects.length).padStart(2, '0')}</i></span>
                <div className="project-detail-navigation">
                  <button type="button" onClick={() => browseProject(-1)} aria-label={language === 'mn' ? 'Өмнөх бүтээл' : 'Previous project'}>←</button>
                  <button type="button" onClick={() => browseProject(1)} aria-label={language === 'mn' ? 'Дараагийн бүтээл' : 'Next project'}>→</button>
                </div>
              </div>
              <div className="project-detail-copy">
                <p className="eyebrow">{selected.category} <span>·</span> {selected.type}</p>
                <h2 id="modal-title">{selected.title}</h2>
                <p className="project-detail-summary">{selected.detail || selected.description}</p>
                <div className="project-detail-section">
                  <p className="project-detail-label">{language === 'mn' ? 'ТӨСЛИЙН ТОВЧ ТАНИЛЦУУЛГА' : 'PROJECT OVERVIEW'}</p>
                  <p>{selected.overview || selected.description}</p>
                </div>
                <div className="project-detail-section">
                  <p className="project-detail-label">{language === 'mn' ? 'ГОЛ ОНЦЛОГ' : 'HIGHLIGHTS'}</p>
                  <ul>{(selected.highlights || []).map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="project-detail-section">
                  <p className="project-detail-label">{language === 'mn' ? 'АШИГЛАСАН ТЕХНОЛОГИ' : 'BUILT WITH'}</p>
                  <div className="modal-stack">{(selected.stack || []).map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}</div>
                </div>
                <div className="project-detail-actions">
                  {selected.demo && <a className="button button-primary" href={selected.demo} target="_blank" rel="noreferrer">{language === 'mn' ? 'Төслийн нүүр хуудас' : 'Open project website'} <span aria-hidden="true">↗</span></a>}
                  {selected.github && <a className="project-github-link" href={selected.github} target="_blank" rel="noreferrer">{language === 'mn' ? 'Эх код харах' : 'View source on GitHub'}</a>}
                  <button className="project-back-link" type="button" onClick={() => setSelected(null)}>{language === 'mn' ? 'Бүтээлүүд рүү буцах' : 'Back to projects'}</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {stationIndex !== null && <p className="station-page-count">0{stationIndex + 1} <span>/ 05</span></p>}
              <p className="eyebrow">{selected.type || 'PORTFOLIO STATION'}</p>
              {selected.image && <img className="station-profile-image" src={selected.image} alt={selected.imageAlt} />}
              <h2 id="modal-title">{selected.title}</h2>
              {stationIndex === 0 ? (
                <div className="station-profile-info">
                  <div><span>{language === 'mn' ? 'НЭР' : 'NAME'}</span><strong>{language === 'mn' ? 'Балбаатар Оюу' : 'Oyu Balbaatar'}</strong></div>
                  <div><span>{language === 'mn' ? 'СУРАЛЦАЖ БУЙ ГАЗАР' : 'UNIVERSITY'}</span><strong>{language === 'mn' ? 'Санхүү, эдийн засгийн их сургууль' : 'University of Finance and Economics'}</strong></div>
                  <div><span>{language === 'mn' ? 'ХӨТӨЛБӨР' : 'PROGRAM'}</span><strong>{language === 'mn' ? 'Мэдээллийн системийн менежмент' : 'Information Systems Management'}</strong></div>
                </div>
              ) : <p>{selected.detail}</p>}
              <div className="modal-stack">{(selected.stack || []).map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}</div>
              {selected.github && <a className="text-link project-source-link" href={selected.github} target="_blank" rel="noreferrer">GitHub <span>&#8599;</span></a>}
              {stationIndex !== null && <button className="button button-primary station-continue" type="button" onClick={continueTour}>{stationIndex === stationOrder.length - 1 ? 'Finish tour' : 'Continue'} <span>→</span></button>}
              {stationIndex === null && (selected.id === 'cashdesk' ? <a className="text-link" href={`mailto:${contactEmail}`}>{t.modalEmail} <span>&#8599;</span></a> : <a className="text-link" href="#work" onClick={() => setSelected(null)}>{t.modalBrowse} <span>&#8599;</span></a>)}
            </>
          )}        </section>
      </div>}
    </div>
  )
}

export default App
