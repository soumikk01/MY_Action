import { useState } from 'react'
import './AdminPanel.css'

// Icons
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

// Project Form Modal
function ProjectModal({ project, onSave, onClose }) {
    const [formData, setFormData] = useState(project || {
        name: '',
        description: '',
        tech: [],
        url: '',
        demo: '',
    })
    const [techInput, setTechInput] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddTech = () => {
        if (techInput.trim() && !formData.tech.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tech: [...prev.tech, techInput.trim()]
            }))
            setTechInput('')
        }
    }

    const handleRemoveTech = (techToRemove) => {
        setFormData(prev => ({
            ...prev,
            tech: prev.tech.filter(t => t !== techToRemove)
        }))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTech()
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.name.trim()) {
            onSave({
                ...formData,
                id: project?.id || Date.now().toString()
            })
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="project-form">
                    <div className="form-group">
                        <label htmlFor="name">Project Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your project"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="url">GitHub/Project URL</label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="demo">Demo URL</label>
                        <input
                            type="url"
                            id="demo"
                            name="demo"
                            value={formData.demo}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Technologies</label>
                        <div className="tech-input-container">
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add tech (press Enter)"
                            />
                            <button type="button" onClick={handleAddTech} className="add-tech-btn">
                                <PlusIcon />
                            </button>
                        </div>
                        <div className="tech-tags-edit">
                            {formData.tech.map((tech) => (
                                <span key={tech} className="tech-tag-edit">
                                    {tech}
                                    <button type="button" onClick={() => handleRemoveTech(tech)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            {project ? 'Update Project' : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Admin Panel Component
function AdminPanel({ projects, onUpdateProjects, onClose }) {
    const [showModal, setShowModal] = useState(false)
    const [editingProject, setEditingProject] = useState(null)

    const handleAddProject = () => {
        setEditingProject(null)
        setShowModal(true)
    }

    const handleEditProject = (project) => {
        setEditingProject(project)
        setShowModal(true)
    }

    const handleDeleteProject = (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            const updated = projects.filter(p => p.id !== projectId)
            onUpdateProjects(updated)
        }
    }

    const handleSaveProject = (projectData) => {
        let updated
        if (editingProject) {
            updated = projects.map(p => p.id === projectData.id ? projectData : p)
        } else {
            updated = [...projects, projectData]
        }
        onUpdateProjects(updated)
        setShowModal(false)
        setEditingProject(null)
    }

    return (
        <div className="admin-panel-overlay" onClick={onClose}>
            <div className="admin-panel" onClick={e => e.stopPropagation()}>
                <div className="admin-header">
                    <h2>
                        <SettingsIcon />
                        Projects Manager
                    </h2>
                    <button className="admin-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="admin-body">
                    <div className="admin-toolbar">
                        <span className="project-count">{projects.length} Projects</span>
                        <button className="btn-add-project" onClick={handleAddProject}>
                            <PlusIcon />
                            Add Project
                        </button>
                    </div>

                    <div className="admin-projects-list">
                        {projects.length === 0 ? (
                            <div className="no-projects">
                                <p>No projects yet. Click "Add Project" to create one!</p>
                            </div>
                        ) : (
                            projects.map((project, index) => (
                                <div key={project.id || index} className="admin-project-item">
                                    <div className="project-item-info">
                                        <h4>{project.name}</h4>
                                        <p>{project.description}</p>
                                        <div className="tech-tags-small">
                                            {project.tech.map(t => (
                                                <span key={t}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="project-item-actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEditProject(project)}
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteProject(project.id)}
                                            title="Delete"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {showModal && (
                    <ProjectModal
                        project={editingProject}
                        onSave={handleSaveProject}
                        onClose={() => {
                            setShowModal(false)
                            setEditingProject(null)
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default AdminPanel
