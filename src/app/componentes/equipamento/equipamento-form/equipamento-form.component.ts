import { Component, inject, OnInit } from '@angular/core';
import { Equipamentos } from '../../../models/equipamentos';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipamentoService } from '../../../services/equipamento-service';
import Swal from 'sweetalert2'
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { DatePipe } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-equipamento-form',
  standalone: true,
  imports: [MdbFormsModule, FormsModule, NgxMaskPipe, NgxMaskDirective, NgxPaginationModule],
  templateUrl: './equipamento-form.component.html',
  styleUrl: './equipamento-form.component.scss',
  providers: [DatePipe, provideNgxMask()]
})
export class EquipamentoFormComponent implements OnInit {

  tituloComponente = "Novo Equipamento"; 
  equipamento: Equipamentos = new Equipamentos();
  situacaoAtual = '';
  

  router = inject(Router);
  rotaAtivada = inject(ActivatedRoute);
  equipamentoService = inject(EquipamentoService);
  datePipe = inject(DatePipe);

  constructor(){
    const id = this.rotaAtivada.snapshot.params['id'];
    if(id > 0){
      this.tituloComponente = "Editar Equipamento";
      this.findById(id);
    }else {
      this.equipamento.id = 0; // Ou algo similar para indicar um novo equipamento
      this.equipamento.situacao = "Disponível";
      this.equipamento.dataAquisicao = this.formatarDataAtual(); 
    }
  }

  ngOnInit(): void {
    this.equipamento.dataAquisicao = this.formatarDataAtual(); // Define a data atual
  }

  formatarDataAtual(): string {
    const data = new Date();
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const ano = data.getFullYear();
    
    return `${dia}-${mes}-${ano}`;
  }

  formatarDataParaSalvar(): string {
    const partes = this.equipamento.dataAquisicao.split('-'); // 'dd-MM-yyyy'
    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1; // Meses em JavaScript começam do zero
    const ano = Number(partes[2]);
  
    // Cria um objeto Date no horário local
    const dataLocal = new Date(ano, mes, dia);
  
    // Converte a data para ISO, ajustando para UTC
    return dataLocal.toISOString(); // Salva em formato ISO
  }
  
  // Ao receber a data do backend
  formatarDataParaInput(data: string): string {
    const partes = data.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`; // Converte 'dd-MM-yyyy' para 'yyyy-MM-dd'
  }

  findById(id: number){
    this.equipamentoService.findById(id).subscribe({
      next: equip => {
        this.equipamento = equip;
        this.equipamento.dataAquisicao = this.formatarDataParaInput(this.equipamento.dataAquisicao); // Formata a data recebida
        console.log("Situação carregada:", this.equipamento.situacao);
      },
      error: erro => {
        Swal.fire('Erro', erro.error, 'error');
      }
    })

  }

  save(){
    const dataParaSalvar = this.formatarDataParaSalvar();
  
  if (dataParaSalvar) {
    // Atribui a data formatada ao objeto 'equipamento'
    this.equipamento.dataAquisicao = dataParaSalvar;
    this.equipamentoService.save(this.equipamento).subscribe({
      next: mensagem => {
        Swal.fire({
          title: mensagem,
          icon: "success"
        }).then(() => {
          this.router.navigate(['admin/equipamento']);
        });
      },
      error: erro => {
        Swal.fire('Erro', erro.error, 'error');
      }
    });
  }
  }

  update(){
    const dataParaSalvar = this.formatarDataParaSalvar();
  
  if (dataParaSalvar) {
    this.equipamento.dataAquisicao = dataParaSalvar;
    console.log(this.equipamento)
    this.equipamentoService.update(this.equipamento).subscribe({
      
      next: mensagem => {
        Swal.fire({
          title: mensagem,
          icon: "success"
        }).then(() => {
          this.router.navigate(['admin/equipamento']);
        });
      },
      error: erro => {
        console.log(erro);

        const mensagemErro =
          typeof erro.error === 'string'
            ? erro.error
            : erro.error?.message ||
              erro.error?.mensagem ||
              erro.message ||
              'Não foi possível atualizar o equipamento.';

        Swal.fire({
          title: 'Erro',
          text: mensagemErro,
          icon: 'error'
        });
      }
    });
  }
  }

  reativar(){
    this.equipamentoService.reativar(this.equipamento.patrimonio).subscribe({
      next: mensagem => {
        Swal.fire({
          title: mensagem,
          icon: "success"
        }).then(() => {
          this.router.navigate(['admin/equipamento']);
        });
      },
      error: erro => {
        console.log(erro);
        Swal.fire('Erro', erro.error, 'error');
      }
    });
  }
}
