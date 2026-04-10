const API_BASE_URL = '/api/users';

let currentPage = 1;
let currentLimit = 10;
let editingUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();
    setUpForm();
    initializeTheme();
});

// Theme Toggle Function
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark-theme');
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (isDark) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.title = 'Switch to Light Theme';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.title = 'Switch to Dark Theme';
        }
    }
}

// Particle Effect
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create particles - increased from 30 to 80
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Randomize size
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        particle.classList.add(size);

        // Random position
        const left = Math.random() * 100;
        particle.style.left = left + '%';
        particle.style.bottom = '-50px';

        // Random animation duration
        const duration = 8 + Math.random() * 12;
        particle.style.animationDuration = duration + 's';

        // Random delay
        const delay = Math.random() * 5;
        particle.style.animationDelay = delay + 's';

        container.appendChild(particle);
    }
}

// Initialize particles on load
window.addEventListener('load', createParticles);

// Setup form submission
function setUpForm() {
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });

    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateUser();
    });
}

// CREATE USER
async function createUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;
    const hobbies = document.getElementById('hobbies').value
        .split(',')
        .map(h => h.trim())
        .filter(h => h);
    const bio = document.getElementById('bio').value;

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                age: age ? parseInt(age) : undefined,
                hobbies,
                bio,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('User created successfully!', 'success');
            document.getElementById('userForm').reset();
            currentPage = 1;
            await loadAllUsers();
        } else {
            showToast(data.message || 'Error creating user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error creating user', 'error');
    }
}

// READ ALL USERS
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}?page=${currentPage}&limit=${currentLimit}`);
        const data = await response.json();

        if (data.success) {
            displayUsers(data.data);
            updatePaginationInfo(data.pagination);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading users', 'error');
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('usersList');

    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No users found. Create your first user!</div>
            </div>
        `;
        return;
    }

    container.innerHTML = users
        .map(user => createUserCard(user))
        .join('');
}

// Create user card HTML
function createUserCard(user) {
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    const hobbiesHTML = user.hobbies
        .slice(0, 3)
        .map(h => `<span class="hobby-tag">${h}</span>`)
        .join('');

    return `
        <div class="user-card">
            <div class="user-card-header">
                <div class="user-avatar">${initials}</div>
                <span style="opacity: 0.5; font-size: 0.8rem;">ID: ${user._id.substring(0, 8)}...</span>
            </div>
            <h3 class="user-card-title">${user.name}</h3>
            <div class="user-card-meta">
                <span>📧 ${user.email}</span>
                ${user.age ? `<span>🎂 Age: ${user.age}</span>` : ''}
                <span>📅 ${new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            ${user.hobbies.length > 0 ? `<div class="user-card-hobbies">${hobbiesHTML}</div>` : ''}
            ${user.bio ? `<p class="user-card-bio">"${user.bio}"</p>` : ''}
            <div class="user-card-actions">
                <button class="btn-edit" onclick="openEditModal('${user._id}', '${user.name.replace(/'/g, "\\'")}', '${user.email}', ${user.age || 0}, '${user.hobbies.join(', ').replace(/'/g, "\\'")}', '${user.bio.replace(/'/g, "\\'")}')"
                    >✏️ Edit</button>
                <button class="btn-delete" onclick="deleteUser('${user._id}')">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// UPDATE USER
async function updateUser() {
    if (!editingUserId) return;

    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const age = document.getElementById('editAge').value;
    const hobbies = document.getElementById('editHobbies').value
        .split(',')
        .map(h => h.trim())
        .filter(h => h);
    const bio = document.getElementById('editBio').value;

    try {
        const response = await fetch(`${API_BASE_URL}/${editingUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                age: age ? parseInt(age) : undefined,
                hobbies,
                bio,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('User updated successfully!', 'success');
            closeEditModal();
            await loadAllUsers();
        } else {
            showToast(data.message || 'Error updating user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating user', 'error');
    }
}

// DELETE USER
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            showToast('User deleted successfully!', 'success');
            await loadAllUsers();
        } else {
            showToast(data.message || 'Error deleting user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting user', 'error');
    }
}

// DELETE ALL USERS
async function deleteAllUsers() {
    if (!confirm('Are you sure you want to delete ALL users? This cannot be undone!')) return;

    try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            for (const user of data.data) {
                await fetch(`${API_BASE_URL}/${user._id}`, { method: 'DELETE' });
            }
            showToast('All users deleted successfully!', 'success');
            currentPage = 1;
            await loadAllUsers();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting users', 'error');
    }
}

