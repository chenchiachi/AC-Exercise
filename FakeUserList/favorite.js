const BASE_URL = 'https://lighthouse-user-api.herokuapp.com';
const INDEX_URL = BASE_URL + '/api/v1/users';

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let filterUsers = []


function renderUsers(data) {
  let rawHTML = '';
  data.forEach((item) => {
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
            <a href="javascript:;" class="btn btn-outline-danger btn-remove-favorite mx-2" data-id="${item.id}">💔</a>
          </div>
        </div>
      </div>
    </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
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

function removeFromFavorite(id) {
  if (!users) return
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  users.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUsers(users)
}




dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-more')) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
});

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filterUsers = users.filter(user =>
    user.name.toLowerCase().includes(keyword)
  )
  if (filterUsers.length === 0) {
    return alert('Not Found.')
  }
  renderUsers(filterUsers)
})


renderUsers(users)