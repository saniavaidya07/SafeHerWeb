// ============================================
// SafeHer - Resources & Safety Tips Logic
// ============================================

const Resources = {
  state: {
    resources: [],
    filteredResources: [],
    currentCategory: 'all',
    currentType: 'all',
    searchQuery: '',
    sortBy: 'latest',
    displayCount: 12,
    bookmarks: JSON.parse(localStorage.getItem('safeher_bookmarks') || '[]')
  },

  init() {
    this.loadResources();
    this.setupSearch();
    this.setupPopularTags();
    this.setupCategories();
    this.setupFilters();
    this.setupSort();
    this.setupLoadMore();
    this.setupModal();
    this.setupNewsletter();
    this.setupReactions();
    this.updateBookmarkCount();
    console.log('📚 Resources initialized');
  },

  // ============================================
  // LOAD RESOURCES (MOCK DATA - Articles & Guides Only)
  // ============================================
  loadResources() {
    this.state.resources = [
      // Self Defense
      { id: 1, title: 'Essential Self-Defense Techniques Every Woman Must Know', category: 'self-defense', type: 'article', duration: '12 min', author: 'Kiran Bedi', authorInitial: 'K', views: 24500, likes: 1234, date: '2024-01-15', bg: 'bg-red', icon: 'fa-hand-fist', description: 'Learn practical, easy-to-remember self-defense moves that could save your life. Expert-taught techniques for real-world scenarios.', featured: true },
      { id: 2, title: 'Complete Guide to Krav Maga for Beginners', category: 'self-defense', type: 'guide', duration: '18 min', author: 'Rachna Singh', authorInitial: 'R', views: 15800, likes: 890, date: '2024-01-20', bg: 'bg-red', icon: 'fa-fist-raised', description: 'Simple yet powerful Krav Maga techniques designed specifically for women. Learn to defend and escape.' },
      { id: 3, title: 'How to Use Everyday Items for Self-Defense', category: 'self-defense', type: 'article', duration: '7 min', author: 'Amrita Rao', authorInitial: 'A', views: 12300, likes: 654, date: '2024-01-25', bg: 'bg-red', icon: 'fa-shield', description: 'Discover how ordinary items like keys, pens, and umbrellas can become effective defense tools in emergencies.' },
      
      // Legal Rights
      { id: 4, title: 'Complete Guide to Women\'s Legal Rights in India', category: 'legal', type: 'guide', duration: '25 min', author: 'Adv. Meera Kaul', authorInitial: 'M', views: 18900, likes: 2100, date: '2024-01-10', bg: 'bg-blue', icon: 'fa-scale-balanced', description: 'Comprehensive guide covering all legal rights, from workplace to domestic protection laws in India.' },
      { id: 5, title: 'Understanding the POSH Act at Workplace', category: 'legal', type: 'article', duration: '10 min', author: 'Priya Sharma', authorInitial: 'P', views: 8900, likes: 445, date: '2024-02-01', bg: 'bg-blue', icon: 'fa-building', description: 'Know your rights under the Prevention of Sexual Harassment Act at your workplace.' },
      { id: 6, title: 'How to File an FIR: Step by Step Guide', category: 'legal', type: 'guide', duration: '15 min', author: 'Adv. Rohan Mehta', authorInitial: 'R', views: 22400, likes: 1567, date: '2024-01-18', bg: 'bg-blue', icon: 'fa-file-signature', description: 'Complete walkthrough on how to file an FIR at any police station in India.' },
      
      // Mental Health
      { id: 7, title: 'Coping with Trauma: A Survivor\'s Guide', category: 'mental-health', type: 'article', duration: '15 min', author: 'Dr. Anjali Verma', authorInitial: 'A', views: 19800, likes: 1890, date: '2024-01-22', bg: 'bg-pink', icon: 'fa-brain', description: 'Professional guidance on healing after trauma. Learn techniques used by therapists for long-term recovery.' },
      { id: 8, title: 'Managing Anxiety in Unsafe Situations', category: 'mental-health', type: 'article', duration: '9 min', author: 'Dr. Simran Kaur', authorInitial: 'S', views: 14200, likes: 923, date: '2024-01-28', bg: 'bg-pink', icon: 'fa-heart-pulse', description: 'Practical breathing techniques and mental exercises to stay calm during stressful moments.' },
      { id: 9, title: 'Building Emotional Resilience', category: 'mental-health', type: 'guide', duration: '20 min', author: 'Meera Patel', authorInitial: 'M', views: 11500, likes: 678, date: '2024-02-05', bg: 'bg-pink', icon: 'fa-hand-holding-heart', description: 'A comprehensive guide on building stronger emotional resilience in challenging times.' },
      
      // Travel Safety
      { id: 10, title: 'Solo Travel Safety: Complete Handbook', category: 'travel', type: 'guide', duration: '30 min', author: 'Nishtha Reddy', authorInitial: 'N', views: 25600, likes: 2300, date: '2024-01-12', bg: 'bg-green', icon: 'fa-plane', description: 'Everything you need to know about traveling solo safely — from booking to arrival.' },
      { id: 11, title: 'Safe Cab & Auto Practices', category: 'travel', type: 'article', duration: '6 min', author: 'Ritu Sharma', authorInitial: 'R', views: 16700, likes: 1102, date: '2024-01-30', bg: 'bg-green', icon: 'fa-car', description: 'Essential safety practices when using cabs, autos, or ride-sharing services alone.' },
      { id: 12, title: 'Metro & Bus Travel Safety Guide', category: 'travel', type: 'article', duration: '8 min', author: 'Kavita Iyer', authorInitial: 'K', views: 9800, likes: 567, date: '2024-02-03', bg: 'bg-green', icon: 'fa-train-subway', description: 'How to stay safe while using public transportation, especially during off-peak hours.' },
      
      // Online Safety
      { id: 13, title: 'Cyberstalking: Detection & Prevention', category: 'online', type: 'article', duration: '11 min', author: 'Prakash Kumar', authorInitial: 'P', views: 13400, likes: 789, date: '2024-01-26', bg: 'bg-cyan', icon: 'fa-user-secret', description: 'Learn to identify cyberstalking behaviors and protect yourself with proven strategies.' },
      { id: 14, title: 'Social Media Privacy Settings Guide', category: 'online', type: 'guide', duration: '20 min', author: 'Anish Jain', authorInitial: 'A', views: 17800, likes: 1245, date: '2024-01-19', bg: 'bg-cyan', icon: 'fa-user-shield', description: 'Complete guide to securing your privacy across Instagram, Facebook, Twitter, and more.' },
      { id: 15, title: 'Protecting Yourself from Online Harassment', category: 'online', type: 'article', duration: '13 min', author: 'Divya Kapoor', authorInitial: 'D', views: 21300, likes: 1876, date: '2024-01-23', bg: 'bg-cyan', icon: 'fa-shield-halved', description: 'Comprehensive article on dealing with online trolls, harassment, and cyberbullying.' },
      
      // Public Places
      { id: 16, title: 'Safety at Nightclubs & Bars', category: 'public', type: 'article', duration: '9 min', author: 'Sneha Roy', authorInitial: 'S', views: 15900, likes: 987, date: '2024-01-27', bg: 'bg-orange', icon: 'fa-martini-glass', description: 'Essential safety tips for enjoying nightlife while staying protected from potential dangers.' },
      { id: 17, title: 'Gym & Workout Safety for Women', category: 'public', type: 'article', duration: '5 min', author: 'Fitness Coach Ria', authorInitial: 'R', views: 8600, likes: 456, date: '2024-02-04', bg: 'bg-orange', icon: 'fa-dumbbell', description: 'How to feel safe and comfortable while working out at public gyms and fitness centers.' },
      
      // Emergency
      { id: 18, title: 'Emergency First Aid: What Every Woman Should Know', category: 'emergency', type: 'guide', duration: '40 min', author: 'Dr. Neha Gupta', authorInitial: 'N', views: 28700, likes: 2456, date: '2024-01-14', bg: 'bg-yellow', icon: 'fa-truck-medical', description: 'Life-saving first aid techniques every woman should master for personal and family emergencies.' },
      { id: 19, title: 'What to Do When Attacked: Emergency Response', category: 'emergency', type: 'article', duration: '14 min', author: 'Officer Sunita', authorInitial: 'S', views: 33500, likes: 3210, date: '2024-01-08', bg: 'bg-yellow', icon: 'fa-exclamation-triangle', description: 'Detailed article explaining the exact steps to take during and after an attack.' },
      { id: 20, title: 'Creating an Emergency Response Plan', category: 'emergency', type: 'article', duration: '12 min', author: 'Safety Expert Rahul', authorInitial: 'R', views: 12100, likes: 723, date: '2024-01-31', bg: 'bg-yellow', icon: 'fa-clipboard-list', description: 'Build a personalized emergency response plan for you and your family.' }
    ];

    this.updateCounts();
    this.applyFilters();
  },

  // ============================================
  // UPDATE COUNTS
  // ============================================
  updateCounts() {
    const counts = { all: this.state.resources.length };
    this.state.resources.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    Object.keys(counts).forEach(cat => {
      const el = document.getElementById(`cat-count-${cat}`);
      if (el) el.textContent = counts[cat];
    });
  },

  // ============================================
  // RENDER RESOURCES
  // ============================================
  renderResources() {
    const grid = document.getElementById('resources-grid');
    const empty = document.getElementById('empty-state-res');
    const showing = document.getElementById('showing-count');

    if (this.state.filteredResources.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      showing.textContent = '0';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    const displayed = this.state.filteredResources.slice(0, this.state.displayCount);
    showing.textContent = displayed.length;

    const typeIcons = {
      article: 'fa-newspaper',
      guide: 'fa-book'
    };

    const categoryLabels = {
      'self-defense': 'Self Defense',
      'legal': 'Legal Rights',
      'mental-health': 'Mental Wellness',
      'travel': 'Travel Safety',
      'online': 'Online Safety',
      'public': 'Public Places',
      'emergency': 'Emergency'
    };

    grid.innerHTML = displayed.map((resource, index) => {
      const isBookmarked = this.state.bookmarks.includes(resource.id);
      return `
        <div class="resource-card" onclick="Resources.openArticle(${resource.id})" style="animation-delay: ${index * 0.05}s">
          <div class="resource-image ${resource.bg}">
            <div class="resource-image-icon">
              <i class="fa-solid ${resource.icon}"></i>
            </div>
            <span class="resource-type-badge">
              <i class="fa-solid ${typeIcons[resource.type]}"></i>
              ${resource.type}
            </span>
            <button class="resource-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="event.stopPropagation(); Resources.toggleBookmark(${resource.id})">
              <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <span class="resource-duration">
              <i class="fa-solid fa-clock"></i>
              ${resource.duration}
            </span>
          </div>

          <div class="resource-body">
            <span class="resource-category-tag">
              <i class="fa-solid fa-tag"></i>
              ${categoryLabels[resource.category]}
            </span>
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-desc">${resource.description}</p>

            <div class="resource-footer">
              <div class="resource-author-mini">
                <div class="author-avatar-mini">${resource.authorInitial}</div>
                <p class="author-name-mini">${resource.author}</p>
              </div>
              <div class="resource-stats">
                <span class="resource-stat">
                  <i class="fa-solid fa-eye"></i>
                  ${this.formatNumber(resource.views)}
                </span>
                <span class="resource-stat">
                  <i class="fa-solid fa-heart"></i>
                  ${this.formatNumber(resource.likes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Show/hide load more
    const loadMoreBtn = document.getElementById('btn-load-more-res');
    if (this.state.displayCount >= this.state.filteredResources.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-flex';
    }
  },

  formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  // ============================================
  // SEARCH
  // ============================================
  setupSearch() {
    const searchInput = document.getElementById('resource-search');
    searchInput?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.toLowerCase().trim();
      this.state.displayCount = 12;
      this.applyFilters();
    });
  },

  // ============================================
  // POPULAR TAGS
  // ============================================
  setupPopularTags() {
    document.querySelectorAll('.popular-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const searchTerm = tag.dataset.search;
        document.getElementById('resource-search').value = searchTerm;
        this.state.searchQuery = searchTerm;
        this.applyFilters();
        document.querySelector('.filter-bar-res').scrollIntoView({ behavior: 'smooth' });
      });
    });
  },

  // ============================================
  // CATEGORIES
  // ============================================
  setupCategories() {
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.currentCategory = card.dataset.category;
        this.state.displayCount = 12;
        this.applyFilters();
      });
    });
  },

  // ============================================
  // TYPE FILTERS
  // ============================================
  setupFilters() {
    document.querySelectorAll('.filter-chip-res').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip-res').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.currentType = chip.dataset.type;
        this.state.displayCount = 12;
        this.applyFilters();
      });
    });
  },

  // ============================================
  // SORT
  // ============================================
  setupSort() {
    document.getElementById('sort-select-res')?.addEventListener('change', (e) => {
      this.state.sortBy = e.target.value;
      this.applyFilters();
    });
  },

  // ============================================
  // APPLY FILTERS & SORT
  // ============================================
  applyFilters() {
    let filtered = [...this.state.resources];

    // Category filter
    if (this.state.currentCategory !== 'all') {
      filtered = filtered.filter(r => r.category === this.state.currentCategory);
    }

    // Type filter
    if (this.state.currentType !== 'all') {
      filtered = filtered.filter(r => r.type === this.state.currentType);
    }

    // Search filter
    if (this.state.searchQuery) {
      const q = this.state.searchQuery;
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (this.state.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'rated':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'short':
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    this.state.filteredResources = filtered;
    this.renderResources();
  },

  // ============================================
  // LOAD MORE
  // ============================================
  setupLoadMore() {
    document.getElementById('btn-load-more-res')?.addEventListener('click', () => {
      this.state.displayCount += 8;
      this.renderResources();
      Toast.success('More resources loaded');
    });
  },

  // ============================================
  // BOOKMARKS
  // ============================================
  toggleBookmark(id) {
    const index = this.state.bookmarks.indexOf(id);
    if (index > -1) {
      this.state.bookmarks.splice(index, 1);
      Toast.info('Removed from bookmarks');
    } else {
      this.state.bookmarks.push(id);
      Toast.success('✓ Added to bookmarks');
    }
    localStorage.setItem('safeher_bookmarks', JSON.stringify(this.state.bookmarks));
    this.updateBookmarkCount();
    this.renderResources();
  },

  updateBookmarkCount() {
    const count = this.state.bookmarks.length;
    document.getElementById('bookmark-count').textContent = count;
  },

  // ============================================
  // MODAL / ARTICLE READER
  // ============================================
  setupModal() {
    document.getElementById('btn-close-article')?.addEventListener('click', () => {
      document.getElementById('article-modal').classList.remove('show');
    });

    document.getElementById('article-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'article-modal') e.target.classList.remove('show');
    });

    document.getElementById('btn-bookmark-article')?.addEventListener('click', function() {
      const icon = this.querySelector('i');
      if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        this.classList.add('active');
        Toast.success('✓ Article bookmarked');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        this.classList.remove('active');
        Toast.info('Bookmark removed');
      }
    });

    document.getElementById('btn-share-article')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.getElementById('article-title').textContent,
          text: 'Check out this article on SafeHer',
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        Toast.success('Link copied to clipboard');
      }
    });

    document.getElementById('btn-print-article')?.addEventListener('click', () => {
      window.print();
    });
  },

  openArticle(id) {
    const resource = this.state.resources.find(r => r.id === id);
    if (!resource) return;

    // Populate modal
    const gradients = {
      'self-defense': 'linear-gradient(135deg, #EF4444, #F87171)',
      'legal': 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'mental-health': 'linear-gradient(135deg, #EC4899, #F472B6)',
      'travel': 'linear-gradient(135deg, #10B981, #34D399)',
      'online': 'linear-gradient(135deg, #06B6D4, #22D3EE)',
      'public': 'linear-gradient(135deg, #F97316, #FB923C)',
      'emergency': 'linear-gradient(135deg, #EAB308, #FACC15)'
    };

    document.getElementById('article-hero-icon').innerHTML = `<i class="fa-solid ${resource.icon}"></i>`;
    document.querySelector('.article-hero-image').style.background = gradients[resource.category] || gradients['self-defense'];

    const categoryLabels = {
      'self-defense': 'Self Defense',
      'legal': 'Legal Rights',
      'mental-health': 'Mental Wellness',
      'travel': 'Travel Safety',
      'online': 'Online Safety',
      'public': 'Public Places',
      'emergency': 'Emergency'
    };

    document.getElementById('article-category-tag').innerHTML = `
      <i class="fa-solid ${resource.icon}"></i>
      ${categoryLabels[resource.category]}
    `;

    document.getElementById('article-title').textContent = resource.title;
    document.getElementById('article-author-initial').textContent = resource.authorInitial;
    document.getElementById('article-author-name').textContent = resource.author;
    document.getElementById('article-date').textContent = new Date(resource.date).toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    document.getElementById('article-read-time').textContent = `${resource.duration} read`;

    // Generate article content
    document.getElementById('article-content').innerHTML = this.generateArticleContent(resource);

    // Update bookmark button
    const bookmarkBtn = document.getElementById('btn-bookmark-article');
    const bookmarkIcon = bookmarkBtn.querySelector('i');
    if (this.state.bookmarks.includes(resource.id)) {
      bookmarkIcon.classList.remove('fa-regular');
      bookmarkIcon.classList.add('fa-solid');
      bookmarkBtn.classList.add('active');
    } else {
      bookmarkIcon.classList.remove('fa-solid');
      bookmarkIcon.classList.add('fa-regular');
      bookmarkBtn.classList.remove('active');
    }

    // Show modal
    document.getElementById('article-modal').classList.add('show');
    document.querySelector('.article-modal').scrollTop = 0;
  },

  generateArticleContent(resource) {
    return `
      <p class="article-lead">${resource.description}</p>
      
      <h2>Introduction</h2>
      <p>Welcome to this comprehensive guide on ${resource.title.toLowerCase()}. Safety and empowerment go hand in hand, and knowledge is your most powerful tool. In this article, we'll cover everything you need to know to stay safe and confident.</p>
      
      <h2>Key Points to Remember</h2>
      <ul>
        <li><strong>Stay Alert:</strong> Always be aware of your surroundings, especially in unfamiliar places.</li>
        <li><strong>Trust Your Instincts:</strong> If something feels off, act on it immediately.</li>
        <li><strong>Have a Plan:</strong> Always know your exit strategy and emergency contacts.</li>
        <li><strong>Practice Regularly:</strong> Consistent practice builds muscle memory for critical moments.</li>
        <li><strong>Stay Connected:</strong> Keep trusted people informed of your whereabouts.</li>
      </ul>

      <h2>Detailed Techniques</h2>
      <p>Understanding the fundamentals is crucial. Let's dive deep into each aspect and explore practical applications you can use in your daily life.</p>
      
      <h3>Step 1: Preparation</h3>
      <p>Preparation is the foundation of safety. Take time to understand your environment, identify potential risks, and plan your responses. This might seem excessive, but preparation saves lives.</p>
      
      <h3>Step 2: Awareness</h3>
      <p>Situational awareness is your first line of defense. Look around, notice unusual behavior, and identify safe zones and exits wherever you go.</p>
      
      <h3>Step 3: Action</h3>
      <p>When action is required, act decisively and confidently. Hesitation can be dangerous. Trust your training and your instincts.</p>

      <h2>Common Scenarios</h2>
      <p>Let's explore some common situations and how to handle them effectively:</p>
      <ol>
        <li>Walking alone at night in unfamiliar areas</li>
        <li>Using public transportation during off-hours</li>
        <li>Being approached by strangers in isolated locations</li>
        <li>Handling harassment in workplace or educational settings</li>
        <li>Managing online threats and cyberstalking</li>
      </ol>

      <h2>Building Confidence</h2>
      <p>Confidence is not about being fearless — it's about being prepared. When you know what to do, fear transforms into focused action. Practice these techniques regularly with friends or in classes.</p>

      <h2>When to Seek Help</h2>
      <p>Remember, seeking help is a sign of strength, not weakness. If you feel unsafe or threatened, don't hesitate to:</p>
      <ul>
        <li>Call emergency services (112, 100, 1091)</li>
        <li>Use SafeHer's SOS feature</li>
        <li>Contact trusted friends or family</li>
        <li>Reach out to women's helplines</li>
        <li>Speak to a mental health professional</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Your safety is not just important — it's essential. By learning, practicing, and staying vigilant, you empower yourself to navigate the world confidently. Remember, you are stronger than you think, and you deserve to feel safe everywhere you go.</p>
      
      <p><strong>Stay safe. Stay strong. Stay empowered. 💜</strong></p>
    `;
  },

  // ============================================
  // NEWSLETTER
  // ============================================
  setupNewsletter() {
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input').value;
      if (email) {
        Toast.success('✓ Successfully subscribed! Check your email.');
        e.target.reset();
      }
    });
  },

  // ============================================
  // REACTIONS
  // ============================================
  setupReactions() {
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const count = btn.querySelector('span');
        const current = parseInt(count.textContent);
        count.textContent = btn.classList.contains('active') ? current + 1 : current - 1;

        const reaction = btn.dataset.reaction;
        Toast.info(`Marked as ${reaction}`);
      });
    });
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Resources.init();
});