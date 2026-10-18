import * as XLSX from 'xlsx';

describe('Relatórios e Dashboard', () => {
  beforeEach(() => {
    cy.login(
    Cypress.env('username'),
    Cypress.env('password')
  );
  });

 it('1. Exibe a listagem de empréstimos na tela de relatórios', () => {
    cy.visit('/admin/relatorio');

    cy.contains('.title', 'Relatório').should('be.visible');
    cy.get('#relatorioList tbody tr').should('have.length.greaterThan', 0);
    cy.get('#relatorioList thead th')
      .should('contain', 'Patrimônio')
      .and('contain', 'RA')
      .and('contain', 'Aluno');
  });

  it('2. Encerra um empréstimo em andamento pela tela de relatórios', () => {
    cy.visit('/admin/emprestimo/new');

    cy.get('input[name="ra"]').clear().type('505233');
    cy.get('input[name="ra"]').blur();

    cy.get('input[name="nome"]', { timeout: 10000 })
      .should('not.have.value', '');

    cy.get('input[name="patrimonio"]').clear().type('NB004');
    cy.get('input[name="patrimonio"]').blur();

    cy.get('input[name="marca"]').should('not.have.value', '');

    cy.contains('button', 'Iniciar Empréstimo')
      .should('not.be.disabled')
      .click();

    cy.get('.swal2-popup.swal2-toast').should('be.visible');

    cy.visit('/admin/relatorio');

    cy.get('#relatorioList tbody tr').then(($rows) => {
      const $ativo = $rows.find('.btn-andamento').first();

      if ($ativo.length) {
        const patrimonio = $ativo.closest('tr').find('td').eq(0).text().trim();

        cy.wrap($ativo).scrollIntoView().click();

        cy.contains('.swal2-popup', 'Tem certeza?').should('be.visible');
        cy.contains('.swal2-confirm', 'Sim, encerrar!').click();

        cy.contains('.swal2-toast', 'Empréstimo encerrado com sucesso!', {
          timeout: 10000,
        }).should('be.visible');

        cy.get('input[name="patrimonio"]').clear().type(patrimonio);
        cy.get('.filtrosEquipamentos a').first().click();

        cy.contains('#relatorioList tbody tr', patrimonio).within(() => {
          cy.get('td').eq(6).should('contain', 'Encerrado');
          cy.get('td').eq(7).find('button').should('be.disabled');
        });
      }
    });
  });


  it('3. Gera o relatório em .xlsx com todos os empréstimos', () => {
    cy.task('apagarRelatorio');
    cy.visit('/admin/relatorio');

    // Seleciona o máximo antes de contar ou exportar.
    cy.get('#pageSize')
      .should('be.visible')
      .then(($select) => {
        const opcoes = Array.from(
          $select[0].querySelectorAll('option')
        )
          .map((option) => Number(option.value))
          .filter(
            (value) => Number.isFinite(value) && value > 0
          );

        expect(opcoes.length, 'Opções numéricas de pageSize')
          .to.be.greaterThan(0);

        const maiorQuantidade = Math.max(...opcoes);

        cy.wrap($select)
          .select(String(maiorQuantidade));
      });

    // Aguarda a atualização da tabela após a seleção.
    cy.get('#relatorioList tbody tr')
      .should('exist');

    cy.get('#pageSize').then(($select) => {
      const selecionado = Number(
        ($select[0] as HTMLSelectElement).value
      );

      cy.log(`Quantidade selecionada: ${selecionado}`);
    });

    cy.wait(2000);

    // Conta os registros somente depois de selecionar o máximo.
    cy.get('#relatorioList tbody tr').then(($rows) => {
      const quantidadeTela = $rows.filter(
        (_, row) => row.querySelectorAll('td').length > 0
      ).length;

      expect(
        quantidadeTela,
        'Total de registros na tela'
      ).to.be.greaterThan(0);

      // Exporta todos os empréstimos.
      cy.get('a#imprimirRelatorio')
        .should('be.visible')
        .click();

      // Lê o arquivo Excel gerado.
      cy.readFile(
        'cypress/downloads/relatorio_emprestimos.xlsx',
        'binary',
        { timeout: 15000 }
      ).then((binario: string) => {
        const planilha = XLSX.read(binario, {
          type: 'binary',
        });

        const aba = planilha.Sheets['Empréstimos'];

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(aba, 'Aba Empréstimos deve existir').to.exist;

        if (!aba) {
          throw new Error(
            'A aba "Empréstimos" não foi encontrada.'
          );
        }

        const linhas = XLSX.utils.sheet_to_json<
          Record<string, unknown>
        >(aba);

        cy.log(`Registros na tela: ${quantidadeTela}`);
        cy.log(`Registros no Excel: ${linhas.length}`);

        expect(
          linhas.length,
          'Quantidade exportada deve corresponder à tela'
        ).to.eq(quantidadeTela);

        expect(
          Object.keys(linhas[0] ?? {}),
          'Colunas obrigatórias do relatório'
        ).to.include.members([
          'Patrimônio',
          'RA',
          'Nome',
          'Curso',
          'Data de Retirada',
          'Data de Devolução',
        ]);
      });
    });
  });

it('4. Aplica o filtro no relatório e compara os dados da tela com o Excel', () => {
  cy.task('apagarRelatorio');
  cy.visit('/admin/relatorio');

  // Normaliza datas para permitir a comparação.
  const normalizarData = (valor: string): string =>
  valor.trim().replace(/\//g, '-');

  // Obtém o patrimônio do primeiro registro.
  cy.get('#relatorioList tbody tr')
    .first()
    .find('td')
    .eq(0)
    .invoke('text')
    .then((patrimonioTexto) => {
      const patrimonio = patrimonioTexto.trim();

      // Aplica o filtro por patrimônio.
      cy.get('input[name="patrimonio"]')
        .clear()
        .type(patrimonio);

      cy.get('.filtrosEquipamentos a')
        .first()
        .click();

      // Confirma que a tabela apresenta apenas o patrimônio filtrado.
      cy.get('#relatorioList tbody tr').should(($rows) => {
        expect($rows.length).to.be.greaterThan(0);

        [...$rows].forEach((row) => {
          const patrimonioLinha =
            row.querySelectorAll('td')[0]?.innerText.trim();

          expect(patrimonioLinha).to.eq(patrimonio);
        });
      });

      // Seleciona a maior quantidade disponível no seletor.
      cy.get('#pageSize')
        .should('be.visible')
        .then(($select) => {
          const select = $select[0] as HTMLSelectElement;

          const opcoes = Array.from(select.options)
            .map((option) => Number(option.value))
            .filter(
              (value) => Number.isFinite(value) && value > 0
            );

          expect(
            opcoes.length,
            'Opções numéricas disponíveis no seletor'
          ).to.be.greaterThan(0);

          const maiorQuantidade = Math.max(...opcoes);

          cy.wrap($select)
            .select(String(maiorQuantidade))
            .should('have.value', String(maiorQuantidade));
        });

      // Captura os registros após selecionar o tamanho máximo.
      cy.get('#relatorioList tbody tr')
        .should('exist')
        .then(($rows) => {
          const registrosTela = [...$rows].map((row) => {
            const colunas = [...row.querySelectorAll('td')];

            return [
              colunas[0]?.innerText.trim() ?? '', // Patrimônio
              colunas[1]?.innerText.trim() ?? '', // RA
              colunas[2]?.innerText.trim() ?? '', // Nome/Aluno
              normalizarData(colunas[4]?.innerText ?? ''), // Retirada
              normalizarData(colunas[5]?.innerText ?? ''), // Devolução
            ];
          });

          const quantidadeTela = registrosTela.length;

          expect(quantidadeTela).to.be.greaterThan(0);

          // Remove eventual arquivo anterior antes de exportar.
          cy.task('apagarRelatorio');

          // Exporta os registros filtrados.
          cy.contains('a#imprimirRelatorio', 'Imprimir').click();

          cy.readFile(
            'cypress/downloads/relatorio_emprestimos.xlsx',
            'binary',
            { timeout: 15000 }
          ).then((binario) => {
            const planilha = XLSX.read(binario, {
              type: 'binary',
            });

            const aba = planilha.Sheets['Empréstimos'];

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(
              aba,
              'Aba Empréstimos deve existir'
            ).to.exist;

            const linhas = XLSX.utils.sheet_to_json<
              Record<string, unknown>
            >(aba);

            // Converte os dados do Excel para o formato da tela.
            const registrosExcel = linhas.map((linha) => [
              String(linha['Patrimônio'] ?? '').trim(),
              String(linha['RA'] ?? '').trim(),
              String(linha['Nome'] ?? '').trim(),
              normalizarData(
                String(linha['Data de Retirada'] ?? '')
              ),
              normalizarData(
                String(linha['Data de Devolução'] ?? '')
              ),
            ]);

            // 1. Compara as quantidades.
            cy.log(`Registros na tela: ${quantidadeTela}`);
            cy.log(`Registros no Excel: ${registrosExcel.length}`);

            expect(
              registrosExcel.length,
              'Quantidade de registros no Excel'
            ).to.eq(quantidadeTela);

            // 2. Confirma que todos pertencem ao patrimônio filtrado.
            registrosExcel.forEach((registro) => {
              expect(registro[0]).to.eq(patrimonio);
            });

            // 3. Compara todos os campos, sem depender da ordem.
            const chaveRegistro = (registro: string[]) =>
              JSON.stringify(registro);

            const telaOrdenada = registrosTela
              .map(chaveRegistro)
              .sort();

            const excelOrdenado = registrosExcel
              .map(chaveRegistro)
              .sort();

            expect(
              excelOrdenado,
              'Os registros do Excel devem corresponder aos da tela'
            ).to.deep.equal(telaOrdenada);
          });
        });
    });
});

  it('5. Exibe a dashboard com os períodos e os gráficos de empréstimos', () => {
    cy.visit('/admin/dashboard');

    cy.contains('div.title', 'Bem Vindo ao EasyNote').should('be.visible');
    cy.contains('h3', 'Empréstimos por Dia').should('be.visible');
    cy.contains('h5', 'Cursos com mais Utilizações').should('exist');
    cy.contains('h5', 'Equipamentos mais Emprestados').should('exist');

    cy.get('#periodo').find('option').should('have.length', 3);

    ['7', '15', '30'].forEach((periodo) => {
        cy.get('#periodo').select(periodo).should('have.value', periodo);
    });

    cy.get('ngx-charts-bar-vertical').should('exist');
    cy.get('ngx-charts-bar-horizontal').should('have.length', 2);
    cy.get('.graficos-div').should('be.visible');

    const hoje = new Date();
    const dataHoje = [
        String(hoje.getDate()).padStart(2, '0'),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        hoje.getFullYear()
    ].join('-');

    cy.get('ngx-charts-bar-vertical').within(() => {
        cy.get('.tick text').should(($rotulos) => {
            const datas = [...$rotulos].map((el) => el.textContent.trim());

            expect(datas).to.include(dataHoje);
        });
    });
});
});
