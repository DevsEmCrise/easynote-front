describe('Permissões de Usuários', () => {
  describe('Usuário Admin', () => {
    beforeEach(() => {
      cy.login(
      Cypress.env('username'),
      Cypress.env('password')
    );
  });

    it('deve visualizar o link "Usuário" no header', () => {
      cy.visit('/admin/dashboard');
      cy.get('nav').contains('a', 'Usuário').should('exist');
    });

    it('deve acessar a página de listagem de usuários', () => {
      cy.visit('/admin/usuario');
      cy.url().should('include', '/admin/usuario');
      cy.contains('h1, .title', 'Usuários').should('exist');
    });

    it('deve visualizar o botão "Novo" na listagem de equipamentos', () => {
      cy.visit('/admin/equipamento');
      cy.contains('a', 'Novo').should('exist');
    });

    it('deve acessar o formulário de cadastro de equipamento', () => {
      cy.visit('/admin/equipamento/new');
      cy.url().should('include', '/admin/equipamento/new');
      cy.contains('button', 'Salvar').should('exist');
    });

    it('deve visualizar botões de ação (editar/desativar) nos equipamentos', () => {
      cy.visit('/admin/equipamento');
      cy.get('table tbody tr').first().find('.btn-warning').should('exist');
      cy.get('table tbody tr').first().find('.btn-danger').should('exist');
    });
  });

  describe('Usuário Colaborador', () => {
    beforeEach(() => {
      cy.login(Cypress.env('USERNAME_COLABORADOR'), Cypress.env('PASSWORD_COLABORADOR'));
    });

    it('NÃO deve visualizar o link "Usuário" no header', () => {
      cy.visit('/admin/dashboard');
      cy.get('nav').contains('a', 'Usuário').should('not.exist');
    });

    it('NÃO deve acessar a página de listagem de usuários (redirecionado para dashboard)', () => {
      cy.visit('/admin/usuario');
      cy.url().should('include', '/admin/dashboard');
    });

    it('NÃO deve visualizar o botão "Novo" na listagem de equipamentos', () => {
      cy.visit('/admin/equipamento');
      cy.contains('a', 'Novo').should('not.exist');
    });

    it('NÃO deve visualizar botões de ação (editar/desativar) nos equipamentos', () => {
      cy.visit('/admin/equipamento');
      cy.get('table tbody tr').first().then(($row) => {
        cy.wrap($row).find('.btn-danger').should('not.exist');
        cy.wrap($row).find('.btn-warning').should('not.exist');
      });
    });

    it('NÃO deve visualizar o botão "Novo" na listagem de alunos', () => {
      cy.visit('/admin/aluno');
      cy.contains('a', 'Novo').should('not.exist');
    });

    it('NÃO deve visualizar botões de ação (editar/desativar) nos alunos', () => {
      cy.visit('/admin/aluno');
      cy.get('table tbody tr').first().then(($row) => {
        cy.wrap($row).find('.btn-danger').should('not.exist');
        cy.wrap($row).find('.btn-warning').should('not.exist');
      });
    });

    it('deve visualizar o link "Empréstimos" no header', () => {
      cy.visit('/admin/dashboard');
      cy.get('nav').contains('a', 'Empréstimos').should('exist');
    });

    it('deve acessar a página de empréstimos', () => {
      cy.visit('/admin/emprestimo/new');
      cy.url().should('include', '/admin/emprestimo/new');
      cy.contains('button', 'Iniciar Empréstimo').should('exist');
    });
  });
});
