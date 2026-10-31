// ============================================
// SafeHer - Feedback & Support Logic
// ============================================

const Feedback = {
  state: {
    currentTab: 'feedback',
    selectedRating: 0,
    selectedEmoji: null,
    attachment: null,
    faqs: [],
    tickets: [],
    features: [],
    votedFeatures: JSON.parse(localStorage.getItem('safeher_voted_features') || '[]'),
    chatMessages: [],
    currentFaqCategory: 'all',
    currentTicketStatus: 'all',
    currentFeatureFilter: 'trending'
  },

  init() {
    this.loadData();
    this.setupTabs();
    this.setupQuickOptions();
    this.setupStarRating();
    this.setupEmojiFeedback();
    this.setupCharCounters();
    this.setupAttachment();
    this.setupFeedbackForm();
    this.setupFAQ();
    this.setupTickets();
    this.setupFeatures();
    this.setupChat();
    this.setupTicketModal();
    console.log('💬 Feedback initialized');
  },

  // ============================================
  // LOAD DATA
  // ============================================
  loadData() {
    // FAQs
    this.state.faqs = [
      { id: 1, category: 'general', question: 'What is SafeHer?', answer: '<p>SafeHer is a comprehensive women safety platform that provides emergency SOS alerts, live location sharing, incident reporting, and a supportive community. Our mission is to empower women with technology-driven safety tools.</p>' },
      { id: 2, category: 'emergency', question: 'How does the SOS feature work?', answer: '<p>The SOS feature works in 3 simple steps:</p><ul><li>Press and hold the red SOS button for 3 seconds</li><li>Your live location is automatically captured and shared</li><li>All your trusted emergency contacts receive instant SMS alerts</li></ul><p>Emergency services can also be notified based on your settings.</p>' },
      { id: 3, category: 'account', question: 'How do I create an account?', answer: '<p>Creating an account is easy:</p><ol><li>Click "Sign Up" on the login page</li><li>Enter your name, email, phone, and password</li><li>Verify your phone number and email</li><li>Add at least one emergency contact</li><li>Start using SafeHer!</li></ol>' },
      { id: 4, category: 'privacy', question: 'Is my data safe with SafeHer?', answer: '<p>Absolutely! Your privacy is our top priority. We use industry-standard encryption for all data transmission and storage. Your personal information is never shared with third parties without your explicit consent. You have full control over your data and can delete your account anytime.</p>' },
      { id: 5, category: 'emergency', question: 'Can I add multiple emergency contacts?', answer: '<p>Yes! You can add up to 10 emergency contacts. You can also set priority levels (1-4) so that highest priority contacts get notified first during emergencies.</p>' },
      { id: 6, category: 'account', question: 'How do I reset my password?', answer: '<p>To reset your password:</p><ol><li>Click "Forgot Password" on the login page</li><li>Enter your registered email</li><li>Check your email for reset link</li><li>Click the link and create a new password</li></ol>' },
      { id: 7, category: 'technical', question: 'Why isn\'t location sharing working?', answer: '<p>If location sharing isn\'t working:</p><ul><li>Check if location permission is granted in browser settings</li><li>Ensure GPS is enabled on your device</li><li>Try refreshing the page</li><li>Make sure you have an active internet connection</li></ul><p>If problems persist, contact our support team.</p>' },
      { id: 8, category: 'privacy', question: 'Who can see my location?', answer: '<p>Only YOU control who sees your location. By default, no one has access. You can:</p><ul><li>Share live location with specific trusted contacts</li><li>Enable auto-sharing during SOS activation</li><li>Turn off location sharing anytime</li></ul>' },
      { id: 9, category: 'billing', question: 'Is SafeHer free to use?', answer: '<p>Yes! Core safety features including SOS, location sharing, emergency contacts, and community features are 100% FREE. We offer optional premium features for enhanced functionality.</p>' },
      { id: 10, category: 'technical', question: 'Does SafeHer work offline?', answer: '<p>SafeHer has limited offline functionality. Emergency contacts and safety tips are stored locally. However, features like SOS alerts, location sharing, and incident reporting require an active internet connection to function.</p>' },
      { id: 11, category: 'emergency', question: 'What happens after I activate SOS?', answer: '<p>When you activate SOS:</p><ol><li>Your location is captured immediately</li><li>SMS alerts sent to all trusted contacts</li><li>Emergency screen appears with active timer</li><li>You can call emergency services with one tap</li><li>Contacts can track your live location</li><li>You can deactivate anytime when safe</li></ol>' },
      { id: 12, category: 'general', question: 'Can I report incidents anonymously?', answer: '<p>Yes, you have the option to submit incident reports anonymously. When you check the "Anonymous" option, your personal information will not be shared with authorities or displayed publicly.</p>' }
    ];

    // Tickets
    this.state.tickets = [
      { id: 'TKT-2024-1001', title: 'Cannot receive SMS notifications', category: 'Technical', status: 'in-progress', priority: 'high', description: 'I\'m not receiving any SMS notifications when SOS is triggered. I\'ve checked my phone settings and permissions but the issue persists.', createdAt: '2024-02-10', updates: 3 },
      { id: 'TKT-2024-0987', title: 'Add profile picture feature request', category: 'Feature Requests', status: 'open', priority: 'low', description: 'It would be great to have the ability to upload a profile picture with better cropping options.', createdAt: '2024-02-08', updates: 1 },
      { id: 'TKT-2024-0876', title: 'Billing question about premium', category: 'Billing/Payment', status: 'resolved', priority: 'medium', description: 'Question about the annual premium plan pricing and features included.', createdAt: '2024-02-05', updates: 5 },
      { id: 'TKT-2024-0765', title: 'App crashes on launch', category: 'Technical', status: 'closed', priority: 'urgent', description: 'The app was crashing when opening. Latest update fixed this issue.', createdAt: '2024-01-28', updates: 8 }
    ];

    // Feature Requests
    this.state.features = [
      { id: 1, title: 'Smartwatch Integration', description: 'Add support for Apple Watch and Wear OS to trigger SOS from smartwatch quickly.', status: 'trending', votes: 342, comments: 45, tags: ['wearables', 'sos', 'integration'], author: 'Priya S.' },
      { id: 2, title: 'Voice-Activated SOS', description: 'Say a safe word or phrase to activate SOS without touching your phone.', status: 'in-development', votes: 289, comments: 67, tags: ['voice', 'sos', 'accessibility'], author: 'Anjali K.' },
      { id: 3, title: 'Group Safety Circles', description: 'Create groups (friends, family, colleagues) for group location sharing and emergencies.', status: 'planned', votes: 234, comments: 34, tags: ['groups', 'social', 'sharing'], author: 'Meera P.' },
      { id: 4, title: 'Safe Route Recommendations', description: 'AI-powered safe route suggestions based on community-reported data and time of day.', status: 'trending', votes: 198, comments: 52, tags: ['navigation', 'ai', 'routes'], author: 'Divya R.' },
      { id: 5, title: 'Panic Alarm Sound Options', description: 'More alarm sound options including sirens, whistles, and custom sounds.', status: 'planned', votes: 156, comments: 21, tags: ['alarm', 'customization'], author: 'Sneha M.' },
      { id: 6, title: 'Multi-language Support', description: 'Add support for regional languages including Tamil, Bengali, Marathi, and more.', status: 'completed', votes: 445, comments: 89, tags: ['language', 'accessibility'], author: 'Kavita I.' }
    ];

    this.renderFAQ();
    this.renderTickets();
    this.renderFeatures();
    this.updateTicketCounts();
  },

  // ============================================
  // TABS
  // ============================================
  setupTabs() {
    document.querySelectorAll('.fb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  },

  switchTab(tabName) {
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.fb-tab[data-tab="${tabName}"]`)?.classList.add('active');

    document.querySelectorAll('.fb-tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');

    this.state.currentTab = tabName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ============================================
  // QUICK OPTIONS
  // ============================================
  setupQuickOptions() {
    document.querySelectorAll('.support-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scrollTo = btn.dataset.scroll;
        if (scrollTo === 'feedback-form') {
          this.switchTab('feedback');
        } else if (scrollTo === 'faq-section') {
          this.switchTab('faq');
        } else if (scrollTo === 'tickets-section') {
          this.switchTab('tickets');
        }
      });
    });
  },

  // ============================================
  // STAR RATING
  // ============================================
  setupStarRating() {
    const stars = document.querySelectorAll('.star-btn');
    const label = document.getElementById('rating-label');
    const labels = {
      1: '⭐ Poor - We need to do better',
      2: '⭐⭐ Fair - Room for improvement',
      3: '⭐⭐⭐ Good - Meets expectations',
      4: '⭐⭐⭐⭐ Great - Really enjoyed it',
      5: '⭐⭐⭐⭐⭐ Excellent - Absolutely loved it!'
    };

    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        stars.forEach((s, i) => {
          if (i < rating) s.classList.add('hover');
          else s.classList.remove('hover');
        });
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });

      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.state.selectedRating = rating;
        stars.forEach((s, i) => {
          if (i < rating) s.classList.add('active');
          else s.classList.remove('active');
        });
        label.textContent = labels[rating];
        label.classList.add('active');
      });
    });
  },

  // ============================================
  // EMOJI FEEDBACK
  // ============================================
  setupEmojiFeedback() {
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.selectedEmoji = btn.dataset.emoji;
      });
    });
  },

  // ============================================
  // CHARACTER COUNTERS
  // ============================================
  setupCharCounters() {
    const setup = (inputId, countId) => {
      const input = document.getElementById(inputId);
      const counter = document.getElementById(countId);
      if (!input || !counter) return;
      input.addEventListener('input', () => {
        counter.textContent = input.value.length;
      });
    };

    setup('fb-subject', 'subject-count');
    setup('fb-message', 'message-count');
  },

  // ============================================
  // ATTACHMENT
  // ============================================
  setupAttachment() {
    const zone = document.getElementById('attachment-zone');
    const input = document.getElementById('fb-attachment');
    const preview = document.getElementById('attachment-preview');

    zone?.addEventListener('click', () => input.click());

    zone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--color-primary)';
    });

    zone?.addEventListener('dragleave', () => {
      zone.style.borderColor = '';
    });

    zone?.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      this.handleFile(e.dataTransfer.files[0]);
    });

    input?.addEventListener('change', (e) => {
      this.handleFile(e.target.files[0]);
    });
  },

  handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Toast.error('File must be less than 5MB');
      return;
    }

    this.state.attachment = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('attachment-preview');
      const zone = document.getElementById('attachment-zone');
      preview.style.display = 'flex';
      zone.style.display = 'none';
      preview.innerHTML = `
        <img src="${e.target.result}" alt="preview">
        <div class="attachment-info">
          <p class="attachment-name">${file.name}</p>
          <p class="attachment-size">${(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button class="attachment-remove" onclick="Feedback.removeAttachment()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
    };
    reader.readAsDataURL(file);
  },

  removeAttachment() {
    this.state.attachment = null;
    document.getElementById('attachment-preview').style.display = 'none';
    document.getElementById('attachment-zone').style.display = 'block';
    document.getElementById('fb-attachment').value = '';
  },

  // ============================================
  // FEEDBACK FORM SUBMIT
  // ============================================
  setupFeedbackForm() {
    document.getElementById('feedback-submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.state.selectedRating === 0) {
        Toast.error('Please provide a rating');
        return;
      }

      const category = document.querySelector('input[name="fbCategory"]:checked');
      if (!category) {
        Toast.error('Please select a category');
        return;
      }

      const subject = document.getElementById('fb-subject').value.trim();
      const message = document.getElementById('fb-message').value.trim();

      if (!subject) return Toast.error('Please enter a subject');
      if (message.length < 20) return Toast.error('Message must be at least 20 characters');

      Toast.success('✓ Thank you for your feedback! We\'ll get back to you soon.');
      
      // Reset form
      e.target.reset();
      this.state.selectedRating = 0;
      this.state.selectedEmoji = null;
      this.state.attachment = null;
      document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('rating-label').textContent = 'Click to rate';
      document.getElementById('rating-label').classList.remove('active');
      document.getElementById('subject-count').textContent = '0';
      document.getElementById('message-count').textContent = '0';
      this.removeAttachment();
    });
  },

  // ============================================
  // FAQ
  // ============================================
  setupFAQ() {
    // Search
    document.getElementById('faq-search')?.addEventListener('input', (e) => {
      this.renderFAQ(e.target.value.toLowerCase().trim());
    });

    // Categories
    document.querySelectorAll('.faq-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.currentFaqCategory = btn.dataset.cat;
        this.renderFAQ();
      });
    });
  },

  renderFAQ(searchTerm = '') {
    const list = document.getElementById('faq-list');
    const empty = document.getElementById('faq-empty');
    let filtered = this.state.faqs;

    if (this.state.currentFaqCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.state.currentFaqCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.question.toLowerCase().includes(searchTerm) ||
        f.answer.toLowerCase().includes(searchTerm)
      );
    }

    if (filtered.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    const catLabels = {
      general: 'General',
      account: 'Account',
      emergency: 'Emergency',
      privacy: 'Privacy',
      technical: 'Technical',
      billing: 'Billing'
    };

    list.innerHTML = filtered.map((faq, index) => `
      <div class="faq-item" data-id="${faq.id}" style="animation-delay: ${index * 0.05}s">
        <div class="faq-question" onclick="Feedback.toggleFAQ(${faq.id})">
          <div class="faq-q-text">
            <span class="faq-cat-badge">${catLabels[faq.category]}</span>
            <p class="faq-q-title">${faq.question}</p>
          </div>
          <div class="faq-toggle">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-content">
            ${faq.answer}
            <div class="faq-helpful">
              <span class="faq-helpful-label">Was this helpful?</span>
              <button class="faq-helpful-btn yes" onclick="event.stopPropagation(); Toast.success('Thanks for your feedback!')">
                <i class="fa-solid fa-thumbs-up"></i> Yes
              </button>
              <button class="faq-helpful-btn no" onclick="event.stopPropagation(); Toast.info('We\\'ll improve this answer')">
                <i class="fa-solid fa-thumbs-down"></i> No
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  toggleFAQ(id) {
    const item = document.querySelector(`.faq-item[data-id="${id}"]`);
    item?.classList.toggle('active');
  },

  // ============================================
  // TICKETS
  // ============================================
  setupTickets() {
    document.querySelectorAll('.ticket-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ticket-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.currentTicketStatus = btn.dataset.status;
        this.renderTickets();
      });
    });

    document.getElementById('btn-new-ticket')?.addEventListener('click', () => {
      this.openNewTicketModal();
    });
  },

  renderTickets() {
    const list = document.getElementById('tickets-list');
    const empty = document.getElementById('tickets-empty');
    let filtered = this.state.tickets;

    if (this.state.currentTicketStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.state.currentTicketStatus);
    }

    if (filtered.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    list.innerHTML = filtered.map((ticket, index) => `
      <div class="ticket-card" style="animation-delay: ${index * 0.05}s">
        <div class="ticket-header-row">
          <div class="ticket-id-title">
            <p class="ticket-id">${ticket.id}</p>
            <h4 class="ticket-title">${ticket.title}</h4>
          </div>
          <div class="ticket-badges">
            <span class="ticket-status-badge status-${ticket.status}">${ticket.status.replace('-', ' ')}</span>
            <span class="ticket-priority-badge priority-${ticket.priority}">${ticket.priority}</span>
          </div>
        </div>
        <p class="ticket-desc">${ticket.description}</p>
        <div class="ticket-footer">
          <div class="ticket-meta">
            <span><i class="fa-solid fa-tag"></i> ${ticket.category}</span>
            <span><i class="fa-solid fa-calendar"></i> ${new Date(ticket.createdAt).toLocaleDateString()}</span>
            <span><i class="fa-solid fa-comment"></i> ${ticket.updates} updates</span>
          </div>
          <div class="ticket-actions">
            <button class="ticket-action-btn">
              <i class="fa-solid fa-eye"></i> View
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  updateTicketCounts() {
    document.getElementById('filter-all-count').textContent = this.state.tickets.length;
    document.getElementById('filter-open-count').textContent = this.state.tickets.filter(t => t.status === 'open').length;
    document.getElementById('filter-progress-count').textContent = this.state.tickets.filter(t => t.status === 'in-progress').length;
    document.getElementById('filter-resolved-count').textContent = this.state.tickets.filter(t => t.status === 'resolved').length;
    document.getElementById('filter-closed-count').textContent = this.state.tickets.filter(t => t.status === 'closed').length;
  },

  // ============================================
  // FEATURES
  // ============================================
  setupFeatures() {
    document.querySelectorAll('.filter-tab-fb').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab-fb').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.currentFeatureFilter = btn.dataset.featureFilter;
        this.renderFeatures();
      });
    });

    document.getElementById('btn-suggest-feature')?.addEventListener('click', () => {
      Toast.info('Feature suggestion form coming soon!');
    });
  },

  renderFeatures() {
    const grid = document.getElementById('features-grid');
    let filtered = [...this.state.features];

    switch (this.state.currentFeatureFilter) {
      case 'popular':
        filtered.sort((a, b) => b.votes - a.votes);
        break;
      case 'recent':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'planned':
        filtered = filtered.filter(f => f.status === 'planned' || f.status === 'in-development');
        break;
      case 'completed':
        filtered = filtered.filter(f => f.status === 'completed');
        break;
      case 'trending':
      default:
        filtered.sort((a, b) => b.votes - a.votes);
    }

    grid.innerHTML = filtered.map((feature, index) => {
      const voted = this.state.votedFeatures.includes(feature.id);
      return `
        <div class="feature-request-card" style="animation-delay: ${index * 0.05}s">
          <div class="vote-column">
            <button class="vote-btn ${voted ? 'voted' : ''}" onclick="Feedback.voteFeature(${feature.id})">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <span class="vote-count">${feature.votes}</span>
          </div>
          <div class="feature-content">
            <div class="feature-header">
              <span class="feature-status-badge status-${feature.status}">${feature.status.replace('-', ' ')}</span>
            </div>
            <h4 class="feature-title">${feature.title}</h4>
            <p class="feature-desc">${feature.description}</p>
            <div class="feature-meta">
              <span><i class="fa-solid fa-user"></i> ${feature.author}</span>
              <span><i class="fa-solid fa-comment"></i> ${feature.comments}</span>
            </div>
            <div class="feature-tags-mini">
              ${feature.tags.map(t => `<span class="feature-tag-mini">#${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  voteFeature(id) {
    const index = this.state.votedFeatures.indexOf(id);
    const feature = this.state.features.find(f => f.id === id);
    if (!feature) return;

    if (index > -1) {
      this.state.votedFeatures.splice(index, 1);
      feature.votes--;
      Toast.info('Vote removed');
    } else {
      this.state.votedFeatures.push(id);
      feature.votes++;
      Toast.success('✓ Voted! Thanks for your feedback');
    }
    localStorage.setItem('safeher_voted_features', JSON.stringify(this.state.votedFeatures));
    this.renderFeatures();
  },

  // ============================================
  // LIVE CHAT
  // ============================================
  setupChat() {
    const openBtns = ['btn-open-chat-header', 'btn-open-chat-hero', 'btn-open-chat-help', 'btn-open-chat-contact'];
    openBtns.forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => this.openChat());
    });

    document.getElementById('chat-close')?.addEventListener('click', () => this.closeChat());
    document.getElementById('chat-minimize')?.addEventListener('click', () => this.minimizeChat());
    document.getElementById('chat-bubble')?.addEventListener('click', () => this.openChat());

    document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
    document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.dataset.msg;
        document.getElementById('chat-input').value = msg;
        this.sendMessage();
      });
    });
  },

  openChat() {
    document.getElementById('chat-widget').classList.add('open');
    document.getElementById('chat-widget').classList.remove('minimized');
    document.getElementById('chat-bubble').classList.remove('show');
  },

  closeChat() {
    document.getElementById('chat-widget').classList.remove('open');
    document.getElementById('chat-bubble').classList.add('show');
  },

  minimizeChat() {
    document.getElementById('chat-widget').classList.toggle('minimized');
  },

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    this.addChatMessage(message, 'user');
    input.value = '';

    // Show typing
    document.getElementById('chat-typing').style.display = 'flex';

    // Simulate response
    setTimeout(() => {
      document.getElementById('chat-typing').style.display = 'none';
      this.addChatMessage(this.getAutoReply(message), 'agent');
    }, 1500 + Math.random() * 1500);
  },

  addChatMessage(message, sender) {
    const body = document.getElementById('chat-body');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = sender === 'agent' ? 'S' : 'U';

    const msgHtml = `
      <div class="chat-message ${sender}">
        <div class="msg-avatar">${avatar}</div>
        <div class="msg-content">
          <div class="msg-bubble">${message}</div>
          <div class="msg-time">${time}</div>
        </div>
      </div>
    `;

    body.insertAdjacentHTML('beforeend', msgHtml);
    body.scrollTop = body.scrollHeight;
  },

  getAutoReply(message) {
    const msg = message.toLowerCase();
    if (msg.includes('sos')) return "Great question about SOS! To activate: Press and hold the red SOS button for 3 seconds. Your location will be shared with all trusted contacts automatically. Would you like me to explain more?";
    if (msg.includes('contact')) return "To add emergency contacts: Go to 'Contacts' page → Click 'Add Contact' → Fill in details → Save. You can add up to 10 contacts with priority levels!";
    if (msg.includes('bug')) return "I'm sorry to hear you're experiencing an issue! Please create a support ticket with details about the bug. Our tech team will investigate right away.";
    if (msg.includes('privacy')) return "Your privacy is our top priority! All data is encrypted end-to-end. You have full control over who sees your info. Check the Privacy tab in your profile for detailed settings.";
    if (msg.includes('help')) return "I'm here to help! You can ask me about SOS features, contacts, privacy, technical issues, or anything else. What would you like to know?";
    if (msg.includes('thank')) return "You're welcome! 💜 Is there anything else I can help you with?";
    return "Thanks for reaching out! I'll connect you with our support team. In the meantime, you can also check our FAQ section for quick answers. Is there anything specific I can help you with right now?";
  },

  // ============================================
  // TICKET MODAL
  // ============================================
  setupTicketModal() {
    document.getElementById('btn-close-ticket-modal')?.addEventListener('click', () => {
      document.getElementById('ticket-modal').classList.remove('show');
    });

    document.getElementById('ticket-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'ticket-modal') e.target.classList.remove('show');
    });

    document.getElementById('ticket-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const priority = document.querySelector('input[name="ticketPriority"]:checked');
      if (!priority) return Toast.error('Please select priority');

      Toast.success('✓ Ticket created successfully! We\'ll respond within 24 hours.');
      document.getElementById('ticket-modal').classList.remove('show');
      e.target.reset();
    });
  },

  openNewTicketModal() {
    document.getElementById('ticket-modal').classList.add('show');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Feedback.init();
});