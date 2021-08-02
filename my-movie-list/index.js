const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewMode = document.querySelector('#view-mode')
const cardMode = document.querySelector('#card-mode')
const listMode = document.querySelector('#list-mode')

let mode = 'card'
let page = 1

// 將搜尋結果渲染至畫面

function checkMode() {
  if (mode === 'card') {
    renderMovies(getMoviesByPage(page))
} else {
    renderMoviesByList(getMoviesByPage(page))
}
}

function renderMovies(data) {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
                <a href="javascript:;" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</a>
                <a href="javascript:;" class="btn btn-info btn-add-movie" data-id="${item.id}">+</a>
            </div>
          </div>
        </div>
      </div>
    `
    })
    dataPanel.innerHTML = rawHTML
}

function renderMoviesByList(data) {
  let rawHTML = '<ul class="list-group w-100 list-group-flush">'
  data.forEach((item) => {
    rawHTML += `
     <li class="d-flex list-group-item align-items-center justify-content-between">
          <p class="m-0">${item.title}</p>
          <div class="footer" >
            <a href="#" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">More</a>
            <a href="#" class="btn btn-info btn-add-movie" data-id="${item.id}">+</a>
          </div>
      </li>
    `
  })
  dataPanel.innerHTML = rawHTML + '</ul>'
}

function renderPaginator(amount) {
  const numbersOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numbersOfPages; page++) {
    rawHTML += `
     <li class="page-item"><a class="page-link" href="#" data-page ="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"></img>`
    modalDate.innerText = 'Release Date：' + data.release_date
    modalDescription.innerText = data.description
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

viewMode.addEventListener('click', function onViewModeClicked(event) {
  console.log(event.target)
  if (event.target.matches('.btn-list')) {
    mode = 'list'
  } else if (event.target.matches('.btn-card')) {
    mode = 'card'
  }
  checkMode(getMoviesByPage(page))
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-movie')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  checkMode(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // 作法一：for of
  // for (const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)}

  // 作法二：filter
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`沒有符合 ${keyword} 的電影`)
  }
  renderPaginator(filteredMovies.length)
  checkMode(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response => {
  movies.push(...response.data.results)   // 1.使用展開運算子 2.使用 for of
  renderPaginator(movies.length)
  checkMode(getMoviesByPage(1))
}))