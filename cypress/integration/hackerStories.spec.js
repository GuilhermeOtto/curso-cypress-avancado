describe('Hacker Stories', () => {
    const initialTerm = 'React'
    const newTerm = 'Cypress'
    const faker = require('faker')

  context('Hittting the real API', () => {
    beforeEach(() => {
      cy.intercept('GET',`**/search?query=${initialTerm}&page=0`)
        .as('getStories')

      cy.visit('/')

      cy.wait('@getStories')

      cy.get('#search')
        .should('be.visible')
        .clear()
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept('GET',`**/search?query=${initialTerm}&page=1`)
        .as('getMoreStories')

      cy.get('.item')
        .should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()
      cy.wait('@getMoreStories')

      cy.get('.item')
        .should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept('GET',`**/search?query=${newTerm}&page=0`)
        .as('getNewTermStories')

      cy.get('#search')
        .should('be.visible')
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.getLocalStorage('search')
        .should('be.equal', initialTerm)

      cy.get('.item')
        .should('have.length', 20)

      cy.get('.item')
        .first()
        .should('be.visible')
        .should('contain', initialTerm)

      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocking the API', () => {
    const stories = require('../fixtures/initialTerm')


    context('Footer', () => {
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
    })

    context('List of stories', () => {
      beforeEach(() => {
        cy.intercept('GET',`**/search?query=${initialTerm}&page=0`,{fixture: 'initialTerm'})
          .as('getMockStories')

        cy.intercept('GET',`**/search?query=${newTerm}&page=0`, {fixture: 'newTerm'})
          .as('getNewTermStories')

        cy.visit('/')

        cy.get('#search')
          .should('be.visible')
          .clear()
      })

      it('shows the right data for all rendered stories', () => {
        cy.get('.item')
          .each((element, index) => {
            cy.wrap(element).should('contain', stories.hits[index].title)
              .and('contain', stories.hits[index].author)
              .and('contain', stories.hits[index].num_comments)
              .and('contain', stories.hits[index].points)
            cy.get(`.item a:contains(${stories.hits[index].title})`)
              .should('have.attr', 'href', stories.hits[index].url)
          })
      })

      it('shows only nineteen stories after dimissing the first story', () => {
        cy.get('.button-small')
          .first()
          .should('be.visible')
          .click()

        cy.wait('@getMockStories')

        cy.get('.item')
          .should('have.length', 19)
      })

      context('Order by', () => {
        it('orders by title', () => {
          cy.get('.list-header-button:contains(Title)')
            .should('be.visible')
            .click()

          const sortedByTitle = stories.hits.sort((a, b) => {
            return a.title.localeCompare(b.title)
          })

          sortedByTitle.forEach((hit, index) => {
            cy.get('.item')
              .eq(index)
              .should('contain', hit.title)
              .and('contain', stories.hits[index].author)
              .and('contain', stories.hits[index].num_comments)
              .and('contain', stories.hits[index].points)
            cy.get(`.item a:contains(${stories.hits[index].title})`)
              .should('have.attr', 'href', stories.hits[index].url)
          })
        })

        it('orders by author', () => {
          cy.get('.list-header-button:contains(Author)')
          .should('be.visible')
          .click()

          const sortedByAuthor = stories.hits.sort((a, b) => {
            return a.author.localeCompare(b.author)
          })

          sortedByAuthor.forEach((hit, index) => {
            cy.get('.item')
              .eq(index)
              .should('contain',  stories.hits[index].author)
          })
        })

        it('orders by comments', () => {
          cy.get('.list-header-button:contains(Comments)')
            .should('be.visible')
            .click()

          const sortedByComments = stories.hits.sort((a, b) => {
            return b.num_comments - a.num_comments
          })

           sortedByComments.forEach((hit, index) => {
             cy.get('.item')
               .eq(index)
               .should('contain',  stories.hits[index].num_comments)
           })
        })

        it('orders by points', () => {
          cy.get('.list-header-button:contains(Points)')
          .should('be.visible')
          .click()

          const sortedByPoints = stories.hits.sort((a, b) => {
            return b.points - a.points
          })

           sortedByPoints.forEach((hit, index) => {
             cy.get('.item')
               .eq(index)
               .should('contain',  stories.hits[index].points)
           })
        })
      })
    })

    context('Search', () => {
      it('shows no story when none is returned', () => {
        cy.intercept('GET',`**/search**`, { body: { hits: [] } })
        .as('getEmptyStories')

        cy.visit('/')

        cy.wait('@getEmptyStories')

        cy.getLocalStorage('search')
          .should('be.equal', initialTerm)

        cy.get('.item')
          .should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.intercept('GET',`**/search?query=${newTerm}&page=0`, {fixture: 'newTerm'})
        .as('getNewTermStories')

        cy.visit('/')

        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@getNewTermStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item')
          .should('have.length', 20)

        cy.get('.item')
          .first()
          .should('contain', newTerm)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.intercept('GET',`**/search?query=${newTerm}&page=0`, {fixture: 'newTerm'})
        .as('getNewTermStories')

        cy.visit('/')

        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(newTerm)

        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@getNewTermStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item')
          .should('have.length', 20)

        cy.get('.item')
          .first()
          .should('contain', newTerm)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          cy.intercept('GET',`**/search**`, { body: { hits: [] } })
            .as('getEmptyStories')

          cy.visit('/')

          Cypress._.times(6, () => {
            const randomWord = faker.random.word()
            cy.get('#search')
              .should('be.visible')
              .clear()
              .type(`${randomWord}{enter}`)

              cy.wait('@getEmptyStories')

            cy.getLocalStorage('search')
              .should('be.equal', randomWord)
          })

          cy.get('.last-searches')
            .within(() => {
              cy.get('button')
                .should('have.length', 5)
          })
        })
      })
    })
  })

  context('Shows a loading indicator', () => {
    it('shows a "Loading ..." state before showing the results', () => {
      cy.intercept('GET', '**/search**', {fixture: 'initialTerm', delay: 1000})
        .as('getDelayedStories')

      cy.visit('/')

      cy.assertLoadingIsShownAndHidden()

      cy.wait('@getDelayedStories')

      cy.get('.item')
        .should('have.length', 20)
    })
  })

  context('Errors', () => {
    it('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept('GET', '**/search**', {statusCode: 500})
        .as('serverError')

      cy.visit('/')

      cy.wait('@serverError')

      cy.contains('Something went wrong ...')
        .should('be.visible')
    })

    it('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept('GET', '**/search**', {forceNetworkError: true})
        .as('networkError')

      cy.visit('/')

      cy.contains('Something went wrong ...')
        .should('be.visible')
    })
  })
})