
describe('Alunos', () => {
  beforeEach(() => {
    cy.login(
    Cypress.env('username'),
    Cypress.env('password')
  );
  });

  const ra = `9${Date.now().toString().slice(-7)}`;

  it('1. Cadastrar novo aluno', () => {
    cy.visit('/admin/aluno/new');

    cy.get('input[name="alunoNome"]').type('Aluno Novo E2E');
    cy.get('input[name="ra"]').type(ra);
    cy.get('input[name="curso"]').type('Análise de Sistemas');

    cy.contains('button', 'Salvar').should('not.be.disabled').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-icon.swal2-success').should('exist');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/admin/aluno');
    cy.wait(3000);

    cy.get('input[name="ra"]').clear().type(ra);
    cy.get('.filtrosAlunos a').first().click();

    cy.contains('tr', ra)
      .should('contain', 'Aluno Novo E2E')
      .and('contain', 'Análise de Sistemas');
  });

  it('2. Valida o cadastro com campos obrigatórios faltando', () => {
    cy.visit('/admin/aluno/new');

    cy.contains('button', 'Salvar').should('be.disabled');

    cy.get('input[name="alunoNome"]').type('Aluno Validação E2E');
    cy.contains('button', 'Salvar').should('be.disabled');

    cy.get('input[name="ra"]').type(ra);
    cy.contains('button', 'Salvar').should('be.disabled');

    cy.get('input[name="curso"]').type('Análise de Sistemas');
    cy.contains('button', 'Salvar').should('not.be.disabled');
  });

  it('3. Não permite cadastrar um aluno com RA já existente', () => {
    cy.visit('/admin/aluno/new');

    cy.get('input[name="alunoNome"]').type('Aluno Duplicado E2E');
    cy.get('input[name="ra"]').type(ra);
    cy.get('input[name="curso"]').type('Análise de Sistemas');

    cy.contains('button', 'Salvar').should('not.be.disabled').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-icon.swal2-error').should('exist');
    cy.contains('.swal2-popup', 'Erro').should('be.visible');
    cy.get('.swal2-confirm').click();

    cy.url().should('include', '/admin/aluno/new');
  });

  it('4. Editar aluno', () => {
    cy.visit('/admin/aluno');

    cy.get('table tbody tr .btn-warning').first().click();
    cy.url().should('match', /\/admin\/aluno\/edit\/\d+/);

    cy.get('input[name="curso"]').clear().type('Engenharia de Software');

    cy.contains('button', 'Atualizar').should('not.be.disabled').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/admin/aluno');
  });

  it('5. Desativar e reativar um aluno', () => {
    const ra = `9${Date.now().toString().slice(-7)}`;

    cy.visit('/admin/aluno/new');

    cy.get('input[name="alunoNome"]').type('Aluno Desativar E2E');
    cy.get('input[name="ra"]').type(ra);
    cy.get('input[name="curso"]').type('Análise de Sistemas');

    cy.contains('button', 'Salvar').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/admin/aluno');

    const filtrar = () => {
      cy.get('input[name="ra"]').clear().type(ra);
      cy.get('.filtrosAlunos a').first().click();
      cy.contains('tr', ra).should('exist');
    };

    filtrar();

    cy.contains('tr', ra).within(() => {
      cy.get('td').eq(3).should('have.text', 'ATIVO');
    });

    cy.contains('tr', ra).find('.btn-danger').click();

    cy.contains(
      '.swal2-popup',
      'Tem certeza que deseja desativar este aluno?'
    ).should('be.visible');

    cy.contains('.swal2-confirm', 'Sim').click();

    cy.contains('.swal2-popup', 'Pronto!', { timeout: 10000 })
      .should('be.visible');

    cy.get('.swal2-confirm').click();

    filtrar();

    cy.contains('tr', ra).within(() => {
      cy.get('td').eq(3).should('have.text', 'INATIVO');
      cy.get('.btn-primary').should('exist');
      cy.get('.btn-warning').should('not.exist');
    });

    cy.contains('tr', ra).find('.btn-primary').click();

    cy.contains(
      '.swal2-popup',
      'Tem certeza que deseja reativar este aluno?'
    ).should('be.visible');

    cy.contains('.swal2-confirm', 'Sim').click();

    cy.contains('.swal2-popup', 'Pronto!', { timeout: 10000 })
      .should('be.visible');

    cy.get('.swal2-confirm').click();

    filtrar();

    cy.contains('tr', ra).within(() => {
      cy.get('td').eq(3).should('have.text', 'ATIVO');
      cy.get('.btn-warning').should('exist');
      cy.get('.btn-danger').should('exist');
    });
  });
});