// SEARCH BY NAME
async function searchByName() {
    const name = document.getElementById('searchName').value;
    if (!name) {
        showToast('Please enter a name to search', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search/name?name=${encodeURIComponent(name)}`);
        const data = await response.json();

        const resultsContainer = document.getElementById('nameSearchResults');
        if (data.success && data.data.length > 0) {
            resultsContainer.innerHTML = data.data
                .map(user => createResultItem(user))
                .join('');
        } else {
            resultsContainer.innerHTML = '<p class="loading">No results found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error searching users', 'error');
    }
}

// FILTER BY AGE
async function filterByAge() {
    const minAge = document.getElementById('minAge').value;
    const maxAge = document.getElementById('maxAge').value;

    if (!minAge && !maxAge) {
        showToast('Please enter min or max age', 'warning');
        return;
    }

    try {
        const url = new URL(`${window.location.origin}${API_BASE_URL}/search/filter`);
        if (minAge) url.searchParams.append('minAge', minAge);
        if (maxAge) url.searchParams.append('maxAge', maxAge);

        const response = await fetch(url);
        const data = await response.json();

        const resultsContainer = document.getElementById('ageFilterResults');
        if (data.success && data.data.length > 0) {
            resultsContainer.innerHTML = data.data
                .map(user => createResultItem(user))
                .join('');
        } else {
            resultsContainer.innerHTML = '<p class="loading">No results found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error filtering users', 'error');
    }
}

// SEARCH BY HOBBY
async function searchByHobby() {
    const hobby = document.getElementById('searchHobby').value;
    if (!hobby) {
        showToast('Please enter a hobby to search', 'warning');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/search/hobbies?hobby=${encodeURIComponent(hobby)}`
        );
        const data = await response.json();

        const resultsContainer = document.getElementById('hobbySearchResults');
        if (data.success && data.data.length > 0) {
            resultsContainer.innerHTML = data.data
                .map(user => createResultItem(user))
                .join('');
        } else {
            resultsContainer.innerHTML = '<p class="loading">No results found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error searching users', 'error');
    }
}

// TEXT SEARCH
async function performTextSearch() {
    const query = document.getElementById('textSearch').value;
    if (!query) {
        showToast('Please enter search text', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search/text?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        const resultsContainer = document.getElementById('textSearchResults');
        if (data.success && data.data.length > 0) {
            resultsContainer.innerHTML = data.data
                .map(user => createResultItem(user))
                .join('');
        } else {
            resultsContainer.innerHTML = '<p class="loading">No results found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error performing text search', 'error');
    }
}

// Create result item
function createResultItem(user) {
    return `
        <div class="result-item">
            <strong>${user.name}</strong> (${user.email})
            ${user.age ? ` - Age: ${user.age}` : ''}
            ${user.hobbies.length > 0 ? ` - Hobbies: ${user.hobbies.join(', ')}` : ''}
            ${user.bio ? `<br><em>${user.bio}</em>` : ''}
        </div>
    `;
}

// Get user statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const data = await response.json();

        const statsContainer = document.getElementById('statsContainer');

        if (data.success && data.data) {
            const stats = data.data;
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">Total Users</div>
                    <div class="stat-value">${stats.totalUsers || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Average Age</div>
                    <div class="stat-value">${Math.round(stats.averageAge) || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Youngest User</div>
                    <div class="stat-value">${stats.minAge || 'N/A'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Oldest User</div>
                    <div class="stat-value">${stats.maxAge || 'N/A'}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading statistics', 'error');
    }
}

// Modal functions
function openEditModal(userId, name, email, age, hobbies, bio) {
    editingUserId = userId;
    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editAge').value = age;
    document.getElementById('editHobbies').value = hobbies;
    document.getElementById('editBio').value = bio;
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingUserId = null;
}

// Close modal when clicking outside
window.onclick = function (e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active to clicked link
    event.target.classList.add('active');

    // Load stats if stats tab
    if (tabName === 'stats') {
        loadStats();
    }
}

// Pagination
async function nextPage() {
    currentPage++;
    await loadAllUsers();
}

async function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        await loadAllUsers();
    }
}

function updatePaginationInfo(pagination) {
    document.getElementById('pageInfo').textContent = `Page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalUsers} total)`;
}

// Show empty state
function showEmptyState() {
    const container = document.getElementById('usersList');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">No users found. Create your first user!</div>
        </div>
    `;
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
