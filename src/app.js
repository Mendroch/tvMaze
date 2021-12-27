import { mapListToDOMElements } from './dominteractions.js'

class TvMaze {
    constructor() {
        this.viewElems = {}
        this.showNameButtons = {}
        this.selectedName = "harry"
        this.initializeApp()
    }

    initializeApp = () => {
        this.connectDOMElements()
        this.setupListeners()
    }

    connectDOMElements = () => {
        const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id)
        const listOfShowNames = Array.from(
            document.querySelectorAll('[data-show-name]')
        ).map(elem => elem.dataset.showName)

        this.viewElems = mapListToDOMElements(listOfIds, 'id')
        this.showNameButtons = mapListToDOMElements(listOfShowNames, 'data-show-name')
    }

    setupListeners = () => {
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter)
        })
    }

    setCurrentNameFilter = () => {
        this.selectedName = event.target.dataset.showName
    }
}

document.addEventListener('DOMContentLoaded', new TvMaze())