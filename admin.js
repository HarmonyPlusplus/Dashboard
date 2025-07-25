// === API URL ===
const apiURL = 'https://talent-backend-o5cb.onrender.com/api/talents/recruiter';
const apiKey = 'https://talent-backend-o5cb.onrender.com/api/talents';

// ✅ Get token securely from localStorage
const authToken = localStorage.getItem('authToken');

// ✅ If not logged in, redirect to login page
if (!authToken) {
  window.location.href = 'login.html';
}

let talents = [];
let currentPage = 1;
const resultsPerPage = 5;

// === Load talents from API ===
async function loadTalents() {
  try {
    const response = await fetch(apiURL, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await response.json();
    talents = result;
    showPage(1);
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Error loading data.');
  }
}

// === Show a page ===
function showPage(page) {
  currentPage = page;
  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageData = talents.slice(start, end);
  showTalents(pageData);
  updatePagination(start + 1, Math.min(end, talents.length), talents.length);
  document.querySelector('.currentPage').textContent = page;
}

// === Show talents in table ===
function showTalents(data) {
  const tbody = document.querySelector('#talentTable tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No data found.</td></tr>`;
    return;
  }

  data.forEach(talent => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${talent.firstName} ${talent.lastName}</td>
      <td>${talent.companyEmail}</td>
      <td><span>${talent.professionNeeded}</span></td>
      <td>${talent.quantityNeeded}</td>
      <td>${formatDate(new Date(talent.createdAt))}</td>
      <td>
        <button class="update-btn" data-id="${talent._id}">Update</button>
        <button class="delete-btn" data-id="${talent._id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateButtons();
  deleteButtons();
}

// === Format date ===
function formatDate(date) {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// === Update pagination text ===
function updatePagination(start, end, total) {
  const paginationText = document.querySelector('.pagination p');
  paginationText.textContent = `Showing ${start} to ${end} of ${total} results`;
}

// === Show error ===
function showError(message) {
  const tbody = document.querySelector('#talentTable tbody');
  tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">${message}</td></tr>`;
}

// === Update buttons ===
function updateButtons() {
  document.querySelectorAll('.update-btn').forEach(button => {
    button.onclick = () => {
      const id = button.dataset.id;
      const talent = talents.find(t => t._id === id);
      if (!talent) return;

      // Pre-fill modal inputs
      document.getElementById('updateId').value = id;
      document.getElementById('updateFirstName').value = talent.firstName;
      document.getElementById('updateLastName').value = talent.lastName;
      document.getElementById('updateCompanyEmail').value = talent.companyEmail;
      document.getElementById('updateProfession').value = talent.professionNeeded;
      document.getElementById('updateQuantity').value = talent.quantityNeeded;

      // Open modal
      openUpdateModal();
    };
  });
}

// === Open Update Modal ===
function openUpdateModal() {
  document.getElementById('updateModal').style.display = 'flex';
}

// === Close Update Modal ===
function closeUpdateModal() {
  document.getElementById('updateModal').style.display = 'none';
}

// === Handle Update Modal submission ===
document.getElementById('updateForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('updateId').value;
  const firstName = document.getElementById('updateFirstName').value;
  const lastName = document.getElementById('updateLastName').value;
  const email = document.getElementById('updateCompanyEmail').value;
  const profession = document.getElementById('updateProfession').value;
  const quantity = parseInt(document.getElementById('updateQuantity').value);

  if (!firstName || !lastName || !email || !profession || !quantity) {
    showErrorNotification('All fields are required.');
    return;
  }

  try {
    const response = await fetch(`${apiKey}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        firstName,
        lastName,
        companyEmail: email,
        professionNeeded: profession,
        quantityNeeded: quantity
      })
    });

    if (!response.ok) throw new Error('Update failed.');

    showNotification('Updated successfully!');
    closeUpdateModal();
    loadTalents();
  } catch (error) {
    console.error('Update failed:', error);
    showErrorNotification('Update failed.');
  }
});

// === Show notification ===
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 1000);
}

// === Show error notification ===
function showErrorNotification(message) {
  const notification = document.getElementById('errorNotifcation');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 1000);
}

// === Delete buttons ===
function deleteButtons() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.onclick = async () => {
      const id = button.dataset.id;
      if (!confirm('Are you sure you want to delete this record?')) return;

      try {
        const response = await fetch(`${apiKey}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Delete failed.');
        showNotification('Deleted successfully!');
        loadTalents();
      } catch (error) {
        console.error('Delete failed:', error);
        showErrorNotification('Delete failed.');
      }
    };
  });
}

// === Search bar ===
const searchInput = document.querySelector('#search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = talents.filter(data =>
      (`${data.firstName} ${data.lastName}`).toLowerCase().includes(query) ||
      data.companyEmail.toLowerCase().includes(query) ||
      (data.professionNeeded.toLowerCase().includes(query))
    );
    showTalents(filtered);
    updatePagination(1, filtered.length, filtered.length);
    document.querySelector('.currentPage').textContent = 1;
  });
}

// === Pagination buttons ===
document.querySelector('.prev').onclick = () => {
  if (currentPage > 1) {
    showPage(currentPage - 1);
  }
};

document.querySelector('.next').onclick = () => {
  if (currentPage < Math.ceil(talents.length / resultsPerPage)) {
    showPage(currentPage + 1);
  }
};

// === Refresh button ===
document.querySelector('.refresh').onclick = () => window.location.reload();

// === Logout button ===
document.querySelector('.logout').onclick = () => {
  if (confirm('Are you sure you want to logout?')) {
    // ✅ Remove token on logout
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  }
};

// === Load data on page load ===
window.onload = loadTalents;

// === Open Add Modal ===
function openAddModal() {
  document.getElementById('addModal').style.display = 'flex';
}

// === Close Add Modal ===
function closeAddModal() {
  document.getElementById('addModal').style.display = 'none';
}

// === Handle Add Form Submission ===
document.getElementById('addForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const firstName = document.getElementById('addFirstName').value;
  const lastName = document.getElementById('addLastName').value;
  const companyEmail = document.getElementById('addCompanyEmail').value;
  const professionNeeded = document.getElementById('addProfession').value;
  const quantityNeeded = parseInt(document.getElementById('addQuantity').value);
  const contactAddress = document.getElementById('addContactAddress').value;

  try {
    const res = await fetch(apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        firstName,
        lastName,
        companyEmail,
        companyWebsite: "https://futurelabs.ng/talent",
        professionNeeded,
        quantityNeeded,
        contactAddress,
        type: "recruiter"
      })
    });

    const data = await res.json();

    if (res.ok) {
      showNotification("Talent added successfully!");
      document.getElementById('addModal').style.display = 'none';
      document.getElementById('addForm').reset();
      await loadTalents();
    } else {
      showErrorNotification(data.message || "Failed to add new talent. Please try again.");
    }

  } catch (error) {
    console.error(error);
    showErrorNotification("Error adding new talent.");
  }
});
