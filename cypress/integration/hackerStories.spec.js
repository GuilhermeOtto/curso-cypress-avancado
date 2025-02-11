describe('Hacker Stories', () => {
    const initialTerm = 'React'
    const newTerm = 'Cypress'
    const faker = require('faker')

  context('Hittting the real API', () => {
    beforeEach(() => {
      cy.intercept('GET',`**/search?query=${initialTerm}&page=0`).as('getStories')
      cy.visit('/')
      cy.wait('@getStories')
      cy.get('#search').clear()
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept('GET',`**/search?query=${initialTerm}&page=1`).as('getMoreStories');

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()

      cy.wait('@getMoreStories');

      cy.get('.item').should('have.length', 40)

    })

    it('searches via the last searched term', () => {
      cy.intercept('GET',`**/search?query=${newTerm}&page=0`).as('getNewTermStories')
      cy.get('#search').type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item').first().should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`).should('be.visible')
    })
    context('Errors', () => {
      it('shows "Something went wrong ..." in case of a server error', () => {
        cy.intercept('GET', '**/search**', {statusCode: 500}).as('serverError')
        cy.visit('/')
        cy.wait('@serverError')
        cy.contains('Something went wrong ...').should('be.visible')
      })
    
      it('shows "Something went wrong ..." in case of a network error', () => {
        cy.intercept('GET', '**/search**', {forceNetworkError: true}).as('networkError')
        cy.visit('/')
        cy.contains('Something went wrong ...').should('be.visible')
      })
    })
  })

  context('Mocking the API', () => {

    beforeEach(() => {
      cy.intercept('GET',`**/search?query=${initialTerm}&page=0`,{fixture: 'initialTerm'}).as('getMockStories')
      cy.intercept('GET',`**/search?query=${newTerm}&page=0`, {fixture: 'newTerm'}).as('getNewTermStories')
      cy.visit('/')
      cy.get('#search').clear()
    })

    context('Footer and list of stories', () => {

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      it('shows only nineteen stories after dimissing the first story', () => {
        cy.get('.button-small').first().click()
        cy.wait('@getMockStories')
        cy.get('.item').should('have.length', 19)
      })
  
      it('types and hits ENTER', () => {
        cy.get('#search').type(`${newTerm}{enter}`)
        cy.wait('@getNewTermStories')
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item').first().should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })
  
      it('types and clicks the submit button', () => {
        cy.get('#search').clear().type(newTerm)
        cy.contains('Submit').click()
  
          cy.wait('@getNewTermStories')
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item').first().should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })
  
      it('shows a max of 5 buttons for the last searched terms', () => {
        cy.intercept('GET',`**/search**`, { body: { hits: [] } }).as('getRandomStories')
  
        Cypress._.times(6, () => {
  
            cy.get('#search').clear().type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomStories')
        })
        cy.get('.last-searches button')
          .should('have.length', 5)
      })

      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I assert on the data?
      // This is why this test is being skipped.
      // TODO: Find a way to test it out.
      it.only('shows the right data for all rendered stories', () => {
        cy.get('#search').type(`${newTerm}{enter}`)
        cy.wait('@getNewTermStories')
  
      })




      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I test ordering?
      // This is why these tests are being skipped.
      // TODO: Find a way to test them out.
      context.skip('Order by', () => {
        it('orders by title', () => {})

        it('orders by author', () => {})

        it('orders by comments', () => {})

        it('orders by points', () => {})
      })

    })


  })
})