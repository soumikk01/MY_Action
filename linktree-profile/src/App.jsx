import { useState, useEffect } from 'react'
import './App.css'
import avatar from './assets/avatar.png'
import ThreeBackground from './components/ThreeBackground'
import AdminPanel from './components/AdminPanel'

// Social Media Icons as SVG components
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
)




// Social links data
const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/soumikpaul', icon: LinkedInIcon },
  { name: 'GitHub', url: 'https://github.com/soumikk01', icon: GitHubIcon },
  { name: 'YouTube', url: 'https://youtube.com/@soumikpaul', icon: YouTubeIcon },
  { name: 'Instagram', url: 'https://instagram.com/logcos2x', icon: InstagramIcon },
]



// Tech Tree data with Roadmap Steps
const techTree = [
  {
    id: 'step-1',
    step: 'Step 1',
    name: 'Web Fundamentals',
    icon: '🌐',
    color: 'blue',
    children: [
      {
        id: 'web-internet',
        name: 'Internet basics',
        icon: '☁️',
        items: [
          { name: 'DNS', icon: '📡' },
          { name: 'HTTP/HTTPS', icon: '🔒' },
          { name: 'Browsers', icon: '🌐' },
        ],
      },
      {
        id: 'frontend-basics',
        name: 'Frontend Basics',
        icon: '🎨',
        items: [
          { name: 'HTML5', icon: '📄' },
          { name: 'CSS3', icon: '🎨' },
          { name: 'JavaScript', icon: '🟨' },
        ],
      },
    ],
  },
  {
    id: 'step-2',
    step: 'Step 2',
    name: 'Frontend Frameworks',
    icon: '⚡',
    color: 'red',
    children: [
      {
        id: 'react-ecosystem',
        name: 'React Ecosystem',
        icon: '⚛️',
        items: [
          { name: 'React', icon: '⚛️' },
          { name: 'Vite', icon: '⚡' },
          { name: 'Hooks', icon: '🪝' },
        ],
      },
      {
        id: 'styling-libs',
        name: 'Modern Styling',
        icon: '💅',
        items: [
          { name: 'Tailwind CSS', icon: '🌊' },
          { name: 'Styled Components', icon: '💅' },
        ],
      },
    ],
  },
  {
    id: 'step-3',
    step: 'Step 3',
    name: 'Backend & APIs',
    icon: '⚙️',
    color: 'yellow',
    children: [
      {
        id: 'backend-runtime',
        name: 'Runtimes',
        icon: '🟩',
        items: [
          { name: 'Node.js', icon: '🟩' },
          { name: 'PHP', icon: '🐘' },
        ],
      },
      {
        id: 'api-design',
        name: 'APIs',
        icon: '🔌',
        items: [
          { name: 'REST', icon: '🔗' },
          { name: 'GraphQL', icon: '💠' },
        ],
      },
    ],
  },
  {
    id: 'step-4',
    step: 'Step 4',
    name: 'Databases',
    icon: '🗃️',
    color: 'green',
    children: [
      {
        id: 'relational-db',
        name: 'Relational',
        icon: '📊',
        items: [
          { name: 'MySQL', icon: '🐬' },
          { name: 'PostgreSQL', icon: '🐘' },
        ],
      },
      {
        id: 'nosql-db',
        name: 'NoSQL',
        icon: '🍃',
        items: [
          { name: 'MongoDB', icon: '🍃' },
          { name: 'Redis', icon: '🟥' },
        ],
      },
    ],
  },
  {
    id: 'step-5',
    step: 'Step 5',
    name: 'Development Tools',
    icon: '🛠️',
    color: 'purple',
    children: [
      {
        id: 'version-control',
        name: 'VCS',
        icon: '📦',
        items: [
          { name: 'Git', icon: '📦' },
          { name: 'GitHub', icon: '🐙' },
        ],
      },
      {
        id: 'video-editing',
        name: 'Video & Motion',
        icon: '🎬',
        items: [
          { name: 'After Effects', icon: '🎬' },
          { name: 'Premiere Pro', icon: '🎥' },
        ],
      },
    ],
  },
]

// Default Projects data
const defaultProjects = [
  {
    id: '1',
    name: 'Portfolio Website',
    description: 'A modern portfolio website built with React and animated backgrounds.',
    tech: ['React', 'CSS3', 'Vite'],
    url: 'https://github.com/soumikk01/My_Portfolio',
    demo: '#',
  },
  {
    id: '2',
    name: 'Exam Portal',
    description: 'Student examination portal with QR code integration and schedule management.',
    tech: ['PHP', 'MySQL', 'JavaScript'],
    url: 'https://github.com/soumikk01',
    demo: '#',
  },
  {
    id: '3',
    name: 'Video Editor Projects',
    description: 'Professional video editing and motion graphics portfolio.',
    tech: ['After Effects', 'Premiere Pro'],
    url: 'https://youtube.com/@soumikpaul',
    demo: '#',
  },
]

// Settings Icon for Admin toggle
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

// External Link Icon
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)



