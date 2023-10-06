// ---------- GLOBAL VARIABLES ----------
const galleryElem = document.getElementById('gallery');
let currentIndex, allUsers, activeUser, modalElem, modalDetailsElem, searchOutput, prevBtn, nextBtn, modalControlsElem, isSearchActive = false;

// ---------- INITIALIZATION ----------
initializeSearch();
retrieveUsers();

// ---------- EVENT LISTENERS ----------
galleryElem.addEventListener('click', processCardClick);
document.addEventListener('keydown', processModalKeyInteraction);
const searchForm = document.querySelector('form');
searchForm.addEventListener('submit', executeSearch);

// ---------- FETCH USER DATA ----------
function retrieveUsers() {
    fetchData('https://randomuser.me/api/?nat=us&results=12')
        .then(data => {
            allUsers = data.results;
            displayUsers(allUsers);
            setupModalStructure();
        });
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return response.ok ? response.json() : Promise.reject(new Error(response.statusText));
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

// ---------- SEARCH FUNCTIONALITY ----------
function initializeSearch() {
    const searchSection = document.querySelector('.search-container');
    const searchFormHTML = `
        <form action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>`;
    searchSection.insertAdjacentHTML('beforeend', searchFormHTML);
}

function executeSearch(event) {
    event.preventDefault();
    const searchText = event.target[0].value.toLowerCase();

    if (searchText === '') {
        isSearchActive = false;
        displayUsers(allUsers);
    } else {
        isSearchActive = true;
        searchOutput = allUsers.filter(user => {
            const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
            return fullName.includes(searchText);
        });

        if (searchOutput.length === 0) {
            galleryElem.innerHTML = '<p>No results found.</p>';
        } else {
            displayUsers(searchOutput);
        }
    }
}

// ---------- DISPLAY AND MODAL FUNCTIONALITIES ----------
function displayUsers(userData) {
    const userCards = userData.map((user, idx) => `
        <div id=${idx} class="card">
            <div class="card-img-container">
                <img class="card-img" src="${user.picture.large}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                <p class="card-text">${user.email}</p>
                <p class="card-text cap">${user.location.state}</p>
            </div>
        </div>`).join('');
    galleryElem.innerHTML = userCards;
}

function setupModalStructure() {
    const modalHTML = `
        <div class="modal-container">
            <div class="modal">
                <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            </div> 
            <div class="modal-btn-container">
                <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
        </div>`;
    galleryElem.insertAdjacentHTML('beforeend', modalHTML);
    modalElem = document.querySelector('.modal-container');
    modalElem.style.display = 'none';
    prevBtn = document.querySelector('#modal-prev');
    nextBtn = document.querySelector('#modal-next');
    modalControlsElem = document.querySelector('.modal-btn-container');
}

function processCardClick(event) {
    const cardElem = event.target.closest('.card');
    if (cardElem) {
        currentIndex = parseInt(cardElem.id, 10);
        activeUser = isSearchActive ? searchOutput[currentIndex] : allUsers[currentIndex];
        displayModal(activeUser);
        modalElem.style.display = 'block';
        updateModalControls();
        modalElem.addEventListener('click', processModalInteraction);
    }
}

function displayModal(user) {
    const modalContent = `
        <div class="modal-info-container">
            <img class="modal-img" src="${user.picture.large}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${user.name.first} ${user.name.last}</h3>
            <p class="modal-text">${user.email}</p>
            <p class="modal-text cap">${user.location.city}</p>
            <hr>
            <p class="modal-text">${formatPhoneNumber(user.cell)}</p>
            <p class="modal-text">${user.location.street.number} ${user.location.street.name}, ${user.location.city}</p>
            <p class="modal-text">${user.location.state}, ${user.location.country} ${user.location.postcode}</p>
            <p class="modal-text">Birthday: ${formatDate(user.dob.date)}</p>
        </div>`;
    const modalDiv = document.querySelector('.modal');
    modalDiv.insertAdjacentHTML('beforeend', modalContent);
}

function formatPhoneNumber(phone) {
    return phone.replace(/[^\d]+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

function formatDate(date) {
    return date.replace(/(\d{4})-(\d{2})-(\d{2}).+/, '$2/$3/$1');
}

function updateModalControls() {
    prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = (isSearchActive ? currentIndex < searchOutput.length - 1 : currentIndex < allUsers.length - 1) ? 'block' : 'none';
}

function processModalInteraction(event) {
    const targetId = event.target.id;

    if (targetId === 'modal-prev' && currentIndex > 0) {
        switchUser(getPreviousUser);
        updateModalControls();
    } else if (targetId === 'modal-next' && (isSearchActive ? currentIndex < searchOutput.length - 1 : currentIndex < allUsers.length - 1)) {
        switchUser(getNextUser);
        updateModalControls();
    } else if (targetId === 'modal-close-btn' || event.target.textContent === 'X') {
        closeModal();
    }
}

function switchUser(retrievalFunction) {
    const newUser = retrievalFunction();
    modalElem.querySelector('.modal-info-container').remove();
    displayModal(newUser);
}

function processModalKeyInteraction(event) {
    if (!modalElem || modalElem.style.display === 'none') return;

    const key = event.key;
    const focusedId = document.activeElement.id;
    if (key === 'Escape') {
        closeModal();
    } else if (key === 'Enter' || key === 'Space') {
        if (focusedId === 'modal-prev' && currentIndex > 0) {
            switchUser(getPreviousUser);
            updateModalControls();
        } else if (focusedId === 'modal-next' && (isSearchActive ? currentIndex < searchOutput.length - 1 : currentIndex < allUsers.length - 1)) {
            switchUser(getNextUser);
            updateModalControls();
        } else if (focusedId === 'modal-close-btn') {
            closeModal();
        }
    }
}

function getPreviousUser() {
    activeUser = isSearchActive ? searchOutput[--currentIndex] : allUsers[--currentIndex];
    return activeUser;
}

function getNextUser() {
    activeUser = isSearchActive ? searchOutput[++currentIndex] : allUsers[++currentIndex];
    return activeUser;
}

function closeModal() {
    modalElem.style.display = 'none';
    modalElem.removeEventListener('click', processModalInteraction);
    const modalDetails = document.querySelector('.modal-info-container');
    if (modalDetails) {
        modalDetails.remove();
    }
}