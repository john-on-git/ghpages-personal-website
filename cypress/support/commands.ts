// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
  interface Chainable {
    getByCy(id: string): Chainable<Element>
    findByCy(subject: Chainable<Element>, id: string): Chainable<Element>
  }
}

Cypress.Commands.add("getByCy",{ prevSubject: false }, (id) => {
  return cy.get(`[data-cy=${id}]`)
})
Cypress.Commands.add("findByCy",{ prevSubject: true }, (subject: Cypress.Chainable<Element>, id) => {
  return subject.find(`[data-cy=${id}]`)
})