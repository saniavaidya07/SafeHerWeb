// ============================================
// SafeHer - Emergency Contacts Logic
// ============================================

const EmergencyContacts = {
  state: {
    contacts: [],
    filteredContacts: [],
    currentFilter: 'all',
    currentView: 'grid',
    searchQuery: '',
    editingContact: null,
    deletingContactId: null,
    draggedCard: null
  },

  init() {
    this.loadContacts();
    this.setupSearch();
    this.setupFilters();
    this.setupViewToggle();
    this.setupQuickActions();
    this.setupModals();
    this.setupContactForm();
    this.setupAvatarPreview();
    console.log('👥 Emergency Contacts initialized');
  },

  // ============================================
  // LOAD CONTACTS
  // ============================================
  loadContacts() {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('safeher_contacts');
    if (stored) {
      this.state.contacts = JSON.parse(stored);
    } else {
      // Default contacts
      this.state.contacts = [
        {
          id: 1,
          name: 'Mom',
          relationship: 'Mother',
          phone: '+91 9876543210',
          email: 'mom@example.com',
          priority: 1,
          trusted: true,
          shareLocation: true,
          smsEnabled: true,
          verified: true,
          category: 'family'
        },
        {
          id: 2,
          name: 'Dad',
          relationship: 'Father',
          phone: '+91 9876543211',
          email: 'dad@example.com',
          priority: 1,
          trusted: true,
          shareLocation: true,
          smsEnabled: true,
          verified: true,
          category: 'family'
        },
        {
          id: 3,
          name: 'Sneha',
          relationship: 'Sibling',
          phone: '+91 9876543212',
          email: 'sneha@example.com',
          priority: 2,
          trusted: true,
          shareLocation: true,
          smsEnabled: true,
          verified: true,
          category: 'family'
        },
        {
          id: 4,
          name: 'Priya',
          relationship: 'Friend',
          phone: '+91 9876543213',
          email: '',
          priority: 3,
          trusted: true,
          shareLocation: false,
          smsEnabled: true,
          verified: false,
          category: 'friends'
        },
        {
          id: 5,
          name: 'Rahul',
          relationship: 'Friend',
          phone: '+91 9876543214',
          email: '',
          priority: 4,
          trusted: false,
          shareLocation: false,
          smsEnabled: false,
          verified: false,
          category: 'friends'
        }
      ];
      this.saveContacts();
    }

    this.applyFilters();
    this.updateStats();
  },

  saveContacts() {
    localStorage.setItem('safeher_contacts', JSON.stringify(this.state.contacts));
  },

  // ============================================
  // UPDATE STATS
  // ============================================
  updateStats() {
    const total = this.state.contacts.length;
    const trusted = this.state.contacts.filter(c => c.trusted).length;
    const verified = this.state.contacts.filter(c => c.verified).length;

    document.getElementById('hero-total').textContent = total;
    document.getElementById('hero-trusted').textContent = trusted;
    document.getElementById('hero-verified').textContent = verified;
    document.getElementById('contacts-count').textContent = this.state.filteredContacts.length;
  },

  // ============================================
  // RENDER CONTACTS
  // ============================================
  renderContacts() {
    const grid = document.getElementById('contacts-grid');
    const empty = document.getElementById('empty-contacts');

    if (this.state.filteredContacts.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    // Sort by priority
    const sorted = [...this.state.filteredContacts].sort((a, b) => a.priority - b.priority);

    grid.innerHTML = sorted.map((contact, index) => {
      const initial = contact.name.charAt(0).toUpperCase();
      const colorIndex = contact.name.charCodeAt(0) % 8;

      return `
        <div class="contact-card priority-${contact.priority}" data-id="${contact.id}" draggable="true" style="animation-delay: ${index * 0.05}s">
          <span class="contact-priority-badge priority-${contact.priority}">
            Priority ${contact.priority}
          </span>

          <div class="contact-card-header">
            <div class="contact-avatar avatar-color-${colorIndex}">
              ${initial}
              ${contact.verified ? '<div class="contact-verified-badge"><i class="fa-solid fa-check"></i></div>' : ''}
            </div>
            <div class="contact-info">
              <p class="contact-name">${contact.name}</p>
              <p class="contact-relationship">
                <i class="fa-solid fa-user-tag"></i>
                ${contact.relationship}
              </p>
            </div>
          </div>

          <div class="contact-details">
            <div class="contact-detail-item">
              <i class="fa-solid fa-phone"></i>
              <span>${contact.phone}</span>
            </div>
            ${contact.email ? `
              <div class="contact-detail-item">
                <i class="fa-solid fa-envelope"></i>
                <span>${contact.email}</span>
              </div>
            ` : ''}
          </div>

          <div class="contact-tags">
            ${contact.trusted ? '<span class="contact-tag tag-trusted"><i class="fa-solid fa-star"></i> Trusted</span>' : ''}
            ${contact.shareLocation ? '<span class="contact-tag tag-location"><i class="fa-solid fa-location-dot"></i> Location</span>' : ''}
            ${contact.smsEnabled ? '<span class="contact-tag tag-sms"><i class="fa-solid fa-message"></i> SMS</span>' : ''}
          </div>

          <div class="contact-actions">
            <button class="contact-action-btn call" onclick="EmergencyContacts.callContact(${contact.id})">
              <i class="fa-solid fa-phone"></i>
              <span>Call</span>
            </button>
            <button class="contact-action-btn sms" onclick="EmergencyContacts.smsContact(${contact.id})">
              <i class="fa-solid fa-message"></i>
              <span>SMS</span>
            </button>
            <button class="contact-action-btn edit" onclick="EmergencyContacts.editContact(${contact.id})">
              <i class="fa-solid fa-pen"></i>
              <span>Edit</span>
            </button>
            <button class="contact-action-btn delete" onclick="EmergencyContacts.confirmDelete(${contact.id})">
              <i class="fa-solid fa-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.setupDragAndDrop();
    this.updateStats();
  },

  // ============================================
  // DRAG AND DROP
  // ============================================
  setupDragAndDrop() {
    const cards = document.querySelectorAll('.contact-card');
    
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.state.draggedCard = card;
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.state.draggedCard = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!this.state.draggedCard || this.state.draggedCard === card) return;

        const draggedId = parseInt(this.state.draggedCard.dataset.id);
        const targetId = parseInt(card.dataset.id);

        // Swap priorities
        const dragged = this.state.contacts.find(c => c.id === draggedId);
        const target = this.state.contacts.find(c => c.id === targetId);

        if (dragged && target) {
          const temp = dragged.priority;
          dragged.priority = target.priority;
          target.priority = temp;

          this.saveContacts();
          this.applyFilters();
          Toast.success('Priority updated');
        }
      });
    });
  },

  // ============================================
  // SEARCH
  // ============================================
  setupSearch() {
    document.getElementById('contact-search')?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.toLowerCase().trim();
      this.applyFilters();
    });
  },

  // ============================================
  // FILTERS
  // ============================================
  setupFilters() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.currentFilter = btn.dataset.filter;
        this.applyFilters();
      });
    });
  },

  applyFilters() {
    this.state.filteredContacts = this.state.contacts.filter(contact => {
      // Category filter
      if (this.state.currentFilter === 'trusted' && !contact.trusted) return false;
      if (this.state.currentFilter === 'family' && contact.category !== 'family') return false;
      if (this.state.currentFilter === 'friends' && contact.category !== 'friends') return false;

      // Search filter
      if (this.state.searchQuery) {
        const q = this.state.searchQuery;
        return contact.name.toLowerCase().includes(q) ||
               contact.phone.toLowerCase().includes(q) ||
               contact.relationship.toLowerCase().includes(q);
      }

      return true;
    });

    this.renderContacts();
  },

  // ============================================
  // VIEW TOGGLE
  // ============================================
  setupViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.currentView = btn.dataset.view;
        
        const grid = document.getElementById('contacts-grid');
        if (this.state.currentView === 'list') {
          grid.classList.add('list-view');
        } else {
          grid.classList.remove('list-view');
        }
      });
    });
  },

  // ============================================
  // QUICK ACTIONS
  // ============================================
  setupQuickActions() {
    document.getElementById('btn-add-contact-header')?.addEventListener('click', () => {
      this.openContactModal();
    });

    document.getElementById('btn-broadcast')?.addEventListener('click', () => {
      const trusted = this.state.contacts.filter(c => c.trusted);
      if (trusted.length === 0) {
        Toast.warning('No trusted contacts to broadcast to');
        return;
      }
      if (confirm(`Send broadcast alert to ${trusted.length} trusted contacts?`)) {
        Toast.success(`📢 Alert sent to ${trusted.length} contacts`);
      }
    });

    document.getElementById('btn-import-contacts')?.addEventListener('click', () => {
      Toast.info('📱 Contact import requires native app permissions');
    });

    document.getElementById('btn-share-location-all')?.addEventListener('click', () => {
      const withLocation = this.state.contacts.filter(c => c.shareLocation);
      if (withLocation.length === 0) {
        Toast.warning('No contacts have location sharing enabled');
        return;
      }
      Toast.success(`📍 Location shared with ${withLocation.length} contacts`);
    });

    document.getElementById('btn-notification-prefs')?.addEventListener('click', () => {
      document.querySelector('.sos-preferences').scrollIntoView({ behavior: 'smooth' });
    });
  },

  // ============================================
  // CONTACT MODAL
  // ============================================
  setupModals() {
    document.getElementById('btn-close-contact-modal')?.addEventListener('click', () => {
      this.closeContactModal();
    });

    document.getElementById('contact-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'contact-modal') this.closeContactModal();
    });

    // Delete modal
    document.getElementById('btn-cancel-delete')?.addEventListener('click', () => {
      document.getElementById('delete-modal').classList.remove('show');
    });

    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
      this.deleteContact();
    });

    document.getElementById('delete-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal') e.target.classList.remove('show');
    });
  },

  openContactModal(contact = null) {
    this.state.editingContact = contact;
    const modal = document.getElementById('contact-modal');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const icon = document.getElementById('modal-icon');
    const btn = document.getElementById('btn-save-contact');

    if (contact) {
      // Edit mode
      title.textContent = 'Edit Contact';
      subtitle.textContent = 'Update contact information';
      icon.className = 'fa-solid fa-pen';
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Update Contact';

      // Populate form
      document.getElementById('contact-name').value = contact.name;
      document.getElementById('contact-phone').value = contact.phone.replace(/^\+\d+\s?/, '');
      document.getElementById('contact-email').value = contact.email || '';
      document.getElementById('contact-trusted').checked = contact.trusted;
      document.getElementById('contact-location').checked = contact.shareLocation;
      document.getElementById('contact-sms').checked = contact.smsEnabled;

      // Select relationship
      const relInput = document.querySelector(`input[name="relationship"][value="${contact.relationship}"]`);
      if (relInput) relInput.checked = true;

      // Select priority
      const priInput = document.querySelector(`input[name="priority"][value="${contact.priority}"]`);
      if (priInput) priInput.checked = true;

      this.updateAvatarPreview(contact.name);
    } else {
      // Add mode
      title.textContent = 'Add New Contact';
      subtitle.textContent = 'Add someone to your emergency network';
      icon.className = 'fa-solid fa-user-plus';
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Save Contact';
      document.getElementById('contact-form').reset();
      document.getElementById('avatar-preview-text').textContent = '?';
    }

    modal.classList.add('show');
  },

  closeContactModal() {
    document.getElementById('contact-modal').classList.remove('show');
    document.getElementById('contact-form').reset();
    this.state.editingContact = null;
  },

  // ============================================
  // AVATAR PREVIEW
  // ============================================
  setupAvatarPreview() {
    document.getElementById('contact-name')?.addEventListener('input', (e) => {
      this.updateAvatarPreview(e.target.value);
    });
  },

  updateAvatarPreview(name) {
    const preview = document.getElementById('avatar-preview');
    const text = document.getElementById('avatar-preview-text');
    if (!name || !name.trim()) {
      text.textContent = '?';
      preview.className = 'avatar-preview';
      return;
    }
    text.textContent = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % 8;
    preview.className = `avatar-preview avatar-color-${colorIndex}`;
  },

  // ============================================
  // CONTACT FORM
  // ============================================
  setupContactForm() {
    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveContact();
    });
  },

  saveContact() {
    const name = document.getElementById('contact-name').value.trim();
    const country = document.getElementById('contact-country').value;
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const relationship = document.querySelector('input[name="relationship"]:checked');
    const priority = document.querySelector('input[name="priority"]:checked');
    const trusted = document.getElementById('contact-trusted').checked;
    const shareLocation = document.getElementById('contact-location').checked;
    const smsEnabled = document.getElementById('contact-sms').checked;

    // Validation
    if (!name) {
      Toast.error('Please enter a name');
      return;
    }
    if (!relationship) {
      Toast.error('Please select relationship');
      return;
    }
    if (!phone || phone.length < 10) {
      Toast.error('Please enter a valid phone number');
      return;
    }
    if (!priority) {
      Toast.error('Please select priority level');
      return;
    }

    // Determine category
    const familyRels = ['Mother', 'Father', 'Sibling', 'Spouse', 'Relative', 'Guardian'];
    const category = familyRels.includes(relationship.value) ? 'family' : 'friends';

    const contactData = {
      name,
      relationship: relationship.value,
      phone: `${country} ${phone}`,
      email,
      priority: parseInt(priority.value),
      trusted,
      shareLocation,
      smsEnabled,
      category,
      verified: false
    };

    if (this.state.editingContact) {
      // Update existing
      const index = this.state.contacts.findIndex(c => c.id === this.state.editingContact.id);
      if (index !== -1) {
        this.state.contacts[index] = {
          ...this.state.contacts[index],
          ...contactData
        };
        Toast.success('✓ Contact updated successfully');
      }
    } else {
      // Add new
      const newContact = {
        id: Date.now(),
        ...contactData
      };
      this.state.contacts.push(newContact);
      Toast.success(`✓ ${name} added to your safety network`);
    }

    this.saveContacts();
    this.applyFilters();
    this.closeContactModal();
  },

  // ============================================
  // CONTACT ACTIONS
  // ============================================
  callContact(id) {
    const contact = this.state.contacts.find(c => c.id === id);
    if (!contact) return;
    window.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
    Toast.info(`📞 Calling ${contact.name}...`);
  },

  smsContact(id) {
    const contact = this.state.contacts.find(c => c.id === id);
    if (!contact) return;
    const message = encodeURIComponent(`Hi ${contact.name}, I'm using SafeHer to reach out.`);
    window.location.href = `sms:${contact.phone.replace(/\s/g, '')}?body=${message}`;
    Toast.info(`💬 Opening SMS to ${contact.name}...`);
  },

  editContact(id) {
    const contact = this.state.contacts.find(c => c.id === id);
    if (contact) this.openContactModal(contact);
  },

  confirmDelete(id) {
    const contact = this.state.contacts.find(c => c.id === id);
    if (!contact) return;
    this.state.deletingContactId = id;
    document.getElementById('delete-contact-name').textContent = contact.name;
    document.getElementById('delete-modal').classList.add('show');
  },

  deleteContact() {
    if (!this.state.deletingContactId) return;
    const contact = this.state.contacts.find(c => c.id === this.state.deletingContactId);
    this.state.contacts = this.state.contacts.filter(c => c.id !== this.state.deletingContactId);
    this.saveContacts();
    this.applyFilters();
    document.getElementById('delete-modal').classList.remove('show');
    Toast.success(`${contact.name} removed from contacts`);
    this.state.deletingContactId = null;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  EmergencyContacts.init();
});