// Documents Page JavaScript
class DocumentsManager {
  constructor() {
    this.documents = [];
    this.filteredDocuments = [];
    this.init();
  }

  init() {
    this.loadDocuments();
    this.setupEventListeners();
    this.populateFilters();
    this.renderDocuments();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const visibilityFilter = document.getElementById('visibilityFilter');
    const courseFilter = document.getElementById('courseFilter');

    searchInput.addEventListener('input', () => this.handleSearch());
    visibilityFilter.addEventListener('change', () => this.handleFilter());
    courseFilter.addEventListener('change', () => this.handleFilter());
  }

  loadDocuments() {
    // Load documents from localStorage (set by upload page)
    this.documents = JSON.parse(localStorage.getItem('documents') || '[]');
    this.filteredDocuments = [...this.documents];
  }

  populateFilters() {
    const courseFilter = document.getElementById('courseFilter');
    const courses = [...new Set(this.documents.map(doc => doc.courseCode).filter(Boolean))];
    
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      courseFilter.appendChild(option);
    });
  }

  handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    this.filteredDocuments = this.documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      doc.courseCode.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    this.renderDocuments();
  }

  handleFilter() {
    const visibilityFilter = document.getElementById('visibilityFilter').value;
    const courseFilter = document.getElementById('courseFilter').value;
    
    this.filteredDocuments = this.documents.filter(doc => {
      const visibilityMatch = !visibilityFilter || doc.visibility === visibilityFilter;
      const courseMatch = !courseFilter || doc.courseCode === courseFilter;
      return visibilityMatch && courseMatch;
    });
    
    this.renderDocuments();
  }

  renderDocuments() {
    const grid = document.getElementById('documentsGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredDocuments.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = this.filteredDocuments.map(doc => this.createDocumentCard(doc)).join('');
    
    // Add event listeners to the new cards
    this.setupCardEventListeners();
  }

  createDocumentCard(doc) {
    const fileIcon = this.getFileIcon(doc.fileType);
    const formattedDate = this.formatDate(doc.uploadedAt);
    const fileSize = this.formatFileSize(doc.fileSize);
    
    return `
      <div class="document-card" data-doc-id="${doc.id}">
        <div class="document-header">
          <div>
            <h3 class="document-title">${this.escapeHtml(doc.title)}</h3>
            <div class="document-meta">
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                ${formattedDate}
              </span>
              <span class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                ${fileSize}
              </span>
            </div>
          </div>
          <span class="visibility-badge ${doc.visibility}">${doc.visibility}</span>
        </div>
        
        ${doc.description ? `<p class="document-description">${this.escapeHtml(doc.description)}</p>` : ''}
        
        ${doc.courseCode ? `<div class="document-meta">
          <span class="meta-item">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            ${this.escapeHtml(doc.courseCode)}
          </span>
        </div>` : ''}
        
        ${doc.tags && doc.tags.length > 0 ? `
          <div class="document-tags">
            ${doc.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        
        <div class="document-footer">
          <div class="document-actions">
            <button class="action-btn view" title="View document">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            <button class="action-btn download" title="Download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
            <button class="action-btn delete" title="Delete document">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupCardEventListeners() {
    // View button
    document.querySelectorAll('.action-btn.view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.document-card');
        const docId = card.dataset.docId;
        this.viewDocument(docId);
      });
    });

    // Download button
    document.querySelectorAll('.action-btn.download').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.document-card');
        const docId = card.dataset.docId;
        this.downloadDocument(docId);
      });
    });

    // Delete button
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.document-card');
        const docId = card.dataset.docId;
        this.deleteDocument(docId);
      });
    });

    // Card click
    document.querySelectorAll('.document-card').forEach(card => {
      card.addEventListener('click', () => {
        const docId = card.dataset.docId;
        this.viewDocument(docId);
      });
    });
  }

  viewDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      // For demo purposes, show an alert with document info
      // In a real app, you'd navigate to a document view page
      alert(`Viewing: ${doc.title}\n\nDescription: ${doc.description || 'No description'}\nCourse: ${doc.courseCode || 'No course'}\nTags: ${doc.tags.join(', ') || 'No tags'}`);
    }
  }

  downloadDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      // For demo purposes, create a download link
      // In a real app, you'd get the actual file from storage
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob(['Document content would be here'], { type: 'text/plain' }));
      link.download = doc.fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  deleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      // Remove from localStorage
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const filtered = documents.filter(doc => doc.id !== docId);
      localStorage.setItem('documents', JSON.stringify(filtered));
      
      // Update local state
      this.documents = filtered;
      this.filteredDocuments = this.filteredDocuments.filter(doc => doc.id !== docId);
      
      // Re-render
      this.renderDocuments();
      
      // Show success message
      this.showToast('Document deleted successfully', 'success');
    }
  }

  getFileIcon(fileType) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('markdown') || fileType.includes('text')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 5000);
  }
}

// Initialize the documents manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DocumentsManager();
});
