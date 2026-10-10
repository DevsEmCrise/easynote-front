describe('Empréstimos', () => {
  beforeEach(() => {
    cy.login(
    Cypress.env('username'),
    Cypress.env('password')
  );
  });

  it('1. Realizar empréstimo com aluno e equipamento existente', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('505233');
    cy.get('input[name="ra"]').blur();

    cy.get('input[name="nome"]').should('not.have.value', '');

    cy.get('input[name="patrimonio"]').clear().type('NB004');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('input[name="marca"]').should('not.have.value', '');

    cy.contains('button', 'Iniciar Empréstimo').should('not.be.disabled');
    cy.contains('button', 'Iniciar Empréstimo').click();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
  });

  it('2. Realizar empréstimo com RA inexistente', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('000000');
    cy.get('input[name="ra"]').blur();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Aluno não encontrado');
  });

  it('3. Realizar empréstimo com patrimônio inexistente', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="patrimonio"]').clear().type('PAT_INVALIDO_999');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Equipamento não encontrado');
  });

  it('4. Equipamento com empréstimo ativo não pode ser emprestado novamente', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('505233');
    cy.get('input[name="ra"]').blur();

    cy.get('input[name="nome"]').should('not.have.value', '');

    cy.get('input[name="patrimonio"]').clear().type('NB004');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
    cy.get('.swal2-title').should('contain', 'já está emprestado');
  });

it('5. Aluno com empréstimo ativo não pode iniciar novo empréstimo', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('505233');
    cy.get('input[name="ra"]').blur();

    cy.get('input[name="nome"]').should('not.have.value', '');

    cy.get('input[name="patrimonio"]').clear().type('QA001');
    cy.get('input[name="patrimonio"]').blur();

    cy.contains('button', 'Iniciar Empréstimo').should('not.be.disabled');
    cy.contains('button', 'Iniciar Empréstimo').click();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
    cy.get('.swal2-title').should('contain', 'já possui empréstimo');
  });

it('6. Encerrar empréstimo', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="patrimonio"]').clear().type('NB004');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('input[name="ra"]').should('have.value', '505233');

    cy.contains('button', 'Iniciar Empréstimo').should('be.disabled');
    cy.contains('button', 'Encerrar Empréstimo').click();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Empréstimo encerrado com sucesso');
  });

});
