/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(usuario: string, senha: string): Chainable<void>;
    visitAndWaitForRoute(url: string): Chainable<void>;
  }
}

Cypress.Commands.add('login', (usuario: string, senha: string) => {
  cy.session([usuario, senha], () => {
    cy.visit('/login');

    cy.get('input[name="usuario"]').type(usuario);
    cy.get('input[name="senha"]').type(senha);

    cy.contains('button', 'Entrar').click();

    cy.window().should((win) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });
});


Cypress.Commands.add('visitAndWaitForRoute', (url: string) => {
  cy.visit(url);
  cy.url().should('include', url);
});
