// Upload Page JavaScript
class DocumentUploader {
  constructor() {
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFileDropZone();
  }

  setupEventListeners() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileDropZone = document.getElementById('fileDropZone');
    const fileRemove = document.getElementById('fileRemove');

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    fileRemove.addEventListener('click', () => this.removeFile());

    // Make the drop zone clickable
    fileDropZone.addEventListener('click', () => fileInput.click());
  }

  setupFileDropZone() {
    const dropZone = document.getElementById('fileDropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => this.highlight(dropZone), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => this.unhighlight(dropZone), false);
    });

    dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(elem) {
    elem.classList.add('dragover');
  }

  unhighlight(elem) {
    elem.classList.remove('dragover');
  }

  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file) {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/markdown',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showToast('Please select a valid file type (PDF, Markdown, text, or image)', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB', 'error');
      return;
    }

    this.selectedFile = file;
    this.displayFileInfo(file);
  }

  displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileDropZone = document.getElementById('fileDropZone');

    fileName.textContent = file.name;
    fileInfo.style.display = 'block';
    fileDropZone.style.display = 'none';
  }

  removeFile() {
    this.selectedFile = null;
    const fileInfo = document.getElementById('fileInfo');
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');

    fileInfo.style.display = 'none';
    fileDropZone.style.display = 'block';
    fileInput.value = '';
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.selectedFile) {
      this.showToast('Please select a file to upload', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      courseCode: formData.get('courseCode'),
      tags: formData.get('tags'),
      visibility: formData.get('visibility'),
      file: this.selectedFile
    };

    // Validate required fields
    if (!data.title.trim()) {
      this.showToast('Please enter a document title', 'error');
      return;
    }

    try {
      await this.uploadDocument(data);
    } catch (error) {
      console.error('Upload error:', error);
      this.showToast('Upload failed. Please try again.', 'error');
    }
  }

  async uploadDocument(data) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
      // For now, we'll simulate the upload process
      // In a real implementation, you'd send this to your backend
      await this.simulateUpload(data);
      
      this.showToast('Document uploaded successfully!', 'success');
      
      // Redirect to documents page after a short delay
      setTimeout(() => {
        window.location.href = 'documents.html';
      }, 1500);
      
    } catch (error) {
      throw error;
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  async simulateUpload(data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo purposes
    if (Math.random() < 0.9) { // 90% success rate
      // Store document data in localStorage for demo
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const newDocument = {
        id: this.generateId(),
        ...data,
        fileName: data.file.name,
        fileSize: data.file.size,
        fileType: data.file.type,
        uploadedAt: new Date().toISOString(),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('documents', JSON.stringify(documents));
      
      return newDocument;
    } else {
      throw new Error('Upload failed');
    }
  }

  generateId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 5000);
  }
}

// Initialize the uploader when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DocumentUploader();
});

// Add some utility functions for the demo
window.DocumentUploader = {
  // Function to get all documents (for other pages)
  getDocuments() {
    return JSON.parse(localStorage.getItem('documents') || '[]');
  },
  
  // Function to get a specific document
  getDocument(id) {
    const documents = this.getDocuments();
    return documents.find(doc => doc.id === id);
  },
  
  // Function to delete a document
  deleteDocument(id) {
    const documents = this.getDocuments();
    const filtered = documents.filter(doc => doc.id !== id);
    localStorage.setItem('documents', JSON.stringify(filtered));
  }
};