function HeroSection() {
  return (
    <section className="hero-section">
      {/* Greeting Line */}
      <div className="hero-greeting">
        <span className="greeting-line"></span>
        <span className="greeting-text">Hello, I'm Soumik</span>
      </div>

      {/* Main Hero Content */}
      <div className="hero-main">
        <div className="hero-left">
          <h1 className="hero-title-creative">Creative</h1>
        </div>

        <div className="hero-avatar-wrapper">
          <img src={avatar} alt="Soumik Biswas" className="hero-avatar" />
        </div>

        <div className="hero-right">
          <h1 className="hero-title-developer">Developer.</h1>
        </div>
      </div>

      {/* Description */}
      <p className="hero-description">
        I'm an experienced <strong>Full Stack Developer</strong> with <strong>Over 5 years</strong> of
        experience, specializing in creating innovative digital
        products used by thousands worldwide.
      </p>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="footer-section">
      {/* Decorative Circle Left */}
      <div className="footer-decor-left">
        <div className="decor-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="footer-main">
        <h2 className="footer-thanks">
          Thanks <span className="thanks-highlight">for</span> <span className="thanks-box">scrolling</span> <span className="thanks-emoji">😊</span>
        </h2>

        {/* Scroll Arrow */}
        <div className="footer-scroll-indicator">
          <div className="scroll-ellipse"></div>
          <div className="scroll-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 16l-6-6h12l-6 6z" />
            </svg>
          </div>
        </div>
      </div>

      {/* SB Badge Right */}
      <div className="footer-badge">
        <div className="sb-badge">
          <div className="sb-inner">
            <span>SB</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="footer-bottom">
        <div className="powered-by">
          <span>Powered by</span>
          <span className="powered-icon">⚡</span>
        </div>
        <div className="support-text">
          <span className="heart-icon">💖</span>
          <span>PRESS L for support</span>
        </div>
      </div>
    </footer>
  )
}



function SocialIcons() {
  return (
    <div className="social-icons">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label={link.name}
        >
          <link.icon />
        </a>
      ))}
    </div>
  )
}



// Tree Branch Icon
const TreeBranchIcon = ({ isExpanded }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`tree-arrow ${isExpanded ? 'expanded' : ''}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Tech Section Component with Tree Structure
function TechSection() {
  const [expandedBranches, setExpandedBranches] = useState({})
  const [expandedSubBranches, setExpandedSubBranches] = useState({})

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleSubBranch = (id) => {
    setExpandedSubBranches(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div id="tech-section" className="tech-section">
      <h2 className="section-title">Tech Stack</h2>

      <div className="tech-tree">
        {techTree.map((branch) => (
          <div key={branch.id} className={`tree-branch ${branch.color}`}>
            {/* Main Branch */}
            <button
              className={`tree-branch-header ${expandedBranches[branch.id] ? 'active' : ''}`}
              onClick={() => toggleBranch(branch.id)}
            >
              <div className="branch-step-container">
                <span className="step-label">{branch.step}</span>
                <span className="branch-name-main">{branch.name}</span>
              </div>
              <span className="tree-icon">{branch.icon}</span>
              <TreeBranchIcon isExpanded={expandedBranches[branch.id]} />
            </button>

            {/* Sub Branches */}
            <div className={`tree-children ${expandedBranches[branch.id] ? 'expanded' : ''}`}>
              {branch.children.map((child) => (
                <div key={child.id} className="tree-sub-branch">
                  <button
                    className={`tree-sub-header ${expandedSubBranches[child.id] ? 'active' : ''}`}
                    onClick={() => toggleSubBranch(child.id)}
                  >
                    <span className="tree-connector"></span>
                    <span className="tree-icon-small">{child.icon}</span>
                    <span className="tree-sub-name">{child.name}</span>
                    <TreeBranchIcon isExpanded={expandedSubBranches[child.id]} />
                  </button>

                  {/* Leaf Items */}
                  <div className={`tree-items ${expandedSubBranches[child.id] ? 'expanded' : ''}`}>
                    {child.items.map((item, index) => (
                      <div
                        key={item.name}
                        className="tree-leaf"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="leaf-connector"></span>
                        <span className="leaf-icon">{item.icon}</span>
                        <span className="leaf-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



// Project Card Component
function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-name">{project.name}</h3>
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
          <ExternalLinkIcon />
        </a>
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-tech">
        {project.tech.map((tech) => (
          <span key={tech} className="tech-tag">{tech}</span>
        ))}
      </div>
    </div>
  )
}

// Projects Section Component
function ProjectsSection({ projects }) {
  return (
    <div className="projects-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id || project.name} project={project} />
        ))}
      </div>
    </div>
  )
}



// Admin Password (change this to your preferred password)
const ADMIN_PASSWORD = 'admin123'

// Password Modal Component
function PasswordModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div className="password-modal" onClick={e => e.stopPropagation()}>
        <h3>🔒 Admin Access</h3>
        <p>Enter password to access admin panel</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Enter password"
            autoFocus
          />
          {error && <span className="password-error">{error}</span>}
          <div className="password-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Unlock</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('linktree-projects')
    return saved ? JSON.parse(saved) : defaultProjects
  })
  const [showAdmin, setShowAdmin] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    localStorage.setItem('linktree-projects', JSON.stringify(projects))
  }, [projects])

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true)
    } else {
      setShowPasswordModal(true)
    }
  }

  const handlePasswordSuccess = () => {
    setIsAuthenticated(true)
    setShowPasswordModal(false)
    setShowAdmin(true)
  }

  const handleUpdateProjects = (newProjects) => {
    setProjects(newProjects)
  }

  return (
    <div className="app">
      <ThreeBackground />
      <main className="main-content">
        <HeroSection />
        <SocialIcons />
        <TechSection />
        <ProjectsSection projects={projects} />
        <FooterSection />
      </main>

      {/* Admin Toggle Button */}
      <button
        className="admin-toggle"
        onClick={handleAdminClick}
        title="Manage Projects"
      >
        <SettingsIcon />
      </button>

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onSuccess={handlePasswordSuccess}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          projects={projects}
          onUpdateProjects={handleUpdateProjects}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}

export default App
