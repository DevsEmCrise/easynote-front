import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: 'https://easynote.beatrizschindler.com.br/',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: false,
      json: true,
    },

    setupNodeEvents(on, config) {  
      config.env['username'] = process.env['CYPRESS_USERNAME'];
      config.env['password'] = process.env['CYPRESS_PASSWORD']; 
      config.env['USERNAME_COLABORADOR'] =
        process.env['CYPRESS_USERNAME_COLABORADOR'];

      config.env['PASSWORD_COLABORADOR'] =
        process.env['CYPRESS_PASSWORD_COLABORADOR'];
      on('task', {
        apagarRelatorio() {
          const arquivo = path.join(
            config.projectRoot,
            'cypress',
            'downloads',
            'relatorio_emprestimos.xlsx'
          );

          if (fs.existsSync(arquivo)) {
            fs.unlinkSync(arquivo);
          }

          return null;
        },
      });

      return config;
    },
  },

  
});
