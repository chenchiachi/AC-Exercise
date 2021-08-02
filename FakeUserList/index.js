const BASE_URL = 'https://lighthouse-user-api.herokuapp.com';
const INDEX_URL = BASE_URL + '/api/v1/users';
const USERS_PER_PAGE = 20

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const users = []
let filterUsers = []

function renderUsers(data) {
  let rawHTML = '';
  const favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []

  data.forEach((item) => {
    let heart = '♡'
    if (favoriteList.some(user => user.id === item.id)) {
      heart = '❤'
    }
    rawHTML += `
    <div class="col-sm-2 m-3">
      <div class="card">
        <img class="user-img" src="${item.avatar}" alt="user-data">
        <div class="card-body p-1">
          <div class="card-title">
            <h5 class="m-0 mt-1 text-nowrap" style="text-align: center;">${item.name} </h5>
          </div>
          <div class="row footer justify-content-center flex-nowrap">
            <a href="javascript:;" class="btn btn-secondary btn-show-more mx-2" data-toggle="modal" data-target="#user-modal" data-id="${item.id}" >More</a>
            <a href="javascript:;" class="btn btn-outline-danger btn-favorite mx-2" data-id="${item.id}">${heart}</a>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numbersOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numbersOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page ="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function showUserModal(id) {
  const modalName = document.querySelector("#user-modal-name");
  const modalImage = document.querySelector("#user-modal-image");
  const modalInfo = document.querySelector("#user-modal-info");


  axios.get(INDEX_URL + '/' + id).then((response) => {
    const data = response.data;
    modalName.innerText = data.name;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-image" class="img-fluid rounded-circle">`;
    modalInfo.innerHTML = `
    <p>Age | ${data.age}</p>
    <p>Region | ${data.region}</p>
    <p>Birthday | ${data.birthday}</p>
    <p style="word-break: break-all;">Email | ${data.email}</p>
    
    `;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)
  if (list.some(user => user.id === id)) {
    return
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

function removeFromFavorite(id) {
  if (!users) return
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const userIndex = list.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  list.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}


function getUsersByPage(page) {
  const data = filterUsers.length ? filterUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  if (target.matches('.btn-show-more')) {
    showUserModal(Number(target.dataset.id));
  } else if (target.matches('.btn-favorite')) {
    if (target.innerText === '♡') {
      addToFavorite(Number(target.dataset.id))
      target.innerText = '❤'
    } else if (target.innerText === '❤') {
      removeFromFavorite(Number(target.dataset.id))
      target.innerText = '♡'
    }
  }
});

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterUsers = users.filter(user =>
    user.name.toLowerCase().includes(keyword)
  )
  if (filterUsers.length === 0) {
    searchInput.value = ''
    return alert('Not Found.')
     }
  renderPaginator(filterUsers.length)
  renderUsers(getUsersByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUsers(getUsersByPage(page))
})

axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length)
  renderUsers(getUsersByPage(1));
});
