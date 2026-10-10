const timestamp = Date.now();

describe('Equipamentos', () => {
  beforeEach(() => {
    cy.login(
    Cypress.env('username'),
    Cypress.env('password')
  );
  });

  it('1. Cadastrar novo equipamento', () => {
    cy.visit('/admin/equipamento/new');

    cy.get('input[name="patrimonio"]').clear().type(`PAT-E2E-${timestamp}`);
    cy.get('input[name="marca"]').clear().type('Dell');
    cy.get('input[name="modelo"]').clear().type('Latitude 5420');
    cy.get('input[name="observacao"]').clear().type('Equipamento criado via E2E');

    cy.get('select[name="situacao"]').select('Disponível');

    cy.contains('button', 'Salvar').should('not.be.disabled');
    cy.contains('button', 'Salvar').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'sucesso');
    cy.url().should('include', '/admin/equipamento');
  });

  it('2. Cadastrar novo equipamento com informações obrigatórias faltando', () => {
    cy.visit('/admin/equipamento/new');

    cy.get('input[name="patrimonio"]').clear().type('TESTE');
    cy.get('input[name="marca"]').clear().type('Marca');

    cy.contains('button', 'Salvar').should('be.disabled');
  });

  it('3. Editar equipamento', () => {
    cy.visit('/admin/equipamento');

    cy.get('table tbody tr').first().find('.btn-warning').click();

    cy.url().should('match', /\/admin\/equipamento\/edit\/\d+/);

    cy.get('input[name="observacao"]').clear().type(`Observacao editada via E2E+${timestamp}`);
    cy.contains('button', 'Atualizar').should('not.be.disabled');
    cy.contains('button', 'Atualizar').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'sucesso');
    cy.url().should('include', '/admin/equipamento');
  });

  it('4. Editar equipamento removendo informações obrigatórias', () => {
    cy.visit('/admin/equipamento');

    cy.get('table tbody tr').first().find('.btn-warning').click();

    cy.url().should('match', /\/admin\/equipamento\/edit\/\d+/);

    cy.get('input[name="patrimonio"]').clear();
    cy.contains('button', 'Atualizar').should('be.disabled');
  });

  it('5. Desativar equipamento', () => {
    cy.visit('/admin/equipamento');

    cy.get('table tbody tr')
      .first()
      .find('.btn-danger')
      .click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Tem certeza');

    cy.contains('button', 'Sim').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Pronto');

    // Verifica se o equipamento desativado apresenta o ícone de reativação
    cy.get('table tbody tr')
      .first()
      .find('.btn-primary .bi-arrow-clockwise')
      .should('exist')
      .and('be.visible');
  });

  it('6. Reativar equipamento', () => {
    cy.visit('/admin/equipamento');

    cy.get('table tbody tr').then(($rows) => {
      const $desativadoBtn = $rows.find('.btn-primary:has(.bi-arrow-clockwise)').first();

      if ($desativadoBtn.length) {

        cy.wrap($desativadoBtn).click();

        cy.get('.swal2-popup').should('be.visible');
        cy.get('.swal2-title').should('contain', 'Tem certeza');
        cy.contains('button', 'Sim').click();

        cy.get('.swal2-popup').should('be.visible');
        cy.get('.swal2-title').should('contain', 'Pronto');
      }
    });
  });

  it('7. Não permite desativar um equipamento emprestado', () => {
    // Realiza o empréstimo
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('505233');
    cy.get('input[name="ra"]').blur();

    cy.get('input[name="nome"]')
      .should('not.have.value', '');

    cy.get('input[name="patrimonio"]').clear().type('QA001');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('input[name="marca"]')
      .should('not.have.value', '');

    cy.contains('button', 'Iniciar Empréstimo')
      .should('not.be.disabled')
      .click();

    cy.get('.swal2-popup.swal2-toast')
      .should('be.visible');

    // Acessa a listagem de equipamentos
    cy.visit('/admin/equipamento');

    // Localiza o equipamento emprestado
    cy.contains('table tbody tr', 'QA001')
      .should('exist')
      .within(() => {
        cy.get('.btn-danger')
          .should('exist')
          .click();
      });

    // Confirma a tentativa de desativação
    cy.get('.swal2-popup')
      .should('be.visible');

    cy.get('.swal2-title')
      .should('contain', 'Tem certeza');

    cy.contains('button', 'Sim').click();

    // Espera o sistema rejeitar a operação
    cy.get('.swal2-popup', { timeout: 10000 })
      .should('be.visible');

    cy.get('.swal2-icon.swal2-error')
      .should('be.visible');
    
    cy.get('.swal2-html-container')
      .should('contain', 'Equipamento possui empréstimo em andamento!');

    // Confirma que o equipamento continua ativo
    cy.visit('/admin/equipamento');

    cy.contains('table tbody tr', 'QA001')
      .should('exist')
      .within(() => {
        cy.get('.btn-danger').should('exist');
        cy.get('.btn-primary .bi-arrow-clockwise')
          .should('not.exist');
    });

    // Encerra o empréstimo
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="patrimonio"]').clear().type('QA001');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('input[name="nome"]')
      .should('not.have.value', '');

    cy.get('input[name="marca"]')
      .should('not.have.value', '');

    cy.contains('button', 'Iniciar Empréstimo')
      .should('be.disabled');

    cy.contains('button', 'Encerrar Empréstimo')
      .should('not.be.disabled')
      .click();

    cy.get('.swal2-popup.swal2-toast')
      .should('be.visible');



  });
});
