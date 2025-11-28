document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesList = document.getElementById('notes-list');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const searchInput = document.getElementById('search-input');
    const lastSaved = document.getElementById('last-saved');
    const syncBtn = document.getElementById('sync-btn');
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const signupLink = document.getElementById('signup-link');
    
    // App State
    let notes = [];
    let currentNoteId = null;
    let currentUser = null;
    
    // Initialize the app
    init();
    
    function init() {
        // Check if user is logged in (in a real app, this would check session/token)
        currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            loadNotes();
            loginModal.style.display = 'none';
        } else {
            loginModal.style.display = 'flex';
        }
        
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Note CRUD operations
        newNoteBtn.addEventListener('click', createNewNote);
        saveNoteBtn.addEventListener('click', saveNote);
        deleteNoteBtn.addEventListener('click', deleteNote);
        
        // Note selection
        notesList.addEventListener('click', handleNoteSelection);
        
        // Search functionality
        searchInput.addEventListener('input', filterNotes);
        
        // Sync button
        syncBtn.addEventListener('click', syncNotes);
        
        // Authentication
        loginBtn.addEventListener('click', handleLogin);
        logoutBtn.addEventListener('click', handleLogout);
        signupLink.addEventListener('click', handleSignup);
        
        // Auto-save when typing (with debounce)
        let saveTimeout;
        noteTitle.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveNote, 1000);
        });
        
        noteContent.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveNote, 1000);
        });
    }
    
    // Note Management Functions
    function loadNotes() {
        // In a real app, this would fetch from a cloud API
        const userNotes = localStorage.getItem(`notes_${currentUser}`);
        notes = userNotes ? JSON.parse(userNotes) : [];
        
        renderNotesList();
        
        if (notes.length > 0) {
            // Select the first note by default
            selectNote(notes[0].id);
        } else {
            // Create a first note if none exist
            createNewNote();
        }
    }
    
    function renderNotesList(filterText = '') {
        notesList.innerHTML = '';
        
        const filteredNotes = filterText 
            ? notes.filter(note => 
                note.title.toLowerCase().includes(filterText.toLowerCase()) || 
                note.content.toLowerCase().includes(filterText.toLowerCase()))
            : notes;
        
        if (filteredNotes.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No notes found';
            emptyMessage.className = 'empty-message';
            notesList.appendChild(emptyMessage);
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteItem = document.createElement('li');
            noteItem.className = 'note-item';
            if (note.id === currentNoteId) {
                noteItem.classList.add('active');
            }
            noteItem.dataset.id = note.id;
            
            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title || 'Untitled Note';
            
            const notePreview = document.createElement('p');
            notePreview.textContent = note.content.substring(0, 60) + (note.content.length > 60 ? '...' : '');
            
            noteItem.appendChild(noteTitle);
            noteItem.appendChild(notePreview);
            notesList.appendChild(noteItem);
        });
    }
    
    function createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        saveNotesToStorage();
        renderNotesList();
        selectNote(newNote.id);
        
        // Focus on the title field
        noteTitle.focus();
    }
    
    function selectNote(noteId) {
        currentNoteId = noteId;
        const note = notes.find(n => n.id === noteId);
        
        if (note) {
            noteTitle.value = note.title;
            noteContent.value = note.content;
            updateLastSavedTime(note.updatedAt);
            
            // Update active state in the list
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === noteId);
            });
        }
    }
    
    function handleNoteSelection(e) {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            selectNote(noteItem.dataset.id);
        }
    }
    
    function saveNote() {
        if (!currentNoteId) return;
        
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex === -1) return;
        
        notes[noteIndex] = {
            ...notes[noteIndex],
            title: noteTitle.value,
            content: noteContent.value,
            updatedAt: new Date().toISOString()
        };
        
        saveNotesToStorage();
        renderNotesList(searchInput.value);
        updateLastSavedTime(notes[noteIndex].updatedAt);
    }
    
    function deleteNote() {
        if (!currentNoteId) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== currentNoteId);
            saveNotesToStorage();
            renderNotesList(searchInput.value);
            
            if (notes.length > 0) {
                selectNote(notes[0].id);
            } else {
                createNewNote();
            }
        }
    }
    
    function filterNotes() {
        renderNotesList(searchInput.value);
    }
    
    function updateLastSavedTime(timestamp) {
        if (!timestamp) {
            lastSaved.textContent = 'Not saved yet';
            return;
        }
        
        const date = new Date(timestamp);
        lastSaved.textContent = `Last saved: ${date.toLocaleString()}`;
    }
    
    function saveNotesToStorage() {
        // In a real app, this would send to a cloud API
        localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    }
    
    function syncNotes() {
        // Simulate syncing with cloud
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing';
        syncBtn.disabled = true;
        
        setTimeout(() => {
            // In a real app, this would fetch from and push to a cloud API
            syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';
            syncBtn.disabled = false;
            
            // Show a confirmation
            const notification = document.createElement('div');
            notification.className = 'sync-notification';
            notification.textContent = 'Notes synced successfully!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 2000);
        }, 1000);
    }
    
    // Authentication Functions
    function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        // In a real app, this would validate against a backend
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        
        // Create user notes storage if it doesn't exist
        if (!localStorage.getItem(`notes_${currentUser}`)) {
            localStorage.setItem(`notes_${currentUser}`, JSON.stringify([]));
        }
        
        loginModal.style.display = 'none';
        loadNotes();
    }
    
    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            loginModal.style.display = 'flex';
            
            // Clear the UI
            notesList.innerHTML = '';
            noteTitle.value = '';
            noteContent.value = '';
            lastSaved.textContent = 'Not saved yet';
        }
    }
    
    function handleSignup(e) {
        e.preventDefault();
        alert('In a real application, this would redirect to a signup page.');
    }
});