import { mapListToDOMElements, createDOMElem } from './dominteractions.js'
import { getShowsByKey, getShowById } from './requests.js'

class TvMaze {
    constructor() {
        this.viewElems = {}
        this.showNameButtons = {}
        this.selectedName = ""
        this.showData = ""
        this.showsList
        this.favoriteOpen = false
        this.favoriteRemove = false
        this.initializeApp()
        this.getShowsList()
    }

    initializeApp = () => {
        this.connectDOMElements()
        // this.setupListeners()
        this.fetchAndDisplayShows()
    }

    connectDOMElements = () => {
        const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id)
        const listOfShowNames = Array.from(
            document.querySelectorAll('[data-show-name]')
        ).map(elem => elem.dataset.showName)

        this.viewElems = mapListToDOMElements(listOfIds, 'id')
        this.showNameButtons = mapListToDOMElements(listOfShowNames, 'data-show-name')
        this.viewElems.searchInput.addEventListener('keydown', this.handleSubmit)
        this.viewElems.searchButton.addEventListener('click', this.handleSubmit)
        this.viewElems.favoriteButton.addEventListener('click', this.openFavorite)
        this.viewElems.shadowDetailsView.addEventListener('click', this.closeDetailsView)
    }

    // setupListeners = () => {
    //     Object.keys(this.showNameButtons).forEach(showName => {
    //         this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter)
    //     })
    // }

    // setCurrentNameFilter = () => {
    //     this.selectedName = event.target.dataset.showName
    //     this.fetchAndDisplayShows()
    // }

    handleSubmit = () => {
        if (event.type === 'click' || event.key === 'Enter') {
            this.selectedName = this.viewElems.searchInput.value
            this.fetchAndDisplayShows()
        }
        this.favoriteOpen = false
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => this.renderCardsOnList(shows, false))
    }

    // getShowById(show.id).then(show => {
    //     let cast = show._embedded.cast
    // })
    ////////////////////////////////////////  ^^ zapytanie o obsade

    renderCardsOnList = (shows, isFavorite) => {
        Array.from (
            document.querySelectorAll('[data-show-id]')
        ).forEach(btn => btn.removeEventListener('click', this.openDetailsView))
        this.viewElems.showsWrapper.innerHTML = ""
        
        if (!isFavorite) {
            for (const { show } of shows) {     // { show } <-- odwołuje się do konkretnego elementu
                // getShowById(show.id).then(show => console.log(show))
                const card = this.createShowCard(show)
                this.viewElems.showsWrapper.appendChild(card)
            }
        }   else {

            for (const show of shows) {
                const card = this.createShowCard(show)
                this.viewElems.showsWrapper.appendChild(card)
            }
        }
    }

    closeDetailsView = event => {
        shadowDetailsView.classList.remove("shadowDeatails")
        document.body.classList.remove("stop-scrolling");
        const { showId } = event.target.dataset
        const closeBtn = document.querySelector(`[id="showPreview"] [data-show-id="${showId}"]`)
        closeBtn.removeEventListener('click', this.closeDetailsView)
        this.viewElems.showPreview.style.display = 'none'
        this.viewElems.showPreview.innerHTML = ''

        if (this.favoriteOpen && this.favoriteRemove) {
            this.openFavorite()
        }
    }

    openDetailsView = event => {
        shadowDetailsView.classList.add("shadowDeatails")
        document.body.classList.add("stop-scrolling")
        const { showId } = event.target.dataset
        getShowById(showId).then(show => {
            const card = this.createShowCard(show, true)
            this.viewElems.showPreview.appendChild(card)
            this.viewElems.showPreview.style.display = 'block'
        })
    }

    createShowCard = (show, isDetailed) => {
        const divCard = createDOMElem('div', 'card card-flex')
        const divCardBody1 = createDOMElem('div', 'card-body card-style')
        const divCardBody2 = createDOMElem('div')
        const divCardBodyHeader = createDOMElem('div', 'card-interactions')
        const h5 = createDOMElem('h5', 'card-title card-title-style', show.name)
        const btnClose = createDOMElem('button', 'btn btn-primary btn-show-close', 'Show details')
        const btnX = createDOMElem('button', 'btn-x')
        this.btnFavorite = createDOMElem('button', 'btn-favorite')
        let img, pDesc, pCast, pGenres, pProduction, pPremiere

        if (show.image) {
            if (isDetailed) {
                img = createDOMElem('div', 'card-preview-bg')
                img.style.backgroundImage = `url('${show.image.original}')`
            } else {
                img = createDOMElem('img', 'card-img-top', null, show.image.medium)
            }
        } else {
            img = createDOMElem('img', 'card-img-top', null, 'https://via.placeholder.com/210x295')
        }

        if (show.summary) {
            let description = this.cuttingTags(show.summary)
            if (isDetailed) {
                pDesc = createDOMElem('p', 'card-text', description)
                btnClose.classList.remove('btn-primary')
                btnClose.classList.add('btn-danger')
                btnClose.innerText = 'Close'

            } else {
                pDesc = createDOMElem('p', 'card-text', `${description.slice(0, 100)} ...`)
            }
        } else {
            pDesc = createDOMElem('p', 'card-text', 'There is no summary for that show yet.')
        }

        btnClose.dataset.showId = show.id
        btnX.dataset.showId = show.id
        this.btnFavorite.showId = show.id
        this.viewElems.shadowDetailsView.dataset.showId = show.id

        btnX.addEventListener('click', this.closeDetailsView)

        if (isDetailed) {
            btnClose.addEventListener('click', this.closeDetailsView)
            divCardBodyHeader.style.display = 'flex'
            this.showData = show
            this.checkInFavorite()
        } else {
            btnClose.addEventListener('click', this.openDetailsView)
            divCardBodyHeader.style.display = 'none'
        }

        divCard.appendChild(divCardBody1)
        divCard.appendChild(divCardBody2)
        divCardBody1.appendChild(divCardBodyHeader)
        divCardBodyHeader.appendChild(this.btnFavorite)
        divCardBodyHeader.appendChild(btnX)
        divCardBody1.appendChild(img)
        divCardBody1.appendChild(h5)
        divCardBody1.appendChild(pDesc)
        
        if (isDetailed) {
            if(!show.genres || show.genres.length == '0') {
                pGenres = createDOMElem('p', 'card-info', 'Genre: ---')
            }   else {
                let genres = 'Genre:'
                for (let genre of show.genres) {
                    genres += `, ${genre}`
                }
                genres = genres.replace(',', '')
                pGenres = createDOMElem('p', 'card-info', genres)
            }

            if(!show.network) {
                pProduction = createDOMElem('p', 'card-info', 'Production: ---')
            }   else {
                pProduction = createDOMElem('p', 'card-info', `Production: ${show.network.country.name}`)
            }

            if(!show.premiered) {
                pPremiere = createDOMElem('p', 'card-info', 'Premiere: ---')
            }   else {
                pPremiere = createDOMElem('p', 'card-info', `Premiere: ${show.premiered}`)
            }

            if(!show._embedded.cast || show._embedded.cast.length == '0') {
                pCast = createDOMElem('p', 'card-info', 'Cast: ---')
            }   else {
                let cast = 'Cast:'
                for (let actor of show._embedded.cast) {
                    cast += `, ${actor.character.name}`
                }
                cast = cast.replace(',', '')
                pCast = createDOMElem('p', 'card-info', cast)
            }

            divCardBody1.appendChild(pGenres)
            divCardBody1.appendChild(pProduction)
            divCardBody1.appendChild(pPremiere)
            divCardBody1.appendChild(pCast)
        }

        divCardBody2.appendChild(btnClose)

        return divCard
    }

    cuttingTags = (description) => {
        let tags = ['<b>', '</b>', '<p>', '</p>', '<i>', '</i>']

        for (let tag of tags) {
            if (description.indexOf(tag) !== -1) {
                description = description.replaceAll(tag, '')
            }
        }

        return description
    }

    openFavorite = () => {
        this.favoriteOpen = true
        this.renderCardsOnList(this.showsList, true)
    }

    checkInFavorite = () => {
        for (let show of this.showsList) {
            if (show.id === this.showData.id) {
                this.btnFavorite.classList.add('btn-favorite-check')
                this.btnFavorite.addEventListener('click', this.removeFromFavorite)
                return
            }
        }
        this.btnFavorite.addEventListener('click', this.addToFavorite) 
    }

    addToFavorite = () => {
        this.btnFavorite.removeEventListener('click', this.addToFavorite)
        this.btnFavorite.addEventListener('click', this.removeFromFavorite)

        this.btnFavorite.classList.add('btn-favorite-check')
        this.favoriteRemove = false

        this.showsList.push(this.showData)
        localStorage.setItem('showsList', JSON.stringify(this.showsList));
    }

    removeFromFavorite = () => {
        this.btnFavorite.removeEventListener('click', this.removeFromFavorite)
        this.btnFavorite.addEventListener('click', this.addToFavorite)

        this.btnFavorite.classList.remove('btn-favorite-check')
        this.favoriteRemove = true

        let i = 0
        for (let show of this.showsList) {
            if (show.id === this.showData.id) {

                this.showsList.splice(i, 1)
                localStorage.setItem('showsList', JSON.stringify(this.showsList));
            }
            i++
        }
    }

    getShowsList = () => {
        if (localStorage.getItem('showsList')) {
            this.showsList = JSON.parse(localStorage.getItem('showsList'));
        } else {
            this.showsList = [];
        }
    }
}

document.addEventListener('DOMContentLoaded', new TvMaze())
