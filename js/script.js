// ---------- GLOBAL VARIABLES ----------
const galleryElem = document.getElementById('gallery');
let currentIndex, allUsers, activeUser, modalElem, modalDetailsElem, searchOutput, prevBtn, nextBtn, modalControlsElem, isSearchActive = false;


// ---------- INITIALIZATION ----------
initializeSearch();
retrieveUsers();


// ---------- EVENT LISTENERS ----------
// Event listeners for card clicks and modal interactions
galleryElem.addEventListener('click', handleCardClick);
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

// Fetches data from the given url
async function fetchData(url) {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    }
    return Promise.reject(new Error(response.statusText));
}


// ---------- SEARCH FUNCTIONALITY ----------
// Initializes the search form
function initializeSearch() {
    const searchSection = document.querySelector('.search-container');
    const searchFormHTML = `
        <form action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>`;
    
    searchSection.insertAdjacentHTML('beforeend', searchFormHTML);

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', executeSearch);
}

// Executes the search and displays the results
function executeSearch(event) {
    event.preventDefault();

    let searchText;
    if (event.type === 'submit') {
        searchText = event.target[0].value.toLowerCase().trim();
    } else {
        searchText = event.target.value.toLowerCase().trim();
    }

    currentIndex = 0;

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
// Displays the users in the gallery
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
    setupModalStructure();
}

// Sets up the modal structure
function setupModalStructure() {
    const existingModal = document.querySelector('.modal-container');

    if (!existingModal) {
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
    }

    modalElem = document.querySelector('.modal-container');
    modalElem.style.display = 'none';
    prevBtn = document.querySelector('#modal-prev');
    nextBtn = document.querySelector('#modal-next');
    modalControlsElem = document.querySelector('.modal-btn-container');
}

// Handles card clicks in the gallery
function handleCardClick(event) {
    const cardElem = event.target.closest('.card');
    if (!cardElem) return;

    currentIndex = parseInt(cardElem.id, 10);
    const displayedUsers = isSearchActive ? searchOutput : allUsers;
    activeUser = displayedUsers[currentIndex];

    displayModal(activeUser);
    modalElem.style.display = 'block';
    updateModalControls();
    modalElem.addEventListener('click', processModalInteraction);
}

// Displays the modal with the user details
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

// Formats phone number and date
function formatPhoneNumber(phone) {
    return phone.replace(/[^\d]+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

function formatDate(date) {
    return date.replace(/(\d{4})-(\d{2})-(\d{2}).+/, '$2/$3/$1');
}

// Updates the modal controls based on the current index
function updateModalControls() {
    prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = (isSearchActive ? currentIndex < searchOutput.length - 1 : currentIndex < allUsers.length - 1) ? 'block' : 'none';
}

// Processes modal interactions
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

// Switches to the previous or next user in the search results or all users
function switchUser(retrievalFunction) {
    const newUser = retrievalFunction();
    modalElem.querySelector('.modal-info-container').remove();
    displayModal(newUser);
}

// Processes keydown events on the modal
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

// Gets the previous user in the search results or all users
function getPreviousUser() {
    activeUser = isSearchActive ? searchOutput[--currentIndex] : allUsers[--currentIndex];
    return activeUser;
}

// Gets the next user in the search results or all users
function getNextUser() {
    activeUser = isSearchActive ? searchOutput[++currentIndex] : allUsers[++currentIndex];
    return activeUser;
}

// Closes the modal and removes the event listener
function closeModal() {
    modalElem.style.display = 'none';
    modalElem.removeEventListener('click', processModalInteraction);
    const modalDetails = document.querySelector('.modal-info-container');
    if (modalDetails) {
        modalDetails.remove();
    }
}